package com.example.concepts;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// A custom annotation that carries a PARAMETER: the int field it marks must be
// at least `value`. Annotations are not just on/off flags — their members let a
// field configure the rule declaratively (here, the minimum) while the Validator
// supplies the behaviour. RUNTIME retention keeps it readable by reflection.
@Retention(RetentionPolicy.RUNTIME)   // keep it in the class file AND at runtime
@Target(ElementType.FIELD)            // it may only annotate fields
public @interface Min {

  // The inclusive lower bound this field must meet. `value` is the conventional
  // member name, so a field can write the shorthand @Min(18) with no key.
  int value();
}
