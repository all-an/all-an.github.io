# Lazy / infinite list — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Uses
only the standard library — `Stream.iterate` builds an infinite lazy list of
Fibonacci numbers, and the downstream `limit(10)` proves it stays bounded in
practice.

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
computing Fibonacci number 0
got 0
computing Fibonacci number 1
got 1
computing Fibonacci number 1
got 1
computing Fibonacci number 2
got 2
computing Fibonacci number 3
got 3
computing Fibonacci number 5
got 5
computing Fibonacci number 8
got 8
computing Fibonacci number 13
got 13
computing Fibonacci number 21
got 21
computing Fibonacci number 34
got 34
```

Notice the interleaving: each `computing Fibonacci number N` is printed *just
before* its `got N`, because `forEach` pulls values one at a time through the
pipeline. The infinite source `Stream.iterate((0,1), (a,b) -> (b, a+b))` is
consulted exactly ten times — never more — because `limit(10)` caps demand.
That is the essence of a lazy (call-by-need) list: each element is produced only
when a consumer asks for it, so an unbounded sequence runs in bounded memory.
