package com.example.concepts;

// The instruction set of the tiny accumulator machine this project compiles. Each
// opcode is one arithmetic step: it takes the running accumulator and an operand
// and returns the new accumulator. The interpreter — which defines what a program
// *means* — and the ahead-of-time compiled code both route through this single
// `apply`, so they cannot disagree. That shared meaning is what lets an AOT
// compiler be correct: the native image must produce exactly what the source
// program says, even though it was compiled long before any input existed.
public enum OpCode {

  // accumulator + operand
  ADD {
    @Override
    int apply(int accumulator, int operand) { return accumulator + operand; }
  },

  // accumulator - operand
  SUB {
    @Override
    int apply(int accumulator, int operand) { return accumulator - operand; }
  },

  // accumulator * operand
  MUL {
    @Override
    int apply(int accumulator, int operand) { return accumulator * operand; }
  };

  // Apply this instruction. The single source of truth for what each opcode means,
  // shared by the interpreter and the compiler so the two can never disagree.
  abstract int apply(int accumulator, int operand);
}
