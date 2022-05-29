export type RootNode = {
    root: RuleNode[];
}


export type RuleNode = {
    expression: string;
    name: string;
    severity: string;
    description: string;
    why: string;
    files: FileNode[];
    rules: RuleNode[];
}

export type FileNode = {
    file: string;
    line: number;
    col: number;
    matches: MatchNode[];
    files: FileNode[];
}

export type MatchNode = {
    file: string;
    context: string;
    match_str: string;
    line: number;
    col: number;
}

export type RuleInfo = {
    name: string;
    description: string;
    why: string;
    severity: number;
}
