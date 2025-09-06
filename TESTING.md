# Testing Guide

## Overview
This document describes how to run JavaScript tests using Mocha, generate coverage reports, and monitor test failures.

## Prerequisites

### Required Tools
- Node.js (v16 or higher)
- npm
- Mocha test framework
- nyc for coverage
- chai for assertions
- sinon for mocking

### Installation
```bash
# Install dependencies
npm install

# Dependencies are automatically installed from package.json:
# - mocha: JavaScript test framework
# - nyc: Coverage tool
# - chai: Assertion library  
# - sinon: Mocking library
```

## JavaScript Testing

### 1. Running All Tests with Coverage
```bash
./run_js_tests.sh
```

### 2. What the script does:
1. **Cleans previous test data**
   - Removes old coverage reports
   - Clears previous test outputs

2. **Runs tests with coverage**
   - Executes all test files in `js/tests/`
   - Generates HTML coverage report
   - Creates failing tests log

3. **Generates reports**
   - **Coverage Report**: `coverage/index.html`
   - **Failing Tests Log**: `failing_tests_report.log`

### 3. Test Output Files
- **`coverage/index.html`** - Interactive HTML coverage report
- **`failing_tests_report.log`** - Simple log with failing test names
- **Console output** - Real-time test results

## Checking Test Results

### 1. View Failing Tests Log
```bash
cat failing_tests_report.log
```

**Example output:**
```
JavaScript Test Results - Tue Aug 26 06:19:02 PM -03 2025
============================================

115 passing (174ms)
101 failing

FAILING TESTS:
============================================
"before each" hook for "should validate firebase configuration structure"
should handle choice
should handle choice when not logged in
should handle choice when logged in
...
```

### 2. View Coverage Report
```bash
# Open in browser
firefox coverage/index.html

# Or serve locally
python -m http.server 8080
# Then open: http://localhost:8080/coverage/
```

### 3. Monitor Test Changes
```bash
# Before making changes
./run_js_tests.sh
cp failing_tests_report.log failing_tests_before.log

# After making changes  
./run_js_tests.sh
diff failing_tests_before.log failing_tests_report.log
```

## Running Individual Tests

### 1. Run Specific Test File
```bash
# Single test file with setup
npx mocha --require js/tests/setup.js js/tests/terminal.test.js

# Run specific test file
npx mocha --require js/tests/setup.js js/tests/firebase-config.test.js

# Multiple specific files
npx mocha --require js/tests/setup.js js/tests/firebase-config.test.js js/tests/terminal.test.js

# Run just one test file (shortest command)
npx mocha js/tests/firebase-config.test.js
```

### 2. Run Tests by Pattern
```bash
# All tests matching pattern
npx mocha --require js/tests/setup.js js/tests/**/*firebase*.test.js

# Grep for specific test names
npx mocha --require js/tests/setup.js --grep "Firebase Config" js/tests/**/*.test.js

# Run only specific test by name
npx mocha --require js/tests/setup.js --grep "should handle guest choice" js/tests/**/*.test.js

# Run only tests from a specific describe block
npx mocha --require js/tests/setup.js --grep "VimEditor" js/tests/**/*.test.js
```

### 3. Debug Individual Tests
```bash
# Verbose output with setup
npx mocha --require js/tests/setup.js --reporter spec js/tests/terminal.test.js

# With stack traces
npx mocha --require js/tests/setup.js --full-trace js/tests/terminal.test.js

# Timeout adjustment for slow tests
npx mocha --require js/tests/setup.js --timeout 10000 js/tests/vim.test.js

# Run just one specific test
npx mocha --require js/tests/setup.js --grep "should validate firebase configuration structure" js/tests/**/*.test.js
```

## Test File Structure

### Current Test Files
```
js/tests/
├── terminal.test.js             # Terminal functionality tests
```

### Adding New Tests
1. **Create test file** in `js/tests/` directory:
```javascript
const { expect } = require('chai');
const myModule = require('../my-module.js');

describe('My Module', function() {
    beforeEach(function() {
        // Setup before each test
    });

    it('should work correctly', function() {
        expect(myModule.myFunction()).to.equal('expected');
    });
});
```

2. **Tests are automatically discovered** - No need to update any config

## Common Test Issues & Solutions

### 1. DOM Mocking Issues
**Problem**: `TypeError: Cannot set properties of undefined (setting 'cssText')`

**Solution**: Enhance DOM mocks in `js/tests/setup.js`:
```javascript
global.document = {
    createElement: (tag) => ({
        tagName: tag.toUpperCase(),
        style: { cssText: '' },
        appendChild: () => {},
        querySelector: () => ({ style: { cssText: '' } }),
        querySelectorAll: () => []
    })
};
```

### 2. Module Import Errors  
**Problem**: `ReferenceError: function is not defined`

**Solution**: Check exports in source files:
```javascript
// In js/terminal.js - make sure functions are exported
module.exports = {
    terminalState,
    commands,
    // ... other functions
};
```

### 3. ES Module vs CommonJS
**Problem**: `require is not defined in ES module scope`

**Solutions**:
```bash
# Option 1: Rename test file to .cjs
mv firebaseconfig-nim.test.js firebaseconfig-nim.test.cjs

# Option 2: Convert to ES modules (update imports)
# import { expect } from 'chai';
```

## Test Coverage Targets

### Recommended Coverage Levels
- **Statements**: ≥ 80%
- **Branches**: ≥ 70% 
- **Functions**: ≥ 90%
- **Lines**: ≥ 80%

### Current Test Status
- **Total Tests**: 216
- **Passing**: 115 ✅
- **Failing**: 101 ❌
- **Main Issues**: DOM mocking, missing exports

## Continuous Integration

### GitHub Actions Setup
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: ./run_js_tests.sh
      - uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: |
            coverage/
            failing_tests_report.log
```

## Best Practices

### 1. Test Organization
- **Group related tests** in describe blocks
- **Use descriptive test names** that explain expected behavior
- **Setup and teardown** properly in beforeEach/afterEach

### 2. Debugging Failed Tests
```bash
# Step 1: Run failing test individually
npx mocha js/tests/terminal.test.js --grep "specific failing test"

# Step 2: Check the failing_tests_report.log
grep -A 5 -B 5 "test name" failing_tests_report.log

# Step 3: Add console.log debugging
console.log('Debug info:', variable);

# Step 4: Check source code exports
node -e "console.log(Object.keys(require('./js/terminal.js')))"
```

### 3. Maintaining Tests
- **Run tests before commits**: `./run_js_tests.sh`
- **Fix failing tests promptly**: Don't let them accumulate
- **Update mocks**: Keep DOM/browser mocks current with usage
- **Review coverage**: Identify untested code paths

### 4. Mock Management
- **Keep mocks minimal**: Only mock what's necessary
- **Use sinon for spies/stubs**: More powerful than basic mocks
- **Reset mocks between tests**: Avoid test interference

## Quick Reference

```bash
# Full test suite with reports
./run_js_tests.sh

# Just run tests (no coverage)
npm test

# View failing tests
cat failing_tests_report.log

# View coverage
firefox coverage/index.html

# Single test file
npx mocha js/tests/firebase-config.test.js

# Debug specific test
npx mocha --grep "specific test name" --reporter spec

# Test with timeout
npx mocha --timeout 10000 js/tests/vim.test.js
```