# Functor / mappable — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Uses
only the standard library — `Optional<Integer>` and `Stream<Integer>` as the
functors, each mapped over with the same plain function. Java is a good fit here
because it ships several functors ready-made: `Optional`, `Stream`, and the
collection types all expose `map`.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Compiles and runs `Main.java`. |
| `index.html` / `style.css` | The concept page. |

No external jars are needed — this uses only `java.util` and `java.util.stream`.
Compiled `*.class` files are git-ignored.

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
Optional present -> Optional[36]
Optional empty   -> Optional.empty
Stream mapped    -> [1, 4, 9, 16]
map f then g     -> Optional[37]
map (g after f)  -> Optional[37]
```

A type is a *functor* when it has `map`: a way to apply a plain function
`A -> B` to the value(s) it wraps while preserving the container's structure.
The same `square` function maps over an `Optional` (one value or none) and a
`Stream` (many values) unchanged — the functor does the reaching-in. Over the
`Optional`, an `empty` is preserved untouched; over the `Stream`, the result has
the same length as the input.

The last two rows show the **functor composition law**: mapping `f` then `g`
gives the same result as mapping `g ∘ f` once (`36` squared then `+1` equals
`37` either way). Functors also obey the **identity law** — `map(x -> x)` leaves
the container unchanged.

Functor vs. monad: a functor's `map` takes a *plain* function (`A -> B`); a
monad's `flatMap` takes a *wrapping* function (`A -> F<B>`). `map` is the simpler
of the two, and every monad (see the [Monad / chain](../065-monad-chain/) concept)
is also a functor.
