package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;

// Verifies that the annotations drive validation: a valid object yields no
// messages, and each violated annotation contributes exactly one message —
// including the @NotBlank custom message and the @Min parameter.
class ValidatorTest {

  // A user meeting every rule produces no violations at all.
  @Test
  void validUserHasNoViolations() {
    List<String> violations = Validator.validate(new User("Ada", 36));

    assertTrue(violations.isEmpty());
  }

  // A blank name violates @NotBlank and reports its custom `message`.
  @Test
  void blankNameReportsTheAnnotationMessage() {
    List<String> violations = Validator.validate(new User("  ", 36));

    assertEquals(List.of("name: name is required"), violations);
  }

  // An under-age value violates @Min and reports the annotation's parameter.
  @Test
  void ageBelowMinimumReportsTheBound() {
    List<String> violations = Validator.validate(new User("Ada", 16));

    assertEquals(List.of("age: must be at least 18"), violations);
  }

  // Multiple broken rules each contribute one message, in field order.
  @Test
  void everyViolatedRuleContributesOneMessage() {
    List<String> violations = Validator.validate(new User("", 10));

    assertEquals(2, violations.size());
    assertEquals("name: name is required", violations.get(0));
    assertEquals("age: must be at least 18", violations.get(1));
  }
}
