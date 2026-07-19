# Capability / permission system — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) so the idea can be exercised
under a real test runner — **JUnit 5**. It builds a file store whose data is
reachable **only** through capabilities: the store is never handed out, and the one
root reference that can reach it is created with it. That root is then **attenuated**
down to a read-only view of a single directory, **delegated** to an untrusted plugin,
and finally **revoked** — none of which involves checking who anyone is.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/FileStore.java` | The protected resource and the root capability; the only way in. |
| `src/main/java/com/example/concepts/FileAccess.java` | Full authority: read, write, list. |
| `src/main/java/com/example/concepts/ReadAccess.java` | Narrow authority: read and list only — deliberately *not* a supertype of `FileAccess`. |
| `src/main/java/com/example/concepts/Attenuation.java` | Deriving weaker capabilities: read-only views and subtree scoping. |
| `src/main/java/com/example/concepts/Caretaker.java` | Revocable forwarding (Redell, 1974) — splits use from control. |
| `src/main/java/com/example/concepts/Plugin.java` | Untrusted third-party code whose entire authority arrives via its constructor. |
| `src/main/java/com/example/concepts/Main.java` | Demo: grant, confine, deny, revoke. |
| `src/test/java/com/example/concepts/CapabilityTest.java` | Asserts attenuation only weakens, cannot be cast back, delegation carries authority, and revocation is real. |
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
Root capability sees: [/etc/secrets.txt, /home/notes.txt, /home/todo.txt]

Plugin can do its job:
/home/notes.txt (8 chars)
/home/todo.txt (17 chars)

Plugin reading /etc/secrets.txt: outside this capability's scope: /etc/secrets.txt
Plugin's capability is a FileAccess? false

After revoke(), plugin: this capability has been revoked
Root still works: hunter2
Tests run: 10, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(The first lines come from `DemoRunTest` running `Main`.)

## The idea

In the **object-capability model**, authority *is* a reference. To be allowed to do
something you must hold an unforgeable object that does it. There is no identity to
check and no permission list to consult, because code that was never handed the
object cannot express the request at all.

This is the opposite of **ambient authority** — the design every mainstream language
ships with, where `Files.readString(path)` is reachable from any line in the process
and the only defence is asking *who is calling*. Under an ACL, a library you
imported runs with all of your permissions. Under capabilities it runs with exactly
what you passed it.

Capabilities are **unforgeable**, **attenuable**, **delegable** and **revocable**.

## No ambient authority

This is a structural property, not a rule anyone follows. The resource is
unreachable — the store is never handed out, only a capability that closes over it,
created together with the single root reference that can reach it.

```java
private FileStore() {
}

// Create a store and return the *only* reference that can reach it.
public static FileAccess createWithRootAccess() {
  return new RootAccess(new FileStore());
}
```

`RootAccess` is a private record, so no other code can build one. The only way to
hold a capability is to be given it — that is what "unforgeable" means here.

## Attenuation: narrowing, never widening

Every derivation returns a strictly weaker capability, and nothing can widen one.
The subtle part is that narrowing must produce a genuinely *different object*:

```java
public static ReadAccess readOnly(FileAccess full) {
  return new ReadOnlyView(full);
}
```

If `FileAccess` were a subtype of `ReadAccess`, anyone given the "read-only" view
could cast it straight back to full authority. That is why the two interfaces are
deliberately unrelated, and why the test asserts the cast fails:

```java
ReadAccess readOnly = Attenuation.readOnly(root);
assertFalse(readOnly instanceof FileAccess);
```

Scoping narrows a different way — still read/write, but only inside a subtree. Note
what the check does *not* do: it never asks who is calling.

```java
private String checkInScope(String path) {
  if (!path.startsWith(pathPrefix)) {
    throw new SecurityException("outside this capability's scope: " + path);
  }
  return path;
}
```

A scoped capability also filters `list()`, because revealing what exists outside your
reach is itself a leak.

## Delegation makes authority legible

Passing the reference *is* the grant, so a component's powers can be read off its
construction:

```java
Plugin plugin = new Plugin(Attenuation.readOnly(Attenuation.scopedTo(root, "/home/")));
```

Everything that plugin can reach is in that one expression. You do not have to read
its body to bound what it can do.

## Revocation: the caretaker pattern

A reference handed away is gone — you cannot reach into another component and take
it back. So you never hand over the real capability: you give out a forwarder you
can switch off (Redell, 1974).

```java
private ReadAccess target;                              // dropped on revocation
private final ReadAccess forwarder = new Forwarder();   // what the grantee holds

public ReadAccess access() { return forwarder; }
public void revoke() { target = null; }
```

The essential move is that this splits one capability into **two objects that go to
different places**: the grantee gets `access()` and can use the resource; the
grantor keeps the `Caretaker` and can revoke. The grantee holds the same forwarder
before and after — its authority changes underneath it, and it has no route back to
the caretaker to undo that.

## A guarantee the compiler makes

One assertion is deliberately absent from the tests. There is no check that the
granted reference is not a `Caretaker`, because it **cannot be written**:

```java
caretaker.access() instanceof Caretaker   // compile error, not a failing test
```

A `ReadAccess` provably can never be that unrelated final type, so javac rejects the
expression outright. The compiler rules it out before the code can exist, which is a
stronger guarantee than any test could give — capability design working as intended,
with the safety property enforced by the type system rather than caught at run time.

## Why bother

- **It dissolves the confused deputy problem.** Under ambient authority every library
  you import runs with your full permissions, so a supply-chain compromise anywhere
  is a compromise everywhere — and identity checks cannot help, because the
  malicious code genuinely *is* you.
- **Authority is auditable.** What a component can reach is visible at the call site
  that constructed it, not distributed across every line it might execute.
- **Least privilege is the default.** You cannot over-grant by accident, because
  granting is an explicit act.

The trade-offs: it has to be pervasive to be worth much — one ambient back door (a
static file API, reflection, an unguarded singleton) undoes the whole property,
which is why retrofitting capabilities onto an existing language is so hard, and why
Java's `SecurityManager` was deprecated rather than repaired. Passing capabilities
explicitly is also more plumbing than calling a global, revocation costs an
indirection per grant, and "who can reach this file?" becomes a hard question
precisely because there is no central list to consult.

## Equivalents elsewhere

`sealed` types and the module system (Java / Kotlin / Scala) for controlling who can
hold what; `capability` types (Pony); `WASI` (WebAssembly), where a module can reach
only the handles the host explicitly passes in — the cleanest mainstream example
today; and the `E` language, where the object-capability model was worked out (Mark
Miller). All replace "check who is asking" with "you can only call what you hold".
