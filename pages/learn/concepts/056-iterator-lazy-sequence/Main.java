// Java
// Runnable version of the "Iterator / lazy sequence" concept snippet.
//
// Uses only the standard library — no external jars needed.
//
// Quick start:
//   ./run.sh
//
// Or manually:
//   javac Main.java
//   java  Main
import java.util.stream.Stream;

public class Main {
  public static void main(String[] args) {
    // An infinite lazy sequence of the natural numbers 1, 2, 3, ...
    // Nothing is computed yet — Stream.iterate just records the seed and successor function.
    Stream<Long> naturals = Stream.iterate(1L, n -> n + 1);

    // Pipeline of lazy stages: each value is pulled through map only when forEach asks for it.
    naturals
        .map(n -> {
          // Visible proof of laziness: this print fires exactly 5 times, not infinitely.
          System.out.println("computing square of " + n);
          return n * n;
        })
        // limit is the terminator that bounds the otherwise-infinite source to 5 elements.
        .limit(5)
        // forEach is the terminal operation that drives the whole pipeline one value at a time.
        .forEach(square -> System.out.println("got " + square));
  }
}
