#!/usr/bin/env sh
# Run the Mockito tests with Maven. The first run downloads JUnit + Mockito into
# the local ~/.m2 cache; after that it works offline. Needs `mvn` and a JDK.
set -e

mvn -q test
