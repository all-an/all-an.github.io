#!/usr/bin/env sh
# Run the JUnit 5 tests with Maven. The tests build a "native image" the way an
# ahead-of-time toolchain does — analysing which programs are reachable, folding
# each one's instructions using facts known statically, and emitting finished code
# before any input exists. They assert the defining properties of AOT compilation:
# everything is compiled before the first run, there is no warm-up, build-time
# optimization shrinks the shipped code without changing its meaning (overflow
# included), and unreachable code is eliminated and can never be compiled at run
# time. The first run downloads JUnit into the local ~/.m2 cache; after that it
# works offline. Needs `mvn` and a JDK.
set -e

mvn test
