package com.example.concepts;

import org.junit.jupiter.api.Test;

// Exercises the real composition root in Main, which wires the genuine
// EmailSender into OrderService exactly as production would. The same
// OrderService class works unchanged with the real dependency — proof that DI
// did not weaken it, it only moved the choice of dependency outward. Watch
// stdout during `mvn test` for the EMAIL line this prints.
class CompositionRootTest {

  // Calls Main.main, building the real object graph and placing an order. It
  // passes by simply not throwing, demonstrating that the wired-up graph runs.
  @Test
  void mainWiresAndRunsTheRealGraph() {
    Main.main(new String[] {});   // builds EmailSender, injects it, places order
  }
}
