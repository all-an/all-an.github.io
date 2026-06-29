package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.IOException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

// Verifies the non-blocking server: one thread echoes a client's message, serves
// many clients through the same select loop, and keeps running after a client
// disconnects. Each test runs the loop on a background thread and stops it after.
class NonBlockingEchoServerTest {

  private NonBlockingEchoServer server;
  private Thread serverThread;

  // Start a fresh server loop on its own thread before each test.
  @BeforeEach
  void startServer() throws IOException {
    server = new NonBlockingEchoServer();
    serverThread = new Thread(server);
    serverThread.start();
  }

  // Stop the loop and wait for it to release its resources after each test.
  @AfterEach
  void stopServer() throws InterruptedException {
    server.stop();
    serverThread.join();
  }

  // The basic round trip: a client's bytes come back unchanged.
  @Test
  void echoesAClientsMessage() throws IOException {
    assertEquals("hello", EchoClient.roundTrip(server.port(), "hello"));
  }

  // The defining property of non-blocking I/O: a single thread multiplexes
  // every connection, so several clients are all served without a thread each.
  @Test
  void servesManyClientsOnTheSameThread() throws IOException {
    assertEquals("one", EchoClient.roundTrip(server.port(), "one"));
    assertEquals("two", EchoClient.roundTrip(server.port(), "two"));
    assertEquals("three", EchoClient.roundTrip(server.port(), "three"));
  }

  // After a client closes, the loop cancels that key and carries on serving —
  // each round trip above already opened and closed its own connection.
  @Test
  void keepsServingAfterAClientDisconnects() throws IOException {
    EchoClient.roundTrip(server.port(), "first");   // connects and disconnects

    assertEquals("second", EchoClient.roundTrip(server.port(), "second"));
  }
}
