package com.example.concepts;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.IntUnaryOperator;

// The build-time half of ahead-of-time compilation. Nothing here ever runs while
// the application is running — this is the compiler, and it finishes its whole job
// before the first input exists. It does the three things an AOT toolchain does:
//
//   1. Closed-world analysis — decide which programs are reachable from the
//      declared entry points. Only those go into the image; the rest are dropped.
//   2. Optimization — fold the instructions of each surviving program using facts
//      known statically, shrinking the code before it is ever executed.
//   3. Emission — turn each optimized program into a callable and seal them into a
//      NativeImage that carries no compiler and no source.
//
// The contrast with a JIT is the timing: a JIT ships the source, starts by
// interpreting, profiles, and compiles hot code *during* execution. AOT pays the
// entire compile cost up front, so the shipped artifact starts at full speed — at
// the price of a closed world, since nothing can be compiled after the build.
public final class AotCompiler {

  // Static-only holder; there is nothing to instantiate.
  private AotCompiler() {
  }

  // Compile an application into a native image. `allPrograms` is everything the
  // source tree contains; `entryPoints` names what is actually reachable. Programs
  // outside the reachable set are eliminated — they are not compiled and cannot be
  // called later, which is exactly the closed-world bargain: the compiler may drop
  // anything it can prove unused because, unlike a JIT, it will never get a second
  // chance to compile it. (Real toolchains walk the call graph from the roots; here
  // programs never call one another, so the roots *are* the reachable set.)
  public static NativeImage compile(List<Program> allPrograms, Set<String> entryPoints) {
    Map<String, IntUnaryOperator> compiledCode = new LinkedHashMap<>();

    for (Program program : allPrograms) {
      if (entryPoints.contains(program.name())) {
        compiledCode.put(program.name(), emit(optimize(program)));
      }
    }

    return new NativeImage(compiledCode);
  }

  // Optimize a program using only what is knowable at build time. The accumulator's
  // value is unknown — that is the input — but the *instructions* are fully known,
  // so adjacent steps that combine algebraically can be collapsed into one:
  //
  //   [MUL 2, MUL 3, ADD 10, SUB 4, ADD 1]  ->  [MUL 6, ADD 7]
  //
  // Each SUB is first rewritten as an ADD of the negated operand so subtractions
  // and additions can merge; adjacent ADDs then sum and adjacent MULs multiply,
  // both of which are associative in two's-complement arithmetic and so preserve
  // the result exactly, overflow included. This is the AOT payoff: work done once
  // at build time that every run of the shipped binary gets for free.
  public static Program optimize(Program program) {
    List<Op> folded = new ArrayList<>();

    for (Op op : program.ops()) {
      // Normalize SUB n into ADD -n so that a mixed run of additions and
      // subtractions becomes a single run of additions that can be merged.
      Op normalized = op.code() == OpCode.SUB
          ? new Op(OpCode.ADD, -op.operand())
          : op;

      Op previous = folded.isEmpty() ? null : folded.get(folded.size() - 1);

      if (previous != null && previous.code() == OpCode.ADD && normalized.code() == OpCode.ADD) {
        folded.set(folded.size() - 1, new Op(OpCode.ADD, previous.operand() + normalized.operand()));
      } else if (previous != null && previous.code() == OpCode.MUL && normalized.code() == OpCode.MUL) {
        folded.set(folded.size() - 1, new Op(OpCode.MUL, previous.operand() * normalized.operand()));
      } else {
        folded.add(normalized);
      }
    }

    return new Program(program.name(), folded);
  }

  // Emit machine-ready code for one program: fold its instruction list into a
  // single callable, ahead of any input. The returned operator closes over the
  // instructions, so running it never loops over or dispatches them — that work was
  // done here, at build time, and is not repeated on any run.
  static IntUnaryOperator emit(Program program) {
    IntUnaryOperator code = IntUnaryOperator.identity();
    for (Op op : program.ops()) {
      IntUnaryOperator preceding = code;   // capture the chain built so far
      code = input -> op.applyTo(preceding.applyAsInt(input));
    }
    return code;
  }
}
