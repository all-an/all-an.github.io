// Java
// Runnable version of the "Monad / chain" concept snippet.
//
// Java ships several monads in its standard library — Optional, Stream, and
// CompletableFuture all expose flatMap-style chaining. This uses Optional: each
// step returns an Optional, flatMap threads the unwrapped value into the next
// step, and an empty result short-circuits the rest of the chain.
//
// Quick start:  ./run.sh      (or: javac Main.java && java Main)

import java.util.Optional;

public class Main {
  // parse turns text into a number, or empty on failure. Optional is the monad:
  // it has flatMap and map, so an empty short-circuits a chain of steps.
  static Optional<Integer> parse(String text) {
    try {
      return Optional.of(Integer.parseInt(text));
    } catch (NumberFormatException e) {
      return Optional.empty();
    }
  }

  // divide guards the divide-by-zero failure case by returning empty.
  static Optional<Integer> divide(int a, int b) {
    return b == 0 ? Optional.empty() : Optional.of(a / b);
  }

  // Nested flatMap: bind each step to the next. An empty anywhere stops the
  // chain and becomes the result — that short-circuiting is the monad at work.
  static Optional<Integer> chained(String a, String b) {
    return parse(a).flatMap(x -> parse(b).flatMap(y -> divide(x, y)));
  }

  public static void main(String[] args) {
    // The same chain over three inputs. Rows 2 and 3 short-circuit: a failed
    // step (empty) skips the remaining steps and becomes the answer.
    String[][] cases = { {"84", "2"}, {"84", "0"}, {"eight", "2"} };
    for (String[] c : cases) {
      Optional<Integer> result = chained(c[0], c[1]);
      // Optional collapses every failure to "no value"; a custom Either would
      // carry which error, but the flatMap chaining mechanism is identical.
      String shown = result.map(String::valueOf).orElse("empty (short-circuited)");
      System.out.println("(" + c[0] + ", " + c[1] + ") -> flatMap: " + shown);
    }
  }
}
