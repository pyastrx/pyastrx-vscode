import { window, commands, ExtensionContext, workspace, FileSystemWatcher} from 'vscode';
import { MatchesProvider } from './providers/MatchesProvider';
import { Configuration } from './configurations';
import * as cp from "child_process";

const execShell = (cmd: string) =>
    new Promise<string>((resolve, reject) => {
        cp.exec(cmd, (err, out) => {
            if (err) {
                return reject(err);
            }
            return resolve(out);
        });
    });

async function askForInfo(placeHolder: string, prompt: string) {
    let userInputWindow =  await window.showInputBox(
		{placeHolder: placeHolder, prompt: prompt }
	);
    return userInputWindow;
}

async function callPyASTrX(xpathQuery: string){
	const pyastrx = workspace.getConfiguration('pyastrx').get('command');
	if(workspace.workspaceFolders === undefined)
        return
    const workspacePath = workspace.workspaceFolders[0].uri.fsPath ;
	const command_str = `cd  ${workspacePath} && ${pyastrx} -n -q  --vscode-output --expr ${xpathQuery}`;
	let otuput = await execShell(command_str);
	return otuput;
}

async function callPyASTrXYAML(){
	const pyastrx = workspace.getConfiguration('pyastrx').get('command');
	const linter =  workspace.getConfiguration('pyastrx').get('just-linter')? "-l":"";
	if(workspace.workspaceFolders === undefined)
        return
    const workspacePath = workspace.workspaceFolders[0].uri.fsPath ;
	const command_str = `cd  ${workspacePath} && ${pyastrx} ${linter} -n -q --vscode-output`;
	let otuput = await execShell(command_str);
	return otuput;
}

export const monitorResults = () => {
    if(workspace.workspaceFolders === undefined)
        return

    const workspacePath = workspace.workspaceFolders[0].uri.fsPath ;
    const pyastrxJSONresult = `${workspacePath}/.pyastrx/results.json`;

    const watcher = workspace.createFileSystemWatcher(pyastrxJSONresult);
    watcher.onDidChange(() => {
		commands.executeCommand('pyastrx-list.refreshMatches');
	});

}

export async function activate(context: ExtensionContext) {
	const matchesProvider = new MatchesProvider();
	window.registerTreeDataProvider('pyastrx-list', matchesProvider);
	Configuration.configure(context);
	registerCommands(matchesProvider);
	monitorResults();
}

const registerCommands = (matchesProvider: MatchesProvider) => {
	commands.registerCommand('pyastrx-list.openLink', node =>
		matchesProvider.openFile(node.file, node.line, node.col)
	)
	commands.registerCommand('pyastrx-list.refreshMatches', () =>{
		window.showInformationMessage('PyASTrX: Refreshing matches...');
		matchesProvider.refreshMatches();
	})
	commands.registerCommand('pyastrx-list.yamlRules', () =>{
		window.showInformationMessage('PyASTrX: yaml rules...');
		callPyASTrXYAML().then(output => console.log(output));
	})
	commands.registerCommand('pyastrx-list.new-xpath-search', () =>{
	    askForInfo('XPath Query', 'Enter an XPath query to search for matches:')
			.then(xpathQuery => {
				if (xpathQuery=='')
					return;
				if(xpathQuery !== undefined)
					callPyASTrX(xpathQuery).then(output => console.log(output));


			})
	})

}

export function deactivate() { }
