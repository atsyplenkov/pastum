# Pastum: paste as ... dataframe

<p align="center">
    <a href="https://pastum.anatolii.nz/">
        <img src="https://img.shields.io/website?url=https%3A%2F%2Fpastum.anatolii.nz&style=flat&labelColor=1e2c2e&color=007ACC&logo=Visual%20Studio%20Code&logoColor=white"></a>
    <a href="https://marketplace.visualstudio.com/items?itemName=atsyplenkov.pastum">
        <img src="https://img.shields.io/visual-studio-marketplace/i/atsyplenkov.pastum?style=flat&labelColor=1e2c2e&color=007ACC&logo=Visual%20Studio%20Code&logoColor=white&label=VS%20Marketplace%20installs"></a>
    <br>
    <a href="https://open-vsx.org/extension/atsyplenkov/pastum">
        <img src="https://img.shields.io/open-vsx/dt/atsyplenkov/pastum?style=flat&labelColor=1e2c2e&color=007ACC&logo=Open%20VSX&logoColor=white&label=Open%20VSX%20downloads"></a>
    <a href="https://github.com/atsyplenkov/pastum/actions/workflows/ci.yml">
        <img src="https://img.shields.io/github/actions/workflow/status/atsyplenkov/pastum/ci.yml?style=flat&labelColor=1e2c2e&color=007ACC&logo=GitHub%20Actions&logoColor=white&label=tests"></a>
    <a href="https://github.com/atsyplenkov/pastum/actions/workflows/publish-extensions.yml">
        <img src="https://img.shields.io/github/actions/workflow/status/atsyplenkov/pastum/publish-extensions.yml?style=flat&labelColor=1e2c2e&color=007ACC&logo=GitHub%20Actions&logoColor=white&label=deploy"></a>
    <br>
    <a href="https://github.com/atsyplenkov/pastum/blob/master/LICENSE.md">
        <img src="https://img.shields.io/github/license/atsyplenkov/pastum?style=flat&labelColor=1e2c2e&color=007ACC&logo=GitHub&logoColor=white"></a>
</p>

`pastum` allows you to quickly transform any text/HTML/CSV table from your clipboard into a dataframe object in your favorite language — R, Python, Julia, JavaScript or Markdown. Almost all popular frameworks are supported; if something is missing, don't hesitate to raise an [issue](https://github.com/atsyplenkov/pastum/issues).

# Example usage

### Text table to polars (Python)

Using the command palette, insert the copied text table as a Python, R, or Julia object. Select the framework on the go. Just press `Ctrl/Cmd+Shift+P`, type `pastum`, and select the preferred option:

![](https://github.com/atsyplenkov/pastum/raw/master/assets/demo-py-polars.gif)

### Text table to tibble (R)

Or you can specify the `pastum.defaultDataframeR`/`pastum.defaultDataframePython` parameter in the VS Code settings and insert the table using the right-click context menu by selecting `Pastum: paste as default dataframe`. The inserted language-framework pair will depend on the editor language *(i.e., you cannot paste a pandas dataframe into an R file using this command)*:

![](https://github.com/atsyplenkov/pastum/raw/master/assets/demo-r-tibble.gif)

# Supported languages and frameworks

- R: `base`, `tribble 🔢`, `tibble ✨`, `data.table 🎩`
- Python: `pandas 🐼`, `polars 🐻`, `datatable 🎩`
- Julia: `DataFrames.jl`
- JavaScript: `base`, `polars 🐻`, `arquero 🏹`, `danfo 🐝`
- Markdown: `columnar ↔️`, `compact ↩️`
- SQL: many options to generate SELECT, INSERT, UPDATE, MERGE, AND CREATE TABLE statements.

`pastum` recognises tables in the following formats: text, HTML, CSV, TSV.

# Try it Yourself

In the table below, the most unfortunate and complex situation is presented. It is a mixture of empty cells, strings, integer and float values. Select, copy and try to paste it into the IDE. The `{pastum}` will recognize all types correctly and fill empty cells with corresponding `NA`/`missing`/`None`/`null` values.

| Integer ID | Strings with missing values | Only float | Int and Float |
|------------|-----------------------------|------------|---------------|
| 1          | Javascript                  | 1.43       | 1             |
| 2          | Rust                        | 123,456.78 | 2             |
| 3          |                             | -45        | 3             |
| 4          | Clojure                     | 123456.78  | 4             |
| 5          | Basic                       | -45.65     | 5.5           |

```r
# paste it as a tribble object in R
tibble::tribble(
  ~IntegerID, ~StringsWithMissingValues, ~OnlyFloat, ~IntAndFloat,
  1L,         "Javascript",              1.43,       1.0,         
  2L,         "Rust",                    123456.78,  2.0,         
  3L,         NA,                        -45.0,      3.0,         
  4L,         "Clojure",                 123456.78,  4.0,         
  5L,         "Basic",                   -45.65,     5.5
)
```

# Installation

The extension is published on both the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=atsyplenkov.pastum) and the [Open VSX Registry](https://open-vsx.org/extension/atsyplenkov/pastum): just click `Install` there or manually install it with:

1) Start VS Code (or any other Code OSS-based IDE, such as [Positron](https://github.com/posit-dev/positron), Cursor, etc.).

2) Inside VS Code, go to the extensions view either by executing the `View: Show Extensions` command (click `View -> Command Palette`) or by clicking on the extension icon on the left side of the VS Code window.

3) In the extensions view, simply search for the term `pastum` in the marketplace search box, then select the extension named `Pastum` and click the install button.

Alternatively, you can install the latest version from the [Releases](https://github.com/atsyplenkov/pastum/releases/) page. Download the latest `.vsix` file and install it as described [here](https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix).

# Features

- For a complete list of features and example usage, see — [pastum.anatolii.nz](https://pastum.anatolii.nz)

- You can use the extension through the command palette (`Ctrl/Cmd+Shift+P`) or via the right-click context menu. If you are a conservative person who doesn't switch frameworks often, you can specify your favorite one in the settings and always use the `Pastum: paste as default dataframe` command.

- The extension mimics the behavior of the [`{datapasta}`](https://github.com/milesmcbain/datapasta/) R package and is capable of detecting the main types: `strings` (or `character` vectors in R), `integer`, and `float` values. A numeric column is considered to be `float` if at least one of the values is `float`; otherwise, the entire column will be treated as `integer`. By default, trailing zeroes are added to all `float` values to comply with `polars` rules (i.e., numeric values `c(1, 2, 3, 4.5)` are transformed to `c(1.0, 2.0, 3.0, 4.5)`).

- Empty table cells will be replaced with `NA`, `None`, or `missing` values depending on the preferred programming language.

- By default, the column names are renamed following the PascalCase [convention](https://www.freecodecamp.org/news/snake-case-vs-camel-case-vs-pascal-case-vs-kebab-case-whats-the-difference/#kebab-case) _(i.e., non-machine friendly column names like 'Long & Ugly column💥' will be transformed to 'LongUglyColumn')_. However, the user can specify the preferred naming convention in the settings — `pastum.defaultConvention`.

- Since `v0.2.0`, users can control the [decimal separator](https://en.m.wikipedia.org/wiki/Decimal_separator) _(e.g., '.' in `12.45`)_ and the digit group separator _(i.e., in numbers over 999)_ through the `pastum.decimalPoint` config. By default, it is set up for a dot (`.`) as the decimal separator and a comma (`,`) as the group separator.

- Since `v0.3.0`, users can control the library declaration pasted with the dataframe (e.g., `import pandas as pd` in Python or `using DataFrames` in Julia) through the `pastum.libraryDeclaration` config.

# IDE support
The extension has almost zero dependencies and is expected to work with any Code OSS-based IDE. So, if you are using VS Code, go to the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=atsyplenkov.pastum); otherwise, visit the [Open VSX Registry](https://open-vsx.org/extension/atsyplenkov/pastum).

# Questions and Feature Requests
There's a lot going on with the development of new features in Pastum. If you have any questions or something is not working, feel free to [open an issue](https://github.com/atsyplenkov/pastum/issues) or start a conversation on [BlueSky](https://bsky.app/profile/anatolii.nz).

# Contributions
Contributions are welcome! If you'd like to contribute, please, fork, submit a PR and I'll merge it.

# Acknowledgements
This extension was inspired by the [`{datapasta}`](https://github.com/milesmcbain/datapasta/) R package created by [@MilesMcBain](https://github.com/MilesMcBain) and contributors. However, the implementation in the Code OSS environment was influenced by [@coatless](https://github.com/coatless) and his [web app](https://web-apps.thecoatlessprofessor.com/data/html-table-to-dataframe-tool.html).