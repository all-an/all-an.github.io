# Ring buffer / circular queue — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Uses
only the standard library — a fixed-capacity FIFO queue backed by one array
whose ends are joined into a ring, so `head` and `tail` wrap around with modulo
instead of shifting elements or growing.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Compiles and runs `Main.java`. |
| `index.html` / `style.css` | The concept page. |

No external jars are needed — it is plain arrays and `int` arithmetic. Compiled
`*.class` files are git-ignored.

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
full? rejects 4th: false
dequeue: 1
dequeue: 2
dequeue: 3
dequeue: 4
dequeue: 5
```

The ring holds three slots. After enqueuing `1, 2, 3` it is full, so a fourth
`enqueue` returns `false` rather than overwriting. Removing `1` and `2` frees
the front two slots, and the next two enqueues (`4`, `5`) reuse slots `0` and
`1` because `tail` has wrapped back to the start of the array — no element is
ever moved and the array is never resized. The dequeues come out `3, 4, 5`,
showing FIFO order is preserved straight across the wrap point. That wrap is the
whole idea: a bounded queue in a single fixed array, with O(1) enqueue and
dequeue and no allocation after construction.
