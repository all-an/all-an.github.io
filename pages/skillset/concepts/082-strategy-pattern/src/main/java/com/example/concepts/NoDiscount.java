package com.example.concepts;

// The simplest concrete strategy: charge the full subtotal, no discount. Having
// a real "do nothing" strategy means the checkout never needs a null check or a
// special case — it always has a strategy to delegate to.
public class NoDiscount implements DiscountStrategy {

  // The subtotal is the total — nothing is taken off.
  @Override
  public int applyCents(int subtotalCents) {
    return subtotalCents;
  }
}
