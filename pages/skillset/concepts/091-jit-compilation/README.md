# JIT compilation — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) so the idea can be exercised
under a real test runner — **JUnit 5**. It implements a miniature **`Jit`** engine
that models how a real just-in-time compiler runs code: every program starts
**interpreted** (walking its bytecode one opcode at a time), the engine **profiles**
each program by counting its calls, and once a program crosses the compile threshold
it turns **hot** and is **compiled** once into a single specialized callable that no
longer inspects the bytecode. `Main` runs a program repeatedly, shows the moment it
flips from interpreted to compiled, and proves the compiled code returns the same
result as interpreting it.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/OpCode.java` | The instruction set (ADD, SUB, MUL); the single source of truth both execution modes share. |
| `src/main/java/com/example/concepts/Op.java` | One instruction: an opcode plus its operand. |
| `src/main/java/com/example/concepts/Program.java` | A named, immutable list of instructions — the unit that gets profiled and compiled. |
| `src/main/java/com/example/concepts/Jit.java` | The engine: interprets while cold, profiles calls, compiles a hot program to a specialized callable. |
| `src/main/java/com/example/concepts/Main.java` | Demo: run a program until it turns hot, watch it switch to compiled code, confirm the result never changes. |
| `src/test/java/com/example/concepts/JitTest.java` | Asserts cold code is interpreted, hot code is compiled, the compiled form is identical to interpreting, programs are profiled independently, and compilation happens once. |
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
Program: 3*x + 7 - 1   bytecode=[MUL 3, ADD 7, SUB 1]
Compile threshold: 4 interpreted calls before compiling

call #1  input=7 -> 27   interpreted (compiled=false)
call #2  input=7 -> 27   interpreted (compiled=false)
call #3  input=7 -> 27   interpreted (compiled=false)
call #4  input=7 -> 27   interpreted (compiled=false)
call #5  input=7 -> 27   compiled    (compiled=true)   <- JIT kicked in
call #6  input=7 -> 27   compiled    (compiled=true)

Interpreter and compiled code agree over inputs 0..9: true
Tests run: 8, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(The first lines come from `DemoRunTest` running `Main`: a program is interpreted
while cold, compiled the moment it runs hot, and produces `27` either way.)

## The idea

Source code can be **interpreted** — walked and executed step by step, which is
flexible and starts instantly but re-does the dispatch work on every run — or
**compiled** ahead of time to native code, which is fast but pays the compile cost
up front for code that might never run. A **just-in-time (JIT) compiler** takes the
middle path: it runs code interpreted at first, watches which parts run often, and
compiles only those **hot** paths to optimized code *while the program is running*.

```java
Jit jit = new Jit(4);          // compile a program after 4 interpreted calls
jit.run(program, 7);           // cold  -> interpreted
// ... a few more calls ...
jit.run(program, 7);           // hot   -> runs compiled code, same result
```

This is **adaptive optimization**: you pay the compile cost only for code that has
proven it runs enough to earn it.

## Interpret first, then compile the hot path

The engine keeps a per-program call counter — its **profile**. While the count is
below the threshold, every call **interprets** the bytecode, dispatching one opcode
at a time. Once the count passes the threshold the program is compiled **once** into
a single callable that has already folded the whole instruction list together, so
running it no longer loops over or dispatches the bytecode.

```java
static int interpret(Program program, int input) {
  int accumulator = input;
  for (Op op : program.ops()) {        // walk the bytecode every call
    accumulator = op.applyTo(accumulator);
  }
  return accumulator;
}

static IntUnaryOperator compile(Program program) {
  IntUnaryOperator code = IntUnaryOperator.identity();
  for (Op op : program.ops()) {        // fold the bytecode ONCE, ahead of any input
    IntUnaryOperator preceding = code;
    code = input -> op.applyTo(preceding.applyAsInt(input));
  }
  return code;
}
```

## Speed, never behavior

The defining rule of a JIT: it may change **performance**, but the result must stay
**observably identical** to interpreting. Here that holds by construction — both
paths run through the same `OpCode.apply` — and the tests pin it down over a wide
range of inputs.

```java
IntUnaryOperator compiled = Jit.compile(program);
for (int input = -100; input <= 100; input++) {
  assertEquals(Jit.interpret(program, input), compiled.applyAsInt(input));
}
```

## Profiled per program

Like a real JIT compiling individual hot methods, each program is profiled on its
own: making one program hot does not compile a different, still-cold one.

```java
for (int call = 0; call < 6; call++) jit.run(hot, 7);   // this one turns hot
jit.run(cold, 7);                                        // called once — stays cold

jit.isCompiled(hot);    // true
jit.isCompiled(cold);   // false
```

## Why bother

- **Startup vs. peak speed** — start interpreting immediately (fast startup), then
  compile the hot loops for near-native throughput once they prove worth it.
- **Optimize with real information** — compiling *during* execution means the
  compiler can specialize to how the code is actually being used, not just how it
  was written.
- **Don't pay for what you don't run** — cold code is never compiled, so rarely
  executed paths cost nothing to optimize.

The trade-offs: the compiler runs inside your process, competing for CPU and memory,
and adds warm-up time before the fast code exists; real engines can also
**deoptimize** — fall back to the interpreter when an assumption a compilation was
built on turns out to be wrong. This project keeps a fixed compile threshold and no
deoptimization to stay small; the shape — interpret, profile, compile the hot path —
is the essence.

## Equivalents elsewhere

`JIT` in the JVM's HotSpot (Java / Scala / Clojure), `V8` (JavaScript), and the
`CLR` (C# / F#); `LuaJIT` (Lua); `PyPy` (Python); `Cranelift` (Rust / Wasmtime). All
run code interpreted or unoptimized at first, profile it, and compile the parts that
run hot to optimized native code — buying peak speed without paying a full
ahead-of-time compile for code that may never run.
