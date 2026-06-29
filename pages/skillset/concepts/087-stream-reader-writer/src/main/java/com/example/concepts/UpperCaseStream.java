package com.example.concepts;

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;

// A processing STAGE that sits in the middle of a stream pipe. It wraps another
// InputStream and transforms each byte as it flows through — here, lowercase
// ASCII letters become uppercase. Because it IS an InputStream, it plugs into
// StreamCopier (or anything taking an InputStream) with no special handling:
// streams compose like a Unix pipeline, `cat file | tr a-z A-Z | ...`.
public final class UpperCaseStream extends FilterInputStream {

  // Wrap the upstream source we pull bytes from before transforming them.
  public UpperCaseStream(InputStream source) {
    super(source);
  }

  // Read one byte from upstream and uppercase it on the way out. End-of-stream
  // (-1) passes straight through unchanged so the copy loop knows when to stop.
  @Override
  public int read() throws IOException {
    int b = in.read();
    return b == -1 ? -1 : Character.toUpperCase(b);
  }

  // The bulk read StreamCopier actually calls. Fill the caller's buffer from
  // upstream, then uppercase the bytes that arrived. FilterInputStream's default
  // bulk read bypasses our single-byte read(), so we must override it too.
  @Override
  public int read(byte[] buffer, int offset, int length) throws IOException {
    int read = in.read(buffer, offset, length);
    for (int i = offset; i < offset + read; i++) {
      buffer[i] = (byte) Character.toUpperCase(buffer[i]);   // transform each delivered byte
    }
    return read;   // -1 when drained makes the for-loop a no-op and stops the copy
  }
}
