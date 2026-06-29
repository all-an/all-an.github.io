#!/usr/bin/env sh
# Run the JUnit 5 tests with Maven. The tests pump bytes from an in-memory source
# (InputStream) to a sink (OutputStream) through a small fixed-size buffer — the
# stream abstraction: a payload of any size moves a chunk at a time without ever
# living wholly in memory. One test routes the bytes through an UpperCaseStream
# filter stage, showing streams composing like a Unix pipe. The first run
# downloads JUnit into the local ~/.m2 cache; after that it works offline. Needs
# `mvn` and a JDK.
set -e

mvn test
