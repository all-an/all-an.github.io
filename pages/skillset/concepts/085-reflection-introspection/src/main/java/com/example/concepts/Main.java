package com.example.concepts;

import java.util.Map;
import java.util.stream.Collectors;

// Demonstrates the three faces of reflection on a class the inspector knows
// nothing about at compile time: read its fields (introspection), call a method
// by name (dynamic invocation), and build an instance from its constructor
// (reflective instantiation).
public class Main {

  public static void main(String[] args) {
    Product widget = new Product("Widget", 1999, true);

    // INTROSPECTION: read the object's private fields into a map. The @Label on
    // `name` renames its key to "product_name".
    Map<String, Object> fields = ObjectInspector.toMap(widget);
    System.out.println("Fields of Product: " + render(fields));

    // DYNAMIC INVOCATION: call summary() chosen by name, never referenced directly.
    Object summary = ObjectInspector.call(widget, "summary");
    System.out.println("Called summary(): " + summary);

    // REFLECTIVE INSTANTIATION: build a Product from its 3-arg constructor at
    // runtime, then inspect the result the same generic way.
    Object gadget = ObjectInspector.instantiate(
        Product.class,
        new Class<?>[] { String.class, int.class, boolean.class },
        "Gadget", 4999, false);
    System.out.println("Reflectively built: " + render(ObjectInspector.toMap(gadget)));
  }

  // Render a field map as "key=value, key=value" for the demo output.
  private static String render(Map<String, Object> map) {
    return map.entrySet().stream()
        .map(entry -> entry.getKey() + "=" + entry.getValue())
        .collect(Collectors.joining(", "));
  }
}
