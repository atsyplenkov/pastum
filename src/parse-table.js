// Code here was inspired by:
// https://web-apps.thecoatlessprofessor.com/data/html-table-to-dataframe-tool.html
const { JSDOM } = require('jsdom');
const vscode = require('vscode');

/**
 * Parses the clipboard content into a structured table.
 * If the clipboard content does not contain a valid table, shows an error message.
 * Otherwise, formats the table headers according to R language conventions and
 * prepares the table data for code generation (into a R dataframe).
 * @param {string} clipboardContent - Raw content of the clipboard
 * @returns {Object} Processed table data with headers, data, and column types
 */
function parseClipboard(clipboardContent) {
    let parsedTableData = null;

    parsedTableData = parseTable(clipboardContent);

    // Format headers according to R language conventions
    const formattedHeaders = parsedTableData.headers.map(header =>
        formatVariableName(header, "r")
    );

    // Prepare formatted data for code generation
    const formattedData = {
        headers: formattedHeaders,
        data: parsedTableData.data,
        columnTypes: parsedTableData.columnTypes
    };

    if (!parsedTableData) {
        vscode.window.showErrorMessage("No valid table found in the clipboard.");
        return;
    }

    return formattedData;
}

/**
 * Formats column names to be valid variable names in different programming languages.
 * Handles specific naming conventions and restrictions for R, Python, and Julia.
 * 
 * Transformation steps:
 * 1. Normalizes spaces (removes non-breaking spaces)
 * 2. Removes special characters
 * 3. Converts spaces to appropriate separator
 * 4. Ensures valid identifier format for each language
 * 
 * Language-specific rules:
 * - R: Uses dots as separators, must start with letter or dot
 * - Python: Uses snake_case, must start with letter or underscore
 * - Julia: Uses snake_case (ASCII only), must start with letter or underscore
 * 
 * @param {string} name - The original column name to be formatted
 * @param {string} language - Target programming language ('r', 'python', or 'julia')
 * @returns {string} A valid variable name for the specified language
 */
function formatVariableName(name, language) {
    // Normalize and clean the input string
    let formatted = name.trim()
        .replace(/\u00A0/g, ' ')          // Replace non-breaking spaces with regular spaces
        .replace(/[^a-zA-Z0-9_\s]/g, '')  // Remove all special characters except spaces
        .replace(/\s+/g, '_')             // Convert spaces to underscores
        .replace(/^(\d)/, '_$1');         // Prefix numbers at start with underscore

    if (language === 'r') {
        // R-specific formatting
        formatted = formatted.replace(/_/g, '.');  // Use dots instead of underscores
        // Ensure valid R identifier (must start with letter or dot)
        if (!/^[a-zA-Z.]/.test(formatted)) {
            formatted = 'x.' + formatted;
        }
    } else if (language === 'python') {
        // Python-specific formatting (PEP 8 compliant)
        formatted = formatted.toLowerCase();  // Convert to lowercase for snake_case
        // Ensure valid Python identifier (must start with letter or underscore)
        if (!/^[a-z_]/.test(formatted)) {
            formatted = '_' + formatted;
        }
    } else if (language === 'julia') {
        // Julia-specific formatting
        formatted = formatted.toLowerCase();  // Convert to lowercase for consistency
        // Ensure valid Julia identifier (must start with letter or underscore)
        if (!/^[a-z_]/.test(formatted)) {
            formatted = '_' + formatted;
        }
    }

    return formatted;
}


/**
 * Converts a string value to its appropriate type (number or string).
 * Used for automatic type detection and conversion of table cell values.
 * 
 * @param {string} value - The value to convert
 * @returns {number|string} Converted number if numeric, original string otherwise
 */
function convertValue(value) {
    if (isNumeric(value)) {
        return parseFloat(value.replace(/,/g, ''));
    }
    return value;
}

