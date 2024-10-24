const vscode = require('vscode');
const { parseClipboard } = require('./src/parse-table');
const { createRDataFrame } = require('./src/paste-r');

function activate(context) {
	// Register the pastum.Rdataframe command
	let disposable = vscode.commands.registerCommand('pastum.Rdataframe', async function () {
		try {
			// 1: Read the clipboard content
			const clipboardContent = await vscode.env.clipboard.readText();

			if (!clipboardContent) {
				vscode.window.showErrorMessage("Clipboard is empty or contains unsupported content.");
				return;
			}

			// 2: Try to extract the table from clipboard content
			let formattedData = null;
			formattedData = parseClipboard(clipboardContent);

			// 3: Ask the user which framework they want to use 
			let framework = null;
			framework = await vscode.window.showQuickPick(
				['base', 'tidyverse ✨', 'data.table 🎩', 'polars 🐻'],
				{ placeHolder: 'Select the R framework to use for the dataframe' }
			);
			framework = framework.split(' ')[0];

			if (!framework) {
				vscode.window.showErrorMessage("No framework selected.");
				return;
			}

			// 4: Generate the R code using the selected framework
			const rCode = createRDataFrame(formattedData, framework);

			if (!rCode) {
				vscode.window.showErrorMessage("Failed to generate R code.");
				return;
			}

			// 5: Insert the generated code into the active editor
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