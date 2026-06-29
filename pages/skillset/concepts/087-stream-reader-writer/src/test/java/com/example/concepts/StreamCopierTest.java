package com.example.concepts;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import org.junit.jupiter.api.Test;

// Verifies the core stream behaviour: every byte reaches the sink, the count is
// right, an empty source copies nothing, and a payload larger than the internal
// buffer still copies correctly — proving the chunked read/write loop.
class StreamCopierTest {

  // The common case: all bytes arrive at the sink and the count matches.
  @Test
  void copiesEveryByteAndReportsTheCount() throws IOException {
    byte[] data = "hello, streams".getBytes(UTF_8);
    ByteArrayOutputStream sink = new ByteArrayOutputStream();

    long copied = StreamCopier.copy(new ByteArrayInputStream(data), sink);

    assertEquals(data.length, copied);
    assertArrayEquals(data, sink.toByteArray());
  }

  // A drained source (read() returns -1 immediately) copies nothing at all.
  @Test
  void emptySourceCopiesNothing() throws IOException {
    ByteArrayOutputStream sink = new ByteArrayOutputStream();

    long copied = StreamCopier.copy(new ByteArrayInputStream(new byte[0]), sink);

    assertEquals(0, copied);
    assertEquals(0, sink.size());
  }

  // A payload larger than the 8 KiB buffer forces the loop to run many times,
  // proving bytes are streamed in chunks rather than read all at once.
  @Test
  void payloadLargerThanBufferCopiesCorrectly() throws IOException {
    byte[] data = new byte[100_000];   // ~12× the internal 8 KiB buffer
    for (int i = 0; i < data.length; i++) {
      data[i] = (byte) (i % 256);
    }
    ByteArrayOutputStream sink = new ByteArrayOutputStream();

    long copied = StreamCopier.copy(new ByteArrayInputStream(data), sink);

    assertEquals(data.length, copied);
    assertArrayEquals(data, sink.toByteArray());
  }
}
