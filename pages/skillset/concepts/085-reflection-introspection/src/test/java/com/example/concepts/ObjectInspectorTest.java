package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import org.junit.jupiter.api.Test;

// Verifies the three reflective capabilities: reading private fields, calling a
// method by name, and constructing an object at runtime.
class ObjectInspectorTest {

  // INTROSPECTION reads even private fields, with their values.
  @Test
  void toMapReadsAllDeclaredFieldsIncludingPrivate() {
    Map<String, Object> fields = ObjectInspector.toMap(new Product("Widget", 1999, true));

    assertEquals(3, fields.size());
    assertEquals(1999, fields.get("priceCents"));
    assertEquals(true, fields.get("inStock"));
  }

  // A field's @Label metadata renames its key; the raw field name is then absent.
  @Test
  void toMapHonorsTheLabelAnnotationForKeyNames() {
    Map<String, Object> fields = ObjectInspector.toMap(new Product("Widget", 1999, true));

    assertEquals("Widget", fields.get("product_name"));   // renamed by @Label
    assertFalse(fields.containsKey("name"));              // raw name not used
  }

  // DYNAMIC INVOCATION calls a method chosen purely by its name string.
  @Test
  void callInvokesAMethodByName() {
    Object result = ObjectInspector.call(new Product("Widget", 1999, true), "summary");

    assertEquals("Widget @ 1999c", result);
  }

  // Asking for a method that does not exist fails clearly rather than silently.
  @Test
  void callOnAnUnknownMethodThrows() {
    Product product = new Product("Widget", 1999, true);

    assertThrows(IllegalArgumentException.class, () -> ObjectInspector.call(product, "noSuchMethod"));
  }

  // REFLECTIVE INSTANTIATION builds a real object from its constructor at runtime.
  @Test
  void instantiateBuildsAnObjectFromItsConstructor() {
    Object built = ObjectInspector.instantiate(
        Product.class,
        new Class<?>[] { String.class, int.class, boolean.class },
        "Gadget", 4999, false);

    assertTrue(built instanceof Product);
    Map<String, Object> fields = ObjectInspector.toMap(built);
    assertEquals("Gadget", fields.get("product_name"));
    assertEquals(4999, fields.get("priceCents"));
  }

  // A constructor whose parameter types do not match is reported, not guessed at.
  @Test
  void instantiateWithWrongParameterTypesThrows() {
    assertThrows(IllegalArgumentException.class, () -> ObjectInspector.instantiate(
        Product.class,
        new Class<?>[] { String.class },   // no single-arg constructor exists
        "Gadget"));
  }
}
