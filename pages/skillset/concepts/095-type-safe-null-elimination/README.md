# Type-safe null elimination — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) so the idea can be exercised
under a real test runner — **JUnit 5**. It uses **`java.util.Optional`** — the real
API, not a hand-rolled `Maybe` — to model a directory lookup that can find nothing
and a manager chain that can end at any step.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/User.java` | A user whose manager is optional in the domain itself. |
| `src/main/java/com/example/concepts/Directory.java` | Lookups that can find nothing, composed without null checks. |
| `src/main/java/com/example/concepts/Main.java` | Demo: present, absent, and missing entirely. |
| `src/test/java/com/example/concepts/OptionalTest.java` | Asserts short-circuiting, composition, forced handling — and the `get()` escape hatch. |
| `src/test/java/com/example/concepts/DemoRunTest.java` | Runs `Main` so its output shows during the build. |
| `run.sh` | Runs `mvn test`. |
| `index.html` / `style.css` | The concept page. |

The `target/` build directory is git-ignored.

## Run it

```sh
chmod +x run.sh   # only needed once
./run.sh          # runs: mvn test
```

The **first** run downloads JUnit into your local `~/.m2` cache; afterwards it runs
offline.

## Expected result

```
carla's manager : bruno
ana's manager   : none
dora's manager  : none

carla's grand-manager : ana
bruno's grand-manager : none
Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

## The idea

A null reference makes every type secretly mean "or nothing", so the compiler cannot
tell you where absence is possible — Tony Hoare called it his billion-dollar
mistake. The fix is to put absence **in the type**: `User` means there is one,
`Optional<User>` means there might not be.

```java
public Optional<User> find(String name) {
  return Optional.ofNullable(usersByName.get(name));   // null stops here
}
```

`ofNullable` is the boundary adapter: null is converted once, at the edge, so
nothing downstream has to think about it.

## Composition is the payoff

Steps that can each come up empty compose flat, because `flatMap` skips the empty
case instead of testing for it:

```java
public Optional<String> grandManagerOf(String name) {
  return find(name)
      .flatMap(User::managerName)
      .flatMap(this::find)
      .flatMap(User::managerName);
}
```

The same logic with nullable returns needs a null check between every step, nested.
Here the null checks are **gone**, not relocated — and `orElse` makes the caller say
what absence means.

## The caveat

In Java this is a library type, not a language one:

```java
assertThrows(NoSuchElementException.class, () -> directory.find("dora").get());
```

`Optional` is not sealed, so there is no exhaustive `switch` forcing you to handle
the empty case, and `get()` on an empty one throws — moving an NPE rather than
removing it. Kotlin's `T?` and Rust's `Option<T>` are enforced by the compiler;
`Optional` is a discipline the API encourages. The usual guidance follows from that:
use it for **return types**, not fields or parameters.

## Equivalents elsewhere

`Optional` (Java 8+), `Option<T>` (Rust, Scala), `Maybe` (Haskell), `T?` with `?.`
and `!!` (Kotlin). The compiler-enforced ones make absence unrepresentable unless
declared; Java's makes it visible and inconvenient to ignore.
