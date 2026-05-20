# Scheduler / dispatcher — runnable Java example

Java (Project Reactor) version of the concept snippet, runnable with plain
`javac`/`java`. Reactor is the reactive foundation of Spring WebFlux, making it
the most common scheduler/dispatcher in modern enterprise Java.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Downloads the jars into `lib/`, then compiles and runs. |
| `index.html` / `style.css` | The concept page. |

Project Reactor is an external library, so two jars must be on the classpath:

- `reactor-core-3.8.5.jar` — `Flux`/`Mono` and the `Schedulers`
- `reactive-streams-1.0.4.jar` — the `Publisher`/`Subscriber` API Reactor implements

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
map  1 on boundedElastic-1
map  2 on boundedElastic-1
map  3 on boundedElastic-1
next 1 on parallel-1
next 4 on parallel-1
next 9 on parallel-1
```

`subscribeOn(Schedulers.boundedElastic())` runs the source and `map` on the
blocking-I/O pool, while `publishOn(Schedulers.parallel())` hands every stage
below it to the CPU-bound pool — so `map` prints a `boundedElastic-*` thread and
`next` prints a `parallel-*` thread. The exact thread numbers (and how the two
groups interleave) can vary between runs; the thread *pools* are the point.
