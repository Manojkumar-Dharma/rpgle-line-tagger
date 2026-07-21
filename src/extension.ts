import * as vscode from 'vscode';

const DEFAULT_MAX_LINE_LENGTH = 100;
const DEFAULT_TAG_COLUMN = 90; // 1-indexed column where the tag starts when there's room
const MAX_TAG_LENGTH = 10;

// Language ids and file extensions that indicate a CL (CLP/CLLE) source member,
// which uses /* ... */ comments instead of RPGLE's // comments.
const CL_LANGUAGE_IDS = ['cl', 'clle', 'clp'];
const CL_FILE_EXTENSIONS = ['clp', 'clle', 'cl'];

// Language ids and file extensions for SQL source members, which use -- comments.
const SQL_LANGUAGE_IDS = ['sql'];
const SQL_FILE_EXTENSIONS = ['sql'];

function isClSource(document: vscode.TextDocument): boolean {
	if (CL_LANGUAGE_IDS.includes(document.languageId.toLowerCase())) {
		return true;
	}
	const ext = document.fileName.split('.').pop()?.toLowerCase() ?? '';
	return CL_FILE_EXTENSIONS.includes(ext);
}

function isSqlSource(document: vscode.TextDocument): boolean {
	if (SQL_LANGUAGE_IDS.includes(document.languageId.toLowerCase())) {
		return true;
	}
	const ext = document.fileName.split('.').pop()?.toLowerCase() ?? '';
	return SQL_FILE_EXTENSIONS.includes(ext);
}

function buildTagText(tag: string, document: vscode.TextDocument): string {
	if (isClSource(document)) {
		return `/* ${tag} */`;
	}
	if (isSqlSource(document)) {
		return `-- ${tag}`;
	}
	return `//${tag}`;
}

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('itagger.addTag', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		if (editor.selections.every(s => s.isEmpty)) {
			vscode.window.showWarningMessage('Select one or more lines first.');
			return;
		}

		const tag = await vscode.window.showInputBox({
			prompt: `Enter source tag (max ${MAX_TAG_LENGTH} characters)`,
			placeHolder: 'Add your tag',
			validateInput: (value) => {
				if (!value || value.trim().length === 0) {
					return 'Tag cannot be empty';
				}
				if (value.length > MAX_TAG_LENGTH) {
					return `Tag must be ${MAX_TAG_LENGTH} characters or fewer`;
				}
				if (/\s/.test(value)) {
					return 'Tag cannot contain spaces';
				}
				return null;
			}
		});

		if (!tag) {
			return; // user cancelled
		}

		const config = vscode.workspace.getConfiguration('itagger');
		const maxLineLength = config.get<number>('maxLineLength', DEFAULT_MAX_LINE_LENGTH);
		const defaultTagColumn = config.get<number>('tagColumn', DEFAULT_TAG_COLUMN);

		// Optional per-run override of the tag column. Leave blank to use the
		// configured default (itagger.tagColumn).
		const columnInput = await vscode.window.showInputBox({
			prompt: `Tag column (optional - press Enter to use default: ${defaultTagColumn})`,
			placeHolder: `${defaultTagColumn}`,
			validateInput: (value) => {
				if (!value || value.trim().length === 0) {
					return null; // empty is fine - falls back to the default
				}
				const n = Number(value);
				if (!Number.isInteger(n) || n < 1 || n > maxLineLength) {
					return `Enter a whole number between 1 and ${maxLineLength}`;
				}
				return null;
			}
		});

		const tagColumn = (columnInput !== undefined && columnInput.trim().length > 0)
			? Number(columnInput.trim())
			: defaultTagColumn;

		const tagText = buildTagText(tag, editor.document);

		applyTags(editor, tagText, maxLineLength, tagColumn);
	});

	context.subscriptions.push(disposable);
}

/**
 * Collects the set of line numbers touched by the current selections,
 * applying the tag to each according to the three placement rules.
 * Processed bottom-to-top so that line insertions (case 3) don't shift
 * the line numbers of lines still waiting to be processed.
 */
function applyTags(editor: vscode.TextEditor, tagText: string, maxLineLength: number, tagColumn: number) {
	const colIndex = tagColumn - 1; // 0-indexed string position where the tag starts

	const lineNumbers = new Set<number>();
	for (const sel of editor.selections) {
		if (sel.isEmpty) {
			continue;
		}
		const startLine = sel.start.line;
		const endLine = sel.end.line;
		for (let ln = startLine; ln <= endLine; ln++) {
			// A selection that ends exactly at column 0 of endLine doesn't
			// really "include" that line's content (e.g. triple-click a line).
			if (ln === endLine && sel.end.character === 0 && startLine !== endLine) {
				continue;
			}
			lineNumbers.add(ln);
		}
	}

	const sortedDesc = Array.from(lineNumbers).sort((a, b) => b - a);
	const eol = editor.document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';

	editor.edit(editBuilder => {
		for (const lineNum of sortedDesc) {
			const line = editor.document.lineAt(lineNum);
			const rawText = line.text;
			const trimmedText = rawText.replace(/\s+$/, '');
			const trimmedLen = trimmedText.length;

			if (trimmedLen <= colIndex) {
				// Case 1: code hasn't reached the tag column yet -> pad and place tag there
				const padded = trimmedText.padEnd(colIndex, ' ');
				editBuilder.replace(line.range, padded + tagText);
				continue;
			}

			const spaceNeeded = 1 + tagText.length; // separating space + tag
			if (trimmedLen + spaceNeeded <= maxLineLength) {
				// Case 2: code already passes the tag column, but there's still room
				editBuilder.replace(line.range, trimmedText + ' ' + tagText);
				continue;
			}

			// Case 3: line is fully occupied - sandwich a tag-only line before and after
			const tagLine = ''.padEnd(colIndex, ' ') + tagText;
			editBuilder.insert(line.range.end, eol + tagLine);
			editBuilder.insert(line.range.start, tagLine + eol);
		}
	});
}

export function deactivate() {}
