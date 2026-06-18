# Dependency injection — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) because dependency injection
only shows its value when something *swaps the dependency* — here the **JUnit 5**
test injects a fake `MessageSender`, while `Main` injects the real `EmailSender`.
The same `OrderService` class serves both, unchanged.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/MessageSender.java` | The dependency abstraction (the seam). |
| `src/main/java/com/example/concepts/EmailSender.java` | The real production implementation. |
| `src/main/java/com/example/concepts/OrderService.java` | Depends on `MessageSender`, injected via its constructor. |
| `src/main/java/com/example/concepts/Main.java` | The composition root — wires the real graph together. |
| `src/test/java/com/example/concepts/OrderServiceTest.java` | Injects a fake sender and asserts on it — the DI payoff. |
| `src/test/java/com/example/concepts/CompositionRootTest.java` | Runs `Main` with the real `EmailSender` wired in. |
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
EMAIL to ada@example.com: Your order for Analytical Engine is confirmed.
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(The `EMAIL` line comes from `CompositionRootTest` running the real
`EmailSender`; `OrderServiceTest` prints nothing because its fake records
silently.)

## The idea

**Dependency injection** means a class is *given* its dependencies from the
outside rather than constructing them itself. It is a form of **Inversion of
Control**: the choice of which concrete dependency to use is taken from the class
and handed to whoever assembles the program (the *composition root*).

`OrderService` needs to send a message, but it does not create an `EmailSender`.
It depends on the `MessageSender` *interface* and receives an implementation
through its constructor:

```java
OrderService(MessageSender sender) {
  this.sender = sender;   // injected — not `new EmailSender()`
}
```

That one decision buys two things:

1. **Decoupling** — `OrderService` knows nothing about email, files, SMS, or any
   concrete sender. Swap the implementation without touching it.
2. **Testability** — the real reason this is a test project. Because the
   dependency comes from outside, `OrderServiceTest` injects a `RecordingSender`
   fake and asserts on the captured message. With the anti-pattern
   `new EmailSender()` baked in, there would be no seam to substitute and the
   test would hit a real mail server.

## Anti-pattern vs. injection

| | Hard-wired (bad) | Injected (good) |
| --- | --- | --- |
| Dependency created | inside the class | at the composition root |
| Coupled to | one concrete type | an interface |
| Testable in isolation | no | yes — inject a fake |
| Who chooses the impl | the class itself | the caller |

## The composition root

The concrete `new` calls live in **one place** — `Main` — instead of being
scattered through the codebase:

```java
MessageSender sender = new EmailSender();        // choose once
OrderService orders = new OrderService(sender);  // inject
```

A **DI framework** automates precisely this wiring step. `@Autowired`
(Spring), `@Inject` (Dagger / CDI), or a container registration just builds the
object graph for you — the principle underneath is the constructor injection
shown here.

## Equivalents elsewhere

The pattern is everywhere: Spring IoC / CDI (Java), Dagger / Hilt (Android),
ASP.NET Core DI (C#), Angular DI (TypeScript), Guice (Java), ZLayer (Scala ZIO),
and the Reader monad (Haskell / Scala) as the functional counterpart. The name
and inversion-of-control framing come from Martin Fowler and Robert C. Martin.
