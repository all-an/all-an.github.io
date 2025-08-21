# Testing Guide

## Overview
This document describes how to run tests and generate coverage reports for the Nim codebase using lcov to track entire files, functions, and types.

## Prerequisites

### Required Tools
- Nim compiler (with gc:arc support)
- lcov (Linux Coverage Validation)
- genhtml (part of lcov package)
- gcc with coverage support

### Installation
```bash
# Ubuntu/Debian
sudo apt-get install lcov nim

# Fedora/RHEL
sudo dnf install lcov nim

# macOS
brew install lcov nim
```

## Setup

### 1. Make the test script executable
```bash
chmod +x run-nim-tests.sh
```

### 2. Verify lcov installation
```bash
lcov --version
genhtml --version
```

## Running Tests with Coverage

### Basic Usage
```bash
./run-nim-tests.sh
```

### What the script does:
1. **Cleans previous coverage data**
   - Removes old HTML reports
   - Deletes previous `.gcda` and `.gcno` files
   - Clears old coverage info files

2. **Compiles tests with coverage flags**
   - Uses `--gc:arc` for better performance
   - Adds `--profiler:on` and `--stackTrace:on` for debugging
   - Includes GCC coverage flags: `-fprofile-arcs -ftest-coverage`
   - Links with gcov library: `-lgcov`

3. **Runs all test files**
   - Executes each compiled test
   - Generates coverage data during execution

4. **Generates coverage reports**
   - Captures coverage information with `lcov --capture`
   - Filters to include only project source files
   - Excludes system/Nim standard library files
   - Removes test files from coverage metrics
   - Generates HTML report with `genhtml`

## Coverage Output

### Files Generated
- `coverage.info` - Raw coverage data
- `coverage_src_only.info` - Filtered coverage data (source only)
- `coverage_html/` - HTML coverage report directory
- `coverage_html/index.html` - Main coverage report

### Viewing Results
```bash
# Open in browser
firefox coverage_html/index.html

# Or use any browser
open coverage_html/index.html
```

### Command Line Summary
The script automatically displays a coverage summary at the end:
```
=== Coverage Summary ===
Reading tracefile coverage_src_only.info
Summary coverage rate:
  lines......: 85.2% (23 of 27 lines)
  functions..: 100.0% (3 of 3 functions)
  branches...: no data found
```

## Adding New Tests

### 1. Create test file
Add your test file to the project directory (e.g., `test_mymodule.nim`)

### 2. Update test runner
Edit `run-nim-tests.sh` and add your test file to the `TEST_FILES` array:
```bash
TEST_FILES=(
    "temp.nim"
    "test_mymodule.nim"  # Add new test here
)
```

### 3. Test file structure
```nim
import unittest, mymodule

suite "My Module Tests":
  test "function should work correctly":
    check myfunction() == expected_result
```

## Coverage Targets

### Recommended Coverage Levels
- **Lines**: ≥ 80%
- **Functions**: ≥ 90%
- **Types**: All public types should be tested

### Excluding Files from Coverage
To exclude specific files, edit the `lcov --remove` command in the script:
```bash
lcov --remove coverage_src_only.info "*test_*" "*exclude_me*" --output-file coverage_src_only.info
```

## Troubleshooting

### Common Issues

#### "lcov: command not found"
```bash
# Install lcov
sudo apt-get install lcov
```

#### "No coverage data found"
- Ensure tests are actually running
- Check that GCC coverage flags are properly set
- Verify test files contain executable code

#### "Permission denied"
```bash
chmod +x run-nim-tests.sh
```

#### Coverage data appears empty
- Make sure test functions are being called
- Check that the Nim compiler supports coverage flags
- Verify gcov is properly installed

### Debug Mode
Add debug output to the script:
```bash
# Add after compilation
ls -la *.gcno *.gcda
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run tests with coverage
  run: |
    sudo apt-get install lcov
    chmod +x run-nim-tests.sh
    ./run-nim-tests.sh

- name: Upload coverage reports
  uses: actions/upload-artifact@v3
  with:
    name: coverage-report
    path: coverage_html/
```

### Coverage Badges
Use lcov summary output to generate coverage badges in README.md

## Best Practices

1. **Run tests before commits**: Always run the full test suite
2. **Monitor coverage trends**: Track coverage over time
3. **Test edge cases**: Focus on boundary conditions
4. **Document test cases**: Use descriptive test names
5. **Review coverage reports**: Identify untested code paths