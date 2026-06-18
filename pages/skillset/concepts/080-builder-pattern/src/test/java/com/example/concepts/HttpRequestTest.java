package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

// Exercises the three things a builder must get right: optional fields fall back
// to defaults, set fields override them, and build() refuses to produce an
// invalid object.
class HttpRequestTest {

  // Setting only the required url leaves every optional field at its default.
  @Test
  void unsetOptionalFieldsUseTheirDefaults() {
    HttpRequest request = new HttpRequest.Builder()
        .url("https://example.com")
        .build();

    assertEquals("https://example.com", request.url());
    assertEquals("GET", request.method());      // default
    assertEquals(30, request.timeoutSeconds());  // default
    assertNull(request.body());                  // default: no body
    assertEquals(0, request.headers().size());   // default: no headers
  }

  // The fluent chain sets each field; headers accumulate across calls.
  @Test
  void setFieldsOverrideDefaults() {
    HttpRequest request = new HttpRequest.Builder()
        .url("https://example.com/orders")
        .method("POST")
        .timeoutSeconds(60)
        .body("{}")
        .header("Accept", "application/json")
        .header("X-Trace", "abc")
        .build();

    assertEquals("POST", request.method());
    assertEquals(60, request.timeoutSeconds());
    assertEquals("{}", request.body());
    assertEquals(2, request.headers().size());
    assertEquals("application/json", request.headers().get("Accept"));
  }

  // build() is the single validation gate — without a url it must fail, so an
  // invalid HttpRequest can never come into existence.
  @Test
  void buildRejectsAMissingRequiredField() {
    HttpRequest.Builder builder = new HttpRequest.Builder()
        .method("POST");   // url never set

    IllegalStateException error =
        assertThrows(IllegalStateException.class, builder::build);
    assertEquals("url is required", error.getMessage());
  }

  // The other validation rule: a non-positive timeout is rejected too.
  @Test
  void buildRejectsAnInvalidTimeout() {
    HttpRequest.Builder builder = new HttpRequest.Builder()
        .url("https://example.com")
        .timeoutSeconds(0);

    assertThrows(IllegalStateException.class, builder::build);
  }
}
