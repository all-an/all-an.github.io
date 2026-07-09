#!/usr/bin/env sh
# Run the JUnit 5 tests with Maven. The tests marshal an object graph (an account
# holding a collection and a nested object) to a byte array with ObjectOutputStream
# and assert the defining properties of serialization: the value round-trips back
# equal, the wire form is a portable byte stream (starting with the 0xAC 0xED
# magic), the result is a distinct deep copy, and transient state is not written.
# The first run downloads JUnit into the local ~/.m2 cache; after that it works
# offline. Needs `mvn` and a JDK.
set -e

mvn test
