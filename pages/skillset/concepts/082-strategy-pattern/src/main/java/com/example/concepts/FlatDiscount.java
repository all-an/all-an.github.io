package com.example.concepts;

// A concrete strategy that subtracts a fixed amount (e.g. a $5 coupon). It shows
// that interchangeable strategies need not share any logic — only the interface.
public class FlatDiscount implements DiscountStrategy {

  // The amount to take off, in cents.
  private final int amountOffCents;

  public FlatDiscount(int amountOffCents) {
    this.amountOffCents = amountOffCents;
  }

  // Subtract the coupon, but never let the total go below zero — a coupon bigger
  // than the cart makes it free, not negative.
  @Override
  public int applyCents(int subtotalCents) {
    return Math.max(0, subtotalCents - amountOffCents);
  }
}
