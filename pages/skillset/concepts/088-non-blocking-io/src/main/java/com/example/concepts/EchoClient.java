package com.example.concepts;

import static java.nio.charset.StandardCharsets.UTF_8;

import java.io.IOException;
import java.net.Socket;

// An ordinary BLOCKING client, deliberately so: the non-blocking part is the
// server's job, not the caller's. It connects, sends a message, and blocks until
// the echo comes back. The contrast is the point — many simple blocking clients
// are multiplexed by one non-blocking server thread.
public final class EchoClient {

  private EchoClient() {}   // utility class — not meant to be instantiated

  // Connect to the echo server, send `message`, and return the echoed reply.
  public static String roundTrip(int port, String message) throws IOException {
    try (Socket socket = new Socket("localhost", port)) {
      socket.setSoTimeout(2000);   // fail with a timeout rather than hang forever if no echo

      socket.getOutputStream().write(message.getBytes(UTF_8));

      // Read the echo. Small messages arrive in a single read over loopback.
      byte[] buffer = new byte[256];
      int read = socket.getInputStream().read(buffer);   // blocks until bytes arrive
      return new String(buffer, 0, read, UTF_8);
    }
  }
}
