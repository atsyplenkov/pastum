const assert = require('assert');
const vscode = require('vscode');

const utils = require('../src/utils');
const parseTable = require('../src/parse-table');

suite('Edge Cases and Error Handling Test Suite', () => {
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

  suite('Utils Edge Cases', () => {
    test('normalizeValue - handles null decimalPoint configuration', () => {
      vscode.workspace.getConfiguration = () => ({
        get: () => null
      });

      const originalShowError = vscode.window.showErrorMessage;
      let errorShown = false;

      vscode.window.showErrorMessage = (msg) => {
        errorShown = true;
        assert.ok(msg.includes('No default decimalPoint selected'));
      };

      const result = utils.normalizeValue('12,345.67', null);
      assert.ok(errorShown);

      vscode.window.showErrorMessage = originalShowError;
    });

    test('isInt - handles edge cases with leading zeros', () => {
      assert.strictEqual(utils.isInt('007'), false);
      assert.strictEqual(utils.isInt('0123'), false);
      assert.strictEqual(utils.isInt('0'), true);
    });

    test('isNumeric - handles scientific notation', () => {
      assert.strictEqual(utils.isNumeric('1e5'), true);
      assert.strictEqual(utils.isNumeric('1E-3'), true);
      assert.strictEqual(utils.isNumeric('1.23e+4'), true);
    });


    test('normalizeBool - handles unknown language', () => {
      const result = utils.normalizeBool('true', 'unknown');
      assert.strictEqual(result, 'true');
    });

    test('convertValue - handles complex numeric formats', () => {
      vscode.workspace.getConfiguration = () => ({
        get: () => '10.000,00'
      });

      const result = utils.convertValue('1.234.567,89');
      assert.strictEqual(result, 1234567.89);
    });

    test('isRowEmpty - handles rows with only whitespace characters', () => {
      assert.strictEqual(utils.isRowEmpty(['\t', '\n', '\r']), true);
      assert.strictEqual(utils.isRowEmpty(['\u00A0', ' ', '']), true);
    });
  });

  suite('Parse Table Edge Cases', () => {
    test('parseClipboard - handles malformed table data', () => {
      const input = 'Header1\nIncompleteRow';

      try {
        const result = parseTable.parseClipboard(input);
        assert.ok(result);
        assert.strictEqual(result.headers.length, 1);
        assert.strictEqual(result.data.length, 1);
      } catch (error) {
        assert.ok(error.message.includes('Invalid table format'));
      }
    });

    test('parseClipboard - handles table with only headers', () => {
      const input = 'Header1\tHeader2\tHeader3';

      try {
        const result = parseTable.parseClipboard(input);
        assert.fail('Should have thrown an error for table with no data rows');
      } catch (error) {
        assert.ok(error.message.includes('No data rows found'));
      }
    });

    test('parseClipboard - handles empty input', () => {
      const input = '';

      try {
        const result = parseTable.parseClipboard(input);
        assert.fail('Should have thrown an error for empty input');
      } catch (error) {
        assert.ok(error.message.includes('Invalid table format'));
      }
    });


    test('parseClipboard - handles table with special characters in headers', () => {
      const input = 'Column Name!\t@Price$\t%Change\nValue1\t100\t5.5';
      const result = parseTable.parseClipboard(input);

      assert.ok(result);
      assert.strictEqual(result.headers[0], 'ColumnName');
      assert.strictEqual(result.headers[1], 'Price');
      assert.strictEqual(result.headers[2], 'Change');
    });

    test('parseClipboard - handles table with numeric-like strings', () => {
      const input = 'ID\tCode\n001\t002\n003\t004';
      const result = parseTable.parseClipboard(input);

      assert.ok(result);
      assert.deepStrictEqual(result.columnTypes, ['string', 'string']);
    });


    test('parseClipboard - handles mixed boolean and string values', () => {
      const input = 'Status\nTrue\nFalse\nMaybe';
      const result = parseTable.parseClipboard(input);

      assert.ok(result);
      assert.strictEqual(result.columnTypes[0], 'string');
    });

    test('parseClipboard - handles very large numbers', () => {
      const input = 'BigNumber\n999999999999999\n1000000000000000';
      const result = parseTable.parseClipboard(input);

      assert.ok(result);
      assert.ok(result.columnTypes[0] === 'integer' || result.columnTypes[0] === 'numeric');
    });

    test('parseClipboard - handles negative numbers', () => {
      const input = 'Value\n-123\n-456.78\n-0.001';
      const result = parseTable.parseClipboard(input);

      assert.ok(result);
      assert.strictEqual(result.columnTypes[0], 'numeric');
    });

    test('parseClipboard - handles different naming conventions', () => {
      vscode.workspace.getConfiguration = () => ({
        get: (key) => {
          if (key === 'decimalPoint') return '10,000.00';
          if (key === 'defaultConvention') return 'snake_case';
          return null;
        }
      });

      const input = 'Long Column Name\tAnother Header\nValue1\tValue2';
      const result = parseTable.parseClipboard(input);

      assert.ok(result);
      assert.strictEqual(result.headers[0], 'long_column_name');
      assert.strictEqual(result.headers[1], 'another_header');
    });

    test('parseClipboard - handles camelCase convention', () => {
      vscode.workspace.getConfiguration = () => ({
        get: (key) => {
          if (key === 'decimalPoint') return '10,000.00';
          if (key === 'defaultConvention') return 'camelCase';
          return null;
        }
      });

      const input = 'First Column\tSecond Column\nValue1\tValue2';
      const result = parseTable.parseClipboard(input);

      assert.ok(result);
      assert.strictEqual(result.headers[0], 'firstColumn');
      assert.strictEqual(result.headers[1], 'secondColumn');
    });

    test('parseClipboard - handles headers starting with numbers', () => {
      const input = '1stColumn\t2ndColumn\nValue1\tValue2';
      const result = parseTable.parseClipboard(input);

      assert.ok(result);
      assert.ok(result.headers[0].startsWith('x') || result.headers[0].startsWith('_'));
      assert.ok(result.headers[1].startsWith('x') || result.headers[1].startsWith('_'));
    });

    test('parseClipboard - handles Cyrillic characters in headers', () => {
      const input = 'Имя\tВозраст\nАлиса\t25\nБоб\t30';
      const result = parseTable.parseClipboard(input);

      assert.ok(result);
      assert.ok(result.headers[0].includes('Имя') || result.headers[0] === 'Имя');
      assert.ok(result.headers[1].includes('Возраст') || result.headers[1] === 'Возраст');
    });
  });

  suite('Memory and Performance Edge Cases', () => {
    test('parseClipboard - handles large table data', () => {
      const rows = ['ID\tName\tValue'];
      for (let i = 1; i <= 1000; i++) {
        rows.push(`${i}\tName${i}\t${i * 1.5}`);
      }
      const input = rows.join('\n');

      const result = parseTable.parseClipboard(input);

      assert.ok(result);
      assert.strictEqual(result.headers.length, 3);
      assert.strictEqual(result.data.length, 1000);
    });

    test('parseClipboard - handles table with many columns', () => {
      const headers = [];
      const values = [];
      for (let i = 1; i <= 50; i++) {
        headers.push(`Col${i}`);
        values.push(`Value${i}`);
      }
      const input = headers.join('\t') + '\n' + values.join('\t');

      const result = parseTable.parseClipboard(input);

      assert.ok(result);
      assert.strictEqual(result.headers.length, 50);
      assert.strictEqual(result.data.length, 1);
    });
  });
});
