# Priority queue / heap — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Uses
only the standard library — a priority queue backed by a binary min-heap stored
in a single array, where every parent is `<=` its children, so the smallest
element is always at the root.

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
poll: 1
poll: 2
poll: 3
poll: 4
poll: 5
```

The values are inserted in scrambled order (`5, 1, 4, 2, 3`), but each `poll`
returns the current smallest element. Internally the heap is a complete binary
tree flattened into an array: a node at index `i` has its parent at `(i - 1) / 2`
and its children at `2i + 1` and `2i + 2`, so no pointers are stored. `offer`
appends to the end and *sifts up* while the new value is smaller than its parent;
`poll` removes the root, moves the last element into its place, and *sifts down*
while a child is smaller. Each operation walks a single root-to-leaf path, so
insertion and removal are O(log n) while reading the minimum is O(1). Draining
the heap one `poll` at a time yields the elements in sorted order — that is
exactly heapsort.
