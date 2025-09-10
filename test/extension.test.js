const assert = require('assert');
const vscode = require('vscode');
const path = require('path');

const utils = require('../src/utils');
const parseTable = require('../src/parse-table');
const extension = require('../extension');
const pasteDefault = require('../src/paste-default');

suite('Pastum Extension Test Suite', () => {
	vscode.window.showInformationMessage('Running Pastum tests...');

	suite('Utils Module Tests', () => {
		const originalGetConfiguration = vscode.workspace.getConfiguration;

		setup(() => {
			vscode.workspace.getConfiguration = () => ({
				get: (key) => {
					if (key === 'decimalPoint') return '10,000.00';
					return null;
				}
			});
		});

		teardown(() => {
			vscode.workspace.getConfiguration = originalGetConfiguration;
		});

		test('normalizeValue - removes commas for 10,000.00 format', () => {
			const result = utils.normalizeValue('12,345.67');
			assert.strictEqual(result, '12345.67');
		});

		test('normalizeValue - handles spaces for 10 000.00 format', () => {
			vscode.workspace.getConfiguration = () => ({
				get: () => '10 000.00'
			});
			const result = utils.normalizeValue('12 345.67');
			assert.strictEqual(result, '12345.67');
		});

		test('normalizeValue - handles European format 10 000,00', () => {
			vscode.workspace.getConfiguration = () => ({
				get: () => '10 000,00'
			});
			const result = utils.normalizeValue('12 345,67');
			assert.strictEqual(result, '12345.67');
		});

		test('normalizeValue - handles German format 10.000,00', () => {
			vscode.workspace.getConfiguration = () => ({
				get: () => '10.000,00'
			});
			const result = utils.normalizeValue('12.345,67');
			assert.strictEqual(result, '12345.67');
		});


		test('isNumeric - identifies numeric values correctly', () => {
			assert.strictEqual(utils.isNumeric('123'), true);
			assert.strictEqual(utils.isNumeric('123.45'), true);
			assert.strictEqual(utils.isNumeric('abc'), false);
			assert.strictEqual(utils.isNumeric(''), false);
			assert.strictEqual(utils.isNumeric('01'), false);
		});


		test('normalizeBool - converts boolean values for different languages', () => {
			assert.strictEqual(utils.normalizeBool('true', 'python'), 'True');
			assert.strictEqual(utils.normalizeBool('false', 'python'), 'False');
			assert.strictEqual(utils.normalizeBool('true', 'r'), 'TRUE');
			assert.strictEqual(utils.normalizeBool('false', 'r'), 'FALSE');
			assert.strictEqual(utils.normalizeBool('true', 'julia'), 'true');
			assert.strictEqual(utils.normalizeBool('false', 'julia'), 'false');
			assert.strictEqual(utils.normalizeBool('true', 'javascript'), 'true');
			assert.strictEqual(utils.normalizeBool('false', 'javascript'), 'false');
		});

		test('cleanDataValue - removes non-breaking spaces', () => {
			const input = '  test\u00A0value  ';
			const result = utils.cleanDataValue(input);
			assert.strictEqual(result, 'test value');
		});

		test('convertValue - converts numeric strings to numbers', () => {
			assert.strictEqual(utils.convertValue('123'), 123);
			assert.strictEqual(utils.convertValue('123.45'), 123.45);
			assert.strictEqual(utils.convertValue('abc'), 'abc');
		});

		test('isRowEmpty - detects empty rows', () => {
			assert.strictEqual(utils.isRowEmpty(['', '', '']), true);
			assert.strictEqual(utils.isRowEmpty(['  ', '  ', '  ']), true);
			assert.strictEqual(utils.isRowEmpty(['a', '', '']), false);
		});

		test('addTrailingZeroes - adds decimal point to integers', () => {
			assert.strictEqual(utils.addTrailingZeroes(123), '123.0');
			assert.strictEqual(utils.addTrailingZeroes('123.45'), '123.45');
		});
	});

	suite('Parse Table Module Tests', () => {
		const originalGetConfiguration = vscode.workspace.getConfiguration;

		setup(() => {
			vscode.workspace.getConfiguration = () => ({
				get: (key) => {
					if (key === 'decimalPoint') return '10,000.00';
					if (key === 'defaultConvention') return 'PascalCase';
					return null;
				}
			});
		});

		teardown(() => {
			vscode.workspace.getConfiguration = originalGetConfiguration;
		});

		test('parseClipboard - parses simple table correctly', () => {
			const input = 'Name\tAge\tScore\nAlice\t25\t95.5\nBob\t30\t87.2';
			const result = parseTable.parseClipboard(input);

			assert.strictEqual(result.headers.length, 3);
			assert.strictEqual(result.headers[0], 'Name');
			assert.strictEqual(result.headers[1], 'Age');
			assert.strictEqual(result.headers[2], 'Score');

			assert.strictEqual(result.data.length, 2);
			assert.strictEqual(result.data[0][0], 'Alice');
			assert.strictEqual(result.data[0][1], 25);
			assert.strictEqual(result.data[0][2], 95.5);
		});


	});

	suite('Extension Activation Tests', () => {
		test('activate - registers all commands', () => {
			const mockContext = {
				subscriptions: []
			};

			const originalRegisterCommand = vscode.commands.registerCommand;
			const registeredCommands = [];

			vscode.commands.registerCommand = (command, handler) => {
				registeredCommands.push(command);
				return { dispose: () => { } };
			};

			extension.activate(mockContext);

			const expectedCommands = [
				'pastum.Rdataframe',
				'pastum.Pydataframe',
				'pastum.Jldataframe',
				'pastum.JSdataframe',
				'pastum.Markdown',
				'pastum.Sql',
				'pastum.Defaultdataframe'
			];

			expectedCommands.forEach(cmd => {
				assert.ok(registeredCommands.includes(cmd), `Command ${cmd} should be registered`);
			});

			vscode.commands.registerCommand = originalRegisterCommand;
		});

		test('deactivate - function exists', () => {
			assert.strictEqual(typeof extension.deactivate, 'function');
		});
	});
});
