package com.example.concepts;

// The abstract decorator: it both IMPLEMENTS Coffee and HOLDS a Coffee. That
// dual nature is the essence of the pattern — a decorator is a Coffee (so it can
// stand in anywhere one is expected, and be wrapped again) and it wraps a Coffee
// (so it can extend that inner object's behavior). By default it simply forwards
// every call to the wrapped object; concrete subclasses override to add their
// own contribution on top of that forwarded result.
public abstract class CoffeeDecorator implements Coffee {

  // The wrapped object — the next layer inward. It may be the base Espresso or
  // another decorator; the decorator neither knows nor cares which.
  protected final Coffee inner;

  protected CoffeeDecorator(Coffee inner) {
    this.inner = inner;
  }

  // Default behavior: delegate straight through. Subclasses call super (via the
  // inner field) and add to the result rather than replacing it.
  @Override
  public int costCents() {
    return inner.costCents();
  }

  @Override
  public String description() {
    return inner.description();
  }
}
