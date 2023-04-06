import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import {FileNode} from '../types'

export default class Rule extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly severity: string,
    public readonly description: string,
    public readonly nestedFiles: FileNode[],
    public readonly collapsibleState: TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState);
    this.tooltip = this.description;
		this.description = this.description;
    if (this.severity === 'error') {
      this.iconPath = new ThemeIcon("error");
    }else if (this.severity === 'warning') {
      this.iconPath = new ThemeIcon("warning");
    }else if (this.severity === 'info') {
      this.iconPath = new ThemeIcon("info");
    }else if (this.severity === 'hint') {
      this.iconPath = new ThemeIcon("hint");
    }else{
      this.iconPath = new ThemeIcon("file-directory");
    }
  }
}
