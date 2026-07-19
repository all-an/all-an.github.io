# Bytecode / IR — runnable Maven + JUnit 5 project

A small **Maven project** (not a single `Main.java`) so the idea can be exercised
under a real test runner — **JUnit 5**. It builds a miniature toolchain around one
**intermediate representation**: **two unrelated frontends** lower their source to a
single flat stack-machine instruction set, and **two backends** consume that set —
one executing it, one translating it — without knowing which language it came from.
A verifier checks the flat form before anything runs, computing the same
`max_stack` figure the JVM stores in a method's Code attribute.

## Files

| Path | Purpose |
| --- | --- |
| `pom.xml` | Maven build — pulls in JUnit 5. |
| `src/main/java/com/example/concepts/Arith.java` | The arithmetic operations, shared by the AST and the IR — one definition of what "add" means. |
| `src/main/java/com/example/concepts/Expr.java` | The source language: a nested expression tree. |
| `src/main/java/com/example/concepts/Instruction.java` | The IR: a flat stack-machine instruction set. |
| `src/main/java/com/example/concepts/ExprCompiler.java` | Frontend #1 — lowers the tree to IR in post-order. |
| `src/main/java/com/example/concepts/RpnCompiler.java` | Frontend #2 — lowers RPN text to the same IR. |
| `src/main/java/com/example/concepts/StackMachine.java` | Backend #1 — executes the IR; also verifies it and disassembles it. |
| `src/main/java/com/example/concepts/SourceEmitter.java` | Backend #2 — translates the IR to source text instead of running it. |
| `src/main/java/com/example/concepts/Main.java` | Demo: two languages in, one IR, verified, then executed and translated. |
| `src/test/java/com/example/concepts/BytecodeTest.java` | Asserts frontends converge, backends are interchangeable, order survives flattening, and verification catches malformed code. |
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
Source #1 (tree): 3 * x + 7
Source #2 (RPN) : 3 x * 7 +

Both lower to the same IR:
 0: push 3
 1: load x
 2: mul
 3: push 7
 4: add
Identical instruction lists: true

Verified. max_stack = 2

Backend #1 (execute)  x=5 -> 22
Backend #2 (emit)        -> ((3 * x) + 7)

Order is preserved: (10 - 4) = 6
Verifier rejects `add` alone: stack underflow at `add`: needs 2 operands, has 0
Tests run: 11, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(The first lines come from `DemoRunTest` running `Main`.)

## The idea

An **intermediate representation** is a language in the middle: not the source
anyone writes, not the machine code anything executes, but a flat instruction set
both sides agree on. A compiler **frontend** lowers source to it; a **backend**
turns it into something that runs.

The payoff is decoupling: with **M** languages and **N** targets you write
**M + N** pieces instead of **M × N**, and every new backend works for every
existing language for free.

**Bytecode** is an IR designed to be executed directly by a virtual machine, usually
a **stack machine** — operands live on an operand stack, so instructions are compact
and trivial to generate. Being flat also makes it **verifiable**.

## Lowering: nesting becomes ordering

The source tree is nested; the IR is flat. Post-order traversal is what bridges
them — both operands are emitted before the operation that consumes them, so by the
time that operation runs its inputs are already on the stack.

```java
case Expr.BinaryOp binary -> {
  emit(binary.left(), code);    // left first — this fixes the operand order
  emit(binary.right(), code);
  code.add(binary.op());        // ...then the operation that consumes both
}

// 3 * x + 7   lowers to:   [push 3, load x, mul, push 7, add]
```

## Two frontends, one representation

A second source language — RPN text, sharing nothing with the tree — lowers to the
**identical** instruction list. RPN is already in the order a stack machine wants,
so each token becomes exactly one instruction and no reordering is needed.

```java
assertEquals(ExprCompiler.compile(tree()), RpnCompiler.compile("3 x * 7 +"));
```

This is the argument for having an IR at all. Everything downstream is written once
and works for both.

## Two backends, one representation

The machine **executes** the list. The right operand was emitted last, so it is on
top — reversing the pops would silently compute `4 - 10` for `10 - 4`.

```java
case Arith arith -> {
  int right = stack.pop();   // emitted last, so it is on top
  int left = stack.pop();
  stack.push(arith.apply(left, right));
}
```

The emitter **translates** it instead, with the identical algorithm over strings, so
the tree the frontend flattened comes back as text:

```java
stack.push("(" + left + " " + arith.symbol() + " " + right + ")");

// [push 3, load x, mul, push 7, add]  ->  "((3 * x) + 7)"
```

Neither backend knows which language produced the code it is given.

## Verifiable because it is flat

Every instruction has a fixed stack effect, so walking the list once establishes
both that the code is well-formed and how deep the stack will ever get — with no
inputs and nothing executed. The JVM does this same walk and stores the answer as
`max_stack`, so a frame can be sized before the method is entered.

```java
if (instruction instanceof Arith) {
  if (depth < 2) throw new IllegalArgumentException("stack underflow at `" + instruction.text() + "`");
  depth--;
} else {
  depth++;
}
```

Code that underflows the stack, or that does not leave exactly one result behind, is
rejected before it reaches any backend — bytecode is not trusted just because it
arrived.

## Why bother

- **Languages and targets evolve independently** — Kotlin and Clojure got the JVM's
  optimizer and GC for free by emitting its bytecode; Rust got every LLVM backend
  the same way.
- **Optimization has a home** — a pass written against the IR improves every
  frontend at once, rather than being reimplemented per language.
- **Untrusted code becomes plausible** — a flat, verifiable format is the premise of
  the JVM sandbox and of `WASM` in a browser.

The trade-offs: an IR is a lowest common denominator, general enough for every
frontend, so language-specific meaning is erased on the way down and hard to recover
later — which is why generic type information and other source-level detail is
famously thin in bytecode. Lowering also costs a compilation stage, and a stack
machine's compactness is paid for in dispatch: real engines
[JIT](../091-jit-compilation/) the bytecode to registers precisely to win that back.

## Equivalents elsewhere

`JVM bytecode` (Java / Kotlin / Scala / Clojure), `LLVM IR` (C / C++ / Rust / D),
`WASM` (polyglot), `CLR IL` (C# / F#), `BEAM bytecode` (Erlang / Elixir). All sit
between many source languages and many execution targets, are flat enough to verify,
and let each side of the toolchain change without the other noticing.
