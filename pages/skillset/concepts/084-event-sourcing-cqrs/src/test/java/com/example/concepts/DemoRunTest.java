package com.example.concepts;

import org.junit.jupiter.api.Test;

// Runs the Main demo so its console output appears during `mvn test`, showing
// commands turned into events and a projection queried from the same log.
class DemoRunTest {

  // Passes by simply not throwing — it exists to exercise and surface the demo.
  @Test
  void demoRunsWithoutError() {
    Main.main(new String[] {});
  }
}
