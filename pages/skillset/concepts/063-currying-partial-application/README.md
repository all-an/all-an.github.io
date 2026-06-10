# Currying / partial application — runnable JavaScript example

JavaScript version of the concept snippet, runnable with plain `node`. JavaScript
is the natural fit here: first-class functions, closures, and terse arrow syntax
make `a => b => a + b` read almost like the math.

## Files

| File | Purpose |
| --- | --- |
| `curry.js` | The runnable snippet. |
| `run.sh` | Runs `curry.js` via `node`. |
| `index.html` / `style.css` | The concept page. |

No dependencies and no build step — just `node`.

## Run it (recommended)

```sh
chmod +x run.sh   # make the script executable (only needed once)
./run.sh          # runs curry.js
```

## Run it manually

```sh
node curry.js
```

## Expected output

```
15
11
7
15
```

`add` is curried: `add(a)` returns a function still waiting for `b`, with `a`
captured in the closure. *Partial application* is the payoff — `add(10)` fixes
the first argument and hands back a reusable "add ten" you can name and pass
around. `curry2` shows the general move: wrap any ordinary two-argument function
so it takes its arguments one at a time, which is how `triple = curry2(multiply)(3)`
specializes `multiply` by fixing `x = 3`. No language feature is required beyond
closures, which is why currying feels native in JavaScript.
