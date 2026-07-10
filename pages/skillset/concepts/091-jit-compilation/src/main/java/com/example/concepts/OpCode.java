package com.example.concepts;

// The instruction set of the tiny accumulator machine this project runs. Each
// opcode is one arithmetic step: it takes the running accumulator and an operand
// and returns the new accumulator. Both execution modes — the interpreter and the
// JIT-compiled form — route through this single `apply`, so they are guaranteed to
// compute the same thing. That shared meaning is what lets a JIT be correct: the
// compiled code must be observably identical to interpreting the bytecode.
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
