# RPGLE Line Tagger

Adds a source modification tag (e.g. `//0084`) to selected RPGLE lines at a fixed column, so changes are easy to trace back to a change/PTF/ticket number.

## Usage

1. Select one or more lines in the editor (multiple selections are supported).
2. Right-click and choose **RPGLE: Add Source Tag**, or run the command from the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
3. Enter a tag (max 10 characters), e.g. `0084`.
4. Optionally enter a tag column for this run only — leave it blank to use the configured default (`rpgleTagger.tagColumn`).

The extension works on any file type. RPGLE (and everything else) gets `//tag` comments; CLP and CLLE source files get `/* tag */` comments; SQL source files get `-- tag` comments.

## Placement rules

Given a 100-character line and a tag column of 90 (both configurable):

1. **Room before column 90** — the line is padded with spaces and the tag (`//0084`) is placed starting at column 90.
2. **Code already reaches column 90, but the line isn't full** — the tag is appended right after the existing text, separated by a single space.
3. **No room left on the line** — a tag-only line is inserted immediately before *and* immediately after the code line, so the original line is left untouched.

## Settings

| Setting | Default | Description |
|---|---|---|
| `rpgleTagger.maxLineLength` | `100` | Total usable line length. |
| `rpgleTagger.tagColumn` | `90` | 1-indexed column where the tag starts when there's room. |

## Known limitations

- Tags are plain text comments (`//tag`); the extension does not validate RPGLE syntax.
- Column counting is based on characters, not visual width — avoid tabs in source lines you plan to tag.
