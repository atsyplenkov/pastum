/**
 * Generates R dataframe objects.
 * Supports base R, tidyverse, data.table, and R polars frameworks.
 * 
 * Modified from: https://web-apps.thecoatlessprofessor.com/data/html-table-to-dataframe-tool.html
 * 
 * Framework-specific details:
 * - base R: Uses data.frame() constructor, no package dependencies
 * - tidyverse: Uses tibble() constructor, requires tidyverse package
 * - data.table: Uses data.table() constructor, requires data.table package
 * - polars: Uses pl$DataFrame() constructor, requires polars package
 * 
 * @param {Object} tableData - Processed table data
 * @param {Array<string>} tableData.headers - Column names
 * @param {Array<Array<any>>} tableData.data - Table values
 * @param {Array<string>} tableData.columnTypes - Column types ('numeric' or 'string')
 * @param {string} framework - R framework to use ('base', 'tidyverse', 'data.table', 'polars')
 * @returns {string} Generated R code
 * 
 */
function createRDataFrame(tableData, framework) {
  const { headers, data, columnTypes } = tableData;
  let code = '';

  /**
   * Formats a value according to its column type for R syntax
   * @param {any} value - The value to format
   * @param {number} colIndex - Column index for type lookup
   * @returns {string} Formatted value
   */
  function formatValue(value, colIndex) {
      if (columnTypes[colIndex] === 'numeric') {
          return value;
      }
      return `"${value}"`;
  }

  // Generate code based on selected framework
  if (framework === 'base') {
      code = `data.frame(\n`;
      headers.forEach((header, i) => {
          const values = data.map(row => formatValue(row[i], i)).join(', ');
          code += `  ${header} = c(${values})${i < headers.length - 1 ? ',\n' : '\n'}`;
      });
      code += `)`;
  } else if (framework === 'tidyverse') {
      code = `tibble::tibble(\n`;
      headers.forEach((header, i) => {
          const values = data.map(row => formatValue(row[i], i)).join(', ');
          code += `  ${header} = c(${values})${i < headers.length - 1 ? ',\n' : '\n'}`;
      });
      code += `)`;
  } else if (framework === 'data.table') {
      code = `data.table::data.table(\n`;
      headers.forEach((header, i) => {
          const values = data.map(row => formatValue(row[i], i)).join(', ');
          code += `  ${header} = c(${values})${i < headers.length - 1 ? ',\n' : '\n'}`;
      });
      code += `)`;
  } else if (framework === 'polars') {
      code = `polars::pl$DataFrame(\n`;
      headers.forEach((header, i) => {
          const values = data.map(row => formatValue(row[i], i)).join(', ');
          code += `  ${header} = c(${values})${i < headers.length - 1 ? ',\n' : '\n'}`;
      });
      code += `)`;
  }

  return code;
}

module.exports = {
    createRDataFrame
}