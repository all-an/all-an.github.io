#!/usr/bin/env sh
# Run the JUnit 5 tests with Maven. The tests declare custom annotations
# (@NotBlank, @Min) on a User object, then let a reflective Validator read those
# annotations at runtime and turn each violated rule into a message — annotations
# as declarative metadata that a processor interprets. The first run downloads
# JUnit into the local ~/.m2 cache; after that it works offline. Needs `mvn` and
# a JDK.
set -e

mvn test
