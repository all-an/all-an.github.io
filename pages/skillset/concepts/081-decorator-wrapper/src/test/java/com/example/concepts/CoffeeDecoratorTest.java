package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

// Verifies the defining properties of the Decorator pattern: a decorator adds to
// what it wraps, decorators stack to any depth, the total is order-independent
// while the description reflects order, and a decorated coffee is itself a Coffee.
class CoffeeDecoratorTest {

  // The bare component is unaffected — nothing has wrapped it.
  @Test
  void baseComponentHasNoAddOns() {
    Coffee coffee = new Espresso();

    assertEquals(200, coffee.costCents());
    assertEquals("Espresso", coffee.description());
  }

  // A single decorator adds its own cost and label on top of the base.
  @Test
  void oneDecoratorAddsItsContribution() {
    Coffee coffee = new Milk(new Espresso());

    assertEquals(250, coffee.costCents());            // 200 + 50
    assertEquals("Espresso + Milk", coffee.description());
  }

  // Decorators stack: each layer adds to the one inside it.
  @Test
  void decoratorsStackToAnyDepth() {
    Coffee coffee = new Sugar(new Milk(new Espresso()));

    assertEquals(275, coffee.costCents());            // 200 + 50 + 25
    assertEquals("Espresso + Milk + Sugar", coffee.description());
  }

  // Wrapping order changes the description but not the total — the add-ons are
  // composable.
  @Test
  void orderAffectsDescriptionButNotTotal() {
    Coffee milkFirst = new Sugar(new Milk(new Espresso()));
    Coffee sugarFirst = new Milk(new Sugar(new Espresso()));

    assertEquals(milkFirst.costCents(), sugarFirst.costCents());     // same total
    assertEquals("Espresso + Milk + Sugar", milkFirst.description());
    assertEquals("Espresso + Sugar + Milk", sugarFirst.description());
  }

  // Because a decorator IS-A Coffee, it can be passed anywhere a Coffee is
  // expected — including as the thing another decorator wraps.
  @Test
  void aDecoratedCoffeeIsItselfACoffee() {
    Coffee inner = new Milk(new Espresso());
    Coffee outer = new Sugar(inner);   // wrap a decorator in another decorator

    assertEquals(275, outer.costCents());
  }
}
