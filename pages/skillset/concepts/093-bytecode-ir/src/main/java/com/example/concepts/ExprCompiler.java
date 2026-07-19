package com.example.concepts;

import java.util.ArrayList;
import java.util.List;

// Frontend #1: lowers a source expression tree to IR. It knows everything about the
// source language and nothing about how the code will eventually run — that is the
// whole point of targeting an IR. Adding a new execution target requires no change
// here at all.
public final class ExprCompiler {

  // Static-only holder; there is nothing to instantiate.
  private ExprCompiler() {
  }

  // Compile an expression tree into a flat instruction list.
  public static List<Instruction> compile(Expr expr) {
    List<Instruction> code = new ArrayList<>();
    emit(expr, code);
    return List.copyOf(code);
  }

  // Walk the tree in post-order: both operands are emitted before the operation
  // that consumes them, so by the time the operation runs its inputs are already
  // sitting on the stack. Left is emitted before right, which fixes the operand
  // order the machine must pop in — the difference between `10 - 4` and `4 - 10`.
  // This traversal is the entire lowering: the tree's nesting becomes an ordering.
  private static void emit(Expr expr, List<Instruction> code) {
    switch (expr) {
      case Expr.Literal literal -> code.add(new Instruction.Push(literal.value()));
      case Expr.Variable variable -> code.add(new Instruction.Load(variable.name()));
      case Expr.BinaryOp binary -> {
        emit(binary.left(), code);
        emit(binary.right(), code);
        code.add(binary.op());
      }
    }
  }
}
