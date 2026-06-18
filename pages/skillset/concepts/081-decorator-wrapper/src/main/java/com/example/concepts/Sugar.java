package com.example.concepts;

// A concrete decorator that adds sugar. Like Milk, it adds its own cost and label
// to whatever it wraps — and because it wraps a Coffee, it can sit on top of Milk
// (or any other decorator) just as easily as on the base Espresso.
public class Sugar extends CoffeeDecorator {

  public Sugar(Coffee inner) {
    super(inner);
  }

  @Override
  public int costCents() {
    return inner.costCents() + 25;
  }

  @Override
  public String description() {
    return inner.description() + " + Sugar";
  }
}
