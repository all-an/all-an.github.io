package com.example.concepts;

import java.io.Serializable;
import java.util.List;
import java.util.Objects;

// A domain object that can be marshalled. Because it is Serializable, every field
// that is part of its "serial state" travels when the object is serialized — here
// that includes a collection (tags) and a nested object (contact), so the whole
// graph is flattened. The sessionToken is `transient`: it is a per-runtime secret
// that must NOT be persisted, so serialization skips it and it returns as null.
// equals()/hashCode() are by value (excluding the transient token), which lets the
// tests assert that a deserialized copy equals the original.
public final class Account implements Serializable {

  // Version stamp of the serial form. If the class changes incompatibly this
  // should change so old bytes are rejected rather than silently misread.
  private static final long serialVersionUID = 1L;

  private final String id;
  private final String owner;
  private final long balanceCents;
  private final List<String> tags;      // a collection — part of the object graph
  private final Contact contact;        // a nested object — also part of the graph

  // Not serialized: a per-session secret that must never be written to the wire.
  // A transient field is omitted from the stream and comes back at its default.
  private final transient String sessionToken;

  public Account(String id, String owner, long balanceCents, List<String> tags,
                 Contact contact, String sessionToken) {
    this.id = id;
    this.owner = owner;
    this.balanceCents = balanceCents;
    this.tags = List.copyOf(tags);
    this.contact = contact;
    this.sessionToken = sessionToken;
  }

  public String id() { return id; }
  public String owner() { return owner; }
  public long balanceCents() { return balanceCents; }
  public List<String> tags() { return tags; }
  public Contact contact() { return contact; }
  public String sessionToken() { return sessionToken; }

  // Value equality over the persistent state (the transient token is excluded),
  // so a round-tripped copy is considered equal to the original object.
  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Account other)) return false;
    return balanceCents == other.balanceCents
        && Objects.equals(id, other.id)
        && Objects.equals(owner, other.owner)
        && Objects.equals(tags, other.tags)
        && Objects.equals(contact, other.contact);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, owner, balanceCents, tags, contact);
  }

  @Override
  public String toString() {
    return "Account[id=" + id + ", owner=" + owner + ", balanceCents=" + balanceCents
        + ", tags=" + tags + ", contact=" + contact + "]";
  }
}