/**
 * Determines if a string value represents a valid number.
 * Handles various number formats including:
 * - Thousands separators (,)
 * - Decimal points (.)
 * - Negative numbers
 * - Scientific notation
 * 
 * Special cases:
 * - Rejects strings starting with '0' followed by digits (e.g., '01234')
 * - Rejects empty strings or whitespace-only strings
 * 
 * @param {string} value - The string to test for numeric format
 * @returns {boolean} True if the string represents a valid number
 */
function isNumeric(value) {
    // Normalize the string by removing thousands separators
    const normalized = value.replace(/,/g, '').replace(/\./g, '.');
    
    return !isNaN(normalized) && 
           !isNaN(parseFloat(normalized)) && 
           normalized.trim() !== '' &&
           !/^0\d/.test(normalized); // Reject numbers with leading zeros
}

/**
 * Cleans data values by removing leading/trailing whitespace and normalizing spaces.
 * Specifically handles non-breaking spaces (ASCII 160) by converting them to regular spaces.
 * 
 * @param {string} value - The data value to clean
 * @returns {string} The cleaned data value
 */
function cleanDataValue(value) {
    return value.trim().replace(/\u00A0/g, ' ');
}

/**
 * Checks if a table row contains only empty cells.
 * A cell is considered empty if it's an empty string or contains only whitespace.
 * 
 * @param {Array} row - Array of cell values to check
 * @returns {boolean} True if all cells in the row are empty
 */
function isRowEmpty(row) {
    return row.every(cell => cell === '' || cell.trim() === '');
}

/**
 * Extracts table HTML from a potentially larger HTML string.
 * Uses multiple strategies to find and extract valid table markup.
 * 
 * @param {string} html - Raw HTML string that may contain a table
 * @returns {string|null} Extracted table HTML or null if no table found
 */
function extractTable(html) {
    // Strategy 1: Direct regex match for complete table tags
    const tableMatch = html.match(/<table[\s\S]*?<\/table>/i);
    if (tableMatch) {
        return tableMatch[0];
    }

    // Strategy 2: Parse and extract using jsdom (instead of DOMParser)
    try {
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        const table = document.querySelector('table');
        if (table) {
            return table.outerHTML;
        }
    } catch (e) {
        console.error('Error parsing HTML:', e);
    }
    
    return null;
}


/**
 * Expands an HTML table into a normalized matrix, handling colspan and rowspan.
 * This function converts a complex HTML table with merged cells into a regular
 * matrix where each cell contains exactly one value.
 * 
 * Process:
 * 1. Creates an empty matrix based on table dimensions
 * 2. Processes each cell, expanding merged cells (colspan/rowspan)
 * 3. Normalizes the matrix to ensure consistent dimensions
 * 4. Filters out empty rows while preserving headers
 * 
 * @param {HTMLTableElement} table - The HTML table element to process
 * @returns {Array<Array<string>>} Normalized matrix of table data
 */
function expandTable(table) {
    // Extract all table rows
    const rows = Array.from(table.querySelectorAll('tr'));
    
    // Initialize result matrix
    const matrix = [];
    let maxCols = 0;
    rows.forEach(() => matrix.push([]));
    
    /**
     * Finds the next available cell position in a row
     * Handles cases where previous cells have been expanded due to colspan
     * 
     * @param {number} row - Row index to search
     * @param {number} startCol - Starting column index
     * @returns {number} Next available column index
     */
    function findNextEmptyCell(row, startCol) {
        let col = startCol;
        while (matrix[row][col] !== undefined) {
            col++;
        }
        return col;
    }
    
    // Process each row and expand merged cells
    rows.forEach((row, rowIndex) => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        let colIndex = 0;
        
        cells.forEach(cell => {
            // Extract span attributes
            const colspan = parseInt(cell.getAttribute('colspan')) || 1;
            const rowspan = parseInt(cell.getAttribute('rowspan')) || 1;
            
            // Find next available position considering previous merged cells
            colIndex = findNextEmptyCell(rowIndex, colIndex);
            
            // Get and clean cell value
            const value = cleanDataValue(cell.textContent);
            
            // Expand cell across its span range
            for (let i = 0; i < rowspan; i++) {
                for (let j = 0; j < colspan; j++) {
                    const currentRow = rowIndex + i;
                    const currentCol = colIndex + j;
                    matrix[currentRow][currentCol] = value;
                }
            }
            
            // Track maximum columns for normalization
            maxCols = Math.max(maxCols, colIndex + colspan);
            colIndex += colspan;
        });
    });
    
    // Normalize matrix dimensions and remove empty rows
    return matrix
        .map(row => {
            // Ensure consistent column count
            while (row.length < maxCols) {
                row.push('');
            }
            return row;
        })
        .filter((row, index) => {
            // Preserve header row and remove empty data rows
            return index === 0 || !isRowEmpty(row);
        });
}


