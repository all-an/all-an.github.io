package com.example.concepts;

// Demonstrates the Strategy pattern: one checkout, the same items, repriced under
// several interchangeable discount strategies just by swapping the strategy.
// The last one is a lambda, showing a strategy need not be a named class.
public class Main {

  public static void main(String[] args) {
    Checkout checkout = new Checkout();
    checkout.addItem(1200);   // $12.00
    checkout.addItem(800);    //  $8.00  -> subtotal $20.00

    // Default strategy set in the constructor: no discount.
    System.out.println("No discount:  " + checkout.total() + " cents");

    // Swap in a percentage discount — the checkout is unchanged.
    checkout.setStrategy(new PercentageDiscount(10));
    System.out.println("10% off:      " + checkout.total() + " cents");

    // Swap again to a flat coupon.
    checkout.setStrategy(new FlatDiscount(500));
    System.out.println("$5 coupon:    " + checkout.total() + " cents");

    // A strategy can be a lambda, because DiscountStrategy is a functional
    // interface — here, "everything is free" for a launch promo.
    checkout.setStrategy(subtotal -> 0);
    System.out.println("Launch promo: " + checkout.total() + " cents");
  }
}
