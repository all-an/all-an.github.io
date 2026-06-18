package com.example.concepts;

// The component interface shared by both the base object and every decorator.
// Because a decorator implements the SAME interface it wraps, callers cannot
// tell a decorated coffee from a plain one — and decorators can wrap other
// decorators. That uniformity is what makes the pattern compose.
public interface Coffee {

  // The price of this coffee (including any added-on layers), in cents.
  int costCents();

  // A human-readable description that names this coffee and its add-ons.
  String description();
}
