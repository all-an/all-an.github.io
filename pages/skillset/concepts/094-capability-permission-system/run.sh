#!/usr/bin/env sh
# Run the JUnit 5 tests with Maven. The tests build a file store whose only entry
# point is a root capability, narrow that capability down to a read-only view of one
# subtree, hand it to an untrusted plugin, and then revoke it. They assert the
# defining properties of the object-capability model: authority comes from holding
# an unforgeable reference rather than from an identity that gets checked,
# attenuation only ever weakens and cannot be cast back into something stronger, an
# attenuated capability does not even reveal what it cannot reach, authority travels
# with the reference when delegated, and revocation cuts off a grant already handed
# over without damaging the capability it was derived from. The first run downloads
# JUnit into the local ~/.m2 cache; after that it works offline. Needs `mvn` and a JDK.
set -e

mvn test
