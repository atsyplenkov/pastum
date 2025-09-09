# Running Tests

The tests are designed to work with the VS Code Test Framework. To run them:

```bash
npm test
```

Or using the VS Code Test CLI:
```bash
npx @vscode/test-cli --extensionDevelopmentPath=. --extensionTestsPath=./test
```

# Test Data Examples

The tests use various table formats to ensure comprehensive coverage:

## Simple Table
```
Name	Age	Score
Alice	25	95.5
Bob	30	87.2
```

## Large Dataset Test
```
Generated tables with 1000+ rows and 50+ columns for performance testing
```

## Special Characters in Headers
```
Column Name!	@Price$	%Change
Value1	100	5.5
```

# Contributing

When adding new features:
1. Add corresponding tests in the appropriate test file
2. Focus on unit tests for core functionality
3. Test edge cases and error conditions
4. Verify module structure and exports
5. Avoid complex async mocking 