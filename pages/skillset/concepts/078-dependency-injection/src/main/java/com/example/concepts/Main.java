package com.example.concepts;

// The composition root: the single place where concrete dependencies are
// created and wired together. Building the object graph lives HERE, at the
// application's entry point, rather than being scattered inside the business
// classes. A DI framework (Spring, Dagger, Guice) automates exactly this step;
// done by hand it is just a few `new` calls.
public class Main {

  public static void main(String[] args) {
    // Choose the concrete implementation once, at the edge of the system...
    MessageSender sender = new EmailSender();

    // ...and inject it into the service that depends on it.
    OrderService orders = new OrderService(sender);

    // OrderService runs against the MessageSender abstraction; the wiring above
    // is what decided the real behavior.
    orders.placeOrder("ada@example.com", "Analytical Engine");
  }
}
