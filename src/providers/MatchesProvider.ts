import {
    Disposable,
    TreeDataProvider,
    EventEmitter,
    Event,
    TreeItem,
    Uri,
    Position,
    workspace,
    window,
    Range,
    Selection,
    commands
} from 'vscode';
import { configuration } from '../configurations';
import { getRuleFilesItems, getRulesItems } from '../services/treeItemsService';
import Rule from '../treeItems/Rule';


export class MatchesProvider implements TreeDataProvider<TreeItem>, Disposable {
    private readonly _disposable: Disposable;
    private _onDidChangeTreeData: EventEmitter<Rule | undefined | null | void> = new EventEmitter<
        Rule | undefined | null | void
    >();
    readonly onDidChangeTreeData: Event<Rule | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor() {
        this._disposable = Disposable.from(
            configuration.onDidChange(this.refreshMatches, this));
    }

    dispose() {
        this._disposable.dispose();
    }

    getTreeItem(element: Rule): TreeItem {
        return element;
    }

    getChildren(element?: TreeItem): TreeItem[] {
        if (element instanceof Rule)
            return getRuleFilesItems(element.nestedFiles);

        return getRulesItems();
    }

    refreshMatches() {
        this._onDidChangeTreeData.fire();
        //commands.executeCommand("pyastrx-list.focus")
    }

    openFile(file: string, line: number, column: number) {
        // if undefined do nothing
        if (file === undefined)
            return;

        const pos = new Position(line-1, column);
        var openPath = Uri.file(file);
        workspace.openTextDocument(openPath).then(doc =>
        {
            window.showTextDocument(doc).then(editor =>
            {
                // Line added - by having a selection at the same position twice, the cursor jumps there
                editor.selections = [new Selection(pos,pos)];

                // And the visible range jumps there too
                let range = new Range(pos, pos);
                editor.revealRange(range);
            });
        });
    }
}
