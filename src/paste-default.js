const vscode = require("vscode");
const r = require("./paste-r.js");
const py = require("./paste-python.js");
const jl = require("./paste-julia.js");

function pasteDefault() {
  // Retrieve the default language-framework pair
  const config = vscode.workspace.getConfiguration("pastum");
  langframe = config.get("defaultDataframe");

  // Switch
  switch (langframe) {
    case "R base":
      r.clipboardToRDataFrame("base");
      break;
    case "R tibble":
      r.clipboardToRDataFrame("tibble");
      break;
    case "R data.table":
      r.clipboardToRDataFrame("data.table");
      break;
    case "R polars":
      r.clipboardToRDataFrame("polars");
      break;
    case "Py pandas":
      py.clipboardToPyDataFrame("pandas");
      break;
    case "Py polars":
      py.clipboardToPyDataFrame("polars");
      break;
    case "Py datatable":
      py.clipboardToPyDataFrame("datatable");
      break;
    case "Jl DataFrame":
      jl.clipboardToJuliaDataFrame();
      break;
    default:
      vscode.window.showErrorMessage("No default framework selected");
  }

  return;
}

module.exports = {
  pasteDefault,
};
