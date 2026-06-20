package com.example.concepts;

// The context: it holds the running subtotal and a discount strategy, and
// delegates the pricing decision to that strategy. The checkout itself contains
// NO discount logic — it does not know or care whether the rule is a percentage,
// a coupon, or nothing. That separation is the whole point of the pattern: the
// algorithm is chosen from outside and can be swapped at runtime.
public class Checkout {

  // The subtotal before any discount, in cents, accumulated as items are added.
  private int subtotalCents = 0;

  // The currently selected algorithm. It is swappable via setStrategy, so the
  // same checkout can be repriced under a different rule without rebuilding it.
  private DiscountStrategy strategy;

  // A checkout always starts with a real strategy (NoDiscount), so total() never
  // has to guard against a missing one.
  public Checkout() {
    this.strategy = new NoDiscount();
  }

  // Add an item's price to the subtotal.
  public void addItem(int priceCents) {
    subtotalCents += priceCents;
  }

  // Swap the pricing algorithm at runtime — the defining move of the Strategy
  // pattern. The next call to total() uses the new rule.
  public void setStrategy(DiscountStrategy strategy) {
    this.strategy = strategy;
  }

  // Compute what is due by delegating to whatever strategy is currently set.
  public int total() {
    return strategy.applyCents(subtotalCents);
  }
}
