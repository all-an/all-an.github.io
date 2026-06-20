package com.example.concepts;

// The strategy: one interchangeable algorithm in a family of them. Every pricing
// rule — no discount, a percentage off, a flat coupon — is just a different
// implementation of this single method. The checkout depends only on this
// interface, so any rule can be slotted in without the checkout changing. That
// is the Strategy pattern: behavior selected and swapped from the outside.
//
// @FunctionalInterface (exactly one abstract method) means a strategy can also
// be written as a plain lambda, not only as a named class.
@FunctionalInterface
public interface DiscountStrategy {

  // Given a subtotal in cents, return the amount actually due in cents. Each
  // strategy encapsulates its own rule for turning one into the other.
  int applyCents(int subtotalCents);
}
