package com.example.concepts;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// A custom annotation that renames a field in reflective output. The point for
// this concept: annotations are metadata the code can READ ABOUT ITSELF at
// runtime. RUNTIME retention is what makes that possible — without it the
// annotation is discarded by the compiler and reflection could never see it.
@Retention(RetentionPolicy.RUNTIME)   // keep it in the class file AND at runtime
@Target(ElementType.FIELD)            // it may only annotate fields
public @interface Label {

  // The name to use for this field when an object is inspected into a map.
  String value();
}
