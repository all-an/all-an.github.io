# Dimension Kingdom - Java/GWT Source

This directory contains the Java source code for Dimension Kingdom, compiled to JavaScript using GWT (Google Web Toolkit) 2.11.0.

## Requirements

- Java 11+
- Maven

## Build

First, make the build script executable (only needed once):

```bash
chmod +x build.sh
```

Then run the build:

```bash
./build.sh
```

This runs `mvn clean package`, which compiles the Java source and outputs the GWT-compiled JavaScript to the parent `dimension-kingdom/` directory.
