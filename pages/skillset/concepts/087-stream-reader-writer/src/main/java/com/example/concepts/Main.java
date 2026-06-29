package com.example.concepts;

import static java.nio.charset.StandardCharsets.UTF_8;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

// Demonstrates the stream abstraction: the SAME StreamCopier moves bytes from a
// source to a sink without caring what they concretely are, and a filter stage
// can sit in the pipe to transform bytes as they flow — exactly like a Unix
// pipeline. Here both source and sink are in-memory byte buffers, but a file or
// socket would plug into the identical copy() call.
public class Main {

  public static void main(String[] args) throws IOException {
    String text = "hello, streams";

    // Plain copy: bytes flow source → buffer → sink unchanged.
    ByteArrayInputStream source = new ByteArrayInputStream(text.getBytes(UTF_8));
    ByteArrayOutputStream sink = new ByteArrayOutputStream();
    long copied = StreamCopier.copy(source, sink);
    System.out.println("Copied " + copied + " bytes: " + sink.toString(UTF_8));

    // Filtered copy: an UpperCaseStream sits in the pipe and transforms each byte.
    ByteArrayInputStream piped = new ByteArrayInputStream(text.getBytes(UTF_8));
    ByteArrayOutputStream upper = new ByteArrayOutputStream();
    StreamCopier.copy(new UpperCaseStream(piped), upper);
    System.out.println("Through filter: " + upper.toString(UTF_8));
  }
}
