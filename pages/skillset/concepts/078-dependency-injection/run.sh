#!/usr/bin/env sh
# Run the JUnit 5 tests with Maven. The tests inject a fake dependency into
# OrderService and also wire up the real one through Main's composition root.
# The first run downloads JUnit into the local ~/.m2 cache; after that it works
# offline. Needs `mvn` and a JDK.
set -e

mvn test
