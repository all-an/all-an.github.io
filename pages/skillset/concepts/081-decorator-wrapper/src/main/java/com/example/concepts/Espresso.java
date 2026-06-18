package com.example.concepts;

// The concrete base component — a plain coffee with no add-ons. This is what sits
// at the center of the wrapping onion; decorators add behavior around it without
// it ever knowing it has been wrapped.
public class Espresso implements Coffee {

  // The base price before any add-ons, in cents.
  @Override
  public int costCents() {
    return 200;
  }

  @Override
  public String description() {
    return "Espresso";
  }
}
