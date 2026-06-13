# Memoization — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Uses
only the standard library — a generic `memoize` wrapper backed by
`ConcurrentHashMap.computeIfAbsent`. Java is a good fit here because the cache,
the higher-order wrapper, and an atomic call counter all come ready-made in
`java.util.concurrent`.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Compiles and runs `Main.java`. |
| `index.html` / `style.css` | The concept page. |

No external jars are needed — this uses only `java.util`, `java.util.concurrent`,
and `java.util.function`. Compiled `*.class` files are git-ignored.

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
square(4) = 16
square(4) = 16
square(7) = 49
square(4) = 16
square(7) = 49
square(9) = 81
calls made:        6
real computations: 3
cache hits:        3
```

*Memoization* caches a function's result by its arguments, so a repeated call
returns the stored answer instead of recomputing it. The `memoize` wrapper keeps
a `ConcurrentHashMap` and uses `computeIfAbsent`: on a cache **miss** it runs the
real function and stores the result; on a **hit** it returns the stored value and
the real function never runs.

The counter proves the saving — six calls over three distinct inputs
(`4, 4, 7, 4, 7, 9`) run the real computation just **three** times, with three
cache hits. Memoization only works for **pure** functions (same input always
gives the same output) and trades memory for speed: the cache grows with the
number of distinct arguments seen.

Because `memoize` takes a `Function` and returns a `Function`, it is a
higher-order function (see the [Higher-order function](../064-higher-order-function/)
concept) that wraps any pure function without changing its callers. The same idea
powers Python's `@lru_cache`, Guava/Caffeine caches, and dynamic-programming
*tabling* (a memoized Fibonacci turns exponential recomputation into linear time).
