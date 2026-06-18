package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

// Shows the payoff of dependency injection: testability. Because OrderService
// accepts its MessageSender from outside, the test injects a fake that records
// calls instead of sending real email — then asserts on what was sent. Without
// DI, OrderService would build its own EmailSender and there would be no seam to
// substitute, so this test could not exist without hitting a real mail server.
class OrderServiceTest {

  // A test double (a "fake"/"spy") implementing the same interface. It delivers
  // nothing; it just records every message so the test can inspect it afterward.
  static class RecordingSender implements MessageSender {

    // Every message this fake was asked to send, captured for assertions.
    final List<String> sent = new ArrayList<>();

    @Override
    public void send(String recipient, String message) {
      sent.add(recipient + " | " + message);
    }
  }

  // Inject the fake, exercise the service, verify the recorded message. No
  // network and no real email — dependency injection made the dependency
  // swappable, and that swap is the entire reason the test is possible.
  @Test
  void placingAnOrderNotifiesTheCustomer() {
    RecordingSender fake = new RecordingSender();
    OrderService orders = new OrderService(fake);   // inject the fake, not email

    orders.placeOrder("ada@example.com", "Analytical Engine");

    assertEquals(1, fake.sent.size());
    assertEquals(
        "ada@example.com | Your order for Analytical Engine is confirmed.",
        fake.sent.get(0));
  }
}
