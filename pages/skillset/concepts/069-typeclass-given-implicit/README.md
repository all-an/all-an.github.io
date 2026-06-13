# Typeclass / given / implicit — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Uses
only the standard library — a custom `Semigroup<T>` interface as the typeclass
dictionary, plus `Comparator<T>` as the built-in one. Java is an honest fit for
the *mechanism* even though it lacks the implicit resolution: a typeclass
instance is just an interface value you pass explicitly.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Compiles and runs `Main.java`. |
| `index.html` / `style.css` | The concept page. |

No external jars are needed — this uses only `java.util`. Compiled `*.class`
files are git-ignored.

## Run it (recommended)

```sh
chmod +x run.sh   # make the script executable (only needed once)
./run.sh          # compiles and runs Main.java
```

## Run it manually

```sh
javac Main.java
java  Main
```

## Expected output

```
Semigroup<Integer> -> 10
Semigroup<String>  -> abc
Comparator<String> -> [fig, pear, apple]
```

A *typeclass* is a **dictionary of operations for a type**, resolved by the type
rather than carried by the value. `Semigroup<T>` bundles one operation — how to
combine two `T` values — and `combineAll` is **ad-hoc polymorphic**: it works for
any `T`, but only because the caller hands it the matching `Semigroup<T>`. The
same generic function produces `10` for integers (addition) and `"abc"` for
strings (concatenation); the behavior comes entirely from the passed instance.

`Comparator<T>` is the same idea built into the standard library: an `Ord T`
dictionary of "how to order `T`", passed to `sort` explicitly — exactly the
pattern `combineAll` uses.

## What Java is missing

Haskell (`typeclass`), Scala (`given` / `implicit`), and Rust (`trait impl`) add
the half Java lacks: the compiler **finds and passes** the right instance
automatically, so the call site omits the dictionary argument entirely. They also
enforce **coherence** — exactly one canonical instance per type, so two parts of
a program can never disagree on "how to combine `Int`". In Java nothing stops you
from defining a second, conflicting `Semigroup<Integer>` and passing whichever
you like; the explicit argument is both the cost and the escape hatch.
