package com.example.concepts;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

// Verifies the three guarantees of the Observer pattern: every subscriber is
// notified, the pushed value is the new state, and an unsubscribed observer
// stops receiving events. A recording observer captures each value so the test
// can assert on exactly what was delivered.
class WeatherStationTest {

  // A test observer that records every value the subject pushes to it, so the
  // test can check both how many notifications arrived and what they carried.
  static class RecordingObserver implements TemperatureObserver {

    // Every temperature this observer was notified of, in order.
    final List<Double> received = new ArrayList<>();

    @Override
    public void onTemperatureChanged(double celsius) {
      received.add(celsius);
    }
  }

  // All subscribers receive every update, and the value pushed is the new state.
  @Test
  void allSubscribersAreNotifiedWithTheNewValue() {
    WeatherStation station = new WeatherStation();
    RecordingObserver a = new RecordingObserver();
    RecordingObserver b = new RecordingObserver();
    station.subscribe(a);
    station.subscribe(b);

    station.setTemperature(18.0);
    station.setTemperature(25.5);

    assertEquals(List.of(18.0, 25.5), a.received);   // both updates reached a
    assertEquals(List.of(18.0, 25.5), b.received);   // and b independently
  }

  // After unsubscribing, an observer must stop being notified — while the
  // remaining observer keeps receiving updates.
  @Test
  void unsubscribedObserverStopsReceivingEvents() {
    WeatherStation station = new WeatherStation();
    RecordingObserver staying = new RecordingObserver();
    RecordingObserver leaving = new RecordingObserver();
    station.subscribe(staying);
    station.subscribe(leaving);

    station.setTemperature(10.0);   // both hear this
    station.unsubscribe(leaving);
    station.setTemperature(20.0);   // only `staying` hears this

    assertEquals(List.of(10.0, 20.0), staying.received);
    assertEquals(List.of(10.0), leaving.received);   // stopped after unsubscribe
  }
}
