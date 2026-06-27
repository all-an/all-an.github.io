# Reflection / introspection — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) so the idea can be exercised
under a real test runner — **JUnit 5** — using the **Reflection API** to read an
object's private fields (introspection), call a method chosen by name (dynamic
invocation), and build an instance from its constructor at runtime (reflective
instantiation). `Main` shows the same three moves printing to the console.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/Label.java` | A `RUNTIME`-retained annotation — metadata reflection can read. |
| `src/main/java/com/example/concepts/Product.java` | An ordinary domain object with private fields — the thing inspected. |
| `src/main/java/com/example/concepts/ObjectInspector.java` | The reflection toolkit: read fields, call a method, construct an object. |
| `src/main/java/com/example/concepts/Main.java` | Demo: inspect, call by name, instantiate reflectively. |
| `src/test/java/com/example/concepts/ObjectInspectorTest.java` | Asserts the three capabilities and their failure modes. |
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
Fields of Product: product_name=Widget, priceCents=1999, inStock=true
Called summary(): Widget @ 1999c
Reflectively built: product_name=Gadget, priceCents=4999, inStock=false
Tests run: 7, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(The lines come from `DemoRunTest` running `Main`: a `Product` inspected into a
map, its `summary()` called by name, then a second `Product` built from its
constructor and inspected the same generic way.)

## The idea

**Reflection** is code that inspects and manipulates code — *metaprogramming*. A
program normally references fields, methods, and constructors it knows at compile
time. Reflection lets it discover and use them at **runtime**, on classes it was
never written against:

```java
// The inspector knows nothing about Product at compile time — it discovers
// everything through Product.class at runtime.
for (Field field : target.getClass().getDeclaredFields()) {
  field.setAccessible(true);        // bypass `private` to read the value
  result.put(field.getName(), field.get(target));
}
```

The three faces shown here:

1. **Introspection** — `toMap` reads every declared field of any object, *private
   included*, without knowing its type. A field's `@Label` annotation (metadata
   the code reads about itself) renames its key.
2. **Dynamic invocation** — `call` looks up a method by its *name string* and
   invokes it; the method is referenced nowhere in the calling code.
3. **Reflective instantiation** — `instantiate` finds a matching constructor and
   builds an object — how frameworks create instances of classes they have never
   seen.

```java
Map<String, Object> fields = ObjectInspector.toMap(widget);       // introspection
Object summary             = ObjectInspector.call(widget, "summary");   // by name
Object gadget = ObjectInspector.instantiate(                      // build at runtime
    Product.class,
    new Class<?>[] { String.class, int.class, boolean.class },
    "Gadget", 4999, false);
```

## Annotations are metadata read at runtime

`@Label` carries `@Retention(RetentionPolicy.RUNTIME)`. That is the whole trick:
without `RUNTIME` retention the compiler discards the annotation and reflection
could never see it. With it, the inspector can ask a field whether it is labelled
and rename its output key — the same mechanism serializers use to map fields to
column or JSON names.

## Why bother

Reflection is how *generic infrastructure* works on *your* classes without you
wiring each one by hand:

- **Serializers / ORMs** read fields to map objects to JSON or table rows.
- **Test runners** find `@Test` methods by scanning for the annotation.
- **Dependency-injection containers** construct objects by reflecting over
  constructors and their parameter types.

The cost is real, which is why it is infrastructure, not everyday code: it
defeats `private`, dodges compile-time checks (a wrong method name fails only at
runtime), and is slower than a direct call.

## Equivalents elsewhere

The Java/C# Reflection API; `getattr` / the `inspect` module (Python); the
`reflect` package (Go); Mirrors (Scala); and — the most powerful form — the
Meta-Object Protocol of Common Lisp's CLOS, where the object system itself is
open to inspection and redefinition at runtime.
