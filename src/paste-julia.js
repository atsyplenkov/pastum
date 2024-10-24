const vscode = require('vscode');
const { parseClipboard } = require('./parse-table');

async function clipboardToJuliaDataFrame() {
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

        // 3: Generate the Julia code for DataFrames.jl
        const jlCode = createJuliaDataFrame(formattedData);

        if (!jlCode) {
            vscode.window.showErrorMessage("Failed to generate Julia code.");
            return;
        }

        // 4: Insert the generated code into the active editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, jlCode);
            });
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
}


/**
 * Generates Julia code for DataFrames.jl
 * Creates a DataFrame using column-based construction syntax.
 * 
 * Modified from: https://web-apps.thecoatlessprofessor.com/data/html-table-to-dataframe-tool.html
 * 
 * @param {Object} tableData - Processed table data
 * @param {Array<string>} tableData.headers - Column names
 * @param {Array<Array<any>>} tableData.data - Table values
 * @param {Array<string>} tableData.columnTypes - Column types ('numeric' or 'string')
 * @returns {string} Generated Julia code
 * 
 */
function createJuliaDataFrame(tableData) {
    const { headers, data, columnTypes } = tableData;
    let code = `using DataFrames\n\n`;
    
    code += `df = DataFrame(\n`;
    headers.forEach((header, i) => {
        const values = data.map(row => 
            columnTypes[i] === 'numeric' ? row[i] : `"${row[i]}"`
        ).join(', ');
        code += `    :${header} => [${values}]${i < headers.length - 1 ? ',\n' : '\n'}`;
    });
    code += `)`;

    return code;
}

module.exports = {
    clipboardToJuliaDataFrame
}