# Polymorphism / dynamic dispatch — runnable Java example

Java version of the concept snippet, runnable with plain `javac`/`java`. Shows
how a single call site dispatches to different concrete implementations at
runtime based on the actual subclass of the receiver.

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
Animal says ...
Dog says woof
Cat says meow
Cow says moo
```

The static type of every element of `herd` is `Animal`, so the compiler resolves
the call as `Animal.speak()`. At runtime the JVM walks the actual object's class
hierarchy to find the most specific override — `Dog`'s, `Cat`'s, or `Cow`'s —
and invokes that one. This late binding is what makes polymorphism a *runtime*
phenomenon and is the mechanism that lets new subclasses slot into existing
code without changing it.
