// Java
// Runnable version of the "Exception / error propagation" concept snippet.
//
// A thrown exception propagates UP the call stack, unwinding each frame that
// does not handle it, until a matching catch clause is found. A finally block
// always runs on the way out — success or failure — for cleanup. This is
// structured exception handling: try/catch/finally, Java's native model.
//
// Quick start:  ./run.sh      (or: javac Main.java && java Main)

public class Main {
  // The deepest frame. Throws two different exception types, so we can watch
  // each one propagate up and get matched by a different catch clause.
  static int parsePositive(String text) {
    int n = Integer.parseInt(text);      // throws NumberFormatException on non-numbers
    if (n <= 0) {
      throw new IllegalArgumentException("not positive: " + n);
    }
    return n;
  }

  // An intermediate frame that does NOT catch. A throw inside the loop unwinds
  // straight through this method — the loop stops and total() never returns —
  // and propagates to whoever called total(). That pass-through is propagation.
  static int total(String[] texts) {
    int sum = 0;
    for (String text : texts) {
      sum += parsePositive(text);
    }
    return sum;
  }

  public static void main(String[] args) {
    // One clean batch and two that fail at different depths with different types.
    String[][] batches = {
      {"3", "4", "5"},   // ok -> 12
      {"3", "-1", "5"},  // IllegalArgumentException from parsePositive
      {"3", "x", "5"},   // NumberFormatException from Integer.parseInt
    };

    for (String[] batch : batches) {
      try {
        // If total() throws, the next line is skipped and control jumps to the
        // first catch whose type matches the thrown exception.
        int sum = total(batch);
        System.out.println("ok: sum = " + sum);
      } catch (NumberFormatException e) {
        // Most specific first: NumberFormatException is a subclass of
        // IllegalArgumentException, so it must be caught before the broader type
        // below — otherwise Java rejects this clause as unreachable.
        System.out.println("caught NumberFormatException: " + e.getMessage());
      } catch (IllegalArgumentException e) {
        // The broader type catches everything the clause above did not.
        System.out.println("caught IllegalArgumentException: " + e.getMessage());
      } finally {
        // finally ALWAYS runs — after success or after a catch — which is why it
        // is the place for cleanup (closing files, releasing locks).
        System.out.println("  (finally: batch done)");
      }
    }
  }
}
