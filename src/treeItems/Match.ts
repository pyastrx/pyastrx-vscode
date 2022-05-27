import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';

export default class File extends TreeItem {
  constructor(
    public readonly file: string,
    public readonly line: number,
    public readonly col : number,
    public readonly tooltip: string,
    public readonly match_txt: string,
    public readonly collapsibleState: TreeItemCollapsibleState,

  ) {
    super(file, collapsibleState);
    this.iconPath = new ThemeIcon("go-to-file");

    this.label = `(${this.line},${this.col}) ${this.match_txt}`;
  }
}
