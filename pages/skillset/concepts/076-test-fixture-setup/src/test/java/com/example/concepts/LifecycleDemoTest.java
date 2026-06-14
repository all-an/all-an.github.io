package com.example.concepts;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

// Makes the fixture lifecycle visible. JUnit calls these four hooks in a fixed
// order; the printout proves @BeforeEach really runs before EACH test (not just
// once), which is what gives every test its own fresh fixture.
class LifecycleDemoTest {

  // @BeforeAll runs ONCE for the whole class, before any test. It must be
  // static because no test instance exists yet when it runs.
  @BeforeAll
  static void beforeAll() {
    System.out.println("@BeforeAll   — once, before all tests");
  }

  // @BeforeEach runs before EVERY test method — this is the per-test fixture
  // setup. Notice it prints once per test below, not once total.
  @BeforeEach
  void beforeEach() {
    System.out.println("  @BeforeEach  — fresh fixture for the next test");
  }

  // @AfterEach runs after EVERY test method — fixture teardown / cleanup, the
  // mirror image of @BeforeEach.
  @AfterEach
  void afterEach() {
    System.out.println("  @AfterEach   — tear the fixture down");
  }

  // @AfterAll runs ONCE after all tests. Static, for the same reason as above.
  @AfterAll
  static void afterAll() {
    System.out.println("@AfterAll    — once, after all tests");
  }

  @Test
  void firstTest() {
    System.out.println("    >>> firstTest body");
  }

  @Test
  void secondTest() {
    System.out.println("    >>> secondTest body");
  }
}
