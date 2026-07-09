# Serialization / marshalling — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) so the idea can be exercised
under a real test runner — **JUnit 5**. It implements a **`Serialization`** helper
that marshals an object graph to a `byte[]` with `ObjectOutputStream` and rebuilds
it with `ObjectInputStream`. `Main` marshals an `Account` — which holds a tag
collection and a nested `Contact` — shows the byte stream and its `0xAC 0xED`
header, then reconstructs an equal but distinct copy and proves the `transient`
field was dropped.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/Serialization.java` | Marshals an object to bytes and unmarshals bytes back into an object. |
| `src/main/java/com/example/concepts/Account.java` | A `Serializable` domain object with a collection, a nested object, and a `transient` field. |
| `src/main/java/com/example/concepts/Contact.java` | A nested `Serializable` object, to show the whole graph is flattened. |
| `src/main/java/com/example/concepts/Main.java` | Demo: serialize a graph, reconstruct it, show it is an equal deep copy with the transient field dropped. |
| `src/test/java/com/example/concepts/SerializationTest.java` | Asserts round-trip fidelity, a portable byte stream, a distinct deep copy, and that transient state is not written. |
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
Serialized size: 377 bytes
Stream header: 0xAC 0xED
Deserialized: Account[id=AC-1001, owner=Ada Lovelace, balanceCents=4200, tags=[vip, beta], contact=Contact[email=ada@example.com, phone=+44 20 7946 0958]]
Equal by value: true
Same instance: false
Token after round-trip: null
Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(The first lines come from `DemoRunTest` running `Main`: an object graph is
marshalled to bytes, reconstructed as an equal but distinct copy, and the
transient session token is gone. The exact byte count can vary slightly by JDK.)

## The idea

An object lives as a graph of references in memory — a private layout the process
alone can read. To store it in a file or send it over a socket, it must first
become a flat sequence of **bytes**. **Serialization** (a.k.a. *marshalling*) is
that flattening; **deserialization** reads the bytes back and reconstructs an
equal object graph.

```java
byte[] wire = Serialization.serialize(account);   // graph -> bytes
Account copy = Serialization.deserialize(wire, Account.class);  // bytes -> graph
```

Java's built-in mechanism writes a stream header (the magic bytes `0xAC 0xED`),
then a description of each class and its field values, recursively, for the whole
reachable graph.

## Value, not identity

The round trip is lossless for the **value** but not for **identity**: the copy
equals the original, yet it is a brand-new instance — a deep copy — and so is
every nested object in it.

```java
original.equals(copy);              // true  — same value
original == copy;                   // false — a new instance
original.contact() == copy.contact();   // false — the graph was rebuilt
```

## What travels

Only the **serial state** travels: every non-`transient` field, including
collections and nested objects. A `transient` field is skipped and comes back at
its default value — the place to keep per-runtime secrets and caches out of the
wire form.

```java
private final transient String sessionToken;   // never serialized -> null on read
```

`serialVersionUID` stamps the format so incompatible old bytes are rejected rather
than silently misread.

## Why bother

- **Persistence & transport** — files, caches, message queues, and RPC all need
  objects turned into bytes and back.
- **Reproducibility** — a stable, versioned format lets one process (or a later
  run) rebuild exactly what another produced.
- **Deep copy** — round-tripping a graph is a simple way to clone it entirely.

The trade-off: the format is a contract — change a class carelessly and old bytes
no longer deserialize. Java's *native* serialization in particular is verbose,
JVM-only, and a notorious security risk: `readObject` on untrusted data is a
classic remote-code-execution vector. Production systems usually marshal to an
explicit, cross-language schema instead.

## Equivalents elsewhere

`Jackson` / `ObjectOutputStream` (Java); `serde` (Rust); `json.Marshal` (Go);
`circe` / `upickle` (Scala); `pickle` (Python); `protobuf` (polyglot). All turn an
in-memory object into a portable byte sequence and reconstruct it, trading a
language-private layout for a format that crosses processes, machines, and time.
