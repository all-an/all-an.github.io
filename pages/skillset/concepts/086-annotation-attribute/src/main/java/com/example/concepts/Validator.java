package com.example.concepts;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

// The PROCESSOR that gives the annotations meaning. Annotations are inert
// metadata — they do nothing until something reads them. This validator walks
// any object's fields, asks each one which rule annotations it carries, reads
// the field's value, and turns every violated rule into a message. This is how
// frameworks like Bean Validation, JPA, and serializers work: the annotation
// declares intent, a separate processor enforces it.
public final class Validator {

  private Validator() {}   // utility class — not meant to be instantiated

  // Validate every annotated field of the target and return one message per
  // violated rule. An empty list means the object is valid.
  public static List<String> validate(Object target) {
    List<String> violations = new ArrayList<>();

    for (Field field : target.getClass().getDeclaredFields()) {
      field.setAccessible(true);   // read the value even though the field is private
      Object value = readValue(field, target);

      // @NotBlank: the field's String value must be present and non-whitespace.
      if (field.isAnnotationPresent(NotBlank.class) && isBlank(value)) {
        // Pull the message straight off the annotation's `message` member.
        violations.add(field.getName() + ": " + field.getAnnotation(NotBlank.class).message());
      }

      // @Min: the field's int value must be at least the annotation's `value`.
      if (field.isAnnotationPresent(Min.class)) {
        int minimum = field.getAnnotation(Min.class).value();   // read the parameter
        if (((int) value) < minimum) {
          violations.add(field.getName() + ": must be at least " + minimum);
        }
      }
    }
    return violations;
  }

  // Read a field's value reflectively; setAccessible was already called above.
  private static Object readValue(Field field, Object target) {
    try {
      return field.get(target);
    } catch (IllegalAccessException e) {
      throw new IllegalStateException("cannot read field " + field.getName(), e);
    }
  }

  // A value counts as blank when it is null or a String of only whitespace.
  private static boolean isBlank(Object value) {
    return value == null || (value instanceof String s && s.isBlank());
  }
}
