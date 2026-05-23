# Backpressure — runnable Java example

Java (Project Reactor) version of the concept snippet, runnable with plain
`javac`/`java`. Reactor is the reactive foundation of Spring WebFlux, making it
the most common place enterprise Java meets backpressure.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Downloads the jars into `lib/`, then compiles and runs. |
| `index.html` / `style.css` | The concept page. |

Project Reactor is an external library, so two jars must be on the classpath:

- `reactor-core-3.8.5.jar` — `Flux`/`Mono` and the `onBackpressure*` operators
- `reactive-streams-1.0.4.jar` — the `Publisher`/`Subscriber`/`Subscription` API Reactor implements

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
consumed 1
consumed 2
consumed 3
dropped  4
dropped  5
dropped  6
dropped  7
dropped  8
dropped  9
dropped  10
```

The subscriber requests only 3 items in `hookOnSubscribe`, so `onBackpressureDrop`
forwards the first three values and discards everything the consumer never asked
for. This is the essence of backpressure: the consumer's bounded demand — not the
producer's pace — decides how much data flows, and the chosen strategy (here,
*drop*) determines what happens to the overflow.
