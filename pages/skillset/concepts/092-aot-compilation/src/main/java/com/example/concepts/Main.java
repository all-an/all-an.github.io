package com.example.concepts;

import java.util.List;
import java.util.Set;

// Demonstrates ahead-of-time compilation: the whole application is analysed,
// optimized and compiled at build time into a native image, which then runs at full
// speed from its very first call — while the code proven unreachable never makes it
// into the artifact at all.
public class Main {

  public static void main(String[] args) {
    // The "source tree": every program the application contains.
    Program poly = new Program("poly", List.of(
        new Op(OpCode.MUL, 2),
        new Op(OpCode.MUL, 3),
        new Op(OpCode.ADD, 10),
        new Op(OpCode.SUB, 4),
        new Op(OpCode.ADD, 1)));
    Program negate = new Program("negate", List.of(new Op(OpCode.MUL, -1)));
    Program unused = new Program("unused", List.of(new Op(OpCode.ADD, 99)));

    // The build: only these names are reachable, so only they are compiled in.
    Set<String> entryPoints = Set.of("poly", "negate");
    NativeImage image = AotCompiler.compile(List.of(poly, negate, unused), entryPoints);

    System.out.println("Source programs: poly, negate, unused");
    System.out.println("Entry points   : poly, negate");
    System.out.println("In the image   : " + image.programNames());
    System.out.println();

    // Optimization happens once, at build time: the shipped code is shorter than
    // the source it came from, and every run gets that saving for free.
    Program optimizedPoly = AotCompiler.optimize(poly);
    System.out.println("poly source   : " + poly.ops().size() + " instructions  [MUL 2, MUL 3, ADD 10, SUB 4, ADD 1]");
    System.out.println("poly compiled : " + optimizedPoly.ops().size() + " instructions  [MUL 6, ADD 7]");
    System.out.println();

    // No warm-up: the first call already runs finished code, not an interpreter.
    for (int input = 1; input <= 3; input++) {
      System.out.printf("run #%d  poly(%d) -> %d   (compiled before startup, no warm-up)%n",
          input, input, image.run("poly", input));
    }

    // Optimizing must not change meaning: the image agrees with the interpreter,
    // which defines what the original, unoptimized program says.
    boolean agree = true;
    for (int input = 0; input < 10; input++) {
      if (Interpreter.interpret(poly, input) != image.run("poly", input)) {
        agree = false;
      }
    }
    System.out.println();
    System.out.println("Image and reference semantics agree over inputs 0..9: " + agree);

    // The closed world: code left out of the build cannot be compiled later,
    // because the compiler does not ship with the image.
    try {
      image.run("unused", 1);
    } catch (IllegalArgumentException eliminated) {
      System.out.println("Calling 'unused': " + eliminated.getMessage());
    }
  }
}
