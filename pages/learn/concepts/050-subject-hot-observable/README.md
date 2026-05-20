# Subject / hot observable — runnable example

Java (RxJava 3) version of the concept snippet, runnable with plain `javac`/`java`.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Downloads the jars into `lib/`, then compiles and runs. |
| `index.html` / `style.css` | The concept page. |

RxJava is an external library, so two jars must be on the classpath:

- `rxjava-3.1.10.jar` — the operators and `Subject` types
- `reactive-streams-1.0.4.jar` — RxJava's only compile dependency

`run.sh` fetches both from Maven Central into `lib/` (only on the first run). The
`lib/` folder and compiled `*.class` files are git-ignored.

## Run it (recommended)

```sh
chmod +x run.sh   # make the script executable (only needed once)
./run.sh          # downloads jars if missing, then compiles and runs
```

## Run it manually

Once the jars are in `lib/` (run `./run.sh` once, or download them yourself):

```sh
javac -cp "lib/*" Main.java
java  -cp "lib/*:." Main      # use ';' instead of ':' on Windows
```

## Expected output

```
A: AAPL 191.4
A: AAPL 191.7
B: AAPL 191.7
```

Subscriber `A` is attached before any value is pushed, so it sees both prices.
Subscriber `B` joins later and only sees the value emitted after it subscribed —
the defining behavior of a hot subject.
