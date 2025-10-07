# GWT Particles - Matrix Rain Effect

Java implementation of the Matrix-style falling character animation, compiled to JavaScript using GWT (Google Web Toolkit).

## Overview

This is a Java port of the Rust WASM particle system using GWT. It creates the iconic "Matrix rain" effect with falling green characters on a black background.

## Features

- **Pure Java**: Written in Java 11, compiled to JavaScript via GWT
- **Matrix Effect**: Falling characters with trail effect
- **Responsive**: Full-screen canvas that adapts to window size
- **Cross-browser**: Works on all modern browsers with HTML5 Canvas support

## Project Structure

```
java-gwt/
├── src/
│   ├── main/java/com/allan/client/
│   │   └── Particles.java              # Main particle system implementation
│   └── main/resources/com/allan/
│       └── Particles.gwt.xml            # GWT module configuration
├── pom.xml                              # Maven configuration with GWT plugin
├── build.sh                             # Linux/Mac build script
├── build.bat                            # Windows build script
└── README.md                            # This file
```

## Prerequisites

- **Java 11+** (works with Java 24)
- **Maven 3.6+**
- Internet connection (for downloading dependencies)

## Building

### Windows

```batch
cd java-gwt
build.bat
```

### Linux/Mac

```bash
cd java-gwt
chmod +x build.sh
./build.sh
```

### Manual Build

```bash
cd java-gwt
mvn clean package
```

## Testing

The project includes comprehensive unit tests for all pure functions.

### Run Tests

```bash
mvn test
```

### Run Tests with Coverage

```bash
mvn test
```

### Test Details

The test suite (`ParticlesTest.java`) includes:
- **Column calculation tests**: Zero width, exact division, floor behavior
- **Random character tests**: Empty string, single char, multiple chars, special characters
- **Drop reset logic tests**: Boundary conditions, probability distributions
- **Drop initialization tests**: Various array sizes
- **Drop update tests**: Increment behavior, reset conditions, sequences

All tests mirror the original Rust WASM implementation tests for consistency.

## Output

The build process generates:
- `../pkg-gwt/particles/particles.nocache.js` - Main GWT bootstrap script
- `../pkg-gwt/particles/*.cache.js` - Compiled JavaScript (one per browser permutation)
- Source maps and other GWT artifacts

## Usage

After building, open `index-gwt.html` in your browser to see the animation.

The HTML file includes:

```html
<script type="text/javascript" src="pkg-gwt/particles/particles.nocache.js"></script>
```

## Configuration

Constants in `Particles.java`:

| Constant | Value | Description |
|----------|-------|-------------|
| `CHARSET` | Mixed characters | Characters to display |
| `FONT_SIZE` | 10.0 | Size of characters in pixels |
| `DRAW_INTERVAL_MS` | 35 | Frame interval (~28 FPS) |
| `TRAIL_ALPHA` | 0.04 | Trail fade effect opacity |
| `TEXT_COLOR` | #00FF46 | Matrix green color |
| `RESET_PROBABILITY` | 0.975 | Probability threshold for drop reset |

## How It Works

1. **Canvas Setup**: Creates a full-screen HTML5 canvas
2. **Drop Initialization**: Each column gets a drop starting at position 1
3. **Animation Loop**: Every 35ms using GWT's Scheduler:
   - Draws semi-transparent black rectangle (trail effect)
   - Renders random characters at each drop position
   - Updates drop positions (increment or reset to top)

## GWT Details

- **GWT Version**: 2.11.0
- **Entry Point**: `com.allan.client.Particles`
- **Module Name**: `particles`
- **Compilation Style**: OBFUSCATED (minified)
- **Output Directory**: `../pkg-gwt/`

## GWT vs Other Solutions

| Feature | Rust WASM | TeaVM | GWT |
|---------|-----------|-------|-----|
| Language | Rust | Java | Java |
| Compiler | wasm-bindgen | TeaVM | GWT |
| Output Size | ~30KB (wasm) | ~200KB (js) | ~100-300KB (js) |
| Java Version Support | N/A | Up to Java 21 | Java 11-24+ |
| Performance | Native WASM | Optimized JS | Optimized JS |
| Build Time | Fast | Moderate | Slow (first build) |
| Tooling | Cargo | Maven | Maven |

## Development

### Development Mode

For rapid development with hot reload:

```bash
mvn gwt:devmode
```

This starts the GWT development server with SuperDevMode.

### Production Build

```bash
mvn clean package -Dgwt.style=OBFUSCATED
```

### Detailed Build (unminified for debugging)

```bash
mvn clean package -Dgwt.style=DETAILED
```

## Troubleshooting

**Build is slow**:
- First build downloads GWT dependencies (~100MB), subsequent builds are faster
- Use `mvn package` (not `mvn install`) for faster builds

**JavaScript not loading**:
- Verify `particles.nocache.js` exists in `../pkg-gwt/particles/` directory
- Check browser console for errors
- Ensure you're using `index-gwt.html`, not the Rust version

**Canvas not displaying**:
- Ensure browser supports HTML5 Canvas
- Check that the entry point is being called (see browser console)

**"Browser not supported" message**:
- Your browser may not support HTML5 Canvas API
- Try a modern browser (Chrome, Firefox, Safari, Edge)

## License

This is a port of the Rust WASM implementation for educational purposes.
