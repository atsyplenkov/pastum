const vscode = require("vscode");
const { parseClipboard } = require("./parse-table");
const { addTrailingZeroes, normalizeBool } = require("./utils");

async function clipboardToJSDataFrame(framework = null) {
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
        ["base", "polars 🐻", "arquero 🏹", "danfo 🐝"],
        {
          placeHolder:
            "Select the JavaScript framework for creating the dataframe",
        }
      );
    }
    framework = framework.split(" ")[0];

    if (!framework) {
      vscode.window.showErrorMessage("No framework selected.");
      return;
    }

    // 4: Generate the JS code using the selected framework
    const jsCode = createJSDataFrame(formattedData, framework);

    if (!jsCode) {
      vscode.window.showErrorMessage("Failed to generate JavaScript code.");
      return;
    }

    // 5: Insert the generated code into the active editor
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.edit((editBuilder) => {
        editBuilder.insert(editor.selection.active, jsCode);
      });
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error.message}`);
  }
}

/**
 * Generates JS dataframe objects.
 * Supports base, polars frameworks.
 *
 */
function createJSDataFrame(tableData, framework) {
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
      return "null";
    } else if (columnTypes[colIndex] === "string") {
      return `"${value}"`;
    } else if (columnTypes[colIndex] === "numeric") {
      return addTrailingZeroes(value);
    } else if (columnTypes[colIndex] === "boolean") {
      return normalizeBool(value, "javascript");
    } else if (columnTypes[colIndex] === "integer") {
      return value;
      // FIXME:
      // add BigInt?
      // return `BigInt(${value})`;
    } else {
      return `"${value}"`;
    }
  }

  // base
  if (framework === "base") {
    code = `const df = {\n`;
    headers.forEach((header, i) => {
      const values = data.map((row) => formatValue(row[i], i)).join(", ");
      code += `    "${header}": [${values}]${
        i < headers.length - 1 ? ",\n" : "\n"
      }`;
    });
    code += `};`;
  } else if (framework === "polars") {
    code = `import pl from "nodejs-polars";\n\n`;
    code += `const df = pl.DataFrame({\n`;
    headers.forEach((header, i) => {
      const values = data.map((row) => formatValue(row[i], i)).join(", ");
      code += `    "${header}": [${values}]${
        i < headers.length - 1 ? ",\n" : "\n"
      }`;
    });
    code += `});`;
  } else if (framework === "arquero") {
    code = `import {table} from "arquero";\n\n`;
    code += `const df = table({\n`;
    headers.forEach((header, i) => {
      const values = data.map((row) => formatValue(row[i], i)).join(", ");
      code += `    "${header}": [${values}]${
        i < headers.length - 1 ? ",\n" : "\n"
      }`;
    });
    code += `});`;
  } else if (framework === "danfo") {
    code = `import * as dfd from "danfojs-node";\n\n`;
    code += `obj_data = {\n`;
    headers.forEach((header, i) => {
      const values = data.map((row) => formatValue(row[i], i)).join(", ");
      code += `    "${header}": [${values}]${
        i < headers.length - 1 ? ",\n" : "\n"
      }`;
    });
    code += `};\n\n`;
    code += `df = new dfd.DataFrame(obj_data);\n\n`;
    code += `df.print();`;
  }

  return code;
}

module.exports = {
  clipboardToJSDataFrame,
};
