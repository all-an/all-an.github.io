package com.example.concepts;

import java.util.List;

// Demonstrates annotations as declarative metadata: the same Validator reads the
// @NotBlank and @Min annotations off any object and enforces them. A valid User
// produces no messages; an invalid one produces one message per broken rule —
// without the User or the Validator hard-coding the other's details.
public class Main {

  public static void main(String[] args) {
    // A well-formed user satisfies every rule the annotations declare.
    User valid = new User("Ada", 36);
    System.out.println("Valid user violations: " + Validator.validate(valid));

    // A blank name and an under-age value each violate their field's annotation.
    User invalid = new User("  ", 16);
    List<String> violations = Validator.validate(invalid);
    System.out.println("Invalid user violations: " + violations);
  }
}
