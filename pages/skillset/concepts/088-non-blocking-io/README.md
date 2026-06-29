# Non-blocking I/O — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) so the idea can be exercised
under a real test runner — **JUnit 5**. It implements a **`NonBlockingEchoServer`**:
a *single thread* that serves any number of clients through one `Selector` loop
(the Reactor pattern). An ordinary blocking **`EchoClient`** connects to it, and
`Main` shows two clients being served by the same loop.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/NonBlockingEchoServer.java` | One thread, one `Selector`, many clients — the non-blocking core. |
| `src/main/java/com/example/concepts/EchoClient.java` | An ordinary blocking client; sends a message and reads the echo. |
| `src/main/java/com/example/concepts/Main.java` | Demo: one server thread serves two clients. |
| `src/test/java/com/example/concepts/NonBlockingEchoServerTest.java` | Asserts one loop echoes, multiplexes many clients, and survives disconnects. |
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
Client A got: hello
Client B got: non-blocking
Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(The first two lines come from `DemoRunTest` running `Main`: one server thread
echoes two separate clients through the same select loop.)

## The idea

**Blocking I/O** parks a thread inside `read()` until data arrives, so each
connection needs its own thread. **Non-blocking I/O** never waits: a call that
has no data ready returns immediately. The thread instead asks the OS *which*
channels are ready and services only those — so **one thread multiplexes many
connections**. The multiplexer is a `Selector` (backed by `epoll` on Linux,
`kqueue` on macOS/BSD, `io_uring` on newer Linux).

```java
serverChannel.configureBlocking(false);                   // never block on this channel
serverChannel.register(selector, SelectionKey.OP_ACCEPT); // wake me when a client connects

while (running) {
  selector.select(100);   // wait up to 100 ms for ANY channel to be ready
  for (SelectionKey key : selector.selectedKeys()) {
    if (key.isAcceptable())     acceptClient();   // a connection is waiting
    else if (key.isReadable())  echo(key);        // a client has bytes ready
  }
}
```

`select()` is the heart of it: the thread blocks *once* on the whole set of
channels rather than on a single one, and is handed back exactly the channels
that can make progress without waiting.

## Accepting and reading without blocking

When the listening channel is *acceptable*, `accept()` returns immediately, and
the new client channel is itself set non-blocking and registered for reads — so
its future data wakes the same loop:

```java
SocketChannel client = serverChannel.accept();   // ready, so this returns at once
client.configureBlocking(false);
client.register(selector, SelectionKey.OP_READ); // wake me when this client sends data
```

```java
int read = client.read(buffer);   // ready, so this returns now — never blocks
if (read == -1) { key.cancel(); client.close(); }   // -1 means the peer closed
```

## Why bother

One thread can hold tens of thousands of mostly-idle connections, because a
parked thread (≈1 MB of stack) is replaced by a cheap registration in the
selector:

- **Scalability** — the classic *C10k* problem: serve 10 000+ connections
  without 10 000 threads. Web servers, proxies, and databases work this way.
- **Resource cost** — memory and context-switching scale with *active* work, not
  with the number of open sockets.
- **Foundation for async** — `async/await`, event loops (Node.js), and reactive
  runtimes (`tokio`, Netty, http4s) are all built on a non-blocking selector core.

The trade-off is complexity: control flow is inverted into callbacks/event
handling, partial reads and writes must be handled by hand, and a single slow
handler stalls every connection sharing the loop.

## Equivalents elsewhere

`NIO` / `Selector` (Java); `epoll` (Linux), `kqueue` (BSD/macOS), `io_uring`
(Linux 5.1+); `asyncio` (Python); `tokio::io` (Rust); and `http4s` / `blaze`
(Scala). All let one thread wait on many I/O sources at once and act only on the
ones that are ready — the Reactor and Proactor patterns.
