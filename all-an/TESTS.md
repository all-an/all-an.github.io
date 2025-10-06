# Testing and Coverage Guide

This document explains how to run tests and generate coverage reports for the Rust WASM project.

## Prerequisites

Install the required tools:

```bash
# Install cargo-llvm-cov for coverage reports
cargo install cargo-llvm-cov

# Install llvm-tools component
rustup component add llvm-tools-preview
```

## Running Tests

### Run all tests
```bash
cargo test
```

### Run tests with verbose output
```bash
cargo test -- --nocapture
```

### Run specific test
```bash
cargo test test_calculate_column_position
```

### Run tests in a specific module
```bash
cargo test particles::tests
```

## Generating Coverage Reports

### Generate HTML coverage report
```bash
cargo llvm-cov --html
```

The report will be saved to `target/llvm-cov/html/index.html`

### Open coverage report in browser
```bash
cargo llvm-cov --html --open
```

### Generate coverage summary in terminal
```bash
cargo llvm-cov
```

### Generate coverage in different formats

#### LCOV format (for CI tools)
```bash
cargo llvm-cov --lcov --output-path lcov.info
```

#### JSON format
```bash
cargo llvm-cov --json --output-path coverage.json
```

## Coverage Options

### Skip coverage instrumentation
```bash
cargo llvm-cov --no-cfg-coverage
```

### Show uncovered lines
```bash
cargo llvm-cov --show-missing-lines
```

## Current Test Coverage

As of the latest run:
- **Total tests**: 5
- **Passing**: 5
- **Coverage**: See `target/llvm-cov/html/index.html` for detailed report

### Test breakdown:
- `particles::tests::test_calculate_column_position_zero` - Tests column position at index 0
- `particles::tests::test_calculate_column_position_one` - Tests column position at index 1
- `particles::tests::test_calculate_column_position_multiple` - Tests multiple column positions
- `tests::test_hello_world` - Tests hello_world function
- `tests::test_greet` - Tests greet function

## Continuous Integration

For CI pipelines, use:

```bash
cargo llvm-cov --lcov --output-path lcov.info
```

Then upload `lcov.info` to coverage services like Codecov or Coveralls.
