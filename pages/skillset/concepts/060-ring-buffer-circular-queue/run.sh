#!/usr/bin/env sh
# Compile and run Main.java. Pure javac/java — no external dependencies.
set -e

javac Main.java
java Main
