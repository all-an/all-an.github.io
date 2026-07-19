package com.example.concepts;

// The arithmetic operations, shared by the source language and the IR. An `Arith`
// is both an AST node's operator and — because a stack machine takes its operands
// from the stack rather than from the instruction — a complete instruction on its
// own. Having one definition of what "add" means is what lets every frontend and
// every backend agree: the meaning lives here, not in any one of them.
public enum Arith implements Instruction {

  ADD("+") {
    @Override
    int apply(int left, int right) { return left + right; }
  },

  SUB("-") {
    @Override
    int apply(int left, int right) { return left - right; }
  },

  MUL("*") {
    @Override
    int apply(int left, int right) { return left * right; }
  };

  // How this operation is written in source form — used when a backend lowers the
  // IR back out to source text rather than executing it.
  private final String symbol;

  Arith(String symbol) {
    this.symbol = symbol;
  }

  // Combine two operands. The single source of truth for what each operation means.
  abstract int apply(int left, int right);

  public String symbol() {
    return symbol;
  }

  // As it appears in a disassembly listing: `add`, `sub`, `mul`.
  @Override
  public String text() {
    return name().toLowerCase();
  }
}
