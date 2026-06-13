// Java
// Runnable version of the "Memoization" concept snippet.
//
// Memoization caches a function's result by its arguments, so a repeated call
// returns the stored answer instead of recomputing it. It only works for pure
// functions — same input must always mean same output — and trades memory for
// speed. This builds a generic memoize wrapper with the standard library:
// ConcurrentHashMap.computeIfAbsent runs the real function only on a cache miss.
//
// Quick start:  ./run.sh      (or: javac Main.java && java Main)

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;

public class Main {
  // Counts how many times the *real* work runs, so we can prove the cache skips
  // repeated computations rather than just trusting that it does.
  static final AtomicInteger realCalls = new AtomicInteger();

  // The expensive function we want to avoid repeating: a pure computation that
  // bumps the counter every time it actually runs.
  static int slowSquare(int n) {
    realCalls.incrementAndGet();
    return n * n;
  }

  // memoize wraps any function in a cache. computeIfAbsent runs fn only when the
  // key is missing; on a hit it returns the stored value and fn never runs.
  static <A, B> Function<A, B> memoize(Function<A, B> fn) {
    Map<A, B> cache = new ConcurrentHashMap<>();
    return arg -> cache.computeIfAbsent(arg, fn);
  }

  public static void main(String[] args) {
    Function<Integer, Integer> fastSquare = memoize(Main::slowSquare);

    // Six calls but only three distinct inputs (4, 4, 7, 4, 7, 9). The repeats
    // are served from the cache, so the real function runs just three times.
    int[] inputs = {4, 4, 7, 4, 7, 9};
    for (int n : inputs) {
      System.out.println("square(" + n + ") = " + fastSquare.apply(n));
    }

    // Proof: 6 calls, 3 distinct keys -> 3 actual computations, 3 cache hits.
    System.out.println("calls made:        " + inputs.length);
    System.out.println("real computations: " + realCalls.get());
    System.out.println("cache hits:        " + (inputs.length - realCalls.get()));
  }
}
