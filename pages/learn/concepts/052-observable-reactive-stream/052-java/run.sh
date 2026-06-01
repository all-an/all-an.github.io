#!/usr/bin/env sh
# Download RxJava (and its reactive-streams dependency) into ./lib if missing,
# then compile and run Main.java. Pure javac/java — no build tool required.
set -e

RXJAVA_VERSION=3.1.10
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

fetch "https://repo1.maven.org/maven2/io/reactivex/rxjava3/rxjava/$RXJAVA_VERSION/rxjava-$RXJAVA_VERSION.jar" "$LIB/rxjava-$RXJAVA_VERSION.jar"
fetch "https://repo1.maven.org/maven2/org/reactivestreams/reactive-streams/$REACTIVE_STREAMS_VERSION/reactive-streams-$REACTIVE_STREAMS_VERSION.jar" "$LIB/reactive-streams-$REACTIVE_STREAMS_VERSION.jar"

# Compile against the jars, then run with the current dir on the classpath too.
javac -cp "$LIB/*" Main.java
java -cp "$LIB/*:." Main
