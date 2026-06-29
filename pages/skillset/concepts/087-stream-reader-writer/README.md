# Stream / reader-writer — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) so the idea can be exercised
under a real test runner — **JUnit 5**. It defines a **`StreamCopier`** that pumps
bytes from a **source** (`InputStream`) to a **sink** (`OutputStream`) a chunk at
a time, and an **`UpperCaseStream`** filter stage that transforms bytes as they
flow through the pipe. `Main` shows both a plain copy and a filtered one printing
to the console.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/StreamCopier.java` | Copies bytes source → buffer → sink, a chunk at a time. |
| `src/main/java/com/example/concepts/UpperCaseStream.java` | A filter stage: wraps an `InputStream` and uppercases each byte. |
| `src/main/java/com/example/concepts/Main.java` | Demo: a plain copy and a copy routed through the filter. |
| `src/test/java/com/example/concepts/StreamCopierTest.java` | Asserts every byte reaches the sink, including a payload bigger than the buffer. |
| `src/test/java/com/example/concepts/UpperCaseStreamTest.java` | Asserts the filter transforms bytes and still plugs into `StreamCopier`. |
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
Copied 14 bytes: hello, streams
Through filter: HELLO, STREAMS
Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(The first two lines come from `DemoRunTest` running `Main`: a plain copy moves
the bytes unchanged, and a copy routed through `UpperCaseStream` uppercases them
on the way through.)

## The idea

A **stream** is a **sequence of bytes (or characters) you process a piece at a
time** rather than holding all at once. A **reader** is a source you *pull* from;
a **writer** is a sink you *push* to. Decoupling them behind the `InputStream` /
`OutputStream` abstractions means the same code works whether the bytes come from
a file, a socket, or memory — and the payload can be far larger than RAM.

```java
public static long copy(InputStream source, OutputStream sink) throws IOException {
  byte[] buffer = new byte[8 * 1024];   // an 8 KiB window, not the whole payload
  long total = 0;

  int read;
  while ((read = source.read(buffer)) != -1) {   // -1 means the source is drained
    sink.write(buffer, 0, read);                 // write only what was actually read
    total += read;
  }
  return total;
}
```

Nothing here knows what the source or sink concretely *is*. A 14-byte string and
a 14-gigabyte file copy with the identical loop, and memory stays bounded by the
buffer either way.

## Composing a pipe

Because a filter stage **is itself an `InputStream`**, it drops into the same
`copy()` with no special handling — streams compose like a Unix pipeline,
`cat file | tr a-z A-Z | ...`:

```java
public final class UpperCaseStream extends FilterInputStream {

  public UpperCaseStream(InputStream source) { super(source); }

  @Override
  public int read(byte[] buffer, int offset, int length) throws IOException {
    int read = in.read(buffer, offset, length);   // pull from upstream
    for (int i = offset; i < offset + read; i++) {
      buffer[i] = (byte) Character.toUpperCase(buffer[i]);   // transform on the way through
    }
    return read;
  }
}
```

```java
StreamCopier.copy(new UpperCaseStream(source), sink);   // bytes arrive uppercased
```

## Why bother

Streaming keeps memory **bounded by the buffer, not the payload**, and lets
independent stages snap together:

- **Large data** — copying a file, downloading a response, or piping a video
  never materialises the whole thing in memory.
- **Composition** — buffering, compression, encryption, and encoding are each a
  stream that wraps another (`GZIPInputStream`, `CipherInputStream`,
  `BufferedReader`), stacked in any order.
- **Uniformity** — files, sockets, and in-memory buffers all expose the same
  `read`/`write` surface, so code written against the abstraction is reusable.

The trade-off is that a stream is **forward-only and stateful**: you can read it
once, you must close it to release the underlying resource, and a byte stream
needs a charset before it becomes text.

## Equivalents elsewhere

`InputStream` / `OutputStream` (Java); `io.Reader` / `io.Writer` (Go); the
`Read` / `Write` traits and `BufReader` (Rust); file streams (C++, Python); and
`fs2.Stream` (Scala). All model data as a sequence pulled from a source and
pushed to a sink a piece at a time, behind an abstraction that hides what the
endpoints concretely are.
