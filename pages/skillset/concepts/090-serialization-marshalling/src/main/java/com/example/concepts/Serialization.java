package com.example.concepts;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.io.UncheckedIOException;

// Serialization (a.k.a. marshalling) turns an in-memory object graph into a flat
// sequence of bytes that can be written to disk or sent over a network, and then
// reconstructs an equal object graph from those bytes. Java's built-in mechanism
// walks every reachable Serializable field, writing a self-describing binary
// stream; deserialization reads that stream back and rebuilds the graph. Only the
// declared serial state travels: object identity and `transient` fields are not
// part of the wire form, so the result is a distinct, deep copy of the original.
public final class Serialization {

  private Serialization() {}   // static utility; not meant to be instantiated

  // Marshal an object graph to bytes. ObjectOutputStream first writes a stream
  // header (the two magic bytes 0xAC 0xED), then a description of each class and
  // its field values, recursively, for the whole reachable graph.
  public static byte[] serialize(Serializable object) {
    ByteArrayOutputStream bytes = new ByteArrayOutputStream();
    try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
      out.writeObject(object);
    } catch (IOException e) {
      // Writing to an in-memory buffer cannot fail with a real I/O error; if it
      // somehow does, surface it unchecked rather than force callers to catch it.
      throw new UncheckedIOException("serialization failed", e);
    }
    return bytes.toByteArray();
  }

  // Unmarshal bytes back into an object, reconstructing the whole graph. The
  // caller passes the expected type so the result is returned already cast.
  public static <T> T deserialize(byte[] data, Class<T> type) {
    ByteArrayInputStream bytes = new ByteArrayInputStream(data);
    try (ObjectInputStream in = new ObjectInputStream(bytes)) {
      return type.cast(in.readObject());
    } catch (IOException | ClassNotFoundException e) {
      // Bad bytes, or a class that is missing/changed since the bytes were
      // written — the input cannot be turned back into the requested object.
      throw new IllegalArgumentException("deserialization failed", e);
    }
  }
}
