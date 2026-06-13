// Java
// Runnable version of the "Typeclass / given / implicit" concept snippet.
//
// A typeclass is a dictionary of operations for a type, resolved by the type
// itself rather than carried by the value. Haskell (typeclass), Scala (given /
// implicit), and Rust (trait impl) let the compiler FIND and PASS that
// dictionary automatically. Java has the dictionary half — an interface
// instance — but you pass it by hand. This shows the mechanism the implicits
// automate, and points at Comparator as the typeclass instance you already use.
//
// Quick start:  ./run.sh      (or: javac Main.java && java Main)

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class Main {
  // The typeclass: a dictionary of operations for some type T. Semigroup bundles
  // exactly one — how to combine two T values into one. In Scala this would be a
  // `trait Semigroup[T]` with `given` instances the compiler injects.
  interface Semigroup<T> {
    T combine(T a, T b);
  }

  // Two instances, one per type. These are the dictionaries a `given` / `implicit`
  // would supply automatically; in Java they are ordinary named values.
  static final Semigroup<Integer> INT_ADDITION = (a, b) -> a + b;
  static final Semigroup<String> STRING_CONCAT = (a, b) -> a + b;

  // combineAll is ad-hoc polymorphic: it works for ANY type T, but only because
  // the caller supplies the Semigroup<T> dictionary that knows how to combine T.
  // The behavior is chosen by the passed instance, not by the values themselves.
  static <T> T combineAll(List<T> items, Semigroup<T> semigroup) {
    T result = items.get(0);
    for (int i = 1; i < items.size(); i++) {
      result = semigroup.combine(result, items.get(i));
    }
    return result;
  }

  public static void main(String[] args) {
    // Same function, two types — the behavior comes from the dictionary we pass.
    // A Scala `for`/call site would omit these arguments; the compiler resolves
    // the unique `given Semigroup[Int]` / `given Semigroup[String]` for us.
    int sum = combineAll(List.of(1, 2, 3, 4), INT_ADDITION);
    String joined = combineAll(List.of("a", "b", "c"), STRING_CONCAT);
    System.out.println("Semigroup<Integer> -> " + sum);    // 10
    System.out.println("Semigroup<String>  -> " + joined); // abc

    // Comparator<T> is a typeclass instance you already use: an `Ord T`
    // dictionary of "how to order T". sort takes it explicitly, exactly like
    // combineAll above — the same pattern, just built into the standard library.
    List<String> words = new ArrayList<>(List.of("pear", "fig", "apple"));
    words.sort(Comparator.comparingInt(String::length));
    System.out.println("Comparator<String> -> " + words);  // [fig, pear, apple]
  }
}
