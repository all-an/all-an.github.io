#!/usr/bin/env sh
# Run the JUnit 5 tests with Maven. The tests map a temporary file into memory
# with FileChannel.map() and assert the three defining properties of a
# memory-mapped file: its bytes act as random-access memory, writes persist to
# disk across separate mappings, and two mappings of the same file share the same
# physical pages (shared memory). The first run downloads JUnit into the local
# ~/.m2 cache; after that it works offline. Needs `mvn` and a JDK.
set -e

mvn test
