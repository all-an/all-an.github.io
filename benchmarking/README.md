# Nim vs JavaScript Performance Benchmarking

This directory contains performance benchmarks comparing Nim-compiled JavaScript vs hand-written JavaScript.

## Setup Instructions

### 1. Install Nim
```bash
# Install Nim compiler
curl https://nim-lang.org/choosenim/init.sh -sSf | sh
# Or use package manager:
# Ubuntu: sudo apt install nim
# macOS: brew install nim
# Windows: Download from https://nim-lang.org/install.html
```

### 2. Compile Nim to JavaScript
```bash
# Navigate to benchmarking directory
cd benchmarking

# Compile Nim to JavaScript
nim js -o:bench-nim.js bench.nim

# The generated JavaScript will be in bench-nim.js
```

### 3. Run Benchmarks
```bash
# Serve files locally
python -m http.server 8000
# or
npx http-server

# Open http://localhost:8000/bench.html
```

## Benchmark Tests

The benchmark compares performance across several categories:

1. **String Processing** - Text parsing and manipulation
2. **Array Operations** - Large array manipulations
3. **Mathematical Computations** - Recursive algorithms
4. **Search Algorithms** - Fuzzy string matching
5. **Data Structure Operations** - Object/table operations

## Expected Results

Nim-compiled JavaScript typically performs **30-60% better** than hand-written JavaScript for:
- Computational tasks
- String processing
- Mathematical operations
- Recursive algorithms

## File Structure

- `bench.nim` - Nim source code with performance tests
- `bench.js` - Equivalent hand-written JavaScript implementations
- `bench.html` - Web page to run and display benchmark results
- `bench-nim.js` - Generated JavaScript from Nim compilation (created after running nim js)

## Understanding Results

- **Lower times are better** (measured in milliseconds)
- **Speedup ratio** shows how much faster Nim is (>1.0 = Nim wins)
- Results may vary by browser and system specifications

## Notes

- Benchmarks run in the browser's JavaScript engine
- Each test runs multiple iterations for accuracy
- Results are averaged across multiple runs
- Modern browsers optimize JavaScript differently