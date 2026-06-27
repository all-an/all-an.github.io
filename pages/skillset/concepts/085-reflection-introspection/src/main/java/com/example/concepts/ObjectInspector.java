package com.example.concepts;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.LinkedHashMap;
import java.util.Map;

// The reflection toolkit. Each method works on objects and classes it knows
// NOTHING about at compile time — it discovers their fields, methods, and
// constructors at runtime through the Reflection API. This is metaprogramming:
// code that inspects and manipulates code. It is how serializers, ORMs, test
// runners, and dependency-injection containers work on your classes generically.
public final class ObjectInspector {

  private ObjectInspector() {}   // utility class — not meant to be instantiated

  // INTROSPECTION: read every declared field of any object into a map, without
  // knowing the object's type at compile time. Private fields are read too, and
  // a field's @Label annotation (if present) renames its key in the result.
  public static Map<String, Object> toMap(Object target) {
    Map<String, Object> result = new LinkedHashMap<>();   // preserve field order

    for (Field field : target.getClass().getDeclaredFields()) {
      field.setAccessible(true);   // bypass `private` so the value can be read

      // Read the @Label metadata about this field, if any, to pick the key name.
      String key = field.isAnnotationPresent(Label.class)
          ? field.getAnnotation(Label.class).value()
          : field.getName();

      try {
        result.put(key, field.get(target));   // read the field's value reflectively
      } catch (IllegalAccessException e) {
        throw new IllegalStateException("cannot read field " + field.getName(), e);
      }
    }
    return result;
  }

  // DYNAMIC INVOCATION: call a no-argument method chosen by NAME at runtime and
  // return its result — the method is not referenced anywhere in this code.
  public static Object call(Object target, String methodName) {
    try {
      Method method = target.getClass().getMethod(methodName);   // look it up by name
      return method.invoke(target);
    } catch (ReflectiveOperationException e) {
      throw new IllegalArgumentException("cannot call " + methodName + "()", e);
    }
  }

  // REFLECTIVE INSTANTIATION: build an object by finding a constructor that
  // matches the given parameter types and invoking it — how frameworks create
  // instances of classes they have never seen (deserialization, DI, fixtures).
  public static Object instantiate(Class<?> type, Class<?>[] paramTypes, Object... args) {
    try {
      Constructor<?> constructor = type.getDeclaredConstructor(paramTypes);
      return constructor.newInstance(args);
    } catch (ReflectiveOperationException e) {
      throw new IllegalArgumentException("cannot instantiate " + type.getSimpleName(), e);
    }
  }
}
