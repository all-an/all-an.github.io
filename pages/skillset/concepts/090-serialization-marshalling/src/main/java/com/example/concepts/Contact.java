package com.example.concepts;

import java.io.Serializable;
import java.util.Objects;

// A small nested object, also Serializable, used to show that serialization
// flattens a whole object GRAPH — not just one object — into the byte stream and
// rebuilds it. Value equality lets the tests compare a round-tripped copy.
public final class Contact implements Serializable {

  // Version stamp of the serial form; change it if the class changes incompatibly.
  private static final long serialVersionUID = 1L;

  private final String email;
  private final String phone;

  public Contact(String email, String phone) {
    this.email = email;
    this.phone = phone;
  }

  public String email() { return email; }
  public String phone() { return phone; }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Contact other)) return false;
    return Objects.equals(email, other.email) && Objects.equals(phone, other.phone);
  }

  @Override
  public int hashCode() {
    return Objects.hash(email, phone);
  }

  @Override
  public String toString() {
    return "Contact[email=" + email + ", phone=" + phone + "]";
  }
}
