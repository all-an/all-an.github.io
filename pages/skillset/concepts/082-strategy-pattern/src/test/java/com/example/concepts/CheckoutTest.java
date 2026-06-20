package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

// Verifies the defining behavior of the Strategy pattern: each algorithm computes
// its own result, and the SAME checkout can be repriced by swapping strategies at
// runtime — including with a lambda strategy.
class CheckoutTest {

  // A small helper: a checkout with a fixed $20.00 subtotal for every test.
  private Checkout cartOfTwenty() {
    Checkout checkout = new Checkout();
    checkout.addItem(1200);
    checkout.addItem(800);   // subtotal = 2000 cents
    return checkout;
  }

  // The default strategy charges the full subtotal.
  @Test
  void defaultStrategyAppliesNoDiscount() {
    assertEquals(2000, cartOfTwenty().total());
  }

  // The percentage strategy keeps (100 - percent)% of the subtotal.
  @Test
  void percentageStrategyTakesAPercentOff() {
    Checkout checkout = cartOfTwenty();
    checkout.setStrategy(new PercentageDiscount(10));

    assertEquals(1800, checkout.total());   // 2000 - 10%
  }

  // The flat strategy subtracts a fixed coupon, floored at zero.
  @Test
  void flatStrategySubtractsACouponAndNeverGoesNegative() {
    Checkout checkout = cartOfTwenty();

    checkout.setStrategy(new FlatDiscount(500));
    assertEquals(1500, checkout.total());   // 2000 - 500

    checkout.setStrategy(new FlatDiscount(99999));
    assertEquals(0, checkout.total());      // floored at 0, not negative
  }

  // The defining move: swapping the strategy reprices the SAME checkout, with no
  // change to the checkout itself.
  @Test
  void swappingStrategyRepricesTheSameCheckout() {
    Checkout checkout = cartOfTwenty();

    checkout.setStrategy(new NoDiscount());
    assertEquals(2000, checkout.total());

    checkout.setStrategy(new PercentageDiscount(25));
    assertEquals(1500, checkout.total());   // same cart, new rule
  }

  // A strategy can be a lambda, since DiscountStrategy is a functional interface.
  @Test
  void aLambdaIsAValidStrategy() {
    Checkout checkout = cartOfTwenty();
    checkout.setStrategy(subtotal -> 0);    // everything free

    assertEquals(0, checkout.total());
  }
}
