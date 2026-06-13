# Typed error channel — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`
(**Java 21+** for the pattern-matching `switch`). Uses only the standard library
— a `sealed interface Result<T, E>` with `Ok` / `Err` records. Java has no
built-in `Result`, so this builds the minimal one and shows it carrying errors
through a chain.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Compiles and runs `Main.java`. |
| `index.html` / `style.css` | The concept page. |

No external jars are needed — this uses only `java.util.function`. Compiled
`*.class` files are git-ignored.

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
21 -> access granted, age 21
16 -> denied: must be 18+, got 16
abc -> denied: not a number: 'abc'
```

A *typed error channel* makes failure an ordinary **typed return value**:
`Result<T, E>` is either `Ok(value)` or `Err(error)`, and the error type `E` is
part of every signature — so a caller cannot quietly ignore failure the way an
unchecked exception lets them. The pipeline `parseAge → checkAdult → map` shows
the three outcomes:

- **`"21"`** — both steps succeed, `map` runs, result is `Ok`.
- **`"16"`** — `parseAge` succeeds but `checkAdult` returns `Err`; `map` is
  skipped and the error is carried to the end.
- **`"abc"`** — `parseAge` returns `Err`, so `flatMap` **short-circuits**:
  `checkAdult` never runs at all. This is the railway: the first `Err` derails
  the train and every later step is bypassed.

Two language features make this clean in Java:

- **`sealed` + `record`s** declare that `Ok` and `Err` are the *only* two cases,
  so the pattern-matching `switch` is **exhaustive** — drop either branch and the
  code won't compile. That exhaustiveness is what forces both channels to be
  handled.
- **`map` vs `flatMap`** split the work: `map` transforms a success value
  (`T -> U`), while `flatMap` chains a step that can itself fail
  (`T -> Result<U, E>`). An `Err` flows through both untouched.

## How this differs from the built-ins

Scala's `Either[E, A]` and `ZIO[R, E, A]`, Haskell's `Either`, and Rust's
`Result<T, E>` ship this channel ready-made, with `for`/`do`/`?` sugar for the
chaining. Java's version is hand-built but identical in spirit; the
[Result / error value](../024-result-error-value/) concept shows the simpler
TypeScript discriminated-union form, while this one focuses on **composing** a
chain of fallible steps where errors short-circuit.
