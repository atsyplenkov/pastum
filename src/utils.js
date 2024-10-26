function isInt(value) {
  // Normalize the string by removing thousands separators
  const normalized = value.replace(/,/g, "").replace(/\./g, ".");
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
  const normalized = value.replace(/,/g, "").replace(/\./g, ".");

  return (
    !isNaN(normalized) &&
    !isNaN(parseFloat(normalized)) &&
    normalized.trim() !== "" &&
    !/^0\d/.test(normalized)
  ); // Reject numbers with leading zeros
}

function cleanDataValue(value) {
  return value.trim().replace(/\u00A0/g, " ");
}

function convertValue(value) {
  if (isNumeric(value)) {
    let float = parseFloat(value.replace(/,/g, ""));
    return float;
  } else if (isInt(value)) {
    return parseInt(value.replace(/,/g, ""));
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
};
