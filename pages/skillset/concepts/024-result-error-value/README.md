# Result / error value — runnable TypeScript example

TypeScript version of the concept snippet, runnable with **Node 23.6+**, which
strips TypeScript types natively and runs the JavaScript — no `tsc`, `ts-node`,
or build tool required. Models success-or-failure as a discriminated union
`Result<T, E>`, the idiomatic TypeScript fit because the compiler *narrows* the
union after you check the tag.

## Files

| File | Purpose |
| --- | --- |
| `result.ts` | The runnable snippet. |
| `run.sh` | Runs `result.ts` via `node`. |
| `index.html` / `style.css` | The concept page. |

No dependencies and no compiled output — Node strips the types in memory.

## Run it (recommended)

```sh
chmod +x run.sh   # make the script executable (only needed once)
./run.sh          # runs result.ts
```

## Run it manually

```sh
node result.ts
```

## Expected output

```
42 -> age is 42
-1 -> error: invalid age: '-1'
abc -> error: invalid age: 'abc'
```

`parseAge` returns a `Result<number, string>` — a value on success, an error
message on failure — instead of throwing. The union's literal `ok: true | false`
field is the *discriminant*: once you test `if (r.ok)`, TypeScript narrows the
type so `r.value` is reachable only in the success branch and `r.error` only in
the failure branch. Reaching for the wrong field in the wrong branch is a
compile error, which is exactly how the type system forces both cases to be
handled — the same guarantee Scala's `Either` gives through pattern matching.
