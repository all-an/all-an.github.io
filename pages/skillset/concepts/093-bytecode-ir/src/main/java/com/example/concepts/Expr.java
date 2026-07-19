package com.example.concepts;

// The source language: an expression tree, the shape a parser naturally produces.
// It is *nested* — an operand is itself an arbitrary expression — which is
// convenient to write and to reason about but not something a machine can execute
// directly. Turning this tree into the flat instruction list of the IR is the
// lowering step that gives the concept its name: the representation *between*
// source and execution.
public sealed interface Expr permits Expr.Literal, Expr.Variable, Expr.BinaryOp {

  // A constant value written in the source.
  record Literal(int value) implements Expr {
  }

  // A reference to a named variable, resolved only when the program runs.
  record Variable(String name) implements Expr {
  }

  // An operation applied to two sub-expressions, each of which may be a whole tree
  // again. This nesting is exactly what the IR flattens away.
  record BinaryOp(Arith op, Expr left, Expr right) implements Expr {
  }
}
