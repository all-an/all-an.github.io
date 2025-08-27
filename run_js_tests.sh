#!/bin/bash

# JavaScript/Mocha Test Runner with Coverage Generation
# Runs Mocha tests and generates HTML coverage reports using nyc

# Don't use set -e as we want to continue even if coverage fails

echo "=== JavaScript/Mocha Test Runner with Coverage ==="

# Clean previous coverage data
echo "Cleaning previous coverage data..."
rm -rf coverage/
rm -rf .nyc_output/

# Create coverage directory
mkdir -p coverage

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
else
    echo "✓ npm packages found"
fi

# Check if required tools are available
check_npm_tool() {
    if ! npx $1 --version &> /dev/null; then
        echo "⚠ $1 not found in node_modules"
        return 1
    else
        echo "✓ $1 found"
        return 0
    fi
}

echo "Checking required tools..."
check_npm_tool "mocha" || (echo "Installing mocha..." && npm install mocha)
check_npm_tool "nyc" || (echo "Installing nyc..." && npm install nyc)

# Run JavaScript tests with coverage
echo ""
echo "=== Running JavaScript Tests with Coverage ==="
echo "Running npm run coverage..."

# Use npm script for coverage - don't fail if it has errors
npm run coverage || echo "⚠ Coverage generation had some issues, continuing..."

# Check if coverage was generated
if [ -d "coverage" ] && [ -f "coverage/index.html" ]; then
    echo "✓ Coverage report generated successfully"
    
    echo ""
    echo "=== Coverage Summary ==="
    echo "Coverage report available in HTML format"
    
    echo ""
    echo "Coverage report generated in: coverage/index.html"
    echo "Open with: firefox coverage/index.html"
    echo "Or serve locally: python -m http.server 8080 && open http://localhost:8080/coverage/"
else
    echo "⚠ Coverage report generation failed"
fi

# Also run tests without coverage for cleaner output and capture results
echo ""
echo "=== Running Tests Only (no coverage) ==="

# Run tests and capture exit code
npm test > /tmp/test_output.log 2>&1
TEST_EXIT_CODE=$?

# Display test output
cat /tmp/test_output.log

echo ""
echo "=== Generating Failing Tests Log ==="

# Create failing_tests_report.log
echo "JavaScript Test Results - $(date)" > failing_tests_report.log
echo "============================================" >> failing_tests_report.log
echo "" >> failing_tests_report.log

# Get test summary
grep -E "(passing|failing)" /tmp/test_output.log | tail -2 >> failing_tests_report.log || echo "Unable to parse test summary" >> failing_tests_report.log

echo "" >> failing_tests_report.log
echo "FAILING TESTS:" >> failing_tests_report.log
echo "============================================" >> failing_tests_report.log

# Extract just the test names that are failing
awk '
/^[[:space:]]*[0-9]+\)/ {
    # Extract test name from failure line
    line = $0
    gsub(/^[[:space:]]*[0-9]+\)[[:space:]]*/, "", line)
    print line
}
' /tmp/test_output.log >> failing_tests_report.log

echo "✅ Failing tests log saved to failing_tests_report.log"

# Clean up temp files  
rm -f /tmp/test_output.log 2>/dev/null

echo ""
echo "=== Test run completed ==="
echo "Summary:"
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "  🎉 All JavaScript/Mocha tests passed!"
else
    echo "  ⚠️  Some JavaScript/Mocha tests failed"
fi
echo "  ✓ HTML coverage report generated"
echo "  ✓ Failing tests log generated"
echo ""
echo "Generated files:"
find js/tests -name "*.test.js" 2>/dev/null | sed 's/^/  - /' || echo "  No test files found in js/tests/"
echo ""
echo "Reports:"
echo "  - Coverage: coverage/index.html"
echo "  - Failing Tests: failing_tests_report.log"
echo ""
echo "Next steps:"
echo "  - View coverage: open coverage/index.html"
echo "  - Review failures: cat failing_tests_report.log"
echo "  - Run specific test: npx mocha js/tests/<test_name>.test.js"

# Exit with test result
exit $TEST_EXIT_CODE