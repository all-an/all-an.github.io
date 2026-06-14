# Test fixture / setup — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) because a test fixture only
means something inside a real test runner — here **JUnit 5 (Jupiter)**, whose
`@BeforeEach` / `@AfterEach` lifecycle hooks build and tear the fixture down.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/ShoppingCart.java` | The stateful code under test. |
| `src/test/java/com/example/concepts/ShoppingCartTest.java` | Two tests sharing a `@BeforeEach` fixture, proving isolation. |
| `src/test/java/com/example/concepts/LifecycleDemoTest.java` | Prints each lifecycle hook as it fires. |
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
Running com.example.concepts.ShoppingCartTest
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
Running com.example.concepts.LifecycleDemoTest
@BeforeAll   — once, before all tests
  @BeforeEach  — fresh fixture for the next test
    >>> firstTest body
  @AfterEach   — tear the fixture down
  @BeforeEach  — fresh fixture for the next test
    >>> secondTest body
  @AfterEach   — tear the fixture down
@AfterAll    — once, after all tests
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0

Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

## The idea

A **test fixture** is the fixed, known starting state a test runs against. The
non-negotiable rule of a good test suite is **isolation**: one test's outcome
must never depend on another having run first, or on the order they run in. The
fixture is what guarantees that — it is rebuilt fresh for every test.

`ShoppingCart` is deliberately *stateful*: each `add` mutates an internal list.
If the two tests in `ShoppingCartTest` shared one cart, the second would see the
first's items and fail. The `@BeforeEach setUp()` hands each test a brand-new,
empty cart, so they are independent:

```java
@BeforeEach
void setUp() {
  cart = new ShoppingCart();   // fresh fixture before EVERY @Test
}
```

## The four lifecycle hooks

| Annotation | When it runs | Static? | Typical use |
| --- | --- | --- | --- |
| `@BeforeAll` | once, before any test | yes | expensive shared setup (start a DB) |
| `@BeforeEach` | before **every** test | no | the per-test fixture |
| `@AfterEach` | after **every** test | no | per-test cleanup / teardown |
| `@AfterAll` | once, after all tests | yes | release shared resources |

## How do I know `@BeforeEach` runs before *each* test, not once?

Don't take it on faith — `LifecycleDemoTest` prints every hook as it fires. Run
just that class:

```sh
mvn test -Dtest=LifecycleDemoTest
```

`@BeforeEach` / `@AfterEach` bracket **both** test bodies (so they print twice),
while `@BeforeAll` / `@AfterAll` print once. That doubled output *is* the proof
each test gets its own fresh fixture.

## Equivalents elsewhere

The pattern is one of Kent Beck's original xUnit patterns, so every framework has
it: `@BeforeEach` (JUnit 5) ↔ `setUp` (Python unittest) ↔ `beforeEach` (Jest) ↔
`before(:each)` (RSpec) ↔ `[TestInitialize]` (C# MSTest) ↔ fixtures
(Scala / ScalaTest).
