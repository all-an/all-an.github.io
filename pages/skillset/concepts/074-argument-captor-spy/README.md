# Argument captor / spy — runnable Maven + Mockito project

Unlike the other concepts (single `Main.java`), this one is a small **Maven
project** because `ArgumentCaptor` and `spy()` are real Mockito features — so the
example actually runs JUnit 5 + Mockito rather than reimplementing them by hand.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5 and Mockito. |
| `src/main/java/com/example/concepts/` | The code under test (`AccountService`) and its collaborator (`AuditLog`, `InMemoryAuditLog`, `AuditEntry`). |
| `src/test/java/com/example/concepts/AccountServiceTest.java` | The two tests: one using `ArgumentCaptor`, one using `spy()`. |
| `run.sh` | Runs `mvn test`. |
| `index.html` / `style.css` | The concept page. |

The `target/` build directory is git-ignored.

## Run it (recommended)

```sh
chmod +x run.sh   # make the script executable (only needed once)
./run.sh          # runs: mvn test
```

The **first** run downloads JUnit and Mockito into your local `~/.m2` cache and
needs network access; afterwards it runs offline.

## Run it manually

```sh
mvn test
```

## Expected result

```
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

> On JDK 21+ you will see warnings like *"Mockito is currently self-attaching…"*
> and *"A Java agent has been loaded dynamically"*. They are harmless — Mockito's
> ByteBuddy engine attaches itself at runtime — and do not affect the result. The
> `pom.xml` sets `-Dnet.bytebuddy.experimental=true` so this keeps working on very
> new JDKs.

## What the two tests show

Both are *behavior verification* — they check **how** the collaborator was used,
not just the returned value.

- **`ArgumentCaptor`** — `AccountService.withdraw` builds an `AuditEntry`
  *internally* and passes it to `auditLog.record(...)`. The test never constructs
  that entry, so it cannot match it with `verify(log).record(eq(...))`. Instead it
  captures the actual argument and asserts on its fields (`account`,
  `amountCents`, `action`). Use a captor whenever the interesting argument is
  created inside the code under test.

- **`spy()`** — a spy wraps a **real** object. `InMemoryAuditLog.record` really
  runs (the entry ends up in the real backing list), *and* Mockito records the
  call so `verify` and capture still work. That is the line between the two
  doubles: a **mock** is hollow and returns defaults until stubbed (see the
  [Mock / stub / double](../073-mock-stub-double/) concept), while a **spy** is a
  real object that runs real code and only overrides what you explicitly stub.

Equivalents in other ecosystems: Mockito's `ArgumentCaptor` ↔ Kotlin MockK's
`slot`/`capture`, C# NSubstitute's `Arg.Do`, and Sinon.js / Python `spy()`.
