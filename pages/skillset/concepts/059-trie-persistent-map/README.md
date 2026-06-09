# Trie / persistent map — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Uses
only the standard library — a small immutable trie (prefix tree) maps string
keys to `int` values, and each `put` returns a new version that shares every
unchanged subtree with the old one (structural sharing, à la Bagwell's HAMT).

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Compiles and runs `Main.java`. |
| `index.html` / `style.css` | The concept page. |

No external jars are needed — `java.util.HashMap` is part of the JDK. Records
require JDK 16+. Compiled `*.class` files are git-ignored.

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
v1 car = 1
v1 cat = 2
v1 dog = null
v2 dog = 3
shared 'c' subtree: true
```

`v1` holds `car` and `cat`, which share the prefix `ca`. Deriving `v2` by
inserting `dog` leaves `v1` completely intact — it still answers `null` for
`dog`, because it never saw that key. The last line is the point: inserting
`dog` only rebuilt the root node and the brand-new `d` path, so the entire `c`
subtree is reused by reference — `v1.children().get('c') == v2.children().get('c')`
is `true`. That reference sharing is what makes a persistent map cheap: an
update copies only the sliver of structure along one path, never the whole map.
