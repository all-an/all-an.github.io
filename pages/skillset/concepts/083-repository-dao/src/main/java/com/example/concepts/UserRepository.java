package com.example.concepts;

import java.util.List;
import java.util.Optional;

// The repository: a collection-like interface for accessing domain objects. It
// names WHAT the application can do with stored users — save, find, list, delete
// — while saying nothing about HOW or WHERE they are stored. Callers depend only
// on this interface, so an in-memory map today can become a SQL database or a
// REST client tomorrow with no change to the code that uses it. That decoupling
// of business logic from the persistence mechanism is the whole point of the
// Repository / DAO pattern.
public interface UserRepository {

  // Insert a new user or update an existing one (matched by id), and return the
  // stored user. Modelled on a collection's "put": the caller does not know or
  // care whether this becomes an INSERT or an UPDATE.
  User save(User user);

  // Look a user up by id. Returns an Optional rather than null so "not found" is
  // an explicit, type-checked outcome the caller must handle.
  Optional<User> findById(String id);

  // Return every stored user. The repository hides whether this is a full table
  // scan, a cached list, or a network call.
  List<User> findAll();

  // Remove the user with this id. Returns true if one was actually removed, so
  // the caller can tell a real delete from a no-op.
  boolean deleteById(String id);
}
