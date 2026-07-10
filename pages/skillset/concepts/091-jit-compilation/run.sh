#!/usr/bin/env sh
# Run the JUnit 5 tests with Maven. The tests drive a small program through the two
# execution strategies a JIT uses: it starts interpreted (walking bytecode one
# opcode at a time), and once it has run past the compile threshold the engine
# compiles it to a single specialized callable and runs that instead. The tests
# assert the defining properties of just-in-time compilation: cold code is
# interpreted but correct, hot code gets compiled, the compiled form is observably
# identical to interpreting for every input, each program is profiled on its own,
# and compilation happens once. The first run downloads JUnit into the local ~/.m2
# cache; after that it works offline. Needs `mvn` and a JDK.
set -e

mvn test
