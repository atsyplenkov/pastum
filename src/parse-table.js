// Code here was inspired by:
// https://web-apps.thecoatlessprofessor.com/data/html-table-to-dataframe-tool.html
const vscode = require("vscode");
const utils = require("./utils.js");

/**
 * Parses the clipboard content into a structured table.
 */
function parseClipboard(clipboardContent) {
  let parsedTableData = null;

  parsedTableData = parseTable(clipboardContent);

  // Format headers according to R language conventions
  const formattedHeaders = parsedTableData.headers.map((header) =>
    formatVariableName(header, null)
  );

  // Prepare formatted data for code generation
  const formattedData = {
    headers: formattedHeaders,
    data: parsedTableData.data,
    columnTypes: parsedTableData.columnTypes,
  };

  if (!parsedTableData) {
    vscode.window.showErrorMessage("No valid table found in the clipboard.");
    return;
  }

  return formattedData;
}

/**
 * Formats column names to be valid variable names in different programming languages.
 * Handles specific naming conventions and restrictions for R.
 */
function formatVariableName(name, convention = null) {
  // Retrieve the setting if convention is not provided
  if (!convention) {
    const config = vscode.workspace.getConfiguration("pastum");
    convention = config.get("defaultConvention");
  }

  // Normalize and clean the input string
  let formatted = name
    .trim()
    .replace(/\u00A0/g, " ") // Replace non-breaking spaces with regular spaces
    .replace(/[^a-zA-Z0-9_\s\u0400-\u04FF]/g, "") // Remove all special characters except spaces and cyrillic letters
    .replace(/\s+/g, "_") // Convert spaces to underscores
    .replace(/^(\d)/, "_$1"); // Prefix numbers at start with underscore

  switch (convention) {
    case "snake_case":
      const split = formatted.split("_");
      formatted = split
        .filter((word) => word !== "")
        .map((word) => word.charAt(0).toLowerCase() + word.slice(1))
        .join("_");
      break;
    case "PascalCase":
      formatted = formatted
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
      break;
    case "camelCase":
      formatted = formatted
        .split("_")
        .map((word) => word.charAt(0).toLowerCase() + word.slice(1))
        .map((word, index) =>
          index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join("");
      break;
  }

  if (!/^[a-zA-Z_\u0400-\u04FF]/.test(formatted)) {
    formatted = "x." + formatted;
  }

  return formatted;
}

/**
 * Expands a plain text table into a normalized matrix.
 * This function ensures each row has consistent columns and removes any empty rows.
 */
function expandTextTable(table) {
  // Initialize matrix
  const matrix = [];

  // Determine the maximum number of columns in the table
  let maxCols = table.reduce((max, row) => Math.max(max, row.length), 0);

  // Normalize each row
  table.forEach((row, rowIndex) => {
    // Ensure consistent column count by adding empty cells to shorter rows
    while (row.length < maxCols) {
      row.push("");
    }

    // Filter out empty rows, but preserve the header row (first row)
    if (rowIndex === 0 || !utils.isRowEmpty(row)) {
      matrix.push(row);
    }
  });

  return matrix;
}

/**
 * Parses text containing a table into structured data.
 * Handles the complete table processing pipeline from text to formatted data.
 */
function parseTable(inputString) {
  try {
    let expandedMatrix;

    // Handle plain text table (assuming tab separated values)
    expandedMatrix = parseTextTable(inputString);

    // Step 3: Extract and validate headers
    const headers = expandedMatrix[0];
    if (headers.length === 0) {
      throw new Error("No headers found in the table");
    }

    // Step 4: Extract and validate data rows
    const data = expandedMatrix.slice(1);
    if (data.length === 0) {
      throw new Error("No data rows found in the table");
    }
    // Step 5: Determine column types through data analysis
    const columnTypes = new Array(headers.length).fill("numeric");
    const columnCounts = new Array(headers.length)
      .fill(0)
      .map(() => ({ numeric: 0, nonNumeric: 0 }));
    // Count numeric and non-numeric values in
    // each column
    data.forEach((row) => {
      row.forEach((value, colIndex) => {
        if (value === "") {
          // Ignore empty values
          return;
        }
        if (utils.isNumeric(value)) {
          columnCounts[colIndex].numeric++;
        } else {
          columnCounts[colIndex].nonNumeric++;
        }
      });
    });
    // If the majority of columns are non-numeric,
    // assume all columns are strings
    columnCounts.forEach((counts, colIndex) => {
      if (counts.nonNumeric >= 1) {
        columnTypes[colIndex] = "string";
      }
    });

    // Check if all values in a numeric colum are integer
    columnTypes.forEach((type, colIndex) => {
      if (type === "numeric") {
        const values = data.map((row) => row[colIndex]);
        const allIntegers = values.every((value) => utils.isInt(value));
        if (allIntegers) {
          columnTypes[colIndex] = "integer";
        }
      }
    });

    // Step 6: Convert data to appropriate types
    const convertedData = data.map((row) =>
      row.map((value, colIndex) =>
        columnTypes[colIndex] != "string" ? utils.convertValue(value) : value
      )
    );

    return { headers, data: convertedData, columnTypes };
  } catch (error) {
    throw new Error("Invalid table format: " + error.message);
  }
}

/**
 * Parses a plain text table (assumes comma, tab, or space delimited values)
 * into a structured matrix.
 */
function parseTextTable(textString) {
  // Split the input by line breaks for rows
  const rows = textString.trim().split(/\r?\n/);

  // Split each row by tab delimiters
  const matrix = rows.map((row) => row.split(/\t/));

  return matrix;
}

module.exports = {
  parseClipboard,
};
