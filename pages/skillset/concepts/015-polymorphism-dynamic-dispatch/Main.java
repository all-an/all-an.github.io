// Java
// Runnable version of the "Polymorphism / dynamic dispatch" concept snippet.
//
// Uses only the standard library — no external jars needed.
//
// Quick start:
//   ./run.sh
//
// Or manually:
//   javac Main.java
//   java  Main

// Base class with a default behavior that subclasses may override.
class Animal {
  String speak() { return "..."; }
}

// Each subclass overrides speak() to return its own sound.
// @Override is documentation + a compile-time guard that the parent really has this method.
class Dog extends Animal {
  @Override String speak() { return "woof"; }
}

class Cat extends Animal {
  @Override String speak() { return "meow"; }
}

class Cow extends Animal {
  @Override String speak() { return "moo"; }
}

public class Main {
  public static void main(String[] args) {
    // The compile-time type of every element is Animal — the JVM has no idea at compile
    // time which subclass will actually be in each slot.
    Animal[] herd = { new Animal(), new Dog(), new Cat(), new Cow() };

    // Yet calling a.speak() picks the correct override at RUNTIME for each object.
    // This runtime selection is "dynamic dispatch" — the heart of OOP polymorphism.
    for (Animal a : herd) {
      System.out.println(a.getClass().getSimpleName() + " says " + a.speak());
    }
  }
}
