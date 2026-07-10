package com.example.concepts;

import java.util.List;
import java.util.function.IntUnaryOperator;

// Demonstrates just-in-time compilation: a program starts out interpreted, and once
// it has run often enough the engine compiles it to specialized code and runs that
// instead — without ever changing the result it produces.
public class Main {

  public static void main(String[] args) {
    // A program: f(x) = x * 3 + 7 - 1  (i.e. 3x + 6), expressed as bytecode.
    Program program = new Program("poly", List.of(
        new Op(OpCode.MUL, 3),
        new Op(OpCode.ADD, 7),
        new Op(OpCode.SUB, 1)));

    int compileThreshold = 4;   // interpret this many times, then compile
    Jit jit = new Jit(compileThreshold);
    int input = 7;              // f(7) = 3*7 + 6 = 27, whichever way it runs

    System.out.println("Program: 3*x + 7 - 1   bytecode=[MUL 3, ADD 7, SUB 1]");
    System.out.println("Compile threshold: " + compileThreshold + " interpreted calls before compiling");
    System.out.println();

    // Call the program repeatedly. The first calls are interpreted; once it turns
    // hot the engine compiles it, and every later call runs the compiled code.
    for (int call = 1; call <= compileThreshold + 2; call++) {
      int result = jit.run(program, input);
      String strategy = jit.isCompiled(program) ? "compiled   " : "interpreted";
      String note = jit.isCompiled(program) && call == compileThreshold + 1 ? "   <- JIT kicked in" : "";
      System.out.printf("call #%d  input=%d -> %d   %s (compiled=%b)%s%n",
          call, input, result, strategy, jit.isCompiled(program), note);
    }

    // A JIT must not change behavior: prove the interpreter and the compiled code
    // agree on every input, so switching strategies is invisible to the result.
    boolean agree = true;
    IntUnaryOperator compiled = Jit.compile(program);
    for (int x = 0; x < 10; x++) {
      if (Jit.interpret(program, x) != compiled.applyAsInt(x)) {
        agree = false;
      }
    }
    System.out.println();
    System.out.println("Interpreter and compiled code agree over inputs 0..9: " + agree);
  }
}
