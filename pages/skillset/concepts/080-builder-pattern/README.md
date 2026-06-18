# Builder pattern — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) so the fluent builder can be
exercised under a real test runner — **JUnit 5** — proving defaults apply, set
fields override them, and `build()` rejects an invalid object. `Main` shows the
same builder in action.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/HttpRequest.java` | Immutable object + its static nested `Builder`. |
| `src/main/java/com/example/concepts/Main.java` | Demo: one request on defaults, one fully customized. |
| `src/test/java/com/example/concepts/HttpRequestTest.java` | Asserts defaults, overrides, and `build()` validation. |
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
GET https://example.com/status (timeout=30s, headers={})
POST https://example.com/orders (timeout=60s, headers={Content-Type=application/json, Authorization=Bearer token123}, body={"item":"Analytical Engine"})
Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(The two lines come from `DemoRunTest` running `Main`: the first request used all
defaults, the second customized every field.)

## The idea

The **Builder pattern** separates *constructing* a complex object from its
*representation*. `HttpRequest` has one required field (`url`) and several
optional ones (`method`, `timeoutSeconds`, `body`, `headers`). Rather than a
constructor taking all of them positionally, a `Builder` collects each value
through a named, chainable setter and produces the object in `build()`:

```java
HttpRequest r = new HttpRequest.Builder()
    .url("https://example.com/orders")
    .method("POST")
    .timeoutSeconds(60)
    .build();
```

## Why bother — the telescoping constructor

Without a builder, an object with N optional fields forces either:

- **One huge constructor** — `new HttpRequest(url, method, timeout, body, headers)`
  — where call sites are an unreadable wall of positional arguments and two
  fields of the same type are trivially swapped by mistake; or
- **Many overloaded constructors** — one per combination of optional fields —
  which explodes combinatorially.

The builder replaces both with a fluent chain where each value is **named**,
**order-independent**, and **optional**.

## Three guarantees a builder buys

1. **Defaults** — optional fields carry their default in the builder, so callers
   set only what they care about.
2. **Immutability** — `HttpRequest`'s fields are `final` and its constructor is
   `private`. Once built, it cannot change; the only path to one is the builder.
3. **Validation in one place** — `build()` is the single gate. It checks the
   whole object (`url` present, `timeoutSeconds` positive) and throws otherwise,
   so an invalid `HttpRequest` can never exist. Public setters on the object
   itself could not make that promise.

## Equivalents elsewhere

A Gang of Four creational pattern. In practice: Lombok's `@Builder` generates one
for you (Java); Kotlin and Scala lean on `copy()` over `data`/`case class` plus
default arguments; Rust uses struct-update syntax `Foo { x, ..base }`; Python and
Swift use named and default parameters, which cover many of the same needs
without a separate builder type.
