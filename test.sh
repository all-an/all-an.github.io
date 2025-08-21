#!/bin/bash

# Nim Test Runner with Coverage Generation
# Tracks entire files, functions and types using lcov

set -e

echo "=== Nim Test Runner with Coverage ==="

# Clean previous coverage data
echo "Cleaning previous coverage data..."
rm -rf coverage_html/
rm -f coverage.info coverage_src_only.info
find . -name "*.gcda" -delete
find . -name "*.gcno" -delete

# Create coverage directory
mkdir -p coverage_html

# Test files to run
TEST_FILES=(
    "tests/test_terminal.nim"
)

# Compile and run tests with coverage
echo "Compiling and running tests with coverage..."

for test_file in "${TEST_FILES[@]}"; do
    if [ -f "$test_file" ]; then
        echo "Running test: $test_file"
        
        # Get base filename without path and extension
        base_name=$(basename "$test_file" .nim)
        
        # Compile with coverage flags for unittest
        nim c --mm:arc --profiler:on --stackTrace:on \
            --passC:"-fprofile-arcs -ftest-coverage -O0" \
            --passL:"-lgcov --coverage" \
            --debugger:native \
            --out:"${base_name}_executable" \
            "$test_file"
        
        # Run the test
        ./${base_name}_executable
        
        echo "✓ $test_file completed"
    else
        echo "⚠ Test file $test_file not found"
    fi
done

# Generate coverage data
echo "Generating coverage data..."

# Capture coverage information from Nim cache and current directory
lcov --capture --directory . --directory ~/.cache/nim --output-file coverage.info

# Filter to include only our source files
lcov --extract coverage.info "$(pwd)/nim/*" --output-file coverage_src_only.info

# Remove dummy/generated files and test files
lcov --remove coverage_src_only.info "*test_*" "*generated_not_to_break_here*" --output-file coverage_src_only.info

# Generate HTML report
echo "Generating HTML coverage report..."
genhtml coverage_src_only.info --output-directory coverage_html \
    --title "Nim Code Coverage Report" \
    --show-details --legend

# Display coverage summary
echo ""
echo "=== Coverage Summary ==="
lcov --summary coverage_src_only.info

echo ""
echo "Coverage report generated in: coverage_html/index.html"
echo "Open with: firefox coverage_html/index.html"

# Clean up test executables and directories
echo "Cleaning up test executables and directories..."
find . -name "*_executable" -type f -executable -delete
rm -rf test_tests/

echo "=== Test run completed ==="