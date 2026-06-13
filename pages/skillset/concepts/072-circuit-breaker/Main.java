// Java
// Runnable version of the "Circuit breaker" concept snippet.
//
// A circuit breaker wraps calls to a flaky dependency and stops hammering it
// once it looks broken. Like an electrical breaker it has three states:
//   CLOSED    — calls flow through; consecutive failures are counted.
//   OPEN      — too many failures; calls are rejected INSTANTLY without calling
//               the dependency, giving it room to recover (fail fast).
//   HALF_OPEN — after a cooldown, one trial call is let through to test recovery;
//               success closes the breaker, another failure re-opens it.
// This is a zero-dependency, hand-built version (the Java ecosystem ships
// Resilience4j for production use).
//
// Quick start:  ./run.sh      (or: javac Main.java && java Main)

import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

public class Main {
  // A clock the breaker reads. The demo passes one it advances by hand so the
  // run is deterministic; real code would pass System::currentTimeMillis.
  @FunctionalInterface
  interface Clock {
    long millis();
  }

  // Thrown when the breaker is OPEN and rejects a call without running it.
  static final class CircuitOpenException extends RuntimeException {}

  static final class CircuitBreaker {
    enum State { CLOSED, OPEN, HALF_OPEN }

    private final int failureThreshold;     // consecutive failures that trip the breaker
    private final long openDurationMillis;  // how long OPEN before a trial is allowed
    private final Clock clock;

    private State state = State.CLOSED;
    private int consecutiveFailures = 0;
    private long openedAtMillis = 0;        // when the breaker last tripped to OPEN

    CircuitBreaker(int failureThreshold, long openDurationMillis, Clock clock) {
      this.failureThreshold = failureThreshold;
      this.openDurationMillis = openDurationMillis;
      this.clock = clock;
    }

    // call runs the action through the breaker, applying the fault-tolerance rules.
    <T> T call(Supplier<T> action) {
      if (state == State.OPEN) {
        // Still cooling down? Reject immediately — the dependency is never touched.
        if (clock.millis() - openedAtMillis < openDurationMillis) {
          throw new CircuitOpenException();
        }
        // Cooldown elapsed: allow a single trial call to probe for recovery.
        state = State.HALF_OPEN;
      }
      try {
        T result = action.get();
        onSuccess();
        return result;
      } catch (RuntimeException e) {
        onFailure();
        throw e;
      }
    }

    // Any success closes the breaker and clears the failure tally.
    private void onSuccess() {
      consecutiveFailures = 0;
      state = State.CLOSED;
    }

    // A failed trial in HALF_OPEN, or hitting the threshold in CLOSED, trips OPEN.
    private void onFailure() {
      consecutiveFailures++;
      if (state == State.HALF_OPEN || consecutiveFailures >= failureThreshold) {
        state = State.OPEN;
        openedAtMillis = clock.millis();
      }
    }

    State state() {
      return state;
    }
  }

  // A clock the demo advances by hand, so the run is deterministic (no sleeping).
  static final class FakeClock implements Clock {
    private long now = 0;

    public long millis() {
      return now;
    }

    void advance(long millis) {
      now += millis;
    }
  }

  // Runs one call through the breaker and prints the outcome and resulting state.
  static void attempt(CircuitBreaker breaker, Supplier<String> service, String step) {
    try {
      String result = breaker.call(service);
      System.out.println(step + " -> " + result + "   [" + breaker.state() + "]");
    } catch (CircuitOpenException e) {
      // The breaker short-circuited: the service was never called.
      System.out.println(step + " -> rejected fast (service not called)   [" + breaker.state() + "]");
    } catch (RuntimeException e) {
      System.out.println(step + " -> failed: " + e.getMessage() + "   [" + breaker.state() + "]");
    }
  }

  public static void main(String[] args) {
    FakeClock clock = new FakeClock();
    // Trip after 3 consecutive failures; stay OPEN for 1000 ms before a trial.
    CircuitBreaker breaker = new CircuitBreaker(3, 1000, clock);

    // A flaky downstream service. We flip `healthy` to simulate an outage and
    // recovery, and count REAL invocations to prove the breaker skips them.
    boolean[] healthy = {false};
    AtomicInteger realCalls = new AtomicInteger();
    Supplier<String> service = () -> {
      realCalls.incrementAndGet();
      if (!healthy[0]) {
        throw new RuntimeException("service down");
      }
      return "200 OK";
    };

    // Outage begins. Three failures in CLOSED count up and trip the breaker OPEN.
    attempt(breaker, service, "call 1 (outage)   ");
    attempt(breaker, service, "call 2 (outage)   ");
    attempt(breaker, service, "call 3 (outage)   ");

    // While OPEN, the call is rejected instantly without hitting the service.
    attempt(breaker, service, "call 4 (open)     ");

    // After the cooldown, one trial call is allowed (HALF_OPEN). Still down -> OPEN.
    clock.advance(1000);
    attempt(breaker, service, "call 5 (trial)    ");

    // Service recovers; after another cooldown the trial succeeds -> CLOSED.
    healthy[0] = true;
    clock.advance(1000);
    attempt(breaker, service, "call 6 (trial)    ");

    // Back to normal: CLOSED, calls flow straight through again.
    attempt(breaker, service, "call 7 (recovered)");

    // 7 attempts but only 6 reached the service — call 4 was rejected fast.
    System.out.println("real service calls made: " + realCalls.get());
  }
}
