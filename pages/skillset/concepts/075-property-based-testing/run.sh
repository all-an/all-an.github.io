#!/usr/bin/env sh
# Run the jqwik property tests with Maven. The first run downloads jqwik into the
# local ~/.m2 cache; after that it runs offline. Needs `mvn` and a JDK.
set -e

mvn test
