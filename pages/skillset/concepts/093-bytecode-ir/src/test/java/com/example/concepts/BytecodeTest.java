package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

// Verifies the defining properties of a bytecode / intermediate representation:
// nested source is lowered to a flat instruction list, unrelated frontends converge
// on that one representation, every backend consumes it without knowing where it
// came from, and the flat form can be checked statically before anything runs.
class BytecodeTest {

  // 3 * x + 7, as a source expression tree.
  private static Expr tree() {
    return new Expr.BinaryOp(Arith.ADD,
        new Expr.BinaryOp(Arith.MUL, new Expr.Literal(3), new Expr.Variable("x")),
        new Expr.Literal(7));
  }

  // The lowering itself: a nested tree becomes a flat, ordered instruction list.
  // Post-order is what makes it work — operands are emitted before the operation
  // that consumes them, so the tree's structure is carried entirely by the ordering.
  @Test
  void nestedSourceIsLoweredToFlatInstructions() {
    List<Instruction> code = ExprCompiler.compile(tree());

    assertEquals(List.of(
        new Instruction.Push(3),
        new Instruction.Load("x"),
        Arith.MUL,
        new Instruction.Push(7),
        Arith.ADD), code);
  }

  // The reason an IR exists: two source languages with nothing in common compile to
  // the *identical* instruction list, so everything downstream is shared. M
  // frontends and N backends cost M + N pieces instead of M x N.
  @Test
  void unrelatedFrontendsProduceTheSameIr() {
    List<Instruction> fromTree = ExprCompiler.compile(tree());
    List<Instruction> fromRpn = RpnCompiler.compile("3 x * 7 +");

    assertEquals(fromTree, fromRpn);
  }

  // A backend consumes the IR without knowing which language produced it, so code
  // from either frontend runs identically.
  @Test
  void everyFrontendRunsOnTheSameBackend() {
    Map<String, Integer> environment = Map.of("x", 5);

    assertEquals(22, StackMachine.run(ExprCompiler.compile(tree()), environment));
    assertEquals(22, StackMachine.run(RpnCompiler.compile("3 x * 7 +"), environment));
  }

  // The other half of the decoupling: one instruction list feeds several backends.
  // Executing it and translating it are two readings of the same code.
  @Test
  void oneIrFeedsSeveralBackends() {
    List<Instruction> code = ExprCompiler.compile(tree());

    assertEquals(22, StackMachine.run(code, Map.of("x", 5)));
    assertEquals("((3 * x) + 7)", SourceEmitter.emit(code));
  }

  // Flattening must not lose operand order. Both backends have to agree that the
  // source said 10 - 4, since subtraction is where a reversed pop order shows up.
  @Test
  void operandOrderSurvivesFlattening() {
    List<Instruction> code = ExprCompiler.compile(
        new Expr.BinaryOp(Arith.SUB, new Expr.Literal(10), new Expr.Literal(4)));

    assertEquals(6, StackMachine.run(code, Map.of()));
    assertEquals("(10 - 4)", SourceEmitter.emit(code));
  }

  // Lowering preserves meaning for every input, not just the one in the demo: the
  // flat code computes what the tree said, whatever x happens to be.
  @Test
  void loweredCodeMatchesTheSourceForEveryInput() {
    List<Instruction> code = ExprCompiler.compile(tree());

    for (int x = -100; x <= 100; x++) {
      assertEquals(3 * x + 7, StackMachine.run(code, Map.of("x", x)));
    }
  }

  // Because the instruction list is flat with a fixed stack effect per instruction,
  // the deepest the stack can get is knowable by walking the code once — without
  // running it and without knowing any variable's value. The JVM does this same
  // walk and stores the answer as a method's `max_stack`.
  @Test
  void maxStackDepthIsKnownWithoutRunning() {
    assertEquals(2, StackMachine.verify(ExprCompiler.compile(tree())));

    // Nesting on the right needs a deeper stack: 1 + (2 + (3 + 4)) holds three
    // pending operands before the innermost addition collapses them.
    Expr rightLeaning = new Expr.BinaryOp(Arith.ADD, new Expr.Literal(1),
        new Expr.BinaryOp(Arith.ADD, new Expr.Literal(2),
            new Expr.BinaryOp(Arith.ADD, new Expr.Literal(3), new Expr.Literal(4))));
    assertEquals(4, StackMachine.verify(ExprCompiler.compile(rightLeaning)));
  }

  // Verification rejects code that would underflow the stack. A real verifier
  // catches exactly this class of malformed bytecode before the code is allowed to
  // run — hand-written or corrupted instruction lists are not trusted.
  @Test
  void verifierRejectsStackUnderflow() {
    assertThrows(IllegalArgumentException.class,
        () -> StackMachine.verify(List.of(Arith.ADD)));
  }

  // And rejects code that does not leave exactly one result behind — two pushes and
  // no operation is not a well-formed expression, however harmless it looks.
  @Test
  void verifierRejectsCodeThatDoesNotLeaveOneValue() {
    assertThrows(IllegalArgumentException.class,
        () -> StackMachine.verify(List.of(new Instruction.Push(1), new Instruction.Push(2))));
  }

  // Variables are resolved by the backend at run time, not baked in at compile time
  // — the same instruction list yields different results in different environments.
  @Test
  void variablesAreResolvedByTheBackend() {
    List<Instruction> code = ExprCompiler.compile(tree());

    assertEquals(10, StackMachine.run(code, Map.of("x", 1)));
    assertEquals(37, StackMachine.run(code, Map.of("x", 10)));
    assertThrows(IllegalArgumentException.class, () -> StackMachine.run(code, Map.of()));
  }
}
