package com.example.concepts;

// Demonstrates non-blocking I/O: a single server thread, started once, serves
// several clients in turn through one Selector loop — no thread per connection.
// Each client is an ordinary blocking socket; the multiplexing all happens on
// the server side.
public class Main {

  public static void main(String[] args) throws Exception {
    NonBlockingEchoServer server = new NonBlockingEchoServer();
    Thread serverThread = new Thread(server);
    serverThread.start();

    // Two clients, one server thread — both handled by the same select loop.
    System.out.println("Client A got: " + EchoClient.roundTrip(server.port(), "hello"));
    System.out.println("Client B got: " + EchoClient.roundTrip(server.port(), "non-blocking"));

    // Ask the loop to finish and wait for the thread to release its resources.
    server.stop();
    serverThread.join();
  }
}
