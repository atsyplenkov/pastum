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
    formatted = "x" + formatted;
  }

  return formatted;
}

/**
 * FIXME: This function is not used yet.
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
    // If the majority of values in a column are non-numeric,
    // assume whole column is string
    columnCounts.forEach((counts, colIndex) => {
      if (counts.nonNumeric > 0) {
        columnTypes[colIndex] = "string";
      }
    });

    // Check if all values in a numeric column are integer
    columnTypes.forEach((type, colIndex) => {
      if (type === "numeric") {
        const values = data.map((row) => row[colIndex]).filter(value => value !== "");
        const allIntegers = values.every((value) => utils.isInt(value));
        if (allIntegers) {
          columnTypes[colIndex] = "integer";
        }
      }
    });
    
    // Check if all values in a string column are boolean
    columnTypes.forEach((type, colIndex) => {
      if (type === "string") {
        const values = data.map((row) => row[colIndex]).filter(value => value !== "");
        const allBool = values.every((value) => utils.isBool(value));
        if (allBool) {
          columnTypes[colIndex] = "boolean";
        }
      }
    });

    // Step 6: Convert data to appropriate types
    const convertedData = data.map((row) =>
      row.map((value, colIndex) =>
        columnTypes[colIndex] !== "string" &&
        columnTypes[colIndex] !== "boolean"
          ? utils.convertValue(value)
          : value
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
  const rlen = rows.length;
  const len2 = rlen - 2;

  // Delimiters: TAB (spreadsheets, IDEs), comma (CSV), semicolon (CSV), pipe (TSV)
  // or by spaces (fixed width)
  const patterns = [ '\\t|\\s\\t', ',', ';', '\\|', '\\s+' ];
  let results = [];
  let columns = [];
  // Finds the best pattern to split the table
  for (let i = 0; i < patterns.length; i++) {
    let pattern = patterns[i];
    let regex = new RegExp(pattern, 'gm');
    let matrix = rows.map((row) => row.split(regex));
    let cols = getNumSplitRows(matrix, i);
    // Check if the pattern perfectly split all rows with same number of columns
    if ((cols[0] > 1) && (cols[0] >= len2) && cols[1] >= rlen) {
      return matrix;
    }
    results[i] = matrix;
    columns[i] = cols;
  }
  // Choose the pattern that best splits the table
  const sorted = columns.sort(sortByBestRowSplit);
  const best = sorted[0][2];
  const res = results[best];
  // Append empty cells to make the table rectangular and avoid errors while converting
  const maxCols = getMaxCols(res);;
  const normalized = res.map((row) => {
    if (row.length < maxCols) {
      const diff = maxCols - row.length;
      return row.concat(new Array(diff).fill(""));
    }
    return row;
  });
  return normalized;
}

function sortByBestRowSplit(a, b) {
  let res = b[0] - a[0]; // More rows with same number of columns (DESC)
  if (res == 0) {
    res = b[1] - a[1]; // More rows with columns split by the pattern (DESC)
    if (res == 0) {
      res = a[2] - b[2]; // Pattern order (ASC) gives TAB
    }
  }
  return res
}

function getMaxCols(matrix) {
  let maxCols = 0;
  let numRows = matrix.length;
  for (let i = 0; i < numRows; i++) {
    let cols = matrix[i].length;
    if (cols > maxCols) {
      maxCols = cols;
    }
  }
  return maxCols;
}

function getNumSplitRows(matrix, index) {
  let numRowSplit = 0;
  let numColsEqual = -1;
  let numCols = -1;
  let numRows = matrix.length;
  for (let i = 0; i < numRows; i++) {
    let cols = matrix[i].length;
    if (cols > 1) {
      numRowSplit += 1;
      if (numCols <= 0) {
        numCols = cols;
      } else if (cols == numCols) {
        numColsEqual += 1;
      }
    }
  }
  return [numColsEqual, numRowSplit, index];
}

module.exports = {
  parseClipboard,
};
