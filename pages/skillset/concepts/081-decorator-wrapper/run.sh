#!/usr/bin/env sh
# Run the JUnit 5 tests with Maven. The tests wrap a base coffee in stacked
# decorators and assert the composed cost and description. The first run
# downloads JUnit into the local ~/.m2 cache; after that it works offline. Needs
# `mvn` and a JDK.
set -e

mvn test
