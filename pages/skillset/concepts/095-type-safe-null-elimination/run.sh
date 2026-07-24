#!/usr/bin/env sh
# Run the JUnit 5 tests with Maven. The tests chain lookups that can each come up
# empty and assert the defining properties of type-safe null elimination: absence
# lives in the type, operations short-circuit instead of being null-checked, several
# fallible steps compose without nesting, and unwrapping forces a decision about
# what absence means. One test also pins the honest caveat — Optional.get() still
# throws, so this is a discipline the API encourages, not one the compiler enforces.
# The first run downloads JUnit into the local ~/.m2 cache; after that it works
# offline. Needs `mvn` and a JDK.
set -e

mvn test
