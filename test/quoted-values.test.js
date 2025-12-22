const assert = require('assert');
const vscode = require('vscode');
const parseTable = require('../src/parse-table');

suite('Quoted Values Parsing Test Suite', () => {
  // Mock configuration
  const originalGetConfiguration = vscode.workspace.getConfiguration;

  setup(() => {
    vscode.workspace.getConfiguration = () => ({
      get: (key) => {
        switch (key) {
          case 'decimalPoint': return '10,000.00';
          case 'defaultConvention': return 'PascalCase';
          default: return null;
        }
      }
    });
  });

  teardown(() => {
    vscode.workspace.getConfiguration = originalGetConfiguration;
  });

  test('should strip surrounding quotes from numeric values', () => {
    const input = 'Col1\n"1"';
    const result = parseTable.parseClipboard(input);

    // Should catch the issue: currently "1" is parsed as string "1" (with quotes likely kept or treated as string)
    // We expect it to be parsed as a number 1
    assert.ok(result);
    assert.strictEqual(result.data[0][0], 1);
    // If it fails, it probably returns "1" (string) or key remains string type
  });

  test('should strip surrounding quotes from string values', () => {
    const input = 'Col1\n"foo"';
    const result = parseTable.parseClipboard(input);

    assert.ok(result);
    assert.strictEqual(result.data[0][0], 'foo');
    // If it fails, it probably returns "\"foo\""
  });

  test('complex row with mixed quoted types', () => {
    // From issue description: x Apple Pear Lemon "1"
    const input = 'x\tApple\tPear\tLemon\n"1"\t"fruit"\t"fruit"\t"fruit"';
    const result = parseTable.parseClipboard(input);

    assert.ok(result);
    assert.strictEqual(result.headers[0], 'X');
    assert.strictEqual(result.data[0][0], 1); // "1" -> 1
    assert.strictEqual(result.data[0][1], 'fruit'); // "fruit" -> fruit
  });
});
