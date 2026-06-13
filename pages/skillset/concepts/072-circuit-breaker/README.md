# Circuit breaker — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Uses
only the standard library — a hand-built circuit breaker state machine with an
injected clock, so the run is deterministic with no real sleeping. Production
Java would use **Resilience4j** instead, but the state machine is exactly this.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Compiles and runs `Main.java`. |
| `index.html` / `style.css` | The concept page. |

No external jars are needed — this uses only `java.util.function` and
`java.util.concurrent.atomic`. Compiled `*.class` files are git-ignored.

## Run it (recommended)

```sh
chmod +x run.sh   # make the script executable (only needed once)
./run.sh          # compiles and runs Main.java
```

## Run it manually

```sh
javac Main.java
java  Main
```

## Expected output

```
call 1 (outage)    -> failed: service down   [CLOSED]
call 2 (outage)    -> failed: service down   [CLOSED]
call 3 (outage)    -> failed: service down   [OPEN]
call 4 (open)      -> rejected fast (service not called)   [OPEN]
call 5 (trial)     -> failed: service down   [OPEN]
call 6 (trial)     -> 200 OK   [CLOSED]
call 7 (recovered) -> 200 OK   [CLOSED]
real service calls made: 6
```

A *circuit breaker* protects a system from a failing dependency by **failing
fast** instead of piling more doomed calls onto something already broken. It is a
three-state machine:

- **CLOSED** — normal operation. Calls flow through and *consecutive* failures
  are counted. Calls 1–3 fail here; the third hits the threshold (3) and trips
  the breaker.
- **OPEN** — the breaker is tripped. Calls are **rejected instantly** without
  invoking the dependency, giving it room to recover. Call 4 is rejected this way
  — note the counter: only **6** of the 7 attempts ever reached the service.
- **HALF_OPEN** — after the cooldown (1000 ms here) the breaker lets *one* trial
  call through. Call 5's trial fails (outage continues) so it snaps back to OPEN;
  after the service recovers, call 6's trial succeeds and **closes** the breaker.

The trip rule lives in `onFailure`: a failure trips OPEN either when the
consecutive-failure threshold is reached in CLOSED, or when the single trial
fails in HALF_OPEN. Any success (`onSuccess`) clears the tally and returns to
CLOSED.

## Why the injected clock

The breaker reads time through a `Clock` interface. The demo passes a `FakeClock`
it advances by hand (`clock.advance(1000)`), which keeps the output deterministic
and the test instant — no `Thread.sleep`. Real code would pass
`System::currentTimeMillis`. This is dependency injection of time: the breaker
depends on an *abstraction* of the clock, not the wall clock, so its behavior is
reproducible and testable.
