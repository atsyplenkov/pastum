const vscode = require("vscode");
const r = require("./src/paste-r.js");
const py = require("./src/paste-python.js");
const jl = require("./src/paste-julia.js");
const js = require("./src/paste-js.js");
const md = require("./src/paste-markdown.js");
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
    vscode.commands.registerCommand(
      "pastum.JSdataframe",
      js.clipboardToJSDataFrame
    ),
    vscode.commands.registerCommand(
      "pastum.Markdown",
      md.clipboardToMarkdown
    ),
    vscode.commands.registerCommand("pastum.Defaultdataframe", def.pasteDefault)
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
