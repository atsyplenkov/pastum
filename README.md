<!-- badges: start -->
[![Version](https://img.shields.io/badge/version-0.0.2-green)](https://github.com/atsyplenkov/pastum)
[![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://img.shields.io/badge/repo_status-WIP-yellow)](https://www.repostatus.org/#wip)
<!-- badges: end -->

# pastum <img src="https://github.com/atsyplenkov/pastum/raw/master/assets/logo.png" align="right" width="200" />
`pastum` allows you to quickly transform any text/HTML table from your clipboard into a dataframe object in your favorite language — R, Python, or Julia. Almost all popular frameworks are supported; if something is missing, don't hesitate to raise an [issue](https://github.com/atsyplenkov/pastum/issues).

# Example usage
### Text table to tibble (R)
![](https://github.com/atsyplenkov/pastum/raw/master/assets/demo-r-tibble.gif)

### HTML table to pandas (Python)
![](https://github.com/atsyplenkov/pastum/raw/master/assets/demo-py-pandas.gif)

# Installation
You can install the development version from the [Releases](https://github.com/atsyplenkov/pastum/releases/) page. Download the latest `.vsix` file, and install it as described [here](https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix).

# Features
- The extension mimics the behavior of the [`{datapasta}`](https://github.com/milesmcbain/datapasta/) R package and is capable of detecting the main types: `strings` (or `character` vectors in R), `integer`, and `float` values. A numeric column is considered to be `float` if at least one of the values is `float`; otherwise, the entire column will be treated as `integer`. By default, trailing zeroes are added to all `float` values to comply with `polars` rules.
- Empty table cells will be replaced with `NA`, `None`, or `missing` values depending on the preferred programming language.
- By default, the column names are renamed following the PascalCase [convention](https://www.freecodecamp.org/news/snake-case-vs-camel-case-vs-pascal-case-vs-kebab-case-whats-the-difference/#kebab-case). However, the user can specify the preferred naming convention in the settings — `pastum.defaultConvention`.

# Contributions
Contributions are welcome! If you'd like to contribute, please, fork, submit a PR and I'll merge it.

# Acknowledgements
This extension was inspired by the [`{datapasta}`](https://github.com/milesmcbain/datapasta/) R package created by [@MilesMcBain](https://github.com/MilesMcBain) and contributors. However, the implementation in the Code OSS environment was influenced by [@coatless](https://github.com/coatless) and his [web app](https://web-apps.thecoatlessprofessor.com/data/html-table-to-dataframe-tool.html).