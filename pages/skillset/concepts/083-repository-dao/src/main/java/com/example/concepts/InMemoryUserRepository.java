package com.example.concepts;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// One concrete implementation of the repository, backed by an in-memory map.
// It is interchangeable with any other UserRepository — a JDBC version, an HTTP
// version — because callers depend on the interface, not on this class. This
// implementation is also what makes tests fast: no database needed to exercise
// the business logic that uses a UserRepository.
public class InMemoryUserRepository implements UserRepository {

  // The "table": user id -> user. LinkedHashMap preserves insertion order so
  // findAll() returns users in a predictable order, which keeps demos and tests
  // deterministic.
  private final Map<String, User> usersById = new LinkedHashMap<>();

  // Store the user under its id, replacing any existing user with that id. This
  // single method covers both insert and update, mirroring a collection's put.
  @Override
  public User save(User user) {
    usersById.put(user.id(), user);
    return user;
  }

  // Return the user for this id, or an empty Optional if none is stored.
  @Override
  public Optional<User> findById(String id) {
    return Optional.ofNullable(usersById.get(id));
  }

  // Return a copy of all stored users. Copying into a new list means callers
  // cannot mutate the repository's internal storage by editing the result.
  @Override
  public List<User> findAll() {
    return new ArrayList<>(usersById.values());
  }

  // Remove the user with this id. Map.remove returns the previous value (or
  // null), so a non-null result means a user was actually there to delete.
  @Override
  public boolean deleteById(String id) {
    return usersById.remove(id) != null;
  }
}
