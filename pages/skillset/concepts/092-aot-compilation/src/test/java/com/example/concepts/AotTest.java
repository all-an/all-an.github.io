package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

// Verifies the defining properties of ahead-of-time compilation: the whole program
// is compiled before it ever runs, optimization happens once at build time and
// shrinks the shipped code, the compiled result is observably identical to the
// program's reference semantics, the first call is already at full speed with no
// warm-up, and the world is closed — unreachable code is eliminated and can never
// be compiled afterwards.
class AotTest {

  // f(x) = ((x * 2) * 3 + 10 - 4) + 1  == 6x + 7, written the long way on purpose
  // so the build-time optimizer has something to fold.
  private static Program poly() {
    return new Program("poly", List.of(
        new Op(OpCode.MUL, 2),
        new Op(OpCode.MUL, 3),
        new Op(OpCode.ADD, 10),
        new Op(OpCode.SUB, 4),
        new Op(OpCode.ADD, 1)));
  }

  // The defining property: compilation is finished before execution begins. The
  // image is callable the instant the build returns — no first call is needed to
  // trigger it, unlike a JIT, which compiles nothing until code has run hot.
  @Test
  void everythingIsCompiledBeforeTheFirstRun() {
    NativeImage image = AotCompiler.compile(List.of(poly()), Set.of("poly"));

    assertTrue(image.contains("poly"));   // compiled, without having run once
    assertEquals(19, image.run("poly", 2));   // 6*2 + 7
  }

  // Because all the compiling happened at build time, there is no warm-up curve:
  // the very first call and the thousandth call run the identical finished code.
  @Test
  void thereIsNoWarmUpPeriod() {
    NativeImage image = AotCompiler.compile(List.of(poly()), Set.of("poly"));

    int firstCall = image.run("poly", 5);
    for (int call = 0; call < 1000; call++) {
      image.run("poly", 5);
    }
    int thousandthCall = image.run("poly", 5);

    assertEquals(firstCall, thousandthCall);   // 6*5 + 7 == 37, from call #1 on
    assertEquals(37, firstCall);
  }

  // The build-time optimizer folds what it can prove statically, so the shipped
  // code is strictly smaller than the source: five instructions become two.
  @Test
  void optimizationShrinksTheCodeAtBuildTime() {
    Program source = poly();

    Program optimized = AotCompiler.optimize(source);

    assertEquals(5, source.ops().size());
    assertEquals(2, optimized.ops().size());
    assertEquals(new Op(OpCode.MUL, 6), optimized.ops().get(0));
    assertEquals(new Op(OpCode.ADD, 7), optimized.ops().get(1));
  }

  // The core correctness invariant: optimizing and compiling may change the shape
  // and the speed of the code, never its meaning. The image must agree with the
  // reference semantics of the *original* program for every input.
  @Test
  void compiledImageMatchesReferenceSemanticsForAllInputs() {
    Program source = poly();
    NativeImage image = AotCompiler.compile(List.of(source), Set.of("poly"));

    for (int input = -100; input <= 100; input++) {
      assertEquals(Interpreter.interpret(source, input), image.run("poly", input));
    }
  }

  // Folding must preserve results exactly, including two's-complement overflow —
  // multiplication and addition stay associative when they wrap, which is what
  // makes merging adjacent MULs and ADDs a legal transformation rather than a
  // "close enough" one.
  @Test
  void foldingPreservesResultsEvenOnOverflow() {
    Program source = poly();
    Program optimized = AotCompiler.optimize(source);

    for (int input : new int[] {Integer.MAX_VALUE, Integer.MIN_VALUE, 1 << 30}) {
      assertEquals(Interpreter.interpret(source, input), Interpreter.interpret(optimized, input));
    }
  }

  // Closed-world analysis: only what is reachable from the entry points is compiled
  // into the image. Unreachable code is dead-code eliminated, which is how AOT
  // builds stay small — the compiler can drop it because nothing may appear later.
  @Test
  void unreachableProgramsAreEliminatedFromTheImage() {
    Program reachable = poly();
    Program unreachable = new Program("unused", List.of(new Op(OpCode.ADD, 99)));

    NativeImage image = AotCompiler.compile(List.of(reachable, unreachable), Set.of("poly"));

    assertTrue(image.contains("poly"));
    assertFalse(image.contains("unused"));
    assertEquals(Set.of("poly"), image.programNames());
  }

  // The price of the closed world: code left out of the build cannot be compiled on
  // demand at run time, because the image ships without a compiler. A JIT would
  // simply compile it on first use; an AOT binary can only fail.
  @Test
  void eliminatedCodeCannotBeCompiledAtRunTime() {
    Program unreachable = new Program("unused", List.of(new Op(OpCode.ADD, 99)));
    NativeImage image = AotCompiler.compile(List.of(poly(), unreachable), Set.of("poly"));

    assertThrows(IllegalArgumentException.class, () -> image.run("unused", 1));
  }

  // Each reachable program is compiled on its own, and the whole reachable set is
  // ready together at build time — there is no per-program threshold to cross.
  @Test
  void everyReachableProgramIsCompiled() {
    Program poly = poly();
    Program negate = new Program("negate", List.of(new Op(OpCode.MUL, -1)));

    NativeImage image = AotCompiler.compile(List.of(poly, negate), Set.of("poly", "negate"));

    assertEquals(19, image.run("poly", 2));     // 6*2 + 7
    assertEquals(-8, image.run("negate", 8));
  }
}
