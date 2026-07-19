# AOT compilation — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) so the idea can be exercised
under a real test runner — **JUnit 5**. It implements a miniature **`AotCompiler`**
that models how an ahead-of-time toolchain such as **GraalVM Native Image** builds a
binary: it runs a **closed-world analysis** to find what is reachable from the
declared entry points, **optimizes** each surviving program by folding instructions
using facts known statically, and **emits** them into a **`NativeImage`** — an
artifact that carries no source, no interpreter and no compiler. `Main` builds an
image, shows the code shrinking at build time, runs it at full speed from the first
call, and shows what happens when you ask for a program the build eliminated.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/OpCode.java` | The instruction set (ADD, SUB, MUL); the single source of truth the interpreter and the compiled code share. |
| `src/main/java/com/example/concepts/Op.java` | One instruction: an opcode plus its operand. |
| `src/main/java/com/example/concepts/Program.java` | A named, immutable list of instructions — the unit that gets analysed, optimized and emitted. |
| `src/main/java/com/example/concepts/Interpreter.java` | The reference semantics: what a program *means*. Not shipped in the image — it is the spec the compiler is measured against. |
| `src/main/java/com/example/concepts/AotCompiler.java` | The build: reachability analysis, build-time optimization, emission. |
| `src/main/java/com/example/concepts/NativeImage.java` | The shipped artifact: finished code only, a fixed set of programs, no compiler. |
| `src/main/java/com/example/concepts/Main.java` | Demo: build an image, watch the code shrink, run with no warm-up, hit the closed world. |
| `src/test/java/com/example/concepts/AotTest.java` | Asserts everything is compiled before the first run, there is no warm-up, folding shrinks the code without changing results, and unreachable code is eliminated for good. |
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
Source programs: poly, negate, unused
Entry points   : poly, negate
In the image   : [poly, negate]

poly source   : 5 instructions  [MUL 2, MUL 3, ADD 10, SUB 4, ADD 1]
poly compiled : 2 instructions  [MUL 6, ADD 7]

run #1  poly(1) -> 13   (compiled before startup, no warm-up)
run #2  poly(2) -> 19   (compiled before startup, no warm-up)
run #3  poly(3) -> 25   (compiled before startup, no warm-up)

Image and reference semantics agree over inputs 0..9: true
Calling 'unused': not in the image: unused — it was not reachable at build time
Tests run: 9, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(The first lines come from `DemoRunTest` running `Main`: an application compiled and
optimized entirely at build time, running at full speed immediately, with the
unreachable program left out of the artifact.)

## The idea

**Ahead-of-time (AOT) compilation** translates a whole program to machine code **at
build time**, before it ever runs. It is the opposite trade to a
[JIT](../091-jit-compilation/): a JIT ships the source, starts interpreted, profiles
what runs hot and compiles *during* execution; an AOT compiler pays the entire
compile cost up front and ships a finished binary that starts at **full speed with
no warm-up**.

```java
NativeImage image = AotCompiler.compile(allPrograms, Set.of("poly", "negate"));
image.run("poly", 2);     // 19 — already compiled, first call is full speed
image.run("unused", 1);   // throws: eliminated at build time, gone for good
```

Because compilation finishes before startup, the compiler sees the **whole program
at once**: it optimizes with static facts and performs **closed-world analysis**,
keeping only what is reachable from the entry points.

## The build: analyse, optimize, emit

```java
public static NativeImage compile(List<Program> allPrograms, Set<String> entryPoints) {
  Map<String, IntUnaryOperator> compiledCode = new LinkedHashMap<>();

  for (Program program : allPrograms) {
    // Unreachable code is dead-code eliminated: it is not compiled, and there is
    // no second chance to compile it later — that is the closed-world bargain.
    if (entryPoints.contains(program.name())) {
      compiledCode.put(program.name(), emit(optimize(program)));
    }
  }

  return new NativeImage(compiledCode);
}
```

Real toolchains walk the call graph from the roots; here programs never call one
another, so the roots *are* the reachable set. The shape is the same: **GraalVM
Native Image**'s `native-image` tool does exactly this at a much larger scale,
tracing every class and method an entry point can reach and refusing to include
anything else.

## Optimizing with static facts

The accumulator's value is unknown — that is the input — but the *instructions* are
fully known, so adjacent steps that combine algebraically collapse into one.

```java
// [MUL 2, MUL 3, ADD 10, SUB 4, ADD 1]  ->  [MUL 6, ADD 7]
Op normalized = op.code() == OpCode.SUB ? new Op(OpCode.ADD, -op.operand()) : op;
```

Each `SUB n` is first rewritten as `ADD -n` so subtractions and additions can merge;
adjacent `ADD`s then sum and adjacent `MUL`s multiply. Both are associative in
two's-complement arithmetic, so the fold preserves the result **exactly**, overflow
included — the tests check `Integer.MAX_VALUE` and `Integer.MIN_VALUE` to prove it.
Five instructions become two, once, and every run of the shipped binary gets that
saving for free.

## Shape and speed, never meaning

The compiler may rewrite the code however it likes as long as the result is
**observably identical** to what the original program says. `Interpreter` defines
that meaning and is never shipped in the image — it exists as the spec.

```java
Program source = poly();
NativeImage image = AotCompiler.compile(List.of(source), Set.of("poly"));
for (int input = -100; input <= 100; input++) {
  assertEquals(Interpreter.interpret(source, input), image.run("poly", input));
}
```

## The closed world

The shipped artifact holds nothing but finished code. A program left out of the
build cannot be compiled on demand, because there is nothing left to compile it
with — a JIT would just compile it on first use.

```java
Program unreachable = new Program("unused", List.of(new Op(OpCode.ADD, 99)));
NativeImage image = AotCompiler.compile(List.of(poly(), unreachable), Set.of("poly"));

assertThrows(IllegalArgumentException.class, () -> image.run("unused", 1));
```

This is the same failure mode a `native-image` build produces for a class that only
reflection reaches: if the analysis never saw it, it is not in the binary.

## Why bother

- **Instant startup** — no warm-up curve; the first request is as fast as the
  millionth. This is why `native-image` suits CLIs, serverless functions and
  scale-to-zero containers, where a JVM would still be warming up as the process exits.
- **Predictable performance** — no compiler running inside your process competing
  for CPU and memory, and no latency spikes from compilation kicking in mid-request.
- **Smaller artifacts** — dropping everything unreachable shrinks the binary, and it
  ships with no compiler or interpreter aboard.

The trade-offs: the world is **closed**, so reflection, dynamic proxies and runtime
class loading need explicit configuration or they vanish from the image; builds are
slow and produce a platform-specific binary; and the compiler optimizes on static
guesses only — it never sees the real workload, so a long-running JIT can eventually
beat it on peak throughput using profile data AOT could not have. (Real toolchains
narrow that gap with **profile-guided optimization**: run an instrumented build,
feed the profile back into the compiler. This project stays with static folding
only; the shape — analyse, optimize, emit, ship finished code — is the essence.)

## Equivalents elsewhere

`GraalVM Native Image` (Java / Scala), whose `native-image` tool compiles a JVM
application and everything it can prove reachable into one self-contained
executable; `Rust` (LLVM); the `Go` compiler; `NativeAOT` (C#); `Kotlin/Native`;
`LDC2` (D). All translate the program before it runs, optimize with a whole-program
view, and ship a binary that needs no compiler at run time.
