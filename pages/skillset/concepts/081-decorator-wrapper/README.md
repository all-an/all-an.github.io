# Decorator / wrapper — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) so the wrapping can be
exercised under a real test runner — **JUnit 5** — proving stacked decorators
compose their cost and description correctly. `Main` shows the same wrapping
printing to the console.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/Coffee.java` | The shared component interface. |
| `src/main/java/com/example/concepts/Espresso.java` | The concrete base component. |
| `src/main/java/com/example/concepts/CoffeeDecorator.java` | Abstract decorator — implements *and* holds a `Coffee`. |
| `src/main/java/com/example/concepts/Milk.java` | A concrete decorator adding milk. |
| `src/main/java/com/example/concepts/Sugar.java` | A concrete decorator adding sugar. |
| `src/main/java/com/example/concepts/Main.java` | Demo: stack decorators around an espresso. |
| `src/test/java/com/example/concepts/CoffeeDecoratorTest.java` | Asserts contribution, stacking, order, and IS-A. |
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
Espresso = 200 cents
Espresso + Milk = 250 cents
Espresso + Milk + Sugar = 275 cents
Espresso + Sugar + Milk = 275 cents
Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(The lines come from `DemoRunTest` running `Main`: a plain espresso, then the
same drink wrapped in one and then several decorators. The last two have the
same total — the add-ons are composable — but read in different order.)

## The idea

The **Decorator pattern** attaches new behavior to an object by **wrapping** it
in another object of the **same interface**. The wrapper holds the thing it
wraps, forwards to it, and adds its own contribution:

```java
abstract class CoffeeDecorator implements Coffee {
  protected final Coffee inner;            // wraps a Coffee...
  // ...and IS a Coffee, so it can be wrapped again.
}

class Milk extends CoffeeDecorator {
  public int costCents() { return inner.costCents() + 50; }  // add, don't replace
}
```

That dual nature — *is-a* and *has-a* the same interface — is the whole pattern.
It buys two things:

1. **Composition over a class explosion** — to support milk, sugar, and caramel
   in any combination by subclassing you would need
   `Milk`, `Sugar`, `MilkSugar`, `MilkCaramel`, `MilkSugarCaramel`, … one class
   per combination. With decorators you write three small classes and stack them.
2. **Runtime, dynamic layering** — `new Sugar(new Milk(new Espresso()))` is
   assembled at runtime; the layers are chosen when the object is built, not
   fixed at compile time by a subclass.

## Decorator vs. the base it wraps

| | Base component (`Espresso`) | Decorator (`Milk`, `Sugar`) |
| --- | --- | --- |
| Implements `Coffee` | yes | yes |
| Holds a `Coffee` | no | yes (the inner layer) |
| Behavior | the original | the inner's result **plus** its own |
| Can be wrapped | yes | yes — decorators wrap decorators |

## You already use decorators

Java's I/O library is built on this pattern:

```java
BufferedReader r = new BufferedReader(new InputStreamReader(inputStream));
```

`InputStreamReader` wraps the raw stream to add character decoding;
`BufferedReader` wraps that to add buffering. Each is a `Reader` wrapping a
`Reader` — exactly the structure above.

## Equivalents elsewhere

A Gang of Four structural pattern. In practice: `@decorator` in Python /
TypeScript, Spring AOP `Proxy` objects, newtype wrapper structs in Rust, HTTP
**middleware** in Go and Express (each handler wraps the next), and AOP
**aspects** — all wrap something to add behavior around it without changing it.
