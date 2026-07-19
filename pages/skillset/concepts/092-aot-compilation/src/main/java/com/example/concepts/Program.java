package com.example.concepts;

import java.util.List;

// A named sequence of instructions describing one int -> int function — the unit
// the compiler analyses, optimizes and emits into the native image at build time.
// The name identifies the program the way a symbol does in a real binary: the
// reachability analysis works on names, and only reachable names end up in the
// image. The instruction list is copied on construction so a program is immutable
// once created — the compiler must be able to trust that what it compiled at build
// time is what the program still says at run time.
public record Program(String name, List<Op> ops) {

  // Defensive copy: an AOT compiler bakes its decisions into the image permanently,
  // so the source it compiled must never change underneath it.
  public Program {
    ops = List.copyOf(ops);
  }
}
