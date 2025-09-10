const vscode = require("vscode");
const { parseClipboard } = require("./parse-table");
const { addTrailingZeroes, normalizeBool } = require("./utils");

async function clipboardToSql(statement = null) {
  try {
    // 1: Read the clipboard content
    const clipboardContent = await vscode.env.clipboard.readText();

    if (!clipboardContent) {
      vscode.window.showErrorMessage(
        "Clipboard is empty or contains unsupported content."
      );
      return;
    }

    // 2: Try to extract the table from clipboard content
    let formattedData = null;
    formattedData = parseClipboard(clipboardContent);

    // 3: Ask the user which statement they want to use
    if (statement === null) {
      const stlist = [
        "SELECT FROM VALUES",
        "SELECT UNION ALL",
        "INSERT INTO VALUES",
        "INSERT INTO SELECT VALUES",
        "INSERT INTO",
        "DELETE WHERE",
        "CREATE TABLE"
      ];
      statement = await vscode.window.showQuickPick(
        stlist,
        {
          placeHolder: "Select the statement for creating the Sql table",
        }
      );
    }

    if (!statement) {
      vscode.window.showErrorMessage("No statement selected.");
      return;
    }

    // 4: Generate the Sql code using the selected statement
    const sqlCode = createSql(formattedData, statement);

    if (!sqlCode) {
      vscode.window.showErrorMessage("Failed to generate Sql code.");
      return;
    }

    // 5: Insert the generated code into the active editor
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.edit((editBuilder) => {
        editBuilder.insert(editor.selection.active, sqlCode);
      });
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error.message}`);
  }
}

/**
 * Generates a Sql script based on the provided table data.
 */
function createSql(tableData, statement) {

  /**
   * Formats a value according to its column type for SQL syntax
   * @param {any} value - The value to format
   * @param {number} colIndex - Column index for type lookup
   * @returns {string} Formatted value
   */
  function formatValue(value, colIndex) {
    if (value === "") {
      return "NULL";
    } else if (columnTypes[colIndex] === "string") {
      return `'${value}'`;
    } else if (columnTypes[colIndex] === "numeric") {
      return addTrailingZeroes(value);
    } else if (columnTypes[colIndex] === "boolean") {
      return normalizeBool(value, "javascript");
    } else if (columnTypes[colIndex] === "integer") {
      return value;
    } else {
      return `'${value}'`;
    }
  }

  function getSqlTypeFor(colIndex) {
    let colt = columnTypes[colIndex];
    if (colt === "string") {
      return "VARCHAR(100)";
    } else if (colt === "numeric") {
      return "NUMERIC(9,6)";
    } else if (colt === "boolean") {
      return "BOOLEAN";
    } else if (colt === "integer") {
      return "INTEGER";
    } else {
      return "VARCHAR(50)";
    }
  }

  function getRowsAs(rows, cols, template, colstart, colsep, colend, rowsep) {
    let lines = [];
    rows.forEach((row) => {
      const vals = row
        .map(function (value, i) {
          let nam1 = cols[i];
          let val2 = formatValue(value, i);
          let res1 = template.replace("{1}", nam1);
          let res2 = res1.replace("{2}", val2);
          return res2;
        }).join(colsep);
      lines = lines.concat(colstart + vals + colend);
    });
    if (lines.length > 0) {
      return lines.join(rowsep);
    }
    return "";
  }

  // Pads a value to the target width
  function padToWidth(value, width, padding) {
    let wide = width - value.toString().length;
    return value +padding.repeat(wide);
  }

  function getRowsAsTuple(rows, cols) {
    return getRowsAs(rows, cols, "{2}", "  (", ", ", ")", ",\n");
  }

  function getRowsAsUnionAll(rows, cols) {
    return getRowsAs(rows, cols, "{2} AS {1}", "  SELECT", ", ", "", " UNION ALL\n");
  }

  function getColumnsAsTuple(cols) {
    let cols2 = cols ? cols.join(", ") : "";
    return `(${cols2})`;
  }

  function getSqlAsCreateTable(rows, cols) {
    let width = cols.reduce((prev, col) => prev > col.length ? prev : col.length, 0);
    let names = cols.map(function (value, i) {
      let colname = padToWidth(value, width, " ");
      let coltype = getSqlTypeFor(i);
      return `    ${colname} ${coltype}`;
    });
    let fields = names.join(",\n");
    let drop = "-- DROP TABLE IF EXISTS mytable;";
    let sql = `${drop}\n\nCREATE TABLE IF NOT EXISTS mytable (\n${fields}\n);\n\n`;
    return sql;
  }

  function getSqlAsSelectFromValues(rows, cols) {
    let names = getColumnsAsTuple(cols);
    let lines = getRowsAsTuple(rows, cols);
    let sql = `SELECT * FROM (VALUES\n${lines}\n) AS t${names};\n`;
    return sql;
  }

  function getSqlAsSelectUnionAll(rows, cols) {
    let lines = getRowsAsUnionAll(rows, cols);
    let sql = `WITH mytable AS (\n${lines}\n)\nSELECT m.* FROM mytable AS m;\n`;
    return sql;
  }

  function getSqlAsInsertFromSelectValues(rows, cols) {
    let sql = getSqlAsSelectFromValues(rows, cols);
    return `INSERT INTO mytable\n${sql}`;
  }

  function getSqlAsInsertIntoValues(rows, cols) {
    let names = getColumnsAsTuple(cols);
    let lines = getRowsAsTuple(rows, cols);
    let sql = `INSERT INTO mytable\n  ${names}\nVALUES\n${lines};\n`;
    return sql;
  }

  function getSqlAsInsertIntoMultiple(rows, cols) {
    let names = getColumnsAsTuple(cols);
    let pre = `INSERT INTO mytable ${names} VALUES (`;
    let sql = getRowsAs(rows, cols, "{2}", pre, ", ", ");", "\n");
    return sql + "\n";
  }

  function getSqlAsDeleteWhere(rows, cols) {
    let names = getColumnsAsTuple(cols);
    let pre = `DELETE FROM mytable WHERE `;
    let sql = getRowsAs(rows, cols, "{1} = {2}", pre, " AND ", "", ";\n");
    let res = sql.replaceAll("= NULL", "IS NULL") + ";\n\n";
    return res;
  }

  const { headers, data, columnTypes } = tableData;
  switch (statement) {
    case "SELECT FROM VALUES":
      return getSqlAsSelectFromValues(data, headers);
    case "SELECT UNION ALL":
      return getSqlAsSelectUnionAll(data, headers);
    case "INSERT INTO VALUES":
      return getSqlAsInsertIntoValues(data, headers);
    case "INSERT INTO SELECT VALUES":
      return getSqlAsInsertFromSelectValues(data, headers);
    case "INSERT INTO":
      return getSqlAsInsertIntoMultiple(data, headers);
    case "DELETE WHERE":
      return getSqlAsDeleteWhere(data, headers);
    case "CREATE TABLE":
      return getSqlAsCreateTable(data, headers);
  }
  return "";
}

module.exports = {
  clipboardToSql,
};
