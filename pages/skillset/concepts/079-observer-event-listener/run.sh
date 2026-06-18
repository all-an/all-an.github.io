#!/usr/bin/env sh
# Run the JUnit 5 tests with Maven. The tests register observers on a subject,
# push updates, and assert each observer was notified — and that unsubscribing
# stops the notifications. The first run downloads JUnit into the local ~/.m2
# cache; after that it works offline. Needs `mvn` and a JDK.
set -e

mvn test
