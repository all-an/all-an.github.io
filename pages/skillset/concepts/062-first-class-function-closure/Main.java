// Java
// Runnable version of the "First-class function / closure" concept snippet.
// Pure javac/java — no external dependencies.
//
// Quick start:
//   ./run.sh
//
// Or manually:
//   javac Main.java
//   java  Main
import java.util.function.Function;

public class Main {

  // Returns a closure: a function that "remembers" the addend `n` from the
  // enclosing scope, even after makeAdder has already returned. Capturing that
  // environment is exactly what turns a plain function into a closure.
  static Function<Integer, Integer> makeAdder(int n) {
    return x -> x + n; // `n` is captured from the enclosing scope
  }

  // Higher-order function: takes two functions as arguments and returns a new
  // one. Functions are first-class values, so they pass in and out like any data.
  static Function<Integer, Integer> andThen(Function<Integer, Integer> f,
                                            Function<Integer, Integer> g) {
    return x -> g.apply(f.apply(x)); // run f, then feed its result to g
  }

  public static void main(String[] args) {
    // First-class: a function stored in a variable, just like an int or a String.
    Function<Integer, Integer> add5 = makeAdder(5); // closure over n = 5
    Function<Integer, Integer> mul3 = x -> x * 3;   // a function literal

    System.out.println("add5(10) = " + add5.apply(10)); // 15
    System.out.println("mul3(10) = " + mul3.apply(10)); // 30

    // Compose the two functions into a third — functions in, function out.
    Function<Integer, Integer> add5ThenMul3 = andThen(add5, mul3);
    System.out.println("(add5 then mul3)(10) = " + add5ThenMul3.apply(10)); // 45
  }
}
