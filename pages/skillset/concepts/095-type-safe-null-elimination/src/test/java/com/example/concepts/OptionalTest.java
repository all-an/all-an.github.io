package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.junit.jupiter.api.Test;

// Verifies the defining properties of type-safe null elimination: absence is in the
// type, operations short-circuit instead of being null-checked, chains compose, and
// getting a value out means saying what absence should do.
class OptionalTest {

  private final Directory directory = new Directory(Map.of(
      "ana", new User("ana", Optional.empty()),
      "bruno", new User("bruno", Optional.of("ana")),
      "carla", new User("carla", Optional.of("bruno"))));

  // The signature carries the fact that a lookup can fail, so a caller cannot
  // forget it the way a nullable return lets them.
  @Test
  void absenceIsVisibleInTheType() {
    assertTrue(directory.find("carla").isPresent());
    assertEquals(Optional.empty(), directory.find("dora"));
  }

  // map/flatMap skip the empty case rather than testing for it — this is what
  // removes the null checks instead of merely relocating them.
  @Test
  void operationsShortCircuitOnAbsence() {
    assertEquals("bruno", directory.find("carla").flatMap(User::managerName).orElse("none"));
    assertEquals("none", directory.find("ana").flatMap(User::managerName).orElse("none"));
    assertEquals("none", directory.find("dora").flatMap(User::managerName).orElse("none"));
  }

  // Several fallible steps compose into a flat chain. The same logic with nullable
  // returns needs a null check between every step, nested.
  @Test
  void fallibleStepsComposeWithoutNesting() {
    assertEquals(Optional.of("ana"), directory.grandManagerOf("carla"));
    assertEquals(Optional.empty(), directory.grandManagerOf("bruno"));   // ana has no manager
    assertEquals(Optional.empty(), directory.grandManagerOf("dora"));    // no such user
  }

  // Unwrapping forces a decision about what absence means. There is no way to reach
  // the value that does not confront the empty case.
  @Test
  void unwrappingForcesHandlingAbsence() {
    assertEquals("carla", directory.find("carla").map(User::name).orElse("unknown"));
    assertEquals("unknown", directory.find("dora").map(User::name).orElse("unknown"));
  }

  // The honest caveat: Optional is a library type, not a language one. It is not
  // sealed, so there is no exhaustive switch forcing you to handle empty, and get()
  // on an empty Optional throws — it moves an NPE rather than removing it. The
  // guarantee is a discipline the API encourages, not one the compiler enforces.
  // Kotlin's T? and Rust's Option<T> are checked by the compiler; this is not.
  @Test
  void optionalStillHasAnUnsafeEscapeHatch() {
    assertThrows(NoSuchElementException.class, () -> directory.find("dora").get());
  }
}
