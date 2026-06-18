package com.example.concepts;

// The production implementation of MessageSender. In a real system this would
// talk to an SMTP server; here it just prints, so the project stays runnable
// with no network. OrderService neither knows nor cares that this is the
// concrete type behind the MessageSender it was given.
public class EmailSender implements MessageSender {

  // Deliver the message. Standing in for a real email send so the demo runs
  // anywhere.
  @Override
  public void send(String recipient, String message) {
    System.out.println("EMAIL to " + recipient + ": " + message);
  }
}
