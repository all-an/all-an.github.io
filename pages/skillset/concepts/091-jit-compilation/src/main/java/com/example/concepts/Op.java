package com.example.concepts;

// One instruction of a program: an opcode plus its immediate operand — for example
// (MUL, 3) meaning "multiply the accumulator by 3". A list of these is the
// "bytecode" the engine either interprets step by step or compiles into native
// code. Immutable, like real bytecode: once emitted, an instruction never changes.
public record Op(OpCode code, int operand) {

  // Run this single instruction against the running accumulator. Delegates to the
  // opcode so the interpreter and the compiled form share identical semantics.
  int applyTo(int accumulator) {
    return code.apply(accumulator, operand);
  }
}
