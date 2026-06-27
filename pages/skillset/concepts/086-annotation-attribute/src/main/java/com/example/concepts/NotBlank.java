package com.example.concepts;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// A custom annotation: declarative metadata that says "this String field must
// not be null or blank". It holds no logic itself — it is a label a separate
// processor (the Validator) reads and acts on. RUNTIME retention is mandatory:
// without it the compiler discards the annotation and no processor could see it.
@Retention(RetentionPolicy.RUNTIME)   // keep it in the class file AND at runtime
@Target(ElementType.FIELD)            // it may only annotate fields
public @interface NotBlank {

  // The message reported when the rule is violated. A default lets a field
  // simply write @NotBlank with no parentheses and still carry a message.
  String message() default "must not be blank";
}
