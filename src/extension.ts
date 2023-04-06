import { window, commands, languages, ExtensionContext, workspace } from 'vscode';
import { MatchesProvider } from './providers/MatchesProvider';
import { PyASTrXLensProvider } from './providers/PyASTrXLensProvider';
import { Configuration } from './configurations';
import { spawn, exec, ChildProcess } from "child_process";

import * as fs from 'fs';
import * as path from 'path';

let watcher_pyastrx: ChildProcess | undefined;


function stopWatcher() {
  if (watcher_pyastrx) {
    console.log(`Stopping PyASTrX watcher ${watcher_pyastrx.pid}...`);
    process.kill(-watcher_pyastrx.pid);
    watcher_pyastrx = undefined;
  }
}
function sendTextToTerminal(text: string, terminalName: string) {
  let terminal = window.terminals.find((t) => t.name === terminalName);
  if (!terminal) {
    terminal = window.createTerminal(terminalName);
  }
  terminal.sendText(`echo "${text}"`);
}

async function callPyASTrXWatch(): Promise<ChildProcess | undefined> {
  const pyastrx = workspace.getConfiguration('pyastrx').get('command');
  const linter = workspace.getConfiguration('pyastrx').get('just-linter') ? '-l' : '';
  const workspaceFolder = workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return undefined;
  }
  const workspacePath = workspaceFolder.uri.fsPath;
  const command_str = `cd ${workspacePath} && ${pyastrx} -n --vscode-output -w ${linter}`;
  const watcher = spawn(command_str, {
    shell: true, stdio: ['inherit', 'pipe', 'pipe'], detached: true
  });
  watcher.stderr?.on('data', (data) => {
    // check if data is not undefined and is bytes
    if (data && data instanceof Buffer)
      sendTextToTerminal(data.toString(), 'PyASTrX');
  });
  watcher.on('close', (code, signal) => {
    console.log(`Child process exited with code ${code} and signal ${signal}`);
  });
  //   const watcher = spawn(command_str, { shell: true, stdio: 'inherit' });

  return watcher;
}

export const monitorResults = () => {
  if (workspace.workspaceFolders === undefined)
    return

  const workspacePath = workspace.workspaceFolders[0].uri.fsPath;
  // CHECK IF .pyastrx folder exists
  const pyastrxFolder = `${workspacePath}/.pyastrx`;
  if (!fs.existsSync(pyastrxFolder))
    fs.mkdirSync(pyastrxFolder);
  const pyastrxJSONresult = `${pyastrxFolder}/results.json`;
  const watcher = workspace.createFileSystemWatcher(`${pyastrxFolder}/*.json`);
  watcher.onDidChange((uri) => {
    if (uri.path !== pyastrxJSONresult)
      return;
    console.log('PyASTrX: results file changed.', uri);
    commands.executeCommand('pyastrx-list.refreshMatches');
  });
  watcher.onDidDelete((uri) => {
    console.log('PyASTrX: results file deleted.', uri);
  });
  watcher.onDidCreate((uri) => {
    if (uri.path !== pyastrxJSONresult)
      return;
    console.log('PyASTrX: results file created.', uri);
    commands.executeCommand('pyastrx-list.refreshMatches');
  });


}
async function initWatcher(context: ExtensionContext) {


  // Start the watcher for PyASTrX

  watcher_pyastrx = await callPyASTrXWatch();
  if (watcher_pyastrx) {
    window.showInformationMessage(`PyASTrX watcher`);
    watcher_pyastrx.on("close", (code: number, signal: string) => {
      console.log(`PyASTrX watcher closed with code ${code} and signal ${signal}`);
    });
    watcher_pyastrx.on("error", (err: Error) => {
      window.showErrorMessage(`PyASTrX watcher error: ${err.message}`);
      console.error(`PyASTrX watcher error: ${err.message}`);
    });
  }

  // Register an event to stop the watcher when VS Code is closed
  context.subscriptions.push({
    dispose: () => stopWatcher()
  });
}
export async function activate(context: ExtensionContext) {
  // check if already activated

  if (watcher_pyastrx)
    return;
  const workspaceFolder = workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return;
  }
  const matchesProvider = new MatchesProvider();
  const codelensProvider = new PyASTrXLensProvider();
  languages.registerCodeLensProvider("*", codelensProvider);

  window.registerTreeDataProvider("pyastrx-list", matchesProvider);
  Configuration.configure(context);
  registerCommands(matchesProvider, codelensProvider, context);
  monitorResults();
  const pyastrxYmlPath = path.join(workspaceFolder.uri.fsPath, "pyastrx.yaml");
  const pyastrxYmlExists = await fs.promises
    .access(pyastrxYmlPath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);

  if (pyastrxYmlExists) {
    await initWatcher(context);
  } else {
    commands.registerCommand('pyastrx-list.initDefaultConf', async () => {
      console.log('PyASTrX: default configuration created...');
      await initWatcher(context);
    })
  }
}

async function refreshYAML(matchesProvider: MatchesProvider, codelensProvider: PyASTrXLensProvider) {
  if (!watcher_pyastrx)
    return;
  window.showInformationMessage('PyASTrX: Refreshing matches...');
  const currentWorkspace = workspace.workspaceFolders?.[0];
  if (!currentWorkspace)
    return;
  stopWatcher();
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('Starting PyASTrX watcher...');
  watcher_pyastrx = await callPyASTrXWatch();
  window.showInformationMessage('PyASTrX: Refreshing matches...');
  matchesProvider.refreshMatches();
  codelensProvider.refresh();
}
const registerCommands = (
  matchesProvider: MatchesProvider, codelensProvider: PyASTrXLensProvider, context: ExtensionContext) => {


  commands.registerCommand('pyastrx-list.openLink', node =>
    matchesProvider.openFile(node.file, node.line, node.col)
  )
  commands.registerCommand('pyastrx-list.refreshMatches', () => {
    window.showInformationMessage('PyASTrX: Refreshing matches...');
    matchesProvider.refreshMatches();
    codelensProvider.refresh();
  })


  commands.registerCommand('pyastrx-list.yamlRules', async () => {
    window.showInformationMessage('PyASTrX: refresh YAML rules...');
    await refreshYAML(matchesProvider, codelensProvider);
  })


  commands.registerCommand("pyastrx.enableCodeLens", () => {
    workspace.getConfiguration("pyastrx").update("enableCodeLens", true, true);
  });

  commands.registerCommand("pyastrx.disableCodeLens", () => {
    workspace.getConfiguration("pyastrx").update("enableCodeLens", false, true);
  });

  commands.registerCommand("pyastrx.codelensAction", (args: any) => {
    window.showInformationMessage(`CodeLens action clicked with args=${args}`);
  });

}


export function deactivate() {
  stopWatcher();
}
