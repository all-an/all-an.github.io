// Java (RxJava 3)
// Runnable version of the "Observable / reactive stream" concept snippet.
//
// RxJava is an external library, so two jars must be on the classpath:
//   rxjava-3.1.10.jar           — the operators and Observable type
//   reactive-streams-1.0.4.jar  — RxJava's only compile dependency
//
// Quick start (downloads the jars into ./lib, then compiles and runs):
//   ./run.sh
//
// Or manually, once the jars are in ./lib:
//   javac -cp "lib/*" Main.java
//   java  -cp "lib/*:." Main      (use ';' instead of ':' on Windows)
import io.reactivex.rxjava3.core.Observable;

public class Main {
  public static void main(String[] args) {
    // Observable.range builds a cold (lazy) stream of 0..9; nothing runs yet.
    Observable<Integer> ticks = Observable.range(0, 10)
        .filter(n -> n % 2 == 0) // keep only even values
        .map(n -> n * 10)        // transform each value as it flows through
        .take(5);                // complete the stream after five emissions

    // Subscribing activates the stream; the callback runs for every emitted value.
    ticks.subscribe(value -> System.out.println("tick: " + value));
  }
}
