# Property-based testing — runnable Maven + jqwik project

A small **Maven project** (not a single `Main.java`) because property-based
testing needs a real generator/shrinking engine — here **jqwik**, the Java
library for it. Each property is checked against ~1000 randomly generated inputs.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in jqwik and the JUnit Platform launcher. |
| `src/main/java/com/example/concepts/Lists.java` | The code under test (a hand-written `reverse`). |
| `src/test/java/com/example/concepts/ListsProperties.java` | The four properties. |
| `src/test/java/com/example/concepts/DemoProperties.java` | A demo that *prints* every generated input and counts the invocations. |
| `run.sh` | Runs `mvn test`. |
| `index.html` / `style.css` | The concept page. |

The `target/` build directory is git-ignored.

## Run it (recommended)

```sh
chmod +x run.sh   # make the script executable (only needed once)
./run.sh          # runs: mvn test
```

The **first** run downloads jqwik into your local `~/.m2` cache and needs
network access; afterwards it runs offline.

## Run it manually

```sh
mvn test
```

## Expected result

`mvn test` runs both property classes — the four real properties plus the
generation demo — for **5** properties total:

```
Running com.example.concepts.ListsProperties
tries = 1000                  | # of calls to property
tries = 1000                  | # of calls to property
tries = 1000                  | # of calls to property
tries = 1000                  | # of calls to property
Running com.example.concepts.DemoProperties
  ... prints each generated input + ">>> property was invoked 5 times" ...
Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Each of the 4 properties in `ListsProperties` was checked against **1000**
generated lists (`tries = 1000`), all passing.

## How do I know it really generates 1000 inputs?

The `tries = 1000` line *is* jqwik telling you how many times it called the
property — 1000 is the default, set per property with `@Property(tries = N)`. But
you do not have to take that on faith. `DemoProperties` makes the generation
visible two ways, using a small `tries = 5` so the output stays short:

- `@Report(Reporting.GENERATED)` prints **every** input jqwik feeds the property.
- an `AtomicInteger` counts the actual calls and prints the total afterwards.

Run just that demo:

```sh
mvn test -Dtest=DemoProperties
```

and you will see each generated list followed by the count (values are random
each run, so yours will differ):

```
timestamp = ..., generated =
  arg0: [5396490, -39104, 0, 116550, 3208, 67, 21, 14347, -863, -6]
timestamp = ..., generated =
  arg0: [3, -3631772, 2147483646, -13454, -3, -19]
timestamp = ..., generated =
  arg0: [1]
timestamp = ..., generated =
  arg0: [410, 122, 193, -383758, -2147483648, 2, -226989846]
timestamp = ..., generated =
  arg0: [1129449433, 2147483646, 3557256, 1, 0, 18, 366, -15511, 2]
>>> property was invoked 5 times
```

Five distinct random lists, five invocations — bump `tries` back to `1000` and
the count follows. Note jqwik deliberately mixes in **edge cases** like the empty
list, `0`, `1`, `Integer.MAX_VALUE` (`2147483647`), and `Integer.MIN_VALUE`
(`-2147483648`), because bugs love boundaries.

## The idea

Example-based tests assert on a few inputs you thought of. Property-based testing
flips that: you state a **property** — a rule true for *all* inputs — and the
framework hunts for a counterexample across hundreds of random cases. Two things
make it powerful:

- **Generators** produce the inputs. `@ForAll List<Integer> xs` asks jqwik to
  synthesize random lists; `@Size(min = 1)` constrains the generator (no empties).
- **Shrinking** is the killer feature. When a property fails on, say, a
  187-element list, jqwik automatically reduces it to the *smallest* input that
  still fails (often a 1- or 2-element list), so the counterexample is readable.

The four properties show common shapes worth reaching for:

| Property | Shape | Rule |
| --- | --- | --- |
| `reversingTwiceRestoresTheOriginal` | involution | `reverse(reverse(xs)) == xs` |
| `reversePreservesSize` | invariant | size is unchanged |
| `firstElementBecomesLast` | relational | first element ends up last |
| `matchesReferenceImplementation` | oracle | agrees with a trusted reference |

## Two Maven gotchas this project handles

- **`junit-platform-launcher`** must be on the test classpath, or Surefire 3.x
  finds the jqwik engine but runs **zero** tests silently.
- **Surefire only runs `*Test`/`*Tests` classes** by default. jqwik classes are
  named `*Properties`, so `pom.xml` adds `**/*Properties.java` to the includes —
  without it, `ListsProperties` is skipped without warning.

Equivalents elsewhere: jqwik ↔ QuickCheck (Haskell), Hypothesis (Python),
ScalaCheck (Scala), fast-check (JavaScript). The technique dates to QuickCheck
(Claessen & Hughes, 1999).
