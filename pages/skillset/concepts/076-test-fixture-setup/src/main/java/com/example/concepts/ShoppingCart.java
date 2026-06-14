package com.example.concepts;

import java.util.ArrayList;
import java.util.List;

// A stateful shopping cart — exactly the kind of object that makes a test
// fixture necessary. Because every instance accumulates items, two tests that
// shared one cart would contaminate each other; a fixture hands each test a
// fresh, empty cart so they stay independent.
public class ShoppingCart {

  // One line item in the cart: a product name and its price in cents.
  // Cents (an int) rather than a floating-point dollar amount avoids rounding
  // error when prices are summed.
  public record Item(String name, int priceCents) {}

  // The cart's mutable state — and the reason a fresh fixture is needed per
  // test. Once a test mutates this list, the next test must not see it.
  private final List<Item> items = new ArrayList<>();

  // Add a product to the cart.
  public void add(String name, int priceCents) {
    items.add(new Item(name, priceCents));
  }

  // How many items are currently in the cart.
  public int itemCount() {
    return items.size();
  }

  // Sum of every item's price, in cents.
  public int totalCents() {
    return items.stream().mapToInt(Item::priceCents).sum();
  }
}
