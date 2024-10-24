const vscode = require('vscode');
const { parseTable, formatVariableName } = require('./src/html-table-to-dataframe');
const { generateRCode } = require('./src/paste-r');

function activate(context) {
	// Register the pastum.Rdataframe command
	let disposable = vscode.commands.registerCommand('pastum.Rdataframe', async function () {
		try {
			// Step 1: Read the clipboard content
			const clipboardContent = await vscode.env.clipboard.readText();

			if (!clipboardContent) {
				vscode.window.showErrorMessage("Clipboard is empty or contains unsupported content.");
				return;
			}

			// Step 2: Try to extract the table from clipboard content (HTML or plain text)
			let parsedTableData = null;

			parsedTableData = parseTable(clipboardContent);

			// Format headers according to R language conventions
			const formattedHeaders = parsedTableData.headers.map(header => 
				formatVariableName(header, "r")
			); 

			// Prepare formatted data for code generation
			const formattedData = {
				headers: formattedHeaders,
				data: parsedTableData.data,
				columnTypes: parsedTableData.columnTypes
			};

			if (!parsedTableData) {
				vscode.window.showErrorMessage("No valid table found in the clipboard.");
				return;
			}

			// Step 3: Ask the user which framework they want to use for R Dataframe (base, tidyverse, etc.)
			const framework = await vscode.window.showQuickPick(
				['base', 'tidyverse', 'data.table', 'polars'],
				{ placeHolder: 'Select the R framework to use for the dataframe' }
			);

			if (!framework) {
				vscode.window.showErrorMessage("No framework selected.");
				return;
			}

			// Step 4: Generate the R code using the selected framework (generateRCode is assumed to exist)
			const rCode = generateRCode(formattedData, framework);

			if (!rCode) {
				vscode.window.showErrorMessage("Failed to generate R code.");
				return;
			}

			// Step 5: Insert the generated R code into the active editor
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				editor.edit(editBuilder => {
					editBuilder.insert(editor.selection.active, rCode);
				});
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Error: ${error.message}`);
		}
	});

	context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
};