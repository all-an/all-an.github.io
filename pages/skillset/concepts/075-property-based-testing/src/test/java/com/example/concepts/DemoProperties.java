package com.example.concepts;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import net.jqwik.api.ForAll;
import net.jqwik.api.Property;
import net.jqwik.api.Report;
import net.jqwik.api.Reporting;
import net.jqwik.api.lifecycle.AfterProperty;

// A demonstration that makes the input generation VISIBLE, answering "how do I
// know jqwik really generates many inputs?". It does two things the silent
// properties in ListsProperties do not:
//   1. @Report(Reporting.GENERATED) prints every input jqwik feeds the property.
//   2. an AtomicInteger counts the actual invocations and prints the total.
// tries = 5 keeps the printout short; the real properties use the default 1000.
class DemoProperties {

  // Counts how many times jqwik actually calls the property below.
  static final AtomicInteger invocations = new AtomicInteger();

  // tries = 5 so the printed list of generated inputs stays short and readable.
  @Property(tries = 5) // 
  @Report(Reporting.GENERATED)
  boolean showsEachGeneratedInput(@ForAll List<Integer> xs) {
    invocations.incrementAndGet();
    return true; // always passes — the point is to observe the inputs, not test
  }

  // Runs once after the property finishes: prints the real invocation count, so
  // you can see it matches the `tries` value (5 here, 1000 by default).
  @AfterProperty
  void printCount() {
    System.out.println(">>> property was invoked " + invocations.get() + " times");
  }
}
