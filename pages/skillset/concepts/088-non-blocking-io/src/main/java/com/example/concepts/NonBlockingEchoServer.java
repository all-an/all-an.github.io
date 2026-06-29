package com.example.concepts;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;

// A single-threaded echo server built on non-blocking I/O — the Reactor pattern.
// With blocking I/O each connection needs its own thread parked in a blocking
// read(); here ONE thread serves every client. The trick is a Selector: instead
// of waiting on a single channel, the thread asks the OS "which of these channels
// is READY right now?" (select), then services only those. No call ever blocks
// waiting for data that has not arrived, so one thread multiplexes any number of
// connections. This is what NIO/Selector, epoll, kqueue, and io_uring all enable.
public final class NonBlockingEchoServer implements Runnable, AutoCloseable {

  // Multiplexer the OS uses to report channel readiness for the whole server.
  private final Selector selector;

  // The listening socket. Bound to an OS-chosen free port so tests never clash.
  private final ServerSocketChannel serverChannel;

  // Read by the select loop, written by stop(); volatile so the change is seen.
  private volatile boolean running = true;

  // Open the selector and a non-blocking listening channel, and register it for
  // ACCEPT readiness — the loop is now wired to be told when a client knocks.
  public NonBlockingEchoServer() throws IOException {
    selector = Selector.open();
    serverChannel = ServerSocketChannel.open();
    serverChannel.bind(new InetSocketAddress("localhost", 0));   // 0 → OS picks a free port
    serverChannel.configureBlocking(false);                      // the whole point: never block
    serverChannel.register(selector, SelectionKey.OP_ACCEPT);    // wake me when a client connects
  }

  // The actual port the OS assigned, so a client knows where to connect.
  public int port() throws IOException {
    return ((InetSocketAddress) serverChannel.getLocalAddress()).getPort();
  }

  // The event loop. Each pass blocks at most 100 ms in select() waiting for ANY
  // registered channel to become ready, then services exactly the ready ones.
  @Override
  public void run() {
    try {
      while (running) {
        selector.select(100);   // wait up to 100 ms for any channel to be ready

        // selectedKeys is the set of channels the OS reports as ready this pass.
        Iterator<SelectionKey> keys = selector.selectedKeys().iterator();
        while (keys.hasNext()) {
          SelectionKey key = keys.next();
          keys.remove();   // we must clear each key; the selector will not do it for us

          if (!key.isValid()) {
            continue;
          }
          if (key.isAcceptable()) {
            acceptClient();   // the listening socket has a pending connection
          } else if (key.isReadable()) {
            echo(key);        // a client socket has bytes ready to read
          }
        }
      }
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    } finally {
      closeQuietly();   // the loop owns its resources and releases them on exit
    }
  }

  // A connection is waiting; accept it without blocking and register the new
  // client channel for READ readiness so future data wakes the same loop.
  private void acceptClient() throws IOException {
    SocketChannel client = serverChannel.accept();   // ready, so this returns immediately
    client.configureBlocking(false);                 // the client channel is non-blocking too
    client.register(selector, SelectionKey.OP_READ); // wake me when this client sends data
  }

  // A client channel has data ready; read what is available and echo it back.
  // read() returns -1 when the peer has closed, which we treat as disconnect.
  private void echo(SelectionKey key) throws IOException {
    SocketChannel client = (SocketChannel) key.channel();
    ByteBuffer buffer = ByteBuffer.allocate(256);

    int read = client.read(buffer);   // ready, so this returns now — never blocks
    if (read == -1) {
      key.cancel();    // peer closed: stop tracking this channel
      client.close();
      return;
    }

    buffer.flip();        // switch from filling to draining
    client.write(buffer); // echo the bytes straight back (small messages send in one write)
  }

  // Signal the loop to finish its current pass and exit; wakeup() unblocks a
  // thread currently parked in select() so it notices `running` turned false.
  public void stop() {
    running = false;
    selector.wakeup();
  }

  // AutoCloseable just defers to stop(); the loop does the real teardown on exit.
  @Override
  public void close() {
    stop();
  }

  // Best-effort release of the selector and listening socket; called once the
  // loop has exited, so nothing is using them and errors are not worth raising.
  private void closeQuietly() {
    try {
      serverChannel.close();
      selector.close();
    } catch (IOException ignored) {
      // closing during shutdown — nothing useful to do with a failure here
    }
  }
}
