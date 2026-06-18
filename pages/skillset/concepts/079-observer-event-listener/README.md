# Observer / event listener — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) because the Observer pattern
only means something when something *subscribes and reacts* — here the **JUnit 5**
tests register observers, push updates, and assert each one was notified, while
`Main` shows the same pattern printing to the console.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/TemperatureObserver.java` | The observer / event-listener interface. |
| `src/main/java/com/example/concepts/WeatherStation.java` | The subject — keeps observers and broadcasts changes. |
| `src/main/java/com/example/concepts/Display.java` | A concrete observer that prints. |
| `src/main/java/com/example/concepts/Main.java` | Demo: subscribe, notify, unsubscribe, lambda observer. |
| `src/test/java/com/example/concepts/WeatherStationTest.java` | Asserts notification, value delivery, and unsubscribe. |
| `src/test/java/com/example/concepts/DemoRunTest.java` | Runs `Main` so its output shows during the build. |
| `run.sh` | Runs `mvn test`. |
| `index.html` / `style.css` | The concept page. |

The `target/` build directory is git-ignored.

## Run it (recommended)

```sh
chmod +x run.sh   # make the script executable (only needed once)
./run.sh          # runs: mvn test
```

The **first** run downloads JUnit into your local `~/.m2` cache and needs
network access; afterwards it runs offline.

## Run it manually

```sh
mvn test
```

## Expected result

```
-- setting 22.5°C --
Phone shows 22.5°C
Window unit shows 22.5°C
-- setting 31.0°C --
Window unit shows 31.0°C
Heat warning! 31.0°C
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(The console lines come from `DemoRunTest` running `Main`. Note the `Phone`
unsubscribed before the second update, so it does not appear again.)

## The idea

The **Observer pattern** decouples a source of events from the things that react
to them. The **subject** (`WeatherStation`) holds a list of **observers** and,
whenever its state changes, pushes the new value to each one:

```java
void setTemperature(double celsius) {
  this.celsius = celsius;
  for (TemperatureObserver o : new ArrayList<>(observers)) {
    o.onTemperatureChanged(celsius);   // push the new value to every listener
  }
}
```

The subject knows observers **only** through the `TemperatureObserver`
interface, so:

1. **New listeners cost nothing** — add another observer without touching
   `WeatherStation`.
2. **Listeners are independent** — a `Display`, a lambda heat-warning, a logger,
   all coexist and none knows about the others.
3. **Subscription is dynamic** — `subscribe` / `unsubscribe` change who listens
   at runtime.

## Push vs. pull

This is the **push** model: the subject hands the new value to the observer's
callback. The alternative is **pull**, where the subject only signals "something
changed" and each observer queries the subject for what it needs. Push is simpler
and used here; pull avoids sending data an observer may not want.

## Why iterate a copy?

`notifyObservers` loops over `new ArrayList<>(observers)`. If an observer
unsubscribed itself (or subscribed another) from inside its callback, mutating
the live list mid-iteration would throw `ConcurrentModificationException`.
Iterating a snapshot makes notification safe against that.

## Equivalents elsewhere

The pattern is one of the Gang of Four originals (1994) and is everywhere:
`EventListener` (Java Swing / the DOM), `@EventHandler` (Spring),
`event` / `delegate` (C#), signal/slot (Qt C++). Its asynchronous, composable
descendant is the **reactive stream** — `Observable` (RxJava / RxJS),
`Flow` (Kotlin), `Flux` (Reactor), `ZStream` (Scala ZIO) — which adds operators,
scheduling, and backpressure on top of the same subscribe-and-be-notified core.
