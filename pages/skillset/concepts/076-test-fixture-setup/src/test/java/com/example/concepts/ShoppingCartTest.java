package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

// A test fixture is the fixed, known starting state each test runs against.
// The @BeforeEach method below rebuilds that state before EVERY test, so the
// tests are isolated — nothing one test does can leak into the next.
class ShoppingCartTest {

  // The fixture: the object under test, recreated fresh for each test method.
  // It is a field so every @Test can reach it after @BeforeEach assigns it.
  private ShoppingCart cart;

  // Runs before every @Test. This is the fixture setup — a brand-new, empty
  // cart each time, which is precisely what makes the two tests below
  // independent of each other and of their run order.
  @BeforeEach
  void setUp() {
    cart = new ShoppingCart();
  }

  // Starts from the empty fixture and asserts only on its own change.
  @Test
  void addingOneItemCountsAsOne() {
    cart.add("Coffee", 450);

    assertEquals(1, cart.itemCount());
    assertEquals(450, cart.totalCents());
  }

  // If the fixture were NOT reset, this test could see "Coffee" left over from
  // the test above and fail on the count. Because @BeforeEach handed it a fresh
  // cart, it starts empty and passes — that isolation is the point of a fixture.
  @Test
  void totalSumsAllItems() {
    cart.add("Tea", 300);
    cart.add("Muffin", 275);

    assertEquals(2, cart.itemCount());
    assertEquals(575, cart.totalCents());
  }
}
