#!/usr/bin/env sh
# Run the JUnit 5 tests with Maven. The tests use the Reflection API to read a
# Product's private fields into a map (introspection), call a method chosen by
# name (dynamic invocation), and build an instance from its constructor at
# runtime (reflective instantiation). The first run downloads JUnit into the
# local ~/.m2 cache; after that it works offline. Needs `mvn` and a JDK.
set -e

mvn test
