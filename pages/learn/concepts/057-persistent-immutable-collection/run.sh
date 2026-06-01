#!/usr/bin/env sh
# Download Vavr into ./lib if missing, then compile and run Main.java.
# Pure javac/java — no build tool needed.
set -e

VAVR_VERSION=0.10.4
LIB=lib

mkdir -p "$LIB"

# Fetch a jar from Maven Central only if it is not already present.
fetch() {
  url="$1"; out="$2"
  if [ ! -f "$out" ]; then
    echo "downloading $(basename "$out")"
    curl -sSL -o "$out" "$url"
  fi
}

fetch "https://repo1.maven.org/maven2/io/vavr/vavr/$VAVR_VERSION/vavr-$VAVR_VERSION.jar" "$LIB/vavr-$VAVR_VERSION.jar"

# Compile against the jar, then run with the current dir on the classpath too.
javac -cp "$LIB/*" Main.java
java -cp "$LIB/*:." Main
