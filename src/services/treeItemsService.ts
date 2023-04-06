import { workspace } from 'vscode';
import Rule from "../treeItems/Rule";
import File from "../treeItems/File";
import { getMatches } from "./matchesResultService";

import { TreeItem, TreeItemCollapsibleState, window } from "vscode";
import { RuleNode, FileNode } from "../types";


export const getRuleFilesItems = (nestedFiles: FileNode[]): TreeItem[] => {
	const files: File[] = convertFilesItems(nestedFiles);
	return [...files];
};


export const getRulesItems = (): Rule[] => {
	const matches = getMatches();
	const num_matches = matches.root.length;
	const msg = num_matches === 0 ? "No matches found" : `${num_matches} matches found`;
	window.showInformationMessage(
		`PyASTrX: ${msg}`);
	return convertRulesItems(matches.root);

};

const convertRulesItems = (rules: RuleNode[]): Rule[] => {
	const expand = workspace.getConfiguration('pyastrx').get('expand');
	let state = TreeItemCollapsibleState.Collapsed;
	if (expand)
		state = TreeItemCollapsibleState.Expanded;
	return rules.map(
		(rule) =>
			new Rule(
				rule.name,
				rule.severity,
				rule.description,
				rule.files,
				state
			)
	);
}

const convertFilesItems = (files: FileNode[]): File[] => {

	return files.map((file) => new File(
		file.file, file.match.context, file.match.line, file.match.col,
		TreeItemCollapsibleState.None
	));
}
