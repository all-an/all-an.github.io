package com.example.concepts;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;

// Backend #2: instead of executing the IR, it translates it into source text for
// another language. It consumes exactly the same instruction list the virtual
// machine does, which is the payoff of a shared IR — a second target costs one new
// backend, not one new compiler per source language.
//
// Real toolchains lean on this constantly: LLVM IR is lowered to x86, ARM or WASM
// by swapping backends, and transpilers emit source the same way this does.
public final class SourceEmitter {

  // Static-only holder; there is nothing to instantiate.
  private SourceEmitter() {
  }

  // Walk the instructions building strings instead of computing numbers. The
  // algorithm is identical to the machine's — push operands, let each operation
  // consume two — but the "values" are fragments of source, so the tree the
  // frontend flattened is reconstructed as text: [push 3, load x, mul] becomes
  // "(3 * x)".
  public static String emit(List<Instruction> code) {
    Deque<String> stack = new ArrayDeque<>();

    for (Instruction instruction : code) {
      switch (instruction) {
        case Instruction.Push push -> stack.push(String.valueOf(push.value()));
        case Instruction.Load load -> stack.push(load.name());
        case Arith arith -> {
          // Same pop order as the machine, for the same reason: the right operand
          // is on top. Reversing it would print `4 - 10` for `10 - 4`.
          String right = stack.pop();
          String left = stack.pop();
          stack.push("(" + left + " " + arith.symbol() + " " + right + ")");
        }
      }
    }

    return stack.pop();
  }
}
