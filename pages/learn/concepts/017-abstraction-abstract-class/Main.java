// Java
// Runnable version of the "Abstraction / abstract class" concept snippet.
//
// Two flavours of abstraction in Java:
//   1. abstract class — partial implementation + state, single inheritance.
//   2. interface       — pure contract (with optional default methods), multiple inheritance.
//
// Quick start:
//   ./run.sh
//
// Or manually:
//   javac Main.java
//   java  Main

// ------------------------------------------------------------------------------------------
// (1) ABSTRACT CLASS — defines WHAT a shape must be able to do, not HOW.
//     Can hold state, declare a constructor, and ship concrete helper methods.
// ------------------------------------------------------------------------------------------
abstract class Shape {
  // No body — every concrete subclass MUST provide its own area().
  abstract double area();

  // A concrete method that builds on the abstract one.
  // Code written here works for every future Shape we will ever invent.
  String describe() {
    return getClass().getSimpleName() + " area=" + String.format("%.2f", area());
  }
}

class Circle extends Shape {
  private final double radius;
  Circle(double radius) { this.radius = radius; }
  @Override double area() { return Math.PI * radius * radius; }
}

class Square extends Shape {
  private final double side;
  Square(double side) { this.side = side; }
  @Override double area() { return side * side; }
}

// ------------------------------------------------------------------------------------------
// (2) INTERFACE — pure capability contract. No instance state, no constructor.
//     A class can implement MANY interfaces, but extend only ONE class.
// ------------------------------------------------------------------------------------------
interface Drawable {
  // Implicitly public abstract — no body.
  void draw();

  // Java 8+ default method: shared behavior layered onto the contract,
  // expressed in terms of the abstract method above.
  default String label() {
    return "[" + getClass().getSimpleName() + "]";
  }
}

// A single class may implement multiple interfaces — try adding `, Serializable` for example.
class Triangle implements Drawable {
  @Override public void draw() { System.out.println(label() + " /\\"); }
}

class Star implements Drawable {
  @Override public void draw() { System.out.println(label() + " *"); }
}

public class Main {
  public static void main(String[] args) {
    // (1) Abstract class in action ------------------------------------------------
    // new Shape() would not compile — Shape is abstract, only concrete subclasses are buildable.
    Shape[] shapes = { new Circle(2.0), new Square(3.0) };
    double total = 0;
    for (Shape s : shapes) {
      // describe() is inherited; area() dispatches to the right subclass implementation.
      System.out.println(s.describe());
      total += s.area();
    }
    System.out.printf("total area = %.2f%n", total);

    // (2) Interface in action -----------------------------------------------------
    // new Drawable() would not compile either — interfaces cannot be instantiated.
    Drawable[] doodles = { new Triangle(), new Star() };
    for (Drawable d : doodles) {
      d.draw();
    }
  }
}
