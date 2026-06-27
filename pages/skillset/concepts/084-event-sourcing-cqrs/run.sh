#!/usr/bin/env sh
# Run the JUnit 5 tests with Maven. The tests replay events to rebuild an account
# aggregate (event sourcing) and fold the same log into a queryable projection
# (the CQRS read side). The first run downloads JUnit into the local ~/.m2 cache;
# after that it works offline. Needs `mvn` and a JDK.
set -e

mvn test
