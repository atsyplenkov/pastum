const vscode = require("vscode");
const { parseClipboard } = require("./parse-table");
const { addTrailingZeroes, normalizeBool } = require("./utils");

async function clipboardToMarkdown(alignment = null) {
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

    // 3: Ask the user which alignment they want to use
    if (alignment === null) {
      alignment = await vscode.window.showQuickPick(
        ["columnar ↔️", "compact ↩️"],
        {
          placeHolder: "Select the alignment for creating the Markdown table",
        }
      );
    }
    alignment = alignment.split(" ")[0];

    if (!alignment) {
      vscode.window.showErrorMessage("No alignment selected.");
      return;
    }

    // 4: Generate the Markdown code using the selected alignment
    const pyCode = createMarkdown(formattedData, alignment);

    if (!pyCode) {
      vscode.window.showErrorMessage("Failed to generate Markdown code.");
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
 * Generates a markdown table.
 * Supports columnar and compact alignments.
 */
function createMarkdown(tableData, alignment) {
  const { headers, data, columnTypes } = tableData;
  let code = "\n";

  /**
   * Formats a value according to its column type for R syntax
   * @param {any} value - The value to format
   * @param {number} colIndex - Column index for type lookup
   * @returns {string} Formatted value
   */
  function formatValue(value, colIndex) {
    if (value === "") {
      return "";
    } else if (columnTypes[colIndex] === "string") {
      return `${value}`;
    } else if (columnTypes[colIndex] === "numeric") {
      return addTrailingZeroes(value);
    } else if (columnTypes[colIndex] === "boolean") {
      return normalizeBool(value, "javascript");
    } else if (columnTypes[colIndex] === "integer") {
      return value;
    } else {
      return `${value}`;
    }
  }

  // Calculate column widths based on header and data lengths
  function calculateColumnWidths(columns, rows) {
    return columns.map((header, colIndex) => {
      const headerWidth = header.length;
      const maxDataWidth = Math.max(
        ...rows.map(
          (row) => formatValue(row[colIndex], colIndex).toString().length
        )
      );
      return Math.max(headerWidth, maxDataWidth);
    });
  }

  function getAlign(colIndex) {
    let colt = columnTypes[colIndex];
    return (colt === "numeric") || (colt === "integer");
  }


  // Pads a value to the target width
  function padToWidth(value, width, padding, before) {
    let wide = width - value.toString().length;
    let fill = padding.repeat(wide);
    return before ? fill + value : value + fill;
  }

  if (alignment === "compact") {
    // Column headers without padding
    let vals = headers.map((header, i) => header).join(" | ");
    code = `| ${vals} |\n`;
    // Column headers/rows separators without padding
    vals = headers.map((header, i) => "-").join("-|-");
    code += `|-${vals}-|\n`;

    // Data rows without padding
    data.forEach((row) => {
      const rowValues = row
        .map((value, i) => ` ${formatValue(value, i)} `).join(" | ");
      code += `| ${rowValues} |\n`;
    });

  } else if (alignment === "columnar") {
    // Calculate column widths based on header and data lengths
    const colWidths = calculateColumnWidths(headers, data);
    // Column headers with padding
    let vals = headers
      .map((header, i) => padToWidth(header, colWidths[i], " ", false))
      .join(" | ");
    code = `| ${vals} |\n`;
    // Column headers/rows separators with padding
    vals = headers
      .map((header, i) => padToWidth("-", colWidths[i], "-", false))
      .join("-|-");
    code += `|-${vals}-|\n`;

    // Data rows with padding
    data.forEach((row) => {
      const cells = row
        .map((value, i) => padToWidth(
          formatValue(value, i),
          colWidths[i], " ", getAlign(i)
        )).join(" | ");
      code += `| ${cells} |\n`;
    });
  }

  return code + "\n";
}

module.exports = {
  clipboardToMarkdown,
};
