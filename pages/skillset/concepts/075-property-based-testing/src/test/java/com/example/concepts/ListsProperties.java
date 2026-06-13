package com.example.concepts;

import java.util.Collections;
import java.util.List;

import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.constraints.Size;

// Property-based tests: instead of hand-picked examples, each @Property states a
// rule and jqwik feeds it ~1000 randomly generated inputs. If any input breaks
// the rule, jqwik SHRINKS it to the smallest counterexample before reporting.
// A property method returns true when the rule holds for the given input.
class ListsProperties {

  // Round-trip / involution: reversing twice restores the original. This single
  // line is checked against hundreds of random lists, not one fixed example.
  @Property
  boolean reversingTwiceRestoresTheOriginal(@ForAll List<Integer> xs) {
    return Lists.reverse(Lists.reverse(xs)).equals(xs);
  }

  // Invariant: reverse never changes the number of elements.
  @Property
  boolean reversePreservesSize(@ForAll List<Integer> xs) {
    return Lists.reverse(xs).size() == xs.size();
  }

  // Relational property on non-empty lists: the first element ends up last.
  // @Size(min = 1) constrains the generator so empty lists are not produced.
  @Property
  boolean firstElementBecomesLast(@ForAll @Size(min = 1) List<Integer> xs) {
    List<Integer> reversed = Lists.reverse(xs);
    return reversed.get(reversed.size() - 1).equals(xs.get(0));
  }

  // Oracle / metamorphic property: our reverse agrees with the JDK's reference
  // implementation for every input — a powerful check when a trusted oracle exists.
  @Property
  boolean matchesReferenceImplementation(@ForAll List<Integer> xs) {
    List<Integer> expected = new java.util.ArrayList<>(xs);
    Collections.reverse(expected);
    return Lists.reverse(xs).equals(expected);
  }
}
