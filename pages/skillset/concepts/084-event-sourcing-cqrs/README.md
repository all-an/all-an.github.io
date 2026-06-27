# Event sourcing / CQRS — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) so the two ideas can be
exercised under a real test runner — **JUnit 5** — replaying events to rebuild an
account aggregate (event sourcing) and folding the same log into a queryable
projection (the CQRS read side). `Main` shows the same flow printing to the
console.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/AccountEvent.java` | The events — immutable facts (a sealed interface of records). |
| `src/main/java/com/example/concepts/EventStore.java` | The append-only event log — the source of truth. |
| `src/main/java/com/example/concepts/Account.java` | The aggregate (write side) — replays events, validates commands. |
| `src/main/java/com/example/concepts/BalanceProjection.java` | A projection (read side) — folds the log into a balance view. |
| `src/main/java/com/example/concepts/Main.java` | Demo: commands → events → log; then query a projection. |
| `src/test/java/com/example/concepts/EventSourcingTest.java` | Asserts replay, command validation, and the projection. |
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
Event log has 5 events.
acc-1 balance: 7000 cents
acc-2 balance: 5000 cents
Rebuilt acc-1 from history: 7000 cents
Total deposited across all accounts: 15000 cents
Tests run: 7, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(The lines come from `DemoRunTest` running `Main`: two accounts opened, deposits
and a withdrawal recorded as events, then balances queried from a projection
built off the same log.)

## The idea

**Event sourcing** stores the *sequence of events* that happened, not the current
state. State is derived by replaying those events:

```java
// State is a fold over history — there is no "current balance" column anywhere.
Account account = Account.replay("acc-1", store.eventsFor("acc-1"));
```

**CQRS** (Command Query Responsibility Segregation) splits the model in two:

- the **command / write side** (`Account`) validates requests and emits events;
- the **query / read side** (`BalanceProjection`) is a separate, query-optimised
  view built by folding the same events.

```java
// Write side: a command validates, then produces an event to append.
store.append(alice.deposit(10000));        // AccountOpened/MoneyDeposited/...

// Read side: a projection folds the log into a queryable view.
BalanceProjection balances = BalanceProjection.from(store.allEvents());
balances.balanceOf("acc-1");               // 7000
```

The moving parts:

1. **Events** — `AccountEvent` (a sealed interface of records), immutable facts.
2. **Event store** — `EventStore`, an append-only log that is the source of truth.
3. **Aggregate (write)** — `Account`, rebuilt by replay, guards invariants.
4. **Projection (read)** — `BalanceProjection`, a derived view answering queries.

## Why bother

Because the log is the source of truth, you get properties a "store current
state" design cannot easily give:

- **Full history / audit** — every change is a recorded fact, never overwritten.
- **Rebuildable views** — a projection can be deleted and replayed from scratch,
  and *new* read models are just *new* folds over the same events (the demo's
  "total deposited" is a second read model in four lines).
- **Temporal queries** — replaying up to a point reconstructs past state.

## Commands vs. events

A **command** is a request that *may be refused* (`withdraw` rejects an overdraft);
an **event** is a fact that *already happened* and is therefore always applied
during replay, never validated again. That is why `Account.apply(...)` has no
checks but `Account.withdraw(...)` does.

## Equivalents elsewhere

A Domain-Driven Design technique popularised by Greg Young (c. 2010). In practice:
Akka Persistence / Pekko (Scala, Java), Marten and EventStoreDB (C#), Axon
Framework (Java), and — for the CQRS read-side shape on the client — Redux's
reducer folding actions into state (JavaScript).
