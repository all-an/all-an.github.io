package com.example.concepts;

// Demonstrates the Builder pattern: two requests built with the same fluent API,
// one taking mostly defaults and one customizing several fields. The chained
// calls read like a description of the object, and only the fields that matter
// to each caller appear.
public class Main {

  public static void main(String[] args) {
    // Minimal request — set only the required url; method, timeout and headers
    // all fall back to the builder's defaults.
    HttpRequest simple = new HttpRequest.Builder()
        .url("https://example.com/status")
        .build();

    // Fully customized request — the fluent chain makes each choice explicit and
    // self-documenting, regardless of field order.
    HttpRequest detailed = new HttpRequest.Builder()
        .url("https://example.com/orders")
        .method("POST")
        .header("Content-Type", "application/json")
        .header("Authorization", "Bearer token123")
        .body("{\"item\":\"Analytical Engine\"}")
        .timeoutSeconds(60)
        .build();

    System.out.println(simple);
    System.out.println(detailed);
  }
}
