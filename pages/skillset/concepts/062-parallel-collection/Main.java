// Java
// Runnable version of the "Parallel collection" concept snippet.
// Pure javac/java — no external dependencies.
//
// Quick start:
//   ./run.sh
//
// Or manually:
//   javac Main.java
//   java  Main
import java.util.stream.IntStream;

public class Main {

  // Tests primality by trial division up to sqrt(n). This is the per-element
  // work that the parallel stream spreads across CPU cores — pure (no shared
  // state), so it is safe to run on many elements at once.
  static boolean isPrime(int n) {
    if (n < 2) return false;
    for (int divisor = 2; (long) divisor * divisor <= n; divisor++) {
      if (n % divisor == 0) return false;
    }
    return true;
  }

  public static void main(String[] args) {
    int limit = 100_000; // count primes in the range [2, limit)

    // Data parallelism via the fork-join model: the range is recursively split
    // into chunks (fork), each chunk is filtered on its own worker thread from
    // the common ForkJoinPool, and the partial counts are summed back together
    // (join). count() is associative, so the total is order-independent.
    long parallel = IntStream.range(2, limit)
        .parallel()              // split the range across CPU cores
        .filter(Main::isPrime)   // each core tests its own chunk
        .count();                // partial counts are joined into one total
    System.out.println("primes below " + limit + ": " + parallel);

    // The same pipeline run on a single thread. Because the operation is pure
    // and associative, splitting the work changes nothing but the wall clock —
    // the parallel and sequential results are identical.
    long sequential = IntStream.range(2, limit)
        .filter(Main::isPrime)
        .count();
    System.out.println("matches sequential? " + (parallel == sequential));
  }
}
