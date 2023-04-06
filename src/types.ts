


export type RootNode = {
    root: RuleNode[];
}
export type RuleDesc = {
    expression: string;
    name: string;
    severity: string;
    description: string;
    why: string;
    use_in_linter: boolean;
}
export type RuleNode = {
    expression: string;
    name: string;
    severity: string;
    description: string;
    why: string;
    use_in_linter: boolean;
    files: FileNode[];
}

export type FileNode = {
    file: string;
    match: MatchNode;
}

export type MatchNode = {
    context: string;
    match_str: string;
    line: number;
    col: number;
}

export type CodeContext = [number, string][];
