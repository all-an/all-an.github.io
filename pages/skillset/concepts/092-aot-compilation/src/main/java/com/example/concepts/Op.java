package com.example.concepts;

// One instruction of a program: an opcode plus its immediate operand — for example
// (MUL, 3) meaning "multiply the accumulator by 3". A list of these is the source
// program the compiler reads at build time. Immutable: an instruction never changes
// once emitted, which is what lets the compiler reason about a whole program safely.
public record Op(OpCode code, int operand) {

  // Run this single instruction against the running accumulator. Delegates to the
  // opcode so the interpreter and the compiled form share identical semantics.
  int applyTo(int accumulator) {
    return code.apply(accumulator, operand);
  }
}
