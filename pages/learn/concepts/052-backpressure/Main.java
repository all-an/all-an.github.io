// Java (Project Reactor)
// Runnable version of the "Backpressure" concept snippet.
//
// Project Reactor is an external library, so two jars must be on the classpath:
//   reactor-core-3.8.5.jar      — Flux/Mono and the onBackpressure* operators
//   reactive-streams-1.0.4.jar  — the Publisher/Subscriber/Subscription API Reactor implements
//
// Quick start (downloads the jars into ./lib, then compiles and runs):
//   ./run.sh
//
// Or manually, once the jars are in ./lib:
//   javac -cp "lib/*" Main.java
//   java  -cp "lib/*:." Main      (use ';' instead of ':' on Windows)
import org.reactivestreams.Subscription;
import reactor.core.publisher.BaseSubscriber;
import reactor.core.publisher.Flux;

public class Main {
  public static void main(String[] args) {
    // A fast source of 10 values feeding a deliberately slow consumer.
    Flux.range(1, 10)
        // Backpressure strategy: discard whatever the consumer has not asked for,
        // reporting each dropped value instead of buffering it without bound.
        .onBackpressureDrop(dropped -> System.out.println("dropped  " + dropped))
        // A subscriber that controls its own demand instead of accepting everything.
        .subscribe(new BaseSubscriber<Integer>() {
          @Override
          protected void hookOnSubscribe(Subscription subscription) {
            // Request only 3 items, never more — this bounded demand is the backpressure signal.
            request(3);
          }

          @Override
          protected void hookOnNext(Integer value) {
            // Only the 3 requested values reach us; the source's overflow is dropped upstream.
            System.out.println("consumed " + value);
          }
        });
  }
}
