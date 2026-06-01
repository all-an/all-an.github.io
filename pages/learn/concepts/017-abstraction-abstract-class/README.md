# Abstraction / abstract class — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Shows
both flavours of abstraction Java supports — `abstract class` and `interface` —
and how each plays out at runtime.

## Files

| File | Purpose |
| --- | --- |
| `Main.java` | The runnable snippet (both `abstract class` and `interface` blocks). |
| `run.sh` | Compiles and runs `Main.java`. |
| `index.html` / `style.css` | The concept page. |

No external jars are needed. Compiled `*.class` files are git-ignored.

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
Circle area=12.57
Square area=9.00
total area = 21.57
[Triangle] /\
[Star] *
```

The first three lines come from the `abstract class Shape` example — `Shape`
declares an `abstract` `area()`, `Circle` and `Square` fill it in, and the
inherited `describe()` works for both. The last two come from the `interface
Drawable` example — `Drawable` publishes `draw()` and a `default label()`,
which `Triangle` and `Star` use without inheriting any state.

## Abstract class vs interface

| Aspect | Abstract class | Interface |
| --- | --- | --- |
| Inheritance | Single (one `extends`) | Multiple (many `implements`) |
| Instance state | Yes — any kind of field | No — only `public static final` constants |
| Constructor | Yes (called from subclass) | No |
| Method bodies | Concrete and `abstract` freely mixed | Abstract by default; `default` & `static` allowed (Java 8+); `private` helpers (Java 9+) |
| Default access | Any modifier (`public` / `protected` / package / `private`) | Methods implicitly `public` |
| Models | "Is-a" with shared implementation | "Can-do" capability shared across unrelated types |
| Use when… | Related types share both state and behavior | A capability cuts across an otherwise-unrelated type hierarchy |

**In short:** reach for an **abstract class** when you have shared *state and
code* to give to a family of related types — e.g. a `Shape` that holds
metadata and pre-built helpers. Reach for an **interface** when you only need
to publish a *contract* that many unrelated classes can fulfil, especially if
any of them already extend a different class — e.g. anything in your domain
that happens to be `Drawable`, `Serializable`, or `Comparable`. Modern Java's
`default` methods narrow the gap, but the inheritance rules (single class,
many interfaces) and the ability to hold instance state remain the decisive
differences.
