# Change Log

## 0.0.7

- CL/CLLE/CLP statements spanning multiple lines via `+` continuation are now tagged as a single logical statement instead of per-line: the tag lands once on the statement's last physical line (or, if there's no room, sandwiches the whole statement block with `-begin`/`-end` markers at column 1). Single-line CL commands are unaffected. RPGLE and SQL still tag every selected line individually.

## 0.0.6

- When a line has no room left for an inline tag, the inserted before/after lines now start at column 1 (instead of the tag column) and are marked `tag-begin` / `tag-end` so the pair is distinguishable. Applies to all supported comment styles (`//`, `/* */`, `--`).

## 0.0.5

- Renamed the extension from "RPGLE Line Tagger" to **iTagger**. Command id changed to `itagger.addTag`, and settings moved from `rpgleTagger.*` to `itagger.*`.

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
