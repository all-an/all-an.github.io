package com.example.concepts;

import java.util.List;

// Demonstrates serialization / marshalling: an in-memory object graph is flattened
// to a byte array and a fresh, equal object graph is reconstructed from it. The
// bytes are a portable wire format; object identity and transient state do not
// survive the trip.
public class Main {

  public static void main(String[] args) {
    Account original = new Account(
        "AC-1001", "Ada Lovelace", 42_00,
        List.of("vip", "beta"),
        new Contact("ada@example.com", "+44 20 7946 0958"),
        "secret-session-token");   // transient — will not be serialized

    // Marshal the whole graph (Account + its tag list + nested Contact) to bytes.
    byte[] wire = Serialization.serialize(original);
    System.out.println("Serialized size: " + wire.length + " bytes");
    System.out.printf("Stream header: 0x%02X 0x%02X%n", wire[0], wire[1]);   // AC ED

    // Unmarshal back into a brand-new object graph.
    Account copy = Serialization.deserialize(wire, Account.class);
    System.out.println("Deserialized: " + copy);

    // The copy equals the original by value, but is a different instance...
    System.out.println("Equal by value: " + original.equals(copy));
    System.out.println("Same instance: " + (original == copy));

    // ...and the transient session token was not part of the wire form.
    System.out.println("Token after round-trip: " + copy.sessionToken());
  }
}
