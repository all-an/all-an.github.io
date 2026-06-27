# Annotation / attribute — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) so the idea can be exercised
under a real test runner — **JUnit 5**. It defines two **custom annotations**
(`@NotBlank`, `@Min`), decorates a `User` object's fields with them, and lets a
separate **`Validator`** read those annotations at runtime and turn each violated
rule into a message. `Main` shows the same thing printing to the console.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/NotBlank.java` | A custom annotation: "this String field must not be blank". |
| `src/main/java/com/example/concepts/Min.java` | A custom annotation carrying a parameter: "this int field must be ≥ value". |
| `src/main/java/com/example/concepts/User.java` | A domain object whose fields are decorated with the annotations. |
| `src/main/java/com/example/concepts/Validator.java` | The processor: reads the annotations and enforces their rules. |
| `src/main/java/com/example/concepts/Main.java` | Demo: validate a valid user and an invalid one. |
| `src/test/java/com/example/concepts/ValidatorTest.java` | Asserts each annotation drives the expected validation message. |
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
Valid user violations: []
Invalid user violations: [name: name is required, age: must be at least 18]
Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(The lines come from `DemoRunTest` running `Main`: a valid `User` produces an
empty list, and an invalid one produces one message per broken annotation.)

## The idea

An **annotation** (a C# **attribute**) is **declarative metadata attached to a
program element** — a class, field, method, or parameter. It carries no
behaviour of its own; it is a label that a *separate processor* reads and acts
on. The element states *what should be true*; the processor decides *what to do
about it*.

```java
public class User {
  @NotBlank(message = "name is required")   // declares a rule…
  private final String name;

  @Min(18)                                  // …configured with a parameter
  private final int age;
}
```

Nothing in `User` checks anything. The `Validator` supplies all the behaviour by
reflecting over the fields and reading the annotations:

```java
if (field.isAnnotationPresent(Min.class)) {
  int minimum = field.getAnnotation(Min.class).value();   // read the parameter
  if (((int) value) < minimum) {
    violations.add(field.getName() + ": must be at least " + minimum);
  }
}
```

## Declaring an annotation

A custom annotation is declared with `@interface`. Its **members** look like
methods and become the parameters callers supply (`@Min(18)`, `@NotBlank(message
= "…")`); a member can have a `default`:

```java
@Retention(RetentionPolicy.RUNTIME)   // keep it readable at runtime
@Target(ElementType.FIELD)            // it may only annotate fields
public @interface NotBlank {
  String message() default "must not be blank";
}
```

**`RUNTIME` retention is the crucial part.** Annotations default to `CLASS`
retention, which the JVM drops at load time; without `RUNTIME` the `Validator`
could never see `@NotBlank`. `@Target` constrains *where* the annotation may be
placed, so misuse is a compile error rather than a silent no-op.

## Why bother

Annotations let you state intent *declaratively* and keep the enforcing logic in
one reusable place:

- **Validation** — Bean Validation (`@NotNull`, `@Size`, `@Email`) works exactly
  like this toy `Validator`, only richer.
- **Serialization / ORM** — `@JsonProperty`, `@Column`, `@Id` map fields to JSON
  keys or database columns.
- **Frameworks** — `@Test`, `@Override`, `@Autowired`, `@Deprecated` all hand
  information to a tool (test runner, compiler, DI container) that acts on it.

The trade-off mirrors reflection's: the rule and its enforcement are decoupled,
so a typo'd member or a missing processor fails at runtime, and the indirection
is invisible until you find the code that reads the annotation.

## Equivalents elsewhere

`@Annotation` (Java); `[Attribute]` (C#); `#[derive(...)]` and other attributes
(Rust); `@decorator` (Python, TypeScript); `@inline` / `@specialized` (Scala);
and `pragma` (C, D). All attach machine-readable metadata to code that some
later stage — compiler, framework, or runtime — interprets.
