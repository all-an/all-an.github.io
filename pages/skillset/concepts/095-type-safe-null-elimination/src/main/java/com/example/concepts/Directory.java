package com.example.concepts;

import java.util.Map;
import java.util.Optional;

// A lookup that can find nothing. The return type says so, so there is no
// convention to remember and no javadoc to miss.
public final class Directory {

  private final Map<String, User> usersByName;

  public Directory(Map<String, User> usersByName) {
    this.usersByName = Map.copyOf(usersByName);
  }

  // Map.get returns null on a miss — the boundary with null-using code.
  // ofNullable converts it once, here, so nothing downstream ever sees a null.
  public Optional<User> find(String name) {
    return Optional.ofNullable(usersByName.get(name));
  }

  // The manager's manager, if there is one — two lookups that can each come up
  // empty, composed without a single null check or nested if.
  public Optional<String> grandManagerOf(String name) {
    return find(name)
        .flatMap(User::managerName)
        .flatMap(this::find)
        .flatMap(User::managerName);
  }
}
