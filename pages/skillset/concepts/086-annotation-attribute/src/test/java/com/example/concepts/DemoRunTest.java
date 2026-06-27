package com.example.concepts;

import org.junit.jupiter.api.Test;

// Runs the Main demo so its console output appears during `mvn test`, showing a
// valid object with no violations and an invalid one whose broken annotations
// each become a message.
class DemoRunTest {

  // Passes by simply not throwing — it exists to exercise and surface the demo.
  @Test
  void demoRunsWithoutError() {
    Main.main(new String[] {});
  }
}
