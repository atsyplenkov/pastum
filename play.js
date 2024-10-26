const utils = require("./src/utils.js");

function formatVariableName(name, convention = null) {
  let formatted = name
    .trim()
    .replace(/\u00A0/g, " ")
    .replace(/[^a-zA-Z0-9_\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/^(\d)/, "_$1");

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

  if (!/^[a-zA-Z]/.test(formatted)) {
    formatted = "x." + formatted;
  }

  return formatted;
}

console.log(formatVariableName("City of Moscow", "snake_case"));
console.log(formatVariableName("City of Moscow", "PascalCase"));
console.log(formatVariableName("City of Moscow", "camelCase"));
