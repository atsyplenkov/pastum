# Changelog

<!-- Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file. -->

## Development version

### Added
- Support to generate SQL statements for querying and modifying database tables (in #41, thanks to @juarezr)

## [0.3.0] - 2025-09-12

### Added

- Markdown table support (thanks to @juarezr)
- TSV and CSV table support (thanks to @juarezr)
- `pastum.libraryDeclaration` configuration option, which allows the user to add library declaration to the pasted dataframe. (#18)
- `pastum.airFormat` configuration option, which allows the user to add comment to skip air formatting in R. (#16)

## [0.2.1] - 2024-11-02

### Added

- JavaScript support (#15)
- Experimental boolean support

### Fixed

- Correct indentation when pasting `tibble::tribble()`

## [0.2.0] - 2024-11-01

### Added

- Introducing `Pastum: paste as default dataframe` command — it is now sensitive to the active editor language (#13). That is, if you are writing in a file with a `.py` extension, then VS Code understands that the language you are writing in is Python. In this case, `pastum` will paste the dataframe as a python code according to the configured default dataframe framework (i.e., `pastum.defaultDataframePython` and `pastum.defaultDataframeR` settings). However, full control is still available and unaffected through the command palette.
- You can now control the decimal separator _(e.g., '.' in `12.45`)_ and the digit group separator _(i.e., in numbers over 999)_ through the `pastum.decimalPoint` config (#10). By default, it is set up for a dot (.) as the decimal separator and a comma (,) as the group separator.

## [0.1.0] - 2024-10-29

### Added

- Website with main features descriptions — [https://pastum.anatolii.nz](https://pastum.anatolii.nz) (#5)
- `tibble::tribble()` support (#11)
- Paste as `tibble::tribble()` is the default option for `pastum.defaultDataframe` (i.e., context menu)

### Fixed

- Minor grammar and spelling edits
- Fixed distinction between string and numeric column types. If at least one value in the column is a string, the whole column is treated as a string.
- Cyrillic letters support in header rows (#9)
- Removed trailing zeroes when the table is copied from the web (#12)

## [0.0.3] - 2024-10-27

- Added "Paste Default Dataframe" command, which can be set in settings. Allows the user to select the default language and framework.
- Added "Paste Default Dataframe" command to the context menu.
- Ditched the `jsdom` dependency in favor of speed and package size

## [0.0.2] - 2024-10-26

- Added distinction between Integer/Float values
- `Missing`, `NA`, or `None` values are inserted by default if the value is empty
- Added `pastum.defaultConvention` configuration option, which allows the user to choose the column name renaming convention

## [0.0.1] - 2024-10-24

- Initial release
- R dataframes support
- Python dataframes support
- Julia dataframes support
