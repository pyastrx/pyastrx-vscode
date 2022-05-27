
import * as fs from 'fs';
import { RootNode } from '../types'
import {workspace} from 'vscode';


export const getMatches = (): RootNode => {
    if(workspace.workspaceFolders === undefined)
        return {'root':[]}

    const workspacePath = workspace.workspaceFolders[0].uri.fsPath ;
    const pyastrxJSONresult = `${workspacePath}/.pyastrx/results.json`;

    try{
        const matches = JSON.parse(fs.readFileSync(pyastrxJSONresult, 'utf-8'));
        return matches;
    }catch(e){
        console.log(e);
        return {"root":[]};
    }

}
