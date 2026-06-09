# Monad / chain — runnable Scala example

Scala version of the concept snippet, runnable with
[scala-cli](https://scala-cli.virtuslab.org). Uses only the standard library —
`Either[String, Int]` as the monad, chained with `flatMap` and, equivalently,
with a `for`-comprehension.

## Files

| File | Purpose |
| --- | --- |
| `Main.scala` | The runnable snippet. |
| `run.sh` | Compiles and runs `Main.scala` via scala-cli. |
| `index.html` / `style.css` | The concept page. |

No external dependencies — just `Either`, `toIntOption`, and `Int` arithmetic.
Compiled output and the `.scala-build/` cache are git-ignored.

## Run it (recommended)

```sh
chmod +x run.sh   # make the script executable (only needed once)
./run.sh          # compiles and runs Main.scala
```

## Run it manually

```sh
scala-cli run Main.scala
```

## Expected output

```
(84, 2) -> flatMap: Right(42)  |  for: Right(42)
(84, 0) -> flatMap: Left(divide by zero)  |  for: Left(divide by zero)
(eight, 2) -> flatMap: Left(not a number: 'eight')  |  for: Left(not a number: 'eight')
```

`Either` is a monad because it has `flatMap` (the monadic *bind*, written `>>=`
in Haskell): each step takes the unwrapped value and returns the next wrapped
value. For `Either` the threading rule is short-circuiting — a `Left` skips the
rest of the chain and becomes the answer, which is why the divide-by-zero and
non-number rows stop early. The `chained` and `sugared` functions print the same
result on every input because the `for`-comprehension is **pure syntactic
sugar**: the compiler rewrites it back into exactly the `flatMap` chain. That
equivalence — readable linear steps that *are* a monadic `flatMap` pipeline — is
the whole point of the concept.
