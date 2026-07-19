package com.example.concepts;

import java.util.ArrayList;
import java.util.List;

// Frontend #2: a completely different source language — reverse Polish notation
// text like "3 x * 7 +" — lowered to the *same* IR. It shares no code with the tree
// compiler and has no parser to speak of, because RPN is already in evaluation
// order.
//
// This is the argument for having an IR at all: two languages with nothing in
// common converge on one instruction set, so every backend written against that
// instruction set works for both — for free. M frontends and N backends need M + N
// pieces instead of M x N.
public final class RpnCompiler {

  // Static-only holder; there is nothing to instantiate.
  private RpnCompiler() {
  }

  // Compile whitespace-separated RPN source into the same instruction list the tree
  // compiler produces. Each token becomes exactly one instruction: RPN is already
  // written in the order a stack machine wants, so no reordering is needed.
  public static List<Instruction> compile(String source) {
    List<Instruction> code = new ArrayList<>();

    for (String token : source.trim().split("\\s+")) {
      code.add(switch (token) {
        case "+" -> Arith.ADD;
        case "-" -> Arith.SUB;
        case "*" -> Arith.MUL;
        // Anything else is a literal if it parses as a number, or a variable name.
        default -> token.matches("-?\\d+")
            ? new Instruction.Push(Integer.parseInt(token))
            : new Instruction.Load(token);
      });
    }

    return List.copyOf(code);
  }
}
