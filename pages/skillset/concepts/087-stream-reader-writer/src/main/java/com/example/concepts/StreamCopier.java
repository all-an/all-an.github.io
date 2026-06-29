package com.example.concepts;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

// The heart of the stream abstraction: move bytes from a SOURCE you pull from
// (InputStream) to a SINK you push to (OutputStream) a CHUNK AT A TIME, so the
// whole payload never has to live in memory at once. Neither side knows what the
// other concretely is — a file, a socket, an in-memory buffer — they meet only
// at the InputStream / OutputStream abstraction. That is why the same copy works
// for a 14-byte string or a 14-gigabyte file.
public final class StreamCopier {

  private StreamCopier() {}   // utility class — not meant to be instantiated

  // Bytes move through a fixed-size window, not all at once. 8 KiB is the
  // conventional default (a few memory pages) — large enough to amortise the
  // per-read overhead, small enough to bound memory regardless of payload size.
  private static final int BUFFER_SIZE = 8 * 1024;   // 8 KiB

  // Pump every byte from source to sink and return how many were moved. The loop
  // reads a chunk, writes exactly the chunk that was read, and repeats until the
  // source signals end-of-stream by returning -1. Memory stays bounded by the
  // buffer no matter how large the stream is.
  public static long copy(InputStream source, OutputStream sink) throws IOException {
    byte[] buffer = new byte[BUFFER_SIZE];
    long total = 0;

    // read() returns the number of bytes read, or -1 once the source is drained.
    int read;
    while ((read = source.read(buffer)) != -1) {
      sink.write(buffer, 0, read);   // write only the bytes actually read, not the whole buffer
      total += read;
    }
    return total;
  }
}
