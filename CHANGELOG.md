# Change Log

All notable changes to the "pastum" extension will be documented in this file.

<!-- Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file. -->

## [0.1] - 2024-10-29

### Added

- Website with main features descriptions — [https://pastum.anatolii.nz](https://pastum.anatolii.nz)
- `tibble::tribble()` support (#11)
- Paste as `tibble::tribble()` is the default option for `pastum.defaultDataframe`

### Fixed

- Minor grammar and spelling edits
- Fixed distinction between string and numeric column types. If at least one value in the column is a string, the whole column is treated as a string.
- Cyrillic letters support in header rows
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
