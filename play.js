const utils = require("./src/utils.js");

function convertValue(value) {
  if (utils.isNumeric(value)) {
    let float = parseFloat(value.replace(/,/g, ""));
    return float;
  } else if (utils.isInt(value)) {
    return parseInt(value.replace(/,/g, ""));
  }
  return value;
}

function addTrailingZeroes(value) {
  return value.toString().indexOf(".") === -1 ? value + ".0" : value;
}

function addTrailingL(value) {
  return value + "L";
}


console.log(addTrailingL(123));
console.log("Float");
console.log(addTrailingZeroes(123.2));
console.log(addTrailingZeroes(123));
console.log(convertValue("123,34,23.32"));
console.log(convertValue("-1233423.212"));
console.log("Int");
console.log(convertValue("123,34,2332"));
console.log(convertValue("-123,342,3"));
