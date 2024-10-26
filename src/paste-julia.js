const vscode = require("vscode");
const { parseClipboard } = require("./parse-table");
const { addTrailingZeroes } = require("./utils");

/**
 * Parses the clipboard content into a structured table.
 */
async function clipboardToJuliaDataFrame() {
  try {
    // 1: Read the clipboard content
    const clipboardContent = await vscode.env.clipboard.readText();

    if (!clipboardContent) {
      vscode.window.showErrorMessage(
        "Clipboard is empty or contains unsupported content."
      );
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
      editor.edit((editBuilder) => {
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
 */
function createJuliaDataFrame(tableData) {
  function formatValue(value, colIndex) {
    if (value === "") {
      return "missing";
    } else if (columnTypes[colIndex] === "string") {
      return `"${value}"`;
    } else if (columnTypes[colIndex] === "numeric") {
      return addTrailingZeroes(value);
    } else if (columnTypes[colIndex] === "integer") {
      return value;
    } else {
      return `"${value}"`;
    }
  }

  const { headers, data, columnTypes } = tableData;
  let code = `using DataFrames\n\n`;

  code += `DataFrame(\n`;
  headers.forEach((header, i) => {
    const values = data.map((row) => formatValue(row[i], i)).join(", ");
    code += `    :${header} => [${values}]${
      i < headers.length - 1 ? ",\n" : "\n"
    }`;
  });
  code += `)`;

  return code;
}

module.exports = {
  clipboardToJuliaDataFrame,
};
