package com.example.concepts;

import java.util.List;

// A named sequence of instructions describing one int -> int function — the unit
// the engine profiles and, once it runs hot, compiles. The name identifies the
// program the way a method identity does in a real JIT: profiling counts are kept
// per program, and each hot program is compiled on its own. The instruction list
// is copied on construction so the bytecode is immutable once created.
public record Program(String name, List<Op> ops) {

  // Defensive copy: the bytecode must not change under the engine after profiling
  // has begun, or interpreted and compiled runs could diverge.
  public Program {
    ops = List.copyOf(ops);
  }
}
