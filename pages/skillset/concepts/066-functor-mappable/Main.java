// Java
// Runnable version of the "Functor / mappable" concept snippet.
//
// A functor is any type that has map: it applies a plain function A -> B to the
// value(s) inside a container without unwrapping them, and keeps the container's
// shape. Java ships several functors in its standard library — Optional and
// Stream both expose map — so the *same* function maps over either one.
//
// Functor vs. monad: a functor's map takes a plain function (A -> B); a monad's
// flatMap takes a wrapping function (A -> F<B>). map is the simpler of the two.
//
// Quick start:  ./run.sh      (or: javac Main.java && java Main)

import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Main {
  // One plain function, A -> B. It knows nothing about Optional or Stream — that
  // is the point: a functor lets you reuse plain functions over wrapped values.
  static final Function<Integer, Integer> square = n -> n * n;

  public static void main(String[] args) {
    // Optional is a functor: map applies square inside the box if a value is
    // present, and preserves "empty" untouched if it is not.
    Optional<Integer> present = Optional.of(6).map(square);   // Optional[36]
    Optional<Integer> absent  = Optional.<Integer>empty().map(square); // empty
    System.out.println("Optional present -> " + present);
    System.out.println("Optional empty   -> " + absent);

    // Stream is the same functor idea over many values: map applies square to
    // each element and preserves the structure (a stream of the same length).
    List<Integer> squared = Stream.of(1, 2, 3, 4)
        .map(square)
        .collect(Collectors.toList());
    System.out.println("Stream mapped    -> " + squared); // [1, 4, 9, 16]

    // Functor composition law: mapping f then g equals mapping (g after f) once.
    // Both lines produce the same result, proving map respects composition.
    Function<Integer, Integer> plusOne = n -> n + 1;
    Optional<Integer> twoMaps = Optional.of(6).map(square).map(plusOne);
    Optional<Integer> oneMap  = Optional.of(6).map(square.andThen(plusOne));
    System.out.println("map f then g     -> " + twoMaps); // Optional[37]
    System.out.println("map (g after f)  -> " + oneMap);  // Optional[37]
  }
}
