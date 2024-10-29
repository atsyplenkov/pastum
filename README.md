<!-- badges: start -->
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fpastum.anatolii.nz)](https://pastum.anatolii.nz/) ![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/atsyplenkov.pastum?include_prereleases&style=flat&label=stable%20version&color=green&link=https%3A%2F%2Fmarketplace.visualstudio.com%2Fitems%3FitemName%3Datsyplenkov.pastum) [![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/atsyplenkov.pastum?label=VS%20Marketplace%20installs&color=7abfbb&link=https%3A%2F%2Fmarketplace.visualstudio.com%2Fitems%3FitemName%3Datsyplenkov.pastum)](https://marketplace.visualstudio.com/items?itemName=atsyplenkov.pastum) [![Open VSX Downloads](https://img.shields.io/open-vsx/dt/atsyplenkov/pastum?label=Open%20VSX%20downloads&color=c160ef)](https://open-vsx.org/extension/atsyplenkov/pastum) [![Deploy Extension](https://github.com/atsyplenkov/pastum/actions/workflows/publish-extensions.yml/badge.svg)](https://github.com/atsyplenkov/pastum/actions/workflows/publish-extensions.yml) ![GitHub License](https://img.shields.io/github/license/atsyplenkov/pastum?color=blue) [![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://img.shields.io/badge/repo_status-WIP-yellow)](https://www.repostatus.org/#wip)


<!-- badges: end -->
# [Pastum: paste as ... dataframe](https://pastum.anatolii.nz)

`pastum` allows you to quickly transform any text/HTML table from your clipboard into a dataframe object in your favorite language — R, Python, or Julia. Almost all popular frameworks are supported; if something is missing, don't hesitate to raise an [issue](https://github.com/atsyplenkov/pastum/issues).

# Example usage

### Text table to polars (Python)
Using the command palette, insert the copied text table as a Python, R, or Julia object. Select the framework on the go.

![](https://github.com/atsyplenkov/pastum/raw/master/assets/demo-py-polars.gif)

### Text table to tibble (R)
Or you can specify the `pastum.defaultDataframe` parameter in VS Code settings and insert the table using the right-click context menu:

![](https://github.com/atsyplenkov/pastum/raw/master/assets/demo-r-tibble.gif)

# Installation
The extension is published on both the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=atsyplenkov.pastum) and the [Open VSX Registry](https://open-vsx.org/extension/atsyplenkov/pastum): just click `Install` there or manually install it with:

1) Start VS Code (or any other Code OSS-based IDE, such as [Positron](https://github.com/posit-dev/positron)).
2) Inside VS Code, go to the extensions view either by executing the `View: Show Extensions` command (click View -> Command Palette...) or by clicking on the extension icon on the left side of the VS Code window.
3) In the extensions view, simply search for the term `pastum` in the marketplace search box, then select the extension named `Pastum` and click the install button.

Alternatively, you can install the latest version from the [Releases](https://github.com/atsyplenkov/pastum/releases/) page. Download the latest `.vsix` file and install it as described [here](https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix).

# Features

- For a complete list of features and example usage, see — [pastum.anatolii.nz](https://pastum.anatolii.nz)
- The extension mimics the behavior of the [`{datapasta}`](https://github.com/milesmcbain/datapasta/) R package and is capable of detecting the main types: `strings` (or `character` vectors in R), `integer`, and `float` values. A numeric column is considered to be `float` if at least one of the values is `float`; otherwise, the entire column will be treated as `integer`. By default, trailing zeroes are added to all `float` values to comply with `polars` rules (i.e., numeric values `c(1, 2, 3, 4.5)` are transformed to `c(1.0, 2.0, 3.0, 4.5)`).
- Empty table cells will be replaced with `NA`, `None`, or `missing` values depending on the preferred programming language.
- By default, the column names are renamed following the PascalCase [convention](https://www.freecodecamp.org/news/snake-case-vs-camel-case-vs-pascal-case-vs-kebab-case-whats-the-difference/#kebab-case). However, the user can specify the preferred naming convention in the settings — `pastum.defaultConvention`.

# IDE support
The extension has almost zero dependencies and is expected to work with any Code OSS-based IDE. It was tested with the latest release version of VS Code (1.94.2) and the pre-release version of [Positron IDE](https://github.com/posit-dev/positron) (2024.11.0-69).

# Contributions
Contributions are welcome! If you'd like to contribute, please, fork, submit a PR and I'll merge it.

# Acknowledgements

This extension was inspired by the [`{datapasta}`](https://github.com/milesmcbain/datapasta/) R package created by [@MilesMcBain](https://github.com/MilesMcBain) and contributors. However, the implementation in the Code OSS environment was influenced by [@coatless](https://github.com/coatless) and his [web app](https://web-apps.thecoatlessprofessor.com/data/html-table-to-dataframe-tool.html).