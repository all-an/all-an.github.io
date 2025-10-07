#!/bin/bash
# Build script for GWT particles project

echo "Building Java GWT particles..."
cd "$(dirname "$0")"

# Clean and compile with Maven
mvn clean package

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "Build successful!"
    echo "Generated JavaScript: ../pkg-gwt/particles/"
    echo "To test: Open index.html in browser"
    echo "========================================"
else
    echo ""
    echo "========================================"
    echo "Build failed! Check errors above."
    echo "========================================"
    exit 1
fi
