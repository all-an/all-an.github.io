#!/usr/bin/env sh
# Download Project Reactor (and its reactive-streams dependency) into ./lib if
# missing, then compile and run Main.java. Pure javac/java — no build tool needed.
set -e

REACTOR_VERSION=3.8.5
REACTIVE_STREAMS_VERSION=1.0.4
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

fetch "https://repo1.maven.org/maven2/io/projectreactor/reactor-core/$REACTOR_VERSION/reactor-core-$REACTOR_VERSION.jar" "$LIB/reactor-core-$REACTOR_VERSION.jar"
fetch "https://repo1.maven.org/maven2/org/reactivestreams/reactive-streams/$REACTIVE_STREAMS_VERSION/reactive-streams-$REACTIVE_STREAMS_VERSION.jar" "$LIB/reactive-streams-$REACTIVE_STREAMS_VERSION.jar"

# Compile against the jars, then run with the current dir on the classpath too.
javac -cp "$LIB/*" Main.java
java -cp "$LIB/*:." Main
