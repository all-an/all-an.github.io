package com.example.concepts;

import org.junit.jupiter.api.Test;

// Runs the Main demo so its console output appears during `mvn test`, showing a
// plain copy and a copy routed through the uppercase filter stage.
class DemoRunTest {

  // Passes by simply not throwing — it exists to exercise and surface the demo.
  @Test
  void demoRunsWithoutError() throws Exception {
    Main.main(new String[] {});
  }
}
