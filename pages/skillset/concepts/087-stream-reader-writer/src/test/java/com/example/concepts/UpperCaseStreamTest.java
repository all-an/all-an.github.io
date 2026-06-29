package com.example.concepts;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import org.junit.jupiter.api.Test;

// Verifies the filter stage transforms bytes as they flow through the pipe and
// still plugs into the same StreamCopier as any other InputStream.
class UpperCaseStreamTest {

  // Routed through the filter, every byte arrives at the sink uppercased.
  @Test
  void uppercasesEachByteFlowingThrough() throws IOException {
    ByteArrayInputStream source = new ByteArrayInputStream("hello, streams".getBytes(UTF_8));
    ByteArrayOutputStream sink = new ByteArrayOutputStream();

    StreamCopier.copy(new UpperCaseStream(source), sink);

    assertEquals("HELLO, STREAMS", sink.toString(UTF_8));
  }

  // The single-byte read path the bulk read falls back to; check it directly,
  // including that end-of-stream (-1) passes through untouched.
  @Test
  void singleByteReadAlsoUppercases() throws IOException {
    UpperCaseStream stream = new UpperCaseStream(new ByteArrayInputStream("ab".getBytes(UTF_8)));

    assertEquals('A', stream.read());
    assertEquals('B', stream.read());
    assertEquals(-1, stream.read());   // end-of-stream passes straight through
  }
}
