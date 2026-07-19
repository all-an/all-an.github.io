package com.example.concepts;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.function.IntUnaryOperator;

// The shipped artifact: the run-time half of ahead-of-time compilation. It holds
// nothing but already-compiled code — no source, no instruction list, no compiler,
// no profiler. Every call runs at full speed from the very first one, because there
// is no warm-up left to do; but the set of programs it can run was fixed at build
// time and can never grow, which is the closed-world price AOT pays for that speed.
public final class NativeImage {

  // Name -> compiled code, populated once by the compiler and never added to
  // afterwards. This map being complete at construction *is* the closed world.
  private final Map<String, IntUnaryOperator> compiledCode;

  // Built only by AotCompiler, at the end of the build. The copy makes the image
  // immutable: nothing can slip a new program in once it has shipped.
  NativeImage(Map<String, IntUnaryOperator> compiledCode) {
    this.compiledCode = new LinkedHashMap<>(compiledCode);
  }

  // Run a program that was compiled into this image. No compilation, no profiling
  // and no interpretation happens here — just a call into finished code.
  public int run(String programName, int input) {
    IntUnaryOperator code = compiledCode.get(programName);

    // A program left out of the image cannot be compiled now: the compiler is gone.
    // This is the closed-world trade-off made visible — the failure mode a real AOT
    // build produces for a class it never saw, rather than loading it on demand.
    if (code == null) {
      throw new IllegalArgumentException(
          "not in the image: " + programName + " — it was not reachable at build time");
    }

    return code.applyAsInt(input);
  }

  // Whether a program survived the build and is callable at run time.
  public boolean contains(String programName) {
    return compiledCode.containsKey(programName);
  }

  // Everything the image can run — the whole world this binary knows about.
  public Set<String> programNames() {
    return compiledCode.keySet();
  }
}
