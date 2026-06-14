#!/usr/bin/env sh
# Run the Jest snapshot tests. The first run installs jest into node_modules
# (needs network); after that it runs offline. Needs node + npm.
set -e

# Install dependencies on first run only — skip if node_modules already exists.
[ -d node_modules ] || npm install

npm test
