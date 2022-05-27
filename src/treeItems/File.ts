import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import {workspace} from 'vscode';
import {MatchNode} from '../types'

export default class File extends TreeItem {
  constructor(
    public readonly file: string,
    public readonly line: number,
    public readonly col : number,
    public readonly nestedMatches: MatchNode[],
    public readonly collapsibleState: TreeItemCollapsibleState,

  ) {
    super(file, collapsibleState);
    this.iconPath = new ThemeIcon("go-to-file");
    if(workspace.workspaceFolders === undefined)
      return
    const workspacePath = workspace.workspaceFolders[0].uri.fsPath+'/';
    // remove if exists workspacePath from humanReadableLine
    const humanReadableLine = this.file.replace(workspacePath, '');
    this.label = `${humanReadableLine}`;
  }
}
