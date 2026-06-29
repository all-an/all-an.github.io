#!/usr/bin/env sh
# Run the JUnit 5 tests with Maven. The tests start a single-threaded NIO echo
# server — one Selector loop that asks the OS which channels are ready instead of
# blocking on any one of them — and connect several ordinary blocking clients to
# it, asserting that the one server thread multiplexes them all (the Reactor
# pattern). The first run downloads JUnit into the local ~/.m2 cache; after that
# it works offline. Needs `mvn` and a JDK.
set -e

mvn test
