package com.example.concepts;

// An ordinary domain object with PRIVATE fields and no special interface. It does
// nothing reflective itself — it is the thing being inspected. The inspector
// reads its fields, calls its methods, and even constructs it without Product
// ever cooperating, which is exactly what makes reflection powerful (and risky).
public class Product {

  // A private field renamed in reflective output via the @Label annotation.
  @Label("product_name")
  private final String name;

  // Plain private fields, read by the inspector despite being private.
  private final int priceCents;
  private final boolean inStock;

  public Product(String name, int priceCents, boolean inStock) {
    this.name = name;
    this.priceCents = priceCents;
    this.inStock = inStock;
  }

  // A no-argument method the inspector invokes purely by its name "summary".
  public String summary() {
    return name + " @ " + priceCents + "c";
  }
}
