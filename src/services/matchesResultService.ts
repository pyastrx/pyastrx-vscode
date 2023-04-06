
import * as fs from 'fs';
import { RootNode, FileNode, MatchNode, RuleNode, RuleDesc, CodeContext } from '../types'
import { workspace } from 'vscode';


export const getMatches = (): RootNode => {
    if (workspace.workspaceFolders === undefined)
        return { 'root': [] }

    const workspacePath = workspace.workspaceFolders[0].uri.fsPath;
    const pyastrxJSONresult = `${workspacePath}/.pyastrx/results.json`;

    // check if file exists if not return an empty {root: []}
    if (!fs.existsSync(pyastrxJSONresult))
        return { 'root': [] }
    const ruleNodes: RuleNode[] = JSON.parse(fs.readFileSync(pyastrxJSONresult, 'utf-8'));


    return { 'root': ruleNodes }

}
