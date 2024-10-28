const vscode = require("vscode");
const { parseClipboard } = require("./parse-table");
const { addTrailingZeroes } = require("./utils");

async function clipboardToRDataFrame(framework = null) {
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
        ["base", "tribble 🔢", "tibble ✨", "data.table 🎩", "polars 🐻"],
        { placeHolder: "Select the R framework for creating the dataframe" }
      );
      framework = framework.split(" ")[0];
    }

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
      editor.edit((editBuilder) => {
        editBuilder.insert(editor.selection.active, rCode);
      });
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error.message}`);
  }
}

/**
 * Generates R dataframe objects.
 * Supports base R, tibble, data.table, and R polars frameworks.
 *
 * Modified from: https://web-apps.thecoatlessprofessor.com/data/html-table-to-dataframe-tool.html
 *
 * Framework-specific details:
 * - base R: Uses data.frame() constructor, no package dependencies
 * - tibble: Uses tibble() constructor, requires tibble package
 * - data.table: Uses data.table() constructor, requires data.table package
 * - polars: Uses pl$DataFrame() constructor, requires polars package
 *
 * @param {Object} tableData - Processed table data
 * @param {Array<string>} tableData.headers - Column names
 * @param {Array<Array<any>>} tableData.data - Table values
 * @param {Array<string>} tableData.columnTypes - Column types ('numeric' or 'string')
 * @param {string} framework - R framework to use ('base', 'tibble', 'data.table', 'polars')
 * @returns {string} Generated R code
 *
 */
function createRDataFrame(tableData, framework) {
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
      return "NA";
    } else if (columnTypes[colIndex] === "string") {
      return `"${value}"`;
    } else if (columnTypes[colIndex] === "numeric") {
      return addTrailingZeroes(value);
    } else if (columnTypes[colIndex] === "integer") {
      return value + "L";
    } else {
      return `"${value}"`;
    }
  }

  // Calculate column widths based on header and data lengths
  function calculateColumnWidths() {
    return headers.map((header, colIndex) => {
      const headerWidth = header.length + 1; // +1 for `~` in tribble
      const maxDataWidth = Math.max(
        ...data.map((row) => formatValue(row[colIndex], colIndex).length)
      );
      return Math.max(headerWidth, maxDataWidth);
    });
  }

  // Pads a value to the target width
  function padToWidth(value, width) {
    return value + " ".repeat(width - value.length);
  }

  // Generate code based on selected framework
  if (framework === "base") {
    code = `data.frame(\n`;
    headers.forEach((header, i) => {
      const values = data.map((row) => formatValue(row[i], i)).join(", ");
      code += `  ${header} = c(${values})${
        i < headers.length - 1 ? ",\n" : "\n"
      }`;
    });
    code += `)`;
  } else if (framework === "tibble") {
    code = `tibble::tibble(\n`;
    headers.forEach((header, i) => {
      const values = data.map((row) => formatValue(row[i], i)).join(", ");
      code += `  ${header} = c(${values})${
        i < headers.length - 1 ? ",\n" : "\n"
      }`;
    });
    code += `)`;
  } else if (framework === "tribble") {
    const colWidths = calculateColumnWidths();
    code = `tibble::tribble(\n`;

    // Column headers with padding
    code +=
      "  " +
      headers
        // Increment by 1 to account for `,`
        .map((header, i) => padToWidth(`~${header},`, colWidths[i] + 1))
        .join(" ") +
      "\n";

    // Data rows with padding
    data.forEach((row) => {
      const rowValues = row
        .map((value, i) =>
          // Increment by 1 to account for `,`
          padToWidth(`${formatValue(value, i)},`, colWidths[i] + 1)
        )
        .join(" ");
      code += `  ${rowValues}\n`;
    });

    // Remove trailing comma and close parentheses
    code = code.trimEnd().slice(0, -1) + `\n)`;
  } else if (framework === "data.table") {
    code = `data.table::data.table(\n`;
    headers.forEach((header, i) => {
      const values = data.map((row) => formatValue(row[i], i)).join(", ");
      code += `  ${header} = c(${values})${
        i < headers.length - 1 ? ",\n" : "\n"
      }`;
    });
    code += `)`;
  } else if (framework === "polars") {
    code = `polars::pl$DataFrame(\n`;
    headers.forEach((header, i) => {
      const values = data.map((row) => formatValue(row[i], i)).join(", ");
      code += `  ${header} = c(${values})${
        i < headers.length - 1 ? ",\n" : "\n"
      }`;
    });
    code += `)`;
  }

  return code;
}

module.exports = {
  clipboardToRDataFrame,
};
