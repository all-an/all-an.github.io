package com.example.concepts;

import java.util.stream.Collectors;

// Demonstrates the Repository / DAO pattern: all the code below talks only to the
// UserRepository INTERFACE. The concrete InMemoryUserRepository is named exactly
// once, on the line that creates it; swap that single line for a database-backed
// implementation and nothing else here changes.
public class Main {

  public static void main(String[] args) {
    // The only mention of the concrete class. Everything after this is written
    // against the UserRepository abstraction.
    UserRepository users = new InMemoryUserRepository();

    // save() inserts new users — the caller never sees an INSERT.
    users.save(new User("ada-1", "Alice", "alice@example.com"));
    users.save(new User("bob-2", "Bob", "bob@example.com"));
    System.out.println("Saved " + users.findAll().size() + " users.");

    // findAll() lists them in insertion order.
    System.out.println("All users: " + format(users));

    // findById() returns an Optional; here we know it is present.
    User found = users.findById("ada-1").orElseThrow();
    System.out.println("Find ada-1: " + describe(found));

    // save() with an existing id is an UPDATE — same call, different effect.
    users.save(new User("ada-1", "Alice", "alice@corp.com"));
    System.out.println("After update: " + describe(users.findById("ada-1").orElseThrow()));

    // deleteById() reports whether a user was actually removed.
    System.out.println("Deleted bob-2: " + users.deleteById("bob-2"));

    // The deleted user is now absent — Optional makes "not found" explicit.
    System.out.println("Find bob-2 after delete: "
        + users.findById("bob-2").map(Main::describe).orElse("not found"));
  }

  // Render one user as "Name <email>".
  private static String describe(User user) {
    return user.name() + " <" + user.email() + ">";
  }

  // Render every stored user as a comma-separated line, for the demo output.
  private static String format(UserRepository users) {
    return users.findAll().stream()
        .map(Main::describe)
        .collect(Collectors.joining(", "));
  }
}
