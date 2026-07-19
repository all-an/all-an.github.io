package com.example.concepts;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;
import java.util.Map;

// Backend #1: a virtual machine that executes the IR directly. It knows nothing
// about any source language — it sees only instructions, so it runs code from every
// frontend equally well. This is what a bytecode interpreter is: the JVM, the CLR
// and a WASM runtime all do exactly this, with a bigger instruction set.
public final class StackMachine {

  // Static-only holder; there is nothing to instantiate.
  private StackMachine() {
  }

  // Execute an instruction list against an environment of variable values, and
  // return the single value left on the operand stack.
  public static int run(List<Instruction> code, Map<String, Integer> environment) {
    Deque<Integer> stack = new ArrayDeque<>();

    for (Instruction instruction : code) {
      switch (instruction) {
        case Instruction.Push push -> stack.push(push.value());
        case Instruction.Load load -> {
          Integer value = environment.get(load.name());
          if (value == null) {
            throw new IllegalArgumentException("unbound variable: " + load.name());
          }
          stack.push(value);
        }
        case Arith arith -> {
          // Pop in reverse: the right operand was emitted last, so it is on top.
          // Getting this backwards would silently compute `4 - 10` for `10 - 4`.
          int right = stack.pop();
          int left = stack.pop();
          stack.push(arith.apply(left, right));
        }
      }
    }

    return stack.pop();
  }

  // Verify the code before running it, and return the deepest the operand stack will
  // ever get. Because the instruction list is flat and its stack effect is fixed per
  // instruction, both facts can be established by walking it once, without executing
  // anything and without knowing any variable's value. This is why real bytecode is
  // verifiable: the JVM does the same walk and records the answer as the `max_stack`
  // field of a method's Code attribute, so the frame can be sized before entry.
  public static int verify(List<Instruction> code) {
    int depth = 0;
    int maxDepth = 0;

    for (Instruction instruction : code) {
      // An operation consumes two operands and leaves one: net effect -1. Anything
      // else pushes a value: +1.
      if (instruction instanceof Arith) {
        if (depth < 2) {
          throw new IllegalArgumentException(
              "stack underflow at `" + instruction.text() + "`: needs 2 operands, has " + depth);
        }
        depth--;
      } else {
        depth++;
      }
      maxDepth = Math.max(maxDepth, depth);
    }

    // A well-formed expression leaves exactly its one result behind.
    if (depth != 1) {
      throw new IllegalArgumentException("code must leave exactly 1 value on the stack, leaves " + depth);
    }

    return maxDepth;
  }

  // Render the instruction list as a disassembly listing, the way `javap -c` prints
  // a compiled method: one instruction per line, with its offset.
  public static String disassemble(List<Instruction> code) {
    StringBuilder listing = new StringBuilder();
    for (int offset = 0; offset < code.size(); offset++) {
      listing.append(String.format("%2d: %s%n", offset, code.get(offset).text()));
    }
    return listing.toString();
  }
}
