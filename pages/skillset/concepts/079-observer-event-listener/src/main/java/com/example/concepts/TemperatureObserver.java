package com.example.concepts;

// The observer (a.k.a. event listener): anything that wants to be told when the
// subject changes. The subject knows observers only through this interface, so
// it can notify any number of unrelated listeners without depending on their
// concrete types — that loose coupling is the heart of the Observer pattern.
public interface TemperatureObserver {

  // Called by the subject whenever the temperature changes. The new value is
  // pushed to the observer (the "push" model) rather than the observer having to
  // poll for it.
  void onTemperatureChanged(double celsius);
}
