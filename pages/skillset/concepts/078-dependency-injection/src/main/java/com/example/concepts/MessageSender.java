package com.example.concepts;

// The dependency abstraction — a "seam". OrderService depends on THIS interface,
// never on a concrete sender. That indirection is what lets the owner inject any
// implementation (real email in production, a fake in tests) from the outside,
// which is the whole point of dependency injection.
public interface MessageSender {

  // Send a message to a recipient. How it is delivered is the implementation's
  // concern, not the caller's — OrderService only knows this method exists.
  void send(String recipient, String message);
}
