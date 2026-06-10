# Monad / chain — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Uses
only the standard library — `Optional<Integer>` as the monad, chained with
`flatMap`. Java is a strong fit here because it ships several monads ready-made:
`Optional`, `Stream`, and `CompletableFuture` all expose flatMap-style chaining.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Compiles and runs `Main.java`. |
| `index.html` / `style.css` | The concept page. |

No external jars are needed — this uses only `java.util.Optional`. Compiled
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
(84, 2) -> flatMap: 42
(84, 0) -> flatMap: empty (short-circuited)
(eight, 2) -> flatMap: empty (short-circuited)
```

`Optional` is a monad because it has `flatMap` (the monadic *bind*, written `>>=`
in Haskell): each step takes the unwrapped value and returns the next wrapped
value. The threading rule is short-circuiting — an `empty` skips the rest of the
chain and becomes the answer, which is why the divide-by-zero and non-number rows
stop early. `Optional` collapses every failure to "no value"; a custom `Either`
type would carry *which* error, but the `flatMap` chaining mechanism is identical.
That readable linear pipeline of steps that *is* a monadic `flatMap` chain — and
the fact it comes built in (also as `Stream.flatMap` and
`CompletableFuture.thenCompose`) — is the whole point of the concept.
