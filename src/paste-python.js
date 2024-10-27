const vscode = require("vscode");
const { parseClipboard } = require("./parse-table");
const { addTrailingZeroes } = require("./utils");

async function clipboardToPyDataFrame(framework = null) {
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

    // 3: Ask the user which framework they want to use
    if (framework === null) {
      framework = await vscode.window.showQuickPick(
        ["pandas 🐼", "polars 🐻", "datatable 🎩"],
        { placeHolder: "Select the Python framework" }
      );
      framework = framework.split(" ")[0];
    }

    if (!framework) {
      vscode.window.showErrorMessage("No framework selected.");
      return;
    }

    // 4: Generate the Python code using the selected framework
    const pyCode = createPyDataFrame(formattedData, framework);

    if (!pyCode) {
      vscode.window.showErrorMessage("Failed to generate Python code.");
      return;
    }

    // 5: Insert the generated code into the active editor
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.edit((editBuilder) => {
        editBuilder.insert(editor.selection.active, pyCode);
      });
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error.message}`);
  }
}

/**
 * Generates Python dataframe objects.
 * Supports pandas, polars, and datatable frameworks.
 *
 * Modified from: https://web-apps.thecoatlessprofessor.com/data/html-table-to-dataframe-tool.html
 *
 */
function createPyDataFrame(tableData, framework) {
  const { headers, data, columnTypes } = tableData;
  let code = "";

  /**
   * Formats a value according to its column type for R syntax
   * @param {any} value - The value to format
   * @param {number} colIndex - Column index for type lookup
   * @returns {string} Formatted value
   */
  function formatValue(value, colIndex) {
    if (value === "") {
      return "None";
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

  // pandas
  if (framework === "pandas") {
    code = `import pandas as pd\n\n`;
    code += `pd.DataFrame({\n`;
    headers.forEach((header, i) => {
      const values = data.map((row) => formatValue(row[i], i)).join(", ");
      code += `    "${header}": [${values}]${
        i < headers.length - 1 ? ",\n" : "\n"
      }`;
    });
    code += `})`;
  } else if (framework === "datatable") {
    code = `import datatable as dt\n\n`;
    code += `dt.Frame({\n`;
    headers.forEach((header, i) => {
      const values = data.map((row) => formatValue(row[i], i)).join(", ");
      code += `    "${header}": [${values}]${
        i < headers.length - 1 ? ",\n" : "\n"
      }`;
    });
    code += `})`;
  } else if (framework === "polars") {
    code = `import polars as pl\n\n`;
    code += `pl.DataFrame({\n`;
    headers.forEach((header, i) => {
      const values = data.map((row) => formatValue(row[i], i)).join(", ");
      code += `    "${header}": [${values}]${
        i < headers.length - 1 ? ",\n" : "\n"
      }`;
    });
    code += `})`;
  }

  return code;
}

module.exports = {
  clipboardToPyDataFrame,
};
