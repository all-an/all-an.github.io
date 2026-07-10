package com.example.concepts;

import java.util.HashMap;
import java.util.Map;
import java.util.function.IntUnaryOperator;

// A miniature just-in-time engine that models how a real JIT (HotSpot, V8, PyPy)
// runs code. Every program starts *interpreted*: each call walks the instruction
// list, dispatching one opcode at a time — flexible, but it re-reads the bytecode
// on every run. The engine *profiles* each program by counting its calls; once a
// program crosses the compile threshold it is deemed "hot" and *compiled* once into
// a single specialized callable that no longer inspects the bytecode. From then on
// the hot program runs the compiled code. The compiled form is observably identical
// to interpreting — a JIT changes performance, never results — because both go
// through the same OpCode semantics. This mirrors adaptive optimization: pay the
// compile cost only for code that runs often enough to earn it.
public final class Jit {

  // How many interpreted calls a program is allowed before it is compiled. Real
  // JITs use large counters (HotSpot's default -XX:CompileThreshold is ~10000);
  // a small value here keeps the demo and tests fast and deterministic.
  private final int compileThreshold;

  // Per-program call counter — the profile that decides what is hot.
  private final Map<String, Integer> invocationCounts = new HashMap<>();

  // Per-program compiled code, populated the moment a program turns hot. Presence
  // in this map means "already compiled"; the engine compiles each program once.
  private final Map<String, IntUnaryOperator> compiledCode = new HashMap<>();

  public Jit(int compileThreshold) {
    this.compileThreshold = compileThreshold;
  }

  // Run a program on an input, choosing the execution strategy adaptively. Counts
  // the call, compiles the program if it has just turned hot, then runs the
  // compiled code when available and falls back to the interpreter while cold.
  public int run(Program program, int input) {
    int count = invocationCounts.merge(program.name(), 1, Integer::sum);

    // Compile exactly once, on the first call past the threshold: the program has
    // now proven itself hot, so it is worth the one-time cost of compiling it.
    if (!compiledCode.containsKey(program.name()) && count > compileThreshold) {
      compiledCode.put(program.name(), compile(program));
    }

    IntUnaryOperator hotCode = compiledCode.get(program.name());
    return hotCode != null ? hotCode.applyAsInt(input) : interpret(program, input);
  }

  // The interpreter: walk the instruction list, applying each opcode to the running
  // accumulator. Simple and immediate, but it re-inspects the bytecode every call.
  static int interpret(Program program, int input) {
    int accumulator = input;
    for (Op op : program.ops()) {
      accumulator = op.applyTo(accumulator);
    }
    return accumulator;
  }

  // The compiler: fold the whole instruction list into ONE callable, ahead of any
  // input. The returned operator closes over the instructions, so running it no
  // longer loops over or dispatches the bytecode — that work was done once, here.
  // Because each step still calls the same OpCode.apply, the compiled result is
  // identical to interpreting the program.
  static IntUnaryOperator compile(Program program) {
    IntUnaryOperator code = IntUnaryOperator.identity();
    for (Op op : program.ops()) {
      IntUnaryOperator preceding = code;   // capture the chain built so far
      code = input -> op.applyTo(preceding.applyAsInt(input));
    }
    return code;
  }

  // True once a program has been compiled — i.e. it ran hot. Lets callers and tests
  // observe the interpret -> compile transition.
  public boolean isCompiled(Program program) {
    return compiledCode.containsKey(program.name());
  }

  // How many times a program has been run so far — the profiling counter that
  // drives the compilation decision.
  public int invocationCount(Program program) {
    return invocationCounts.getOrDefault(program.name(), 0);
  }
}
