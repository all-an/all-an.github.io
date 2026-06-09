# Persistent / immutable collection — runnable Java example

Java (Vavr) version of the concept snippet, runnable with plain `javac`/`java`.
Vavr is the canonical persistent-collections library for the JVM — its `List`,
`Map`, `Set`, and friends all use structural sharing instead of copy-on-write.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Downloads the jar into `lib/`, then compiles and runs. |
| `index.html` / `style.css` | The concept page. |

Vavr is an external library, so one jar must be on the classpath:

- `vavr-0.10.4.jar` — `io.vavr.collection.List` and the other persistent collections

`run.sh` fetches it from Maven Central into `lib/` (only on the first run). The
`lib/` folder and compiled `*.class` files are git-ignored.

## Run it (recommended)

```sh
chmod +x run.sh   # make the script executable (only needed once)
./run.sh          # downloads the jar if missing, then compiles and runs
```

## Run it manually

Once the jar is in `lib/` (run `./run.sh` once, or download it yourself):

```sh
javac -cp "lib/*" Main.java
java  -cp "lib/*:." Main      # use ';' instead of ':' on Windows
```

## Expected output

```
original: List(1, 2, 3)
extended: List(0, 1, 2, 3)
dropped:  List(2, 3)
extended.tail() == original ? true
```

The last line is the whole point. `original` is never modified — `prepend` and
`tail` return new lists — yet `extended.tail()` is *the same object* as
`original`, not a copy. The prepended cons cell simply points at the existing
list, so building `extended` costs one allocation rather than copying all three
elements. That structural sharing is what separates a *persistent* collection
from one that is merely immutable, and it is why functional languages can hand
out "modified" copies cheaply.
