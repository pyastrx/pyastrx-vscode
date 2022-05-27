import {workspace} from 'vscode';
import Rule from "../treeItems/Rule";
import File from "../treeItems/File";
import Match from "../treeItems/Match";
import { getMatches } from "./matchesResultService";

import { TreeItem, TreeItemCollapsibleState, window } from "vscode";
import { RuleNode, FileNode, MatchNode } from "../types";
import { config } from 'process';


export const getRuleFilesItems = (nestedFiles: FileNode[]): TreeItem[] => {
	const files: File[] = convertFilesItems(nestedFiles);
	return [...files];
};

export const getFileMatchesItems = (nestedMatches: MatchNode[]): TreeItem[] => {
	const matches: Match[] = convertMatchesItems(nestedMatches);
	return [...matches];
};

export const getRulesItems = (): Rule[] => {
	const matches = getMatches();
	const num_matches = matches.root.length;
	const msg = num_matches === 0 ? "No matches found" : `${num_matches} matches found`;
	window.showInformationMessage(
							`PyASTrX: ${msg}`);
	return convertRulesItems(matches.root);

};

const convertRulesItems = (rules: RuleNode[]): Rule[] =>{
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

const convertFilesItems = (files: FileNode[]): File[] =>{
	const expand = workspace.getConfiguration('pyastrx').get('expand');
	let state = TreeItemCollapsibleState.Collapsed;
	if (expand)
		state = TreeItemCollapsibleState.Expanded;
	return files.map((file) => new File(
		file.file, 0, 0, file.matches,
		state));
}

const convertMatchesItems = (matches: MatchNode[]): Match[] =>
	matches.map((match) => new Match(
		match.file, match.line, match.col, match.context, match.match_str,
		TreeItemCollapsibleState.None));
