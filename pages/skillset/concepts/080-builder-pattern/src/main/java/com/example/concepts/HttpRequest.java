package com.example.concepts;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

// An immutable object with one required field (url) and several optional ones,
// each with a sensible default. That mix is exactly what the Builder pattern is
// for: constructing such an object step by step through a readable, fluent API
// instead of a long, error-prone constructor where callers must remember the
// position and meaning of every argument.
public final class HttpRequest {

  // All fields are final, so a built request can never change afterward. They
  // are populated once, by the Builder, in build().
  private final String url;
  private final String method;
  private final int timeoutSeconds;
  private final String body;             // optional — null means "no body"
  private final Map<String, String> headers;

  // The constructor is PRIVATE: the only way to make an HttpRequest is through
  // the Builder, which guarantees every instance passed through build()'s
  // validation. The builder hands itself in so the request can copy its values.
  private HttpRequest(Builder builder) {
    this.url = builder.url;
    this.method = builder.method;
    this.timeoutSeconds = builder.timeoutSeconds;
    this.body = builder.body;
    // Defensive, unmodifiable copy so later edits to the builder's map cannot
    // mutate us. A LinkedHashMap copy keeps the headers in insertion order
    // (unlike Map.copyOf, which does not preserve order).
    this.headers = Collections.unmodifiableMap(new LinkedHashMap<>(builder.headers));
  }

  public String url() { return url; }
  public String method() { return method; }
  public int timeoutSeconds() { return timeoutSeconds; }
  public String body() { return body; }
  public Map<String, String> headers() { return headers; }

  // A readable form used by the demo to show what was built.
  @Override
  public String toString() {
    return method + " " + url + " (timeout=" + timeoutSeconds + "s, headers="
        + headers + (body == null ? "" : ", body=" + body) + ")";
  }

  // The Builder: a mutable helper that collects values one call at a time, then
  // produces the immutable HttpRequest. Each setter returns `this`, which is
  // what makes the calls chain fluently: request.url(..).method(..).build().
  public static final class Builder {

    // Required field — has no default, so the builder starts holding null and
    // build() rejects it if the caller never set it.
    private String url;

    // Optional fields carry their defaults right here, so a caller who does not
    // set them still gets a valid, sensible value.
    private String method = "GET";
    private int timeoutSeconds = 30;
    private String body = null;
    // LinkedHashMap so headers keep the order they were added — nicer output.
    private final Map<String, String> headers = new LinkedHashMap<>();

    // Each of these records one choice and returns the builder for chaining.
    public Builder url(String url) {
      this.url = url;
      return this;
    }

    public Builder method(String method) {
      this.method = method;
      return this;
    }

    public Builder timeoutSeconds(int timeoutSeconds) {
      this.timeoutSeconds = timeoutSeconds;
      return this;
    }

    public Builder body(String body) {
      this.body = body;
      return this;
    }

    // Headers accumulate, so this can be called many times to add several.
    public Builder header(String name, String value) {
      this.headers.put(name, value);
      return this;
    }

    // The terminal step. It is the single place that validates the whole object,
    // so an HttpRequest can never exist in an invalid state — a guarantee a
    // plain constructor with public setters cannot make.
    public HttpRequest build() {
      if (url == null || url.isBlank()) {
        throw new IllegalStateException("url is required");
      }
      if (timeoutSeconds <= 0) {
        throw new IllegalStateException("timeoutSeconds must be positive");
      }
      return new HttpRequest(this);
    }
  }
}
