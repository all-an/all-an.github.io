package com.example.concepts;

import org.junit.jupiter.api.Test;

// Runs the Main demo so its console output appears during `mvn test`, showing one
// cart repriced under each interchangeable strategy.
class DemoRunTest {

  // Passes by simply not throwing — it exists to exercise and surface the demo.
  @Test
  void demoRunsWithoutError() {
    Main.main(new String[] {});
  }
}
