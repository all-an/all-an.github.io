package com.example.concepts;

// Demonstrates the Observer pattern end to end: two displays subscribe to one
// weather station, both react to each update, and after one unsubscribes only
// the other keeps hearing about changes. A lambda observer shows that any
// listener — not just a named class — can subscribe.
public class Main {

  public static void main(String[] args) {
    WeatherStation station = new WeatherStation();   // the subject

    // Two observers subscribe; both will be notified on every change.
    Display phone = new Display("Phone");
    Display window = new Display("Window unit");
    station.subscribe(phone);
    station.subscribe(window);

    // A lambda is a perfectly good observer too — the interface has one method.
    station.subscribe(celsius -> {
      if (celsius > 30) System.out.println("Heat warning! " + celsius + "°C");
    });

    // First update — every subscriber reacts.
    System.out.println("-- setting 22.5°C --");
    station.setTemperature(22.5);

    // The phone unsubscribes; it must not be notified again.
    station.unsubscribe(phone);

    // Second update — the phone is silent, the others still react.
    System.out.println("-- setting 31.0°C --");
    station.setTemperature(31.0);
  }
}
