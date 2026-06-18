package com.example.concepts;

// A concrete decorator that adds milk. It takes the wrapped coffee's result and
// adds its own cost and a label on top — never replacing what is underneath.
public class Milk extends CoffeeDecorator {

  public Milk(Coffee inner) {
    super(inner);
  }

  // The inner cost PLUS milk's surcharge.
  @Override
  public int costCents() {
    return inner.costCents() + 50;
  }

  // The inner description WITH "+ Milk" appended, so stacked add-ons read in
  // wrapping order.
  @Override
  public String description() {
    return inner.description() + " + Milk";
  }
}
