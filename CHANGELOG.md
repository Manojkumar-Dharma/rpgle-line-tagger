# Change Log

## 0.0.4

- SQL source files now get `-- tag` style comments. Detected by file language id (`sql`) or file extension (`.sql`).

## 0.0.3

- CLP/CLLE source files now get `/* tag */` style comments instead of `//tag`. Detected by file language id (`cl`/`clle`/`clp`) or file extension (`.clp`/`.clle`/`.cl`); all other files still use `//tag`.

## 0.0.2

- Prompt placeholder now reads "Add your tag" instead of showing a sample value.
- Added an optional second prompt to override the tag column for a single run (leave blank to use the configured default).
- Roadmap: explicit CLP/CLLE source type support planned for a future version (the extension already works on any file type today, since it doesn't check file language).

## 0.0.1

- Initial release: add source tags to selected RPGLE lines with column-90 placement, overflow append, and sandwich-line fallback.
