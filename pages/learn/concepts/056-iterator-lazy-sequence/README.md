# Iterator / lazy sequence — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Uses
only the standard library — `Stream.iterate` builds an infinite lazy sequence,
and the downstream `limit(5)` proves it stays bounded in practice.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Compiles and runs `Main.java`. |
| `index.html` / `style.css` | The concept page. |

No external jars are needed — `java.util.stream.Stream` is part of the JDK.
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
computing square of 1
got 1
computing square of 2
got 4
computing square of 3
got 9
computing square of 4
got 16
computing square of 5
got 25
```

Notice the interleaving: each `computing square of N` is printed *just before*
its `got N*N`, because `forEach` pulls values one at a time through the pipeline.
The infinite source `Stream.iterate(1L, n -> n + 1)` is consulted exactly five
times — never more — because `limit(5)` caps demand. That is the essence of a
lazy sequence: work happens only when a consumer asks for it.
