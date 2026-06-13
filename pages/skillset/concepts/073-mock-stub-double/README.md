# Mock / stub / double — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Uses
only the standard library — the test doubles are hand-built so the stub-vs-mock
difference is explicit. Production Java would generate them with **Mockito**, but
the idea is exactly this.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet. |
| `run.sh` | Compiles and runs `Main.java`. |
| `index.html` / `style.css` | The concept page. |

No external jars are needed — this uses only `java.lang`. Compiled `*.class`
files are git-ignored.

## Run it (recommended)

```sh
chmod +x run.sh   # make the script executable (only needed once)
./run.sh          # compiles and runs Main.java
```

## Run it manually

```sh
javac Main.java
java  Main
```

## Expected output

```
PASS: stub: approved payment -> confirmed
PASS: mock: charged exactly once
PASS: mock: charged the right account
PASS: mock: charged the right amount
PASS: stub: declined payment -> declined
all checks passed
```

A *test double* stands in for a real collaborator so a test runs fast and in
isolation. `OrderService` takes a `PaymentGateway` through its constructor —
that **dependency injection** is what lets a test substitute a double for the
real, network-calling implementation.

The two kinds differ in *what the test verifies* (Meszaros' taxonomy):

- **Stub** — returns a canned answer with no logic. `ApprovingStub` always
  approves, so `checkout` returns `"confirmed"`; the one-line lambda stub always
  declines, driving the other path. The test asserts on the **result** — this is
  *state verification*.
- **Mock** — also **records** how it was called. `RecordingMock` tracks the call
  count and the last arguments, so the test asserts the gateway was charged
  *exactly once* with the *right* account and amount. The test verifies the
  **interaction** — this is *behavior verification*, and it catches bugs a stub
  cannot, such as charging twice or charging `$0`.

Rule of thumb: use a **stub** when you care about *what your code does with the
answer*, and a **mock** when you care about *how your code uses the
collaborator*. Frameworks like Mockito (`when(...).thenReturn(...)` for stubbing,
`verify(...)` for mocking), `jest.fn()`, `unittest.mock`, and ScalaMock automate
both, but generate the very same kinds of doubles built by hand here.
