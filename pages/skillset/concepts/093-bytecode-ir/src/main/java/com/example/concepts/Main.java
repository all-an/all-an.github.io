package com.example.concepts;

import java.util.List;
import java.util.Map;

// Demonstrates bytecode / IR: two unrelated source languages are lowered to one
// flat instruction set, that instruction set is verified without being run, and
// then handed to two different backends — one that executes it and one that
// translates it — neither of which knows which language it came from.
public class Main {

  public static void main(String[] args) {
    // Source #1: an expression tree, 3 * x + 7.
    Expr tree = new Expr.BinaryOp(Arith.ADD,
        new Expr.BinaryOp(Arith.MUL, new Expr.Literal(3), new Expr.Variable("x")),
        new Expr.Literal(7));

    // Source #2: the same computation written in a completely different language.
    String rpn = "3 x * 7 +";

    List<Instruction> fromTree = ExprCompiler.compile(tree);
    List<Instruction> fromRpn = RpnCompiler.compile(rpn);

    System.out.println("Source #1 (tree): 3 * x + 7");
    System.out.println("Source #2 (RPN) : " + rpn);
    System.out.println();
    System.out.println("Both lower to the same IR:");
    System.out.print(StackMachine.disassemble(fromTree));
    System.out.println("Identical instruction lists: " + fromTree.equals(fromRpn));
    System.out.println();

    // Verification is a static walk: it needs no input values and runs no code.
    System.out.println("Verified. max_stack = " + StackMachine.verify(fromTree));
    System.out.println();

    // One IR, two backends. Neither knows which source language it came from.
    Map<String, Integer> environment = Map.of("x", 5);
    System.out.println("Backend #1 (execute)  x=5 -> " + StackMachine.run(fromTree, environment));
    System.out.println("Backend #2 (emit)        -> " + SourceEmitter.emit(fromTree));
    System.out.println();

    // Operand order survives the flattening: the tree said 10 - 4, not 4 - 10.
    Expr subtraction = new Expr.BinaryOp(Arith.SUB, new Expr.Literal(10), new Expr.Literal(4));
    List<Instruction> subtractionCode = ExprCompiler.compile(subtraction);
    System.out.println("Order is preserved: " + SourceEmitter.emit(subtractionCode)
        + " = " + StackMachine.run(subtractionCode, Map.of()));

    // The verifier rejects malformed code before it ever reaches a backend.
    try {
      StackMachine.verify(List.of(Arith.ADD));
    } catch (IllegalArgumentException rejected) {
      System.out.println("Verifier rejects `add` alone: " + rejected.getMessage());
    }
  }
}
