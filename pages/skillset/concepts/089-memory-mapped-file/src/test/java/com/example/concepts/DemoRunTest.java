package com.example.concepts;

import org.junit.jupiter.api.Test;

// Runs the Main demo so its console output appears during `mvn test`, showing a
// file read and written as memory, persisting across mappings, and shared between
// two mappings of the same file.
class DemoRunTest {

  // Passes by simply not throwing — it exists to exercise and surface the demo.
  @Test
  void demoRunsWithoutError() throws Exception {
    Main.main(new String[] {});
  }
}
