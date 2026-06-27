package com.example.concepts;

// An ordinary domain object whose fields are DECORATED WITH ANNOTATIONS. The
// annotations declare the rules ("name must not be blank", "age at least 18")
// without writing any checking code here — the object states what should be
// true and leaves enforcement to whatever processor reads the metadata.
public class User {

  // @NotBlank declares the rule; it does not enforce it. The Validator does.
  @NotBlank(message = "name is required")
  private final String name;

  // @Min(18) configures the rule with a parameter read straight off the metadata.
  @Min(18)
  private final int age;

  public User(String name, int age) {
    this.name = name;
    this.age = age;
  }
}
