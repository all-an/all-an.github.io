package com.example.concepts;

// A concrete observer that reacts to temperature changes by printing them. It is
// one of potentially many independent listeners; the WeatherStation neither
// knows nor cares that this particular observer renders to the console.
public class Display implements TemperatureObserver {

  // A label so the demo output shows which observer reacted.
  private final String name;

  public Display(String name) {
    this.name = name;
  }

  // The reaction to an event — here, just print the pushed value.
  @Override
  public void onTemperatureChanged(double celsius) {
    System.out.println(name + " shows " + celsius + "°C");
  }
}
