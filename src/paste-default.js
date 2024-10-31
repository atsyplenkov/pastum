const vscode = require("vscode");
const r = require("./paste-r.js");
const py = require("./paste-python.js");
const jl = require("./paste-julia.js");

function pasteDefault() {
  // Get the default dataframe framework
  const config = vscode.workspace.getConfiguration("pastum");
  const frameR = config.get("defaultDataframeR");
  const framePy = config.get("defaultDataframePy");

  // Get the active editor language
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor found.");
    return;
  }

  // Switch to the appropriate framework based on the editor language
  switch (editor.document.languageId) {
    case "r":
      r.clipboardToRDataFrame(frameR);
      break;
    case "python":
      py.clipboardToPyDataFrame(framePy);
      break;
    case "julia":
      jl.clipboardToJuliaDataFrame();
      break;
    default:
      vscode.window.showErrorMessage("No default framework selected");
  }
}

module.exports = {
  pasteDefault,
};
