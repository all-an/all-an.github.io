package com.example.concepts;

// A concrete strategy that takes a fixed percentage off the subtotal. The
// percentage is captured in the constructor, so "10% off" and "25% off" are two
// instances of the same class — strategies can carry their own configuration.
public class PercentageDiscount implements DiscountStrategy {

  // How much to take off, as a whole-number percent (e.g. 10 means 10%).
  private final int percentOff;

  public PercentageDiscount(int percentOff) {
    this.percentOff = percentOff;
  }

  // Keep (100 - percentOff)% of the subtotal. Integer math in cents avoids the
  // rounding error of floating-point money; it truncates fractional cents.
  @Override
  public int applyCents(int subtotalCents) {
    return subtotalCents * (100 - percentOff) / 100;
  }
}
