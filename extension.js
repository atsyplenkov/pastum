const vscode = require("vscode");
const r = require("./src/paste-r.js");
const py = require("./src/paste-python.js");
const jl = require("./src/paste-julia.js");
const def = require("./src/paste-default.js");

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "pastum.Rdataframe",
      r.clipboardToRDataFrame
    ),
    vscode.commands.registerCommand(
      "pastum.Pydataframe",
      py.clipboardToPyDataFrame
    ),
    vscode.commands.registerCommand(
      "pastum.Jldataframe",
      jl.clipboardToJuliaDataFrame
    ),
    vscode.commands.registerCommand("pastum.Defaultdataframe", def.pasteDefault)
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
