package com.example.concepts;

// A service that needs to notify customers but does NOT create its own notifier.
// Its MessageSender is INJECTED through the constructor — this is dependency
// injection. OrderService is therefore decoupled from any concrete sender: it
// can be handed the real EmailSender in production or a fake one in a test,
// without a single line of OrderService changing.
public class OrderService {

  // The injected dependency. It is final because, once wired, it never changes —
  // the owner that constructed OrderService chose it, not OrderService itself.
  private final MessageSender sender;

  // Constructor injection: the dependency arrives as a constructor parameter.
  // Contrast the anti-pattern `this.sender = new EmailSender();`, which would
  // hard-wire the concrete type, couple this class to email, and leave no seam
  // to substitute a fake — making the class untestable in isolation.
  public OrderService(MessageSender sender) {
    this.sender = sender;
  }

  // Place an order and notify the customer through whatever sender was injected.
  public void placeOrder(String customer, String item) {
    // ... order persistence would happen here ...
    sender.send(customer, "Your order for " + item + " is confirmed.");
  }
}
