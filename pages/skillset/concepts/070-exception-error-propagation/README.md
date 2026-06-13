# Exception / error propagation — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Uses
only the standard library — `try`/`catch`/`finally` with built-in exception
types. Java is the canonical home of structured exception handling, so the
mechanism shows with no extra machinery.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Compiles and runs `Main.java`. |
| `index.html` / `style.css` | The concept page. |

No external jars are needed — this uses only `java.lang`. Compiled `*.class`
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
ok: sum = 12
  (finally: batch done)
caught IllegalArgumentException: not positive: -1
  (finally: batch done)
caught NumberFormatException: For input string: "x"
  (finally: batch done)
```

A thrown exception **propagates up the call stack**: it unwinds each frame that
does not handle it until a matching `catch` is found. The call chain here is
`main → total → parsePositive`:

- **Batch 1** `{3, 4, 5}` — no throw, `total` returns `12`, `finally` still runs.
- **Batch 2** `{3, -1, 5}` — `parsePositive("-1")` throws `IllegalArgumentException`.
  `total` does **not** catch, so the exception passes straight through it (the
  loop stops, `total` never returns) and is caught in `main`.
- **Batch 3** `{3, "x", 5}` — `Integer.parseInt("x")` throws
  `NumberFormatException`, which propagates the same way.

Two details the example pins down:

- **Catch order is most-specific-first.** `NumberFormatException` is a *subclass*
  of `IllegalArgumentException`, so it must be listed before the broader type. Flip
  them and Java refuses to compile (`exception ... has already been caught`),
  because the broad clause would make the specific one unreachable.
- **`finally` always runs.** It executes after a normal return *and* after a
  caught exception, which is why resource cleanup (closing files, releasing
  locks) belongs there. `try`-with-resources is the sugar that automates exactly
  this for `AutoCloseable` types.

This is the *untyped* error channel — failure is an out-of-band throw the
compiler does not force callers to handle (for unchecked exceptions). The
[Typed error channel](../071-typed-error-channel/) concept covers the alternative:
making failure an ordinary typed return value.
