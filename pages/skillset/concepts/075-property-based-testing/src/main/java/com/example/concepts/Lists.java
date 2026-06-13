package com.example.concepts;

import java.util.ArrayList;
import java.util.List;

// The code under test: a hand-written list reverse. Property-based tests state
// rules that must hold for EVERY input, then let jqwik hunt for a counterexample.
public final class Lists {
  private Lists() {}

  // Returns a new list with the elements of input in reverse order.
  public static <T> List<T> reverse(List<T> input) {
    List<T> out = new ArrayList<>(input.size());
    for (int i = input.size() - 1; i >= 0; i--) {
      out.add(input.get(i));
    }
    return out;
  }
}
