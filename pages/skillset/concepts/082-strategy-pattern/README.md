# Strategy pattern — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) so the interchangeable
algorithms can be exercised under a real test runner — **JUnit 5** — swapping one
discount strategy for another on the same checkout and asserting each result.
`Main` shows the same swapping printing to the console.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/DiscountStrategy.java` | The strategy interface (a family of algorithms). |
| `src/main/java/com/example/concepts/NoDiscount.java` | Concrete strategy — charge the full subtotal. |
| `src/main/java/com/example/concepts/PercentageDiscount.java` | Concrete strategy — a percentage off. |
| `src/main/java/com/example/concepts/FlatDiscount.java` | Concrete strategy — a flat coupon, floored at zero. |
| `src/main/java/com/example/concepts/Checkout.java` | The context — holds a strategy and delegates. |
| `src/main/java/com/example/concepts/Main.java` | Demo: one cart repriced under each strategy. |
| `src/test/java/com/example/concepts/CheckoutTest.java` | Asserts each algorithm and runtime swapping. |
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
No discount:  2000 cents
10% off:      1800 cents
$5 coupon:    1500 cents
Launch promo: 0 cents
Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(The lines come from `DemoRunTest` running `Main`: the same $20.00 cart priced
under four interchangeable strategies, the last one a lambda.)

## The idea

The **Strategy pattern** turns an algorithm into a parameter. Instead of baking
the pricing rule into `Checkout`, each rule is its own class implementing a shared
`DiscountStrategy` interface, and the checkout simply delegates:

```java
class Checkout {
  private DiscountStrategy strategy = new NoDiscount();
  void setStrategy(DiscountStrategy s) { this.strategy = s; }   // swap at runtime
  int total() { return strategy.applyCents(subtotalCents); }    // delegate
}
```

The three moving parts:

1. **Strategy** — the interface (`DiscountStrategy`) for a family of algorithms.
2. **Concrete strategies** — `NoDiscount`, `PercentageDiscount`, `FlatDiscount`,
   each encapsulating one rule and optionally its own configuration.
3. **Context** — `Checkout`, which holds a strategy and delegates to it, owning
   none of the algorithm.

## Why bother — Open/Closed Principle

Without it, pricing rules pile up inside one method:

```java
// ANTI-PATTERN — every new rule means editing this method.
int total(String kind) {
  if (kind.equals("none"))       return subtotal;
  else if (kind.equals("pct10")) return subtotal * 90 / 100;
  else if (kind.equals("flat5")) return Math.max(0, subtotal - 500);
  // ...another branch for every rule, forever
}
```

That method must be **modified** for every new rule and grows without bound. With
strategies, the checkout is **closed for modification but open for extension**:
add a rule by writing a new class, and nothing existing changes.

## Strategy is just "a behavior as an object"

Because `DiscountStrategy` has a single method, a strategy can be a **lambda** —
no class needed:

```java
checkout.setStrategy(subtotal -> 0);   // launch promo: everything free
```

This is the bridge to the functional view: a strategy is a first-class function.
That is why `Comparator` (Java sorting), `Runnable`, and most callbacks *are* the
Strategy pattern, just spelled as functions.

## Strategy vs. State

Both hold a swappable object behind an interface. The difference is intent:
**Strategy** is chosen by the *client* to vary an algorithm; **State** is changed
by the object itself to vary behavior as its internal state transitions.

## Equivalents elsewhere

A Gang of Four behavioral pattern. In practice the strategy is usually a function:
a Java functional interface / lambda, a C or Rust function pointer, a Rust trait
object (`Box<dyn Fn>`), a Go interface value, or a Scala / Haskell typeclass
instance passed implicitly.
