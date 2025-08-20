#!/bin/bash

echo "=== Running Test Suite ==="

# Clean up old coverage files to ensure fresh coverage reports
echo "🧹 Cleaning up old coverage files..."
rm -rf coverage/ .nyc_output/

echo ""
echo "🧪 JavaScript Frontend Tests with Coverage:"

# Run all JavaScript tests with coverage and capture results
JS_RESULT=$(npm run coverage 2>&1)
JS_PASSED=$(echo "$JS_RESULT" | grep -o '[0-9]\+ passing' | head -1 | grep -o '[0-9]\+')
JS_FAILED=$(echo "$JS_RESULT" | grep -o '[0-9]\+ failing' | head -1 | grep -o '[0-9]\+')

# If no explicit counts found, parse from output
if [ -z "$JS_PASSED" ]; then
    JS_PASSED=0
fi
if [ -z "$JS_FAILED" ]; then
    JS_FAILED=0
fi

echo "$JS_RESULT"

echo ""
echo "=== Final Test Results ==="
echo "📊 JavaScript Tests:"
echo "   ✅ Passed: $JS_PASSED tests"
echo "   ❌ Failed: $JS_FAILED tests"
echo ""

# Generate failing tests mini-report
echo "=== Generating Failing Tests Report ==="
cat > FAILING_TESTS_REPORT.md << 'EOF'
# Test Failures Report

## JavaScript Tests
EOF

if [ "$JS_FAILED" -eq 0 ]; then
    echo "✅ **All tests are passing** - $JS_PASSED tests passed, $JS_FAILED failed" >> FAILING_TESTS_REPORT.md
else
    echo "❌ **$JS_FAILED tests failing** out of $((JS_PASSED + JS_FAILED)) total tests" >> FAILING_TESTS_REPORT.md
    echo "" >> FAILING_TESTS_REPORT.md
    echo "### Failing Test Names:" >> FAILING_TESTS_REPORT.md
    echo "$JS_RESULT" | grep -E "^\s*[0-9]+\)\s" | sed 's/^[[:space:]]*[0-9]*)[[:space:]]*/- /' >> FAILING_TESTS_REPORT.md
fi

echo "" >> FAILING_TESTS_REPORT.md
echo "---" >> FAILING_TESTS_REPORT.md
echo "**Summary:** $JS_PASSED passing ✅ | $JS_FAILED failing ❌" >> FAILING_TESTS_REPORT.md

echo "📄 Failing tests report saved to: FAILING_TESTS_REPORT.md"
echo ""
echo "ℹ️  Coverage Reports Available:"
echo "   📊 JavaScript Coverage: coverage/index.html"
echo ""
echo "=== Coverage Information ==="
echo "📊 JavaScript Coverage Summary:"
echo "   Check coverage/index.html for detailed coverage report"
echo ""
echo "🔄 Coverage files are now regenerated fresh on each test run"
echo "   - Removed files will no longer appear in coverage"
echo "   - Added files will be automatically included"