// Java (Project Reactor)
// Runnable version of the "Scheduler / dispatcher" concept snippet.
//
// Project Reactor is an external library, so two jars must be on the classpath:
//   reactor-core-3.8.5.jar      — Flux/Mono and the Schedulers
//   reactive-streams-1.0.4.jar  — the Publisher/Subscriber API Reactor implements
//
// Quick start (downloads the jars into ./lib, then compiles and runs):
//   ./run.sh
//
// Or manually, once the jars are in ./lib:
//   javac -cp "lib/*" Main.java
//   java  -cp "lib/*:." Main      (use ';' instead of ':' on Windows)
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Schedulers;

public class Main {
  public static void main(String[] args) {
    Flux.range(1, 3)
        // subscribeOn picks the thread the source runs on: the blocking-I/O pool.
        .subscribeOn(Schedulers.boundedElastic())
        .map(n -> {
          System.out.println("map  " + n + " on " + Thread.currentThread().getName());
          return n * n;
        })
        // publishOn moves every stage below it onto the CPU-bound parallel pool.
        .publishOn(Schedulers.parallel())
        .doOnNext(n -> System.out.println("next " + n + " on " + Thread.currentThread().getName()))
        // blockLast keeps the main thread alive until the async pipeline finishes.
        .blockLast();
  }
}
