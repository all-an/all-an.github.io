package com.example.concepts;

// The reference semantics: what a program *means*, defined by walking its
// instructions one at a time. Nothing in the shipped native image uses this — an
// AOT-compiled binary carries no interpreter at all. It exists as the specification
// the compiler is measured against: for every program and every input, the compiled
// code must return exactly what interpreting would. An AOT compiler is allowed to
// change the shape and speed of the code, never its meaning.
public final class Interpreter {

  // Static-only holder; there is nothing to instantiate.
  private Interpreter() {
  }

  // Execute a program by walking its instruction list, applying each opcode to the
  // running accumulator, starting from the input.
  public static int interpret(Program program, int input) {
    int accumulator = input;
    for (Op op : program.ops()) {
      accumulator = op.applyTo(accumulator);
    }
    return accumulator;
  }
}
