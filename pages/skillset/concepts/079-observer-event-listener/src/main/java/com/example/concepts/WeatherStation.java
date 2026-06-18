package com.example.concepts;

import java.util.ArrayList;
import java.util.List;

// The subject (a.k.a. observable): the source of events. It keeps a list of
// observers and, whenever its state changes, pushes the new value to every one
// of them. It has no idea what the observers actually do — that decoupling is
// what lets new listeners be added without touching this class.
public class WeatherStation {

  // The registered observers. A copy is iterated when notifying (below) so an
  // observer may unsubscribe itself during a callback without a
  // ConcurrentModificationException.
  private final List<TemperatureObserver> observers = new ArrayList<>();

  // The subject's state — the thing observers care about.
  private double celsius;

  // Register an observer so it receives future updates. This is the
  // "subscribe" half of the pattern.
  public void subscribe(TemperatureObserver observer) {
    observers.add(observer);
  }

  // Remove an observer so it stops receiving updates. After this returns, the
  // observer will not be notified again.
  public void unsubscribe(TemperatureObserver observer) {
    observers.remove(observer);
  }

  // Change the temperature and notify every subscriber. The state update and the
  // broadcast are one operation, so observers never see a stale value.
  public void setTemperature(double celsius) {
    this.celsius = celsius;
    notifyObservers();
  }

  // Push the current value to all observers. Iterating a copy keeps the
  // notification safe even if a callback subscribes or unsubscribes.
  private void notifyObservers() {
    for (TemperatureObserver observer : new ArrayList<>(observers)) {
      observer.onTemperatureChanged(celsius);
    }
  }
}
