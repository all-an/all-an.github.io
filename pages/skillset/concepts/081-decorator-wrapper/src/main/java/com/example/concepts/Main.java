package com.example.concepts;

// Demonstrates the Decorator pattern: start with a plain Espresso, then wrap it
// in layers. Each `new Decorator(...)` adds behavior around the object inside it,
// and because every layer is itself a Coffee, the layers stack freely.
public class Main {

  public static void main(String[] args) {
    // The bare base component.
    Coffee plain = new Espresso();
    print(plain);

    // One layer: milk wraps the espresso.
    Coffee withMilk = new Milk(new Espresso());
    print(withMilk);

    // Several layers: sugar wraps milk wraps espresso. Read the constructors
    // from the inside out to see the wrapping order.
    Coffee deluxe = new Sugar(new Milk(new Espresso()));
    print(deluxe);

    // The same add-ons in a different order — decorators are composable, so the
    // total is identical even though the description reads differently.
    Coffee deluxeAlt = new Milk(new Sugar(new Espresso()));
    print(deluxeAlt);
  }

  // Print a coffee's composed description and cost.
  private static void print(Coffee coffee) {
    System.out.println(coffee.description() + " = " + coffee.costCents() + " cents");
  }
}
