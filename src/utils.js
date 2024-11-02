const vscode = require("vscode");

function normalizeValue(value, decimalPoints = null) {
  const config = vscode.workspace.getConfiguration("pastum");
  decimalPoints = config.get("decimalPoint");

  if (decimalPoints === "10,000.00") {
    return value.replace(/,/g, "");
  } else if (decimalPoints === "10 000.00") {
    return value.replace(/ /g, "");
  } else if (decimalPoints === "10 000,00") {
    return value.replace(/ /g, "").replace(/,/g, ".");
  } else if (decimalPoints === "10.000,00") {
    return value.replace(/\./g, "").replace(/,/g, ".");
  } else if (decimalPoints === null) {
    // return error
    vscode.window.showErrorMessage("No default decimalPoint selected");
  }
}

function isInt(value) {
  // Normalize the string by removing thousands separators
  const normalized = normalizeValue(value);
  // Parse value as a float
  const float = parseFloat(normalized);
  // Calculate the residual after removing the decimal point
  let residual = Math.abs(float % 1);

  return (
    !isNaN(float) &&
    !residual > 0 &&
    normalized.trim() !== "" &&
    !/^0\d/.test(normalized)
  );
}

function isNumeric(value) {
  // Normalize the string by removing thousands separators
  const normalized = normalizeValue(value);

  return (
    !isNaN(normalized) &&
    !isNaN(parseFloat(normalized)) &&
    normalized.trim() !== "" &&
    !/^0\d/.test(normalized)
  ); // Reject numbers with leading zeros
}

function isBool(value) {
  const normalized = value.toLowerCase().trim();
  let boolCheck = normalized === "true" || normalized === "false";
  return boolCheck && normalized !== "" && !isNaN(normalized);
}

function normalizeBool(value, language) {
  const normalized = value.toLowerCase().trim();
  switch (language) {
    case "python":
      if (normalized === "true") {
        return "True";
      } else if (normalized === "false") {
        return "False";
      }
      break;
    case "r":
      if (normalized === "true") {
        return "TRUE";
      } else if (normalized === "false") {
        return "FALSE";
      }
      break;
    case "julia":
      if (normalized === "true") {
        return "true";
      } else if (normalized === "false") {
        return "false";
      }
      break;
    case "javascript":
      if (normalized === "true") {
        return "true";
      } else if (normalized === "false") {
        return "false";
      }
      break;
    default:
      return value;
  }
}

function cleanDataValue(value) {
  return value.trim().replace(/\u00A0/g, " ");
}

function convertValue(value) {
  if (isNumeric(value)) {
    let float = parseFloat(normalizeValue(value));
    return float;
  } else if (isInt(value)) {
    return parseInt(normalizeValue(value));
  }
  return value;
}

function isRowEmpty(row) {
  return row.every((cell) => cell === "" || cell.trim() === "");
}

function addTrailingZeroes(value) {
  return value.toString().indexOf(".") === -1 ? value + ".0" : value;
}

module.exports = {
  isInt,
  cleanDataValue,
  convertValue,
  isNumeric,
  isRowEmpty,
  addTrailingZeroes,
  normalizeValue,
  normalizeBool,
  isBool,
};
