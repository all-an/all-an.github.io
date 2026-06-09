# Parallel collection — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Uses
only the standard library — a parallel stream that spreads the same `filter`
across CPU cores via the fork-join model, counting the primes in a range.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Compiles and runs `Main.java`. |
| `index.html` / `style.css` | The concept page. |

No external jars are needed — it is plain `IntStream` and `int` arithmetic.
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
primes below 100000: 9592
matches sequential? true
```

`IntStream.range(2, 100_000).parallel()` turns the range into a *parallel
collection*: the runtime recursively splits it into chunks (*fork*), filters
each chunk for primes on its own worker thread from the common `ForkJoinPool`,
and sums the partial counts back together (*join*). There are 9592 primes below
100,000. The second run does the identical pipeline on a single thread, and the
two counts match — that equality is the whole point. Because `isPrime` is pure
(no shared mutable state) and `count` is associative, the order in which chunks
finish is irrelevant, so splitting the work across cores changes only the
wall-clock time, never the answer. Drop either property — share mutable state,
or combine with a non-associative operation — and the parallel result would no
longer be trustworthy.
