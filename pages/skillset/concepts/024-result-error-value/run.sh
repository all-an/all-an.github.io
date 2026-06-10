#!/usr/bin/env sh
# Run result.ts with Node. Node 23.6+ strips the TypeScript types natively and
# runs the resulting JavaScript — no tsc, ts-node, or build tool required.
set -e

node result.ts
