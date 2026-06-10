# Higher-order function — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Uses
only the standard library — `java.util.function.Function` to pass a function
into `mapEach` and to return a function out of `scaler`.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Compiles and runs `Main.java`. |
| `index.html` / `style.css` | The concept page. |

No external jars are needed — it is plain `List`, `Function`, and `int`
arithmetic. Compiled `*.class` files are git-ignored. Requires a JDK with
`Stream.toList()` (Java 16+).

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
squares: [1, 4, 9, 16]
labels: [1, 2, 3, 4]
tripled: [3, 6, 9, 12]
```

`mapEach` is a higher-order function because one of its parameters *is* a
function: it runs the same `stream().map(...)` traversal but defers the actual
per-element work to whatever `transform` you pass — a lambda (`n -> n * n`), a
method reference (`String::valueOf`), or a function you got from somewhere else.
`scaler` is higher-order in the other direction: it *returns* a function, so
`scaler(3)` hands back an `Int -> Int` that triples its input. Feeding that
returned function straight into `mapEach` shows the whole point — behavior is
just another value to compute with, store, and pass around.
