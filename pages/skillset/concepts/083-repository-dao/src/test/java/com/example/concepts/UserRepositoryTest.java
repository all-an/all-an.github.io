package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

// Verifies the repository contract. Note the field type is the UserRepository
// INTERFACE, not the concrete class: every test is written against the
// abstraction, so the exact same tests would pass against a database-backed
// implementation.
class UserRepositoryTest {

  private UserRepository users;

  // A fresh, empty repository before each test, so tests never leak state.
  @BeforeEach
  void setUp() {
    users = new InMemoryUserRepository();
  }

  // save() then findById() returns the same user back.
  @Test
  void savesAndFindsAUserById() {
    users.save(new User("ada-1", "Alice", "alice@example.com"));

    User found = users.findById("ada-1").orElseThrow();
    assertEquals("Alice", found.name());
    assertEquals("alice@example.com", found.email());
  }

  // findById() for an unknown id is an empty Optional, not null and not an error.
  @Test
  void findByIdIsEmptyWhenAbsent() {
    assertTrue(users.findById("nobody").isEmpty());
  }

  // save() with an existing id updates in place rather than adding a duplicate.
  @Test
  void saveWithExistingIdUpdatesInPlace() {
    users.save(new User("ada-1", "Alice", "alice@example.com"));
    users.save(new User("ada-1", "Alice", "alice@corp.com"));   // same id

    assertEquals(1, users.findAll().size());                    // not duplicated
    assertEquals("alice@corp.com", users.findById("ada-1").orElseThrow().email());
  }

  // findAll() returns every stored user, in insertion order.
  @Test
  void findAllReturnsEveryUserInInsertionOrder() {
    users.save(new User("ada-1", "Alice", "alice@example.com"));
    users.save(new User("bob-2", "Bob", "bob@example.com"));

    List<User> all = users.findAll();
    assertEquals(2, all.size());
    assertEquals("Alice", all.get(0).name());
    assertEquals("Bob", all.get(1).name());
  }

  // deleteById() removes the user and reports true; a second delete reports false.
  @Test
  void deleteByIdRemovesAndReportsWhetherItDid() {
    users.save(new User("bob-2", "Bob", "bob@example.com"));

    assertTrue(users.deleteById("bob-2"));   // actually removed
    assertTrue(users.findById("bob-2").isEmpty());
    assertFalse(users.deleteById("bob-2"));  // nothing left to remove
  }

  // Mutating the list returned by findAll() must not affect the repository — the
  // repository owns its storage and hands back a copy.
  @Test
  void findAllReturnsACopyThatCannotMutateTheRepository() {
    users.save(new User("ada-1", "Alice", "alice@example.com"));

    users.findAll().clear();                 // tamper with the returned list

    assertEquals(1, users.findAll().size()); // repository is unaffected
  }
}
