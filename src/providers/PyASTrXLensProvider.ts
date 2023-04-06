import * as vscode from 'vscode';
import { getMatches } from "./../services/matchesResultService";
import { RootNode, FileNode, MatchNode, RuleNode, RuleDesc, CodeContext } from '../types'


// create a map of strings to vscode icons , if not found use default
const getIcon = (icon: string) => {
	const icons = new Map<string, string>([
		["error", "error"],
		["warning", "warning"],
		["info", "info"],
		["hint", "lightbulb"],
		["default", "info"]
	]);
	return icons.get(icon) || "info";
};

/**
 * CodelensProvider
 */
export class PyASTrXLensProvider implements vscode.CodeLensProvider {

	private codeLenses: vscode.CodeLens[] = [];
	private matches: RootNode;
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

	constructor() {
		this.matches = getMatches();
		vscode.workspace.onDidChangeConfiguration((_) => {
			this._onDidChangeCodeLenses.fire();
		});


	}
	public refresh() {
		this.matches = getMatches();
		this._onDidChangeCodeLenses.fire();
	}

	public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {

		if (vscode.workspace.getConfiguration("pyastrx").get("enableCodeLens", true)) {
			this.codeLenses = [];
			const fileName = document.fileName;


			this.matches.root.forEach((rule: RuleNode) => {
				const description = rule.description;
				const severity = rule.severity;
				const icon = getIcon(severity);
				const why = rule.why;
				const ruleName = rule.name;
				rule.files.forEach((file: FileNode) => {
					if (file.file !== fileName)
						return;

					const col = file.match.col;
					const line = file.match.line -1;
					const match_str = file.match.match_str;
					const position = new vscode.Position(line, col);
					const end = new vscode.Position(line, col + match_str.length);
					const range = new vscode.Range(position, end);
					if (range) {
						 const command: vscode.Command = {
						 	title: `$(${icon}) ${description}`,
							tooltip: `${why} \n rule: ${ruleName}`,
							command: ""
						}
						this.codeLenses.push(new vscode.CodeLens(range, command));
					}
				});
			});

			return this.codeLenses;
		}
		return [];
	}
	public dispose() {
		this._onDidChangeCodeLenses.dispose();
	}

	public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
		if (vscode.workspace.getConfiguration("pyastrx").get("enableCodeLens", true)) {
			return codeLens;
		}
		return null;
	}
}
