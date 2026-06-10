# First-class function / closure — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Uses
only the standard library — `java.util.function.Function` to store functions in
variables, pass them as arguments, return them, and capture an enclosing
variable in a closure.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Compiles and runs `Main.java`. |
| `index.html` / `style.css` | The concept page. |

No external jars are needed — it is plain `Function` and `int` arithmetic.
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
add5(10) = 15
mul3(10) = 30
(add5 then mul3)(10) = 45
```

`makeAdder(5)` returns a *closure*: the lambda `x -> x + n` captures `n = 5` from
the enclosing scope and keeps seeing it even after `makeAdder` has returned, so
`add5.apply(10)` is `15`. Because functions are *first-class*, `add5` and `mul3`
are ordinary values held in variables, and `andThen` is a *higher-order
function* — it takes two functions, returns a new one (`x -> g(f(x))`), and that
composed function turns `10` into `add5` → `15`, then `mul3` → `45`. Store,
pass, return, capture: the same four moves underpin every callback, stream
pipeline, and dependency-injected strategy.
