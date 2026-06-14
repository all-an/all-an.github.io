#!/usr/bin/env sh
# Run the JUnit 5 tests with Maven. The first run downloads JUnit into the local
# ~/.m2 cache; after that it works offline. Needs `mvn` and a JDK.
set -e

mvn test
