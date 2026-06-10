// Java
// Runnable version of the "Higher-order function" concept snippet.
// Pure javac/java — no external dependencies.
//
// Quick start:
//   ./run.sh
//
// Or manually:
//   javac Main.java
//   java  Main
import java.util.List;
import java.util.function.Function;

public class Main {

  // Higher-order function: takes another function `transform` as a parameter
  // and applies it to every element, building a new list. Behavior is passed in
  // as data, so the same map-each traversal works for any transform.
  static <T, R> List<R> mapEach(List<T> items, Function<T, R> transform) {
    return items.stream().map(transform).toList();
  }

  // Higher-order function that *returns* a function: given a factor, it hands
  // back a new function that multiplies its input by that factor.
  static Function<Integer, Integer> scaler(int factor) {
    return n -> n * factor;
  }

  public static void main(String[] args) {
    List<Integer> nums = List.of(1, 2, 3, 4);

    // Pass a function in: square every element.
    List<Integer> squares = mapEach(nums, n -> n * n);
    System.out.println("squares: " + squares); // [1, 4, 9, 16]

    // Pass a method reference in — functions are just values.
    List<String> labels = mapEach(nums, String::valueOf);
    System.out.println("labels: " + labels); // [1, 2, 3, 4]

    // Get a function back from scaler, then feed it to mapEach.
    Function<Integer, Integer> triple = scaler(3);
    List<Integer> tripled = mapEach(nums, triple);
    System.out.println("tripled: " + tripled); // [3, 6, 9, 12]
  }
}
