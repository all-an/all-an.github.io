#!/usr/bin/env sh
# Run the JUnit 5 tests with Maven. The tests lower two unrelated source languages —
# an expression tree and RPN text — to one flat stack-machine instruction set, then
# hand that instruction list to two backends: one that executes it and one that
# translates it to source text. They assert the defining properties of a bytecode /
# IR: nested source becomes a flat ordered list, unrelated frontends converge on the
# identical representation, every backend consumes it without knowing where it came
# from, operand order survives the flattening, and the flat form can be verified —
# stack depth and all — before a single instruction runs. The first run downloads
# JUnit into the local ~/.m2 cache; after that it works offline. Needs `mvn` and a JDK.
set -e

mvn test