/**
 * Parses HTML or text containing a table into structured data.
 * Handles the complete table processing pipeline from HTML or text to formatted data.
 * 
 * Processing steps:
 * 1. Extracts and validates table HTML or plain text
 * 2. Expands merged cells into normalized matrix (for HTML)
 * 3. Processes headers and data rows
 * 4. Determines column types
 * 5. Converts data to appropriate types
 * 
 * @param {string} inputString - Raw HTML or text containing a table
 * @returns {Object} Processed table data with headers, data, and column types
 * @throws {Error} If table structure is invalid or missing required elements
 */
function parseTable(inputString) {
    try {
        let doc;
        let table;
        let expandedMatrix;

        // Step 1: Check if input contains HTML
        if (inputString.includes('<table')) {
            // Handle HTML table
            const extractedTable = extractTable(inputString);
            if (extractedTable) {
                const dom = new JSDOM(extractedTable);
                doc = dom.window.document;
                table = doc.querySelector('table');
            } else {
                const dom = new JSDOM(inputString);
                doc = dom.window.document;
                table = doc.querySelector('table');
            }

            if (!table) {
                throw new Error('No table found in the HTML content');
            }

            // Step 2: Process HTML table into normalized matrix
            expandedMatrix = expandTable(table);
        } else {
            // Handle plain text table (assuming tab or comma separated values)
            expandedMatrix = parseTextTable(inputString);
        }

        // Step 3: Extract and validate headers
        const headers = expandedMatrix[0];
        if (headers.length === 0) {
            throw new Error('No headers found in the table');
        }

        // Step 4: Extract and validate data rows
        const data = expandedMatrix.slice(1);
        if (data.length === 0) {
            throw new Error('No data rows found in the table');
        }

        // Step 5: Determine column types through data analysis
        const columnTypes = new Array(headers.length).fill('numeric');
        data.forEach(row => {
            row.forEach((value, colIndex) => {
                if (columnTypes[colIndex] === 'numeric' && !isNumeric(value)) {
                    columnTypes[colIndex] = 'string';
                }
            });
        });

        // Step 6: Convert data to appropriate types
        const convertedData = data.map(row =>
            row.map((value, colIndex) =>
                columnTypes[colIndex] === 'numeric' ? convertValue(value) : value
            )
        );

        return { headers, data: convertedData, columnTypes };
    } catch (error) {
        throw new Error('Invalid table format: ' + error.message);
    }
}

/**
 * Parses a plain text table (assumes comma, tab, or space delimited values)
 * into a structured matrix.
 * 
 * @param {string} textString - Raw text containing a table
 * @returns {Array[]} Matrix representation of the table
 */
function parseTextTable(textString) {
    // Split the input by line breaks for rows
    const rows = textString.trim().split(/\r?\n/);

    // Split each row by common delimiters (comma, tab, or spaces)
    const matrix = rows.map(row => row.split(/\t/).filter(cell => cell.trim() !== ''));

    return matrix;
}

module.exports = {
    parseClipboard
}