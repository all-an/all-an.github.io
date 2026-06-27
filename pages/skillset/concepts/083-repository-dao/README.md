# Repository / DAO — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) so the data-access contract
can be exercised under a real test runner — **JUnit 5** — saving, finding,
listing, and deleting users entirely through the `UserRepository` interface.
`Main` shows the same operations printing to the console.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/User.java` | The domain object the repository stores (an immutable record). |
| `src/main/java/com/example/concepts/UserRepository.java` | The repository interface — the data-access contract. |
| `src/main/java/com/example/concepts/InMemoryUserRepository.java` | One concrete implementation, backed by a map. |
| `src/main/java/com/example/concepts/Main.java` | Demo: save, find, update, and delete through the interface. |
| `src/test/java/com/example/concepts/UserRepositoryTest.java` | Asserts the repository contract against the interface. |
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
Saved 2 users.
All users: Alice <alice@example.com>, Bob <bob@example.com>
Find ada-1: Alice <alice@example.com>
After update: Alice <alice@corp.com>
Deleted bob-2: true
Find bob-2 after delete: not found
Tests run: 7, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(The lines come from `DemoRunTest` running `Main`: two users saved, listed,
looked up, one updated by re-saving the same id, and one deleted — all through
the `UserRepository` interface.)

## The idea

A **Repository** (or **DAO**, Data Access Object) is a collection-like interface
for accessing domain objects. It names *what* you can do with stored data —
`save`, `findById`, `findAll`, `deleteById` — while hiding *how* and *where* the
data lives. The application talks to the interface; the storage mechanism stays
behind it:

```java
public interface UserRepository {
  User save(User user);
  Optional<User> findById(String id);
  List<User> findAll();
  boolean deleteById(String id);
}
```

The moving parts:

1. **Domain object** — `User`, a plain immutable value, with no persistence code.
2. **Repository interface** — `UserRepository`, the data-access contract.
3. **Implementation** — `InMemoryUserRepository`, one of possibly many
   (a JDBC version, an HTTP version) that callers never name directly.

## Why bother — depend on the abstraction

Without a repository, persistence code leaks into business logic: SQL strings,
connection handling, and result-set parsing get tangled with the rules that use
the data. Pull data access behind an interface and the rest of the app depends
only on the **abstraction** (the Dependency Inversion Principle):

```java
// Business code never names a database — just the interface.
UserRepository users = new InMemoryUserRepository();   // swap this one line
```

Swap that single line for a database-backed implementation and nothing else
changes. The same property is what makes the tests fast: they run against the
in-memory implementation, so no database is needed to exercise the logic.

## `save` is both insert and update

Modelled on a collection's `put`, `save` inserts a new user or updates an
existing one matched by id — the caller does not know or care which:

```java
users.save(new User("ada-1", "Alice", "alice@example.com"));  // INSERT
users.save(new User("ada-1", "Alice", "alice@corp.com"));     // UPDATE, same id
```

## Repository vs. DAO

The two terms overlap and are often used interchangeably. The usual distinction:
a **DAO** maps one-to-one to a table or data source and is framed around CRUD; a
**Repository** is a domain-driven concept that behaves like an in-memory
*collection* of aggregate roots, and may sit on top of one or more DAOs. Both
share the core move shown here: hide the persistence mechanism behind an
interface of domain operations.

## Equivalents elsewhere

A Domain-Driven Design building block (Evans 2003); DAO comes from the J2EE Core
Patterns. In practice: Spring Data's `JpaRepository` (Java), `Repository<T>` with
Entity Framework (C#), Active Record (Ruby on Rails), and Quill or Slick (Scala).
