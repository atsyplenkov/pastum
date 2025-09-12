const assert = require('assert');
const vscode = require('vscode');

const pasteR = require('../src/paste-r');
const pastePython = require('../src/paste-python');
const pasteJulia = require('../src/paste-julia');
const pasteJS = require('../src/paste-js');
const pasteMarkdown = require('../src/paste-markdown');
const pasteSql = require('../src/paste-sql');
const pasteDefault = require('../src/paste-default');

suite('Paste Modules Test Suite', () => {
  let mockEditor;
  let mockClipboard;
  let originalClipboard;
  let originalActiveTextEditor;

  setup(() => {
    mockEditor = {
      selection: { active: { line: 0, character: 0 } },
      edit: (callback) => {
        const editBuilder = {
          insert: (position, text) => {
            mockEditor.insertedText = text;
          }
        };
        callback(editBuilder);
        return Promise.resolve(true);
      },
      document: { languageId: 'python' }
    };

    mockClipboard = {
      readText: () => Promise.resolve('Name\tAge\tScore\nAlice\t25\t95.5\nBob\t30\t87')
    };

    originalClipboard = vscode.env.clipboard;
    originalActiveTextEditor = vscode.window.activeTextEditor;

    vscode.env.clipboard = mockClipboard;
    vscode.window.activeTextEditor = mockEditor;

    vscode.workspace.getConfiguration = () => ({
      get: (key) => {
        switch (key) {
          case 'decimalPoint': return '10,000.00';
          case 'defaultConvention': return 'PascalCase';
          case 'defaultDataframeR': return 'tibble ✨';
          case 'defaultDataframePython': return 'pandas 🐼';
          case 'defaultDataframeJavascript': return 'polars 🐻';
          case 'defaultAligmentMarkdown': return 'columnar ↔️';
          case 'defaultSqlStatement': return 'INSERT INTO VALUES';
          default: return null;
        }
      }
    });

    vscode.window.showQuickPick = (items) => Promise.resolve(items[0]);
    vscode.window.showErrorMessage = () => { };
  });

  teardown(() => {
    vscode.env.clipboard = originalClipboard;
    vscode.window.activeTextEditor = originalActiveTextEditor;
  });

  suite('Python Paste Module Tests', () => {
    test('clipboardToPyDataFrame - function exists', () => {
      assert.strictEqual(typeof pastePython.clipboardToPyDataFrame, 'function');
    });
  });

  suite('R Paste Module Tests', () => {
    test('clipboardToRDataFrame - function exists', () => {
      assert.strictEqual(typeof pasteR.clipboardToRDataFrame, 'function');
    });
  });

  suite('Julia Paste Module Tests', () => {
    test('clipboardToJuliaDataFrame - function exists', () => {
      assert.strictEqual(typeof pasteJulia.clipboardToJuliaDataFrame, 'function');
    });
  });

  suite('JavaScript Paste Module Tests', () => {
    test('clipboardToJSDataFrame - function exists', () => {
      assert.strictEqual(typeof pasteJS.clipboardToJSDataFrame, 'function');
    });
  });

  suite('Markdown Paste Module Tests', () => {
    test('clipboardToMarkdown - function exists', () => {
      assert.strictEqual(typeof pasteMarkdown.clipboardToMarkdown, 'function');
    });
  });

  suite('Sql Paste Module Tests', () => {
    test('clipboardToSql - function exists', () => {
      assert.strictEqual(typeof pasteSql.clipboardToSql, 'function');
    });
  });

  suite('Default Paste Module Tests', () => {
    test('pasteDefault - function exists', () => {
      assert.strictEqual(typeof pasteDefault.pasteDefault, 'function');
    });

    test('pasteDefault - shows error when no editor is active', async () => {
      vscode.window.activeTextEditor = null;

      const originalShowError = vscode.window.showErrorMessage;
      let errorShown = false;

      vscode.window.showErrorMessage = (msg) => {
        errorShown = true;
        assert.ok(msg.includes('No active editor found'));
      };

      await pasteDefault.pasteDefault();
      assert.ok(errorShown);

      vscode.window.showErrorMessage = originalShowError;
    });
  });
});
