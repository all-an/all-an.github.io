package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.function.IntUnaryOperator;
import org.junit.jupiter.api.Test;

// Verifies the defining properties of just-in-time compilation: code starts
// interpreted, turns compiled once it is hot, the compiled form is observably
// identical to interpreting (a JIT changes speed, not results), each program is
// profiled and compiled on its own, and compilation happens once.
class JitTest {

  // f(x) = x * 3 + 7 - 1  == 3x + 6, expressed as bytecode.
  private static Program poly() {
    return new Program("poly", List.of(
        new Op(OpCode.MUL, 3),
        new Op(OpCode.ADD, 7),
        new Op(OpCode.SUB, 1)));
  }

  // Cold start: before a program turns hot it is interpreted, not compiled — yet it
  // still produces the correct result. Compilation is an optimization, not a
  // prerequisite for running.
  @Test
  void coldCodeIsInterpretedButCorrect() {
    Jit jit = new Jit(4);   // compile only after 4 interpreted calls
    Program program = poly();

    int result = jit.run(program, 7);

    assertEquals(27, result);              // 3*7 + 6
    assertFalse(jit.isCompiled(program));  // still cold — interpreted
  }

  // Profiling drives compilation: run a program past its threshold and it turns hot
  // and gets compiled. The invocation counter is the profile that makes the call.
  @Test
  void hotCodeGetsCompiled() {
    Jit jit = new Jit(4);
    Program program = poly();

    for (int call = 0; call < 6; call++) {
      jit.run(program, 7);
    }

    assertTrue(jit.isCompiled(program));
    assertEquals(6, jit.invocationCount(program));
  }

  // The threshold is a sharp boundary: still interpreted on the call that reaches
  // the threshold, compiled on the very next one. This is what "compile after N
  // runs" means precisely.
  @Test
  void compilationHappensJustPastTheThreshold() {
    int threshold = 4;
    Jit jit = new Jit(threshold);
    Program program = poly();

    for (int call = 1; call <= threshold; call++) {
      jit.run(program, 7);
    }
    assertFalse(jit.isCompiled(program));   // reached the threshold, not past it

    jit.run(program, 7);                    // one more call tips it over
    assertTrue(jit.isCompiled(program));
  }

  // The core correctness invariant: the compiled code and the interpreter compute
  // the same output for every input, so switching from one to the other can never
  // be observed in the result. A JIT is only allowed to change performance.
  @Test
  void compiledCodeMatchesInterpreterForAllInputs() {
    Program program = poly();
    IntUnaryOperator compiled = Jit.compile(program);

    for (int input = -100; input <= 100; input++) {
      assertEquals(Jit.interpret(program, input), compiled.applyAsInt(input));
    }
  }

  // Because the run() result is invariant across the interpret -> compile switch,
  // the very same engine returns identical values before and after a program turns
  // hot. The user of the code sees no discontinuity.
  @Test
  void runResultIsUnchangedAcrossCompilation() {
    Jit jit = new Jit(4);
    Program program = poly();

    int whileCold = jit.run(program, 9);   // interpreted (call #1)
    for (int call = 0; call < 5; call++) {
      jit.run(program, 9);                 // warm it up past the threshold
    }
    int whileHot = jit.run(program, 9);    // now compiled

    assertTrue(jit.isCompiled(program));
    assertEquals(whileCold, whileHot);     // 3*9 + 6 == 33, either way
    assertEquals(33, whileHot);
  }

  // Programs are profiled independently, like methods in a real JIT: making one
  // program hot must not compile a different, still-cold program.
  @Test
  void programsAreProfiledIndependently() {
    Jit jit = new Jit(4);
    Program hot = poly();
    Program cold = new Program("negate", List.of(new Op(OpCode.MUL, -1)));

    for (int call = 0; call < 6; call++) {
      jit.run(hot, 7);
    }
    jit.run(cold, 7);   // called once — nowhere near hot

    assertTrue(jit.isCompiled(hot));
    assertFalse(jit.isCompiled(cold));
  }

  // Compilation is a one-time cost paid up front: one compiled operator serves every
  // later call, never recompiled per invocation. This is why the compile threshold
  // exists — spend the effort once, then amortize it over many fast runs.
  @Test
  void oneCompilationServesManyCalls() {
    Program program = poly();
    IntUnaryOperator compiled = Jit.compile(program);   // compiled a single time

    for (int input = 0; input < 1000; input++) {
      assertEquals(Jit.interpret(program, input), compiled.applyAsInt(input));
    }
  }
}
