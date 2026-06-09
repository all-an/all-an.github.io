// Java (RxJava 3)
// Runnable version of the "Subject / hot observable" concept snippet.
//
// RxJava is an external library, so two jars must be on the classpath:
//   rxjava-3.1.10.jar           — the operators and Subject types
//   reactive-streams-1.0.4.jar  — RxJava's only compile dependency
//
// Quick start (downloads the jars into ./lib, then compiles and runs):
//   ./run.sh
//
// Or manually, once the jars are in ./lib:
//   javac -cp "lib/*" Main.java
//   java  -cp "lib/*:." Main      (use ';' instead of ':' on Windows)
import io.reactivex.rxjava3.subjects.PublishSubject;

public class Main {
  public static void main(String[] args) {
    // A PublishSubject is hot: it is both a sink we push into and a stream others observe.
    PublishSubject<String> prices = PublishSubject.create();

    // First subscriber attaches; it will only see values emitted from now on.
    prices.subscribe(value -> System.out.println("A: " + value));

    // Pushing a value multicasts it to every current subscriber synchronously.
    prices.onNext("AAPL 191.4"); // A: AAPL 191.4

    // A late subscriber misses everything emitted before it joined (hot semantics).
    prices.subscribe(value -> System.out.println("B: " + value));

    prices.onNext("AAPL 191.7"); // A: AAPL 191.7   B: AAPL 191.7

    // Completing the subject ends the shared stream for every subscriber at once.
    prices.onComplete();
  }
}
