# For comprehension / do notation — runnable TypeScript example

TypeScript version of the concept snippet, runnable with **Node 23.6+**, which
strips TypeScript types natively and runs the JavaScript — no `tsc`, `ts-node`,
or build tool required. JavaScript is the idiomatic fit here because its
`async/await` *is* do-notation specialized to the `Promise` monad — `await` is
the Promise's `flatMap`, and the code after it is the continuation.

## Files

| File | Purpose |
| --- | --- |
| `comprehension.ts` | The runnable snippet. |
| `run.sh` | Runs `comprehension.ts` via `node`. |
| `index.html` / `style.css` | The concept page. |

No dependencies and no compiled output — Node strips the types in memory.

## Run it (recommended)

```sh
chmod +x run.sh   # make the script executable (only needed once)
./run.sh          # runs comprehension.ts
```

## Run it manually

```sh
node comprehension.ts
```

## Expected output

```
#1  sugar: Ada ordered book, pen  |  desugared: Ada ordered book, pen
#2  sugar: Linus ordered laptop  |  desugared: Linus ordered laptop
#9  sugar: error: no user #9  |  desugared: error: no user #9
```

JavaScript's `async/await` is **syntactic sugar over monadic `flatMap`/bind**: a
chain of dependent steps reads top-to-bottom instead of nesting, and a failing
step short-circuits the rest. The two columns above are the same computation
written both ways:

- `summarySugar` uses `async/await` — each `await` is a **bind**, and the steps
  read as plain sequential statements even though `items` depends on `name` from
  the previous bind.
- `summaryDesugared` is exactly what that compiles to: nested `Promise.then`,
  which is the Promise monad's `flatMap`. This is the bind chain the sugar hides.

Both forms agree on every row, and the unknown id `#9` short-circuits both (its
first bind rejects, so step 2 never runs).

Scala's `for` comprehension and Haskell's `do` notation are the same sugar,
generalized — they give this top-to-bottom bind chain (and the same
short-circuit) over `Option`/`Either` and every other monad, not just the async
one.

## The catch: async/await is do-notation for *one* monad

`async/await` only sequences `Promise`s. Scala's `for` and Haskell's `do` work
over **any** monad — `Option`, `List`, `Either`, `IO`, `State`. That generality
is why those languages reuse one syntax everywhere, while JavaScript needs a
separate keyword (`await`) bolted onto just the async case.

**Java has no equivalent syntax at all.** You either chain `flatMap` by hand
(see the [Monad / chain](../065-monad-chain/) concept) or reach for virtual
threads (Project Loom, Java 21+), which make blocking code run asynchronously by
a *different mechanism* — real cheap threads, not desugaring into binds.
