package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;

// Verifies the defining properties of serialization / marshalling: an object graph
// round-trips back to an equal value, the wire form is a concrete byte sequence (a
// portable format), the reconstructed graph is a distinct deep copy, and only the
// declared serial state — not transient fields — travels.
class SerializationTest {

  // A sample graph: an account holding a tag collection and a nested contact.
  private static Account sampleAccount(String sessionToken) {
    return new Account(
        "AC-1001", "Ada Lovelace", 4200,
        List.of("vip", "beta"),
        new Contact("ada@example.com", "+44 20 7946 0958"),
        sessionToken);
  }

  // Fidelity: deserialize(serialize(x)) equals x — the value survives the trip
  // through a flat byte form, nested collection and object included.
  @Test
  void roundTripPreservesValue() {
    Account original = sampleAccount(null);
    Account copy = Serialization.deserialize(Serialization.serialize(original), Account.class);
    assertEquals(original, copy);
  }

  // The wire form is bytes: a non-empty array that begins with the Java
  // serialization stream magic (0xAC 0xED). This is what makes it storable/sendable.
  @Test
  void producesPortableByteStream() {
    byte[] wire = Serialization.serialize(sampleAccount(null));
    assertTrue(wire.length > 0);
    assertEquals((byte) 0xAC, wire[0]);
    assertEquals((byte) 0xED, wire[1]);
  }

  // The whole object GRAPH is flattened and rebuilt as a distinct deep copy: the
  // reconstructed account and its nested Contact are new instances, not the
  // originals, yet equal by value — proof the graph was rebuilt, not shared.
  @Test
  void reconstructsADistinctDeepCopy() {
    Account original = sampleAccount(null);
    Account copy = Serialization.deserialize(Serialization.serialize(original), Account.class);

    assertNotSame(original, copy);
    assertNotSame(original.contact(), copy.contact());
    assertEquals(original.contact(), copy.contact());
    assertEquals(List.of("vip", "beta"), copy.tags());
  }

  // Only the declared serial state travels: a transient field is skipped by
  // serialization and comes back at its default (null), even though the original
  // held a value. Marshalling captures persistent state, not per-runtime secrets.
  @Test
  void transientFieldIsNotSerialized() {
    Account original = sampleAccount("secret-session-token");
    assertEquals("secret-session-token", original.sessionToken());

    Account copy = Serialization.deserialize(Serialization.serialize(original), Account.class);
    assertNull(copy.sessionToken());
  }

  // The format is deterministic: serializing two equal graphs yields identical
  // bytes, so the wire form can be compared, hashed, or cached as a content key.
  @Test
  void equalValuesSerializeToEqualBytes() {
    byte[] first = Serialization.serialize(sampleAccount(null));
    byte[] second = Serialization.serialize(sampleAccount(null));
    assertArrayEquals(first, second);
  }
}
