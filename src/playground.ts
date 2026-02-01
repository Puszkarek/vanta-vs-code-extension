import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';
import { getConfig } from './utils/get-config';

export class Playground {
    private debounceTimer: NodeJS.Timeout | undefined;
    private outputChannel: vscode.OutputChannel;
    private decorationType: vscode.TextEditorDecorationType;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel("Void");
        this.decorationType = vscode.window.createTextEditorDecorationType({
            after: {
                margin: '0 0 0 1em',
                color: '#888888',
                fontStyle: 'italic'
            }
        });
    }

    public async attach(doc: vscode.TextDocument) {
        this.triggerRun(doc);

        vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document === doc) {
                this.triggerRun(doc);
            }
        });
    }

    private triggerRun(doc: vscode.TextDocument) {
        const { debounce } = getConfig();

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            this.run(doc);
        }, debounce);
    }

    private async run(doc: vscode.TextDocument) {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== doc) return;

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;
        const rootPath = workspaceFolders[0].uri.fsPath;

        const { tsconfigPath } = getConfig();
        
        const tempTsFile = path.join(rootPath, '.void.ts');
        const tempJsFile = path.join(rootPath, '.void.js');
        const originalCode = doc.getText();

        const wrapper = `
const _originalLog = console.log;
console.log = (...args) => {
    try {
        throw new Error();
    } catch (e) {
        const stackLines = e.stack.split('\\n');
        // Index 2 is the caller
        const callerLine = stackLines[2] || '';
        // format: __VOID__|caller_stack|output...
        _originalLog('__VOID__|' + callerLine + '|', ...args);
    }
};
`;
        const wrapperLines = wrapper.split('\n').length - 1;
        const codeToRun = wrapper + originalCode;

        fs.writeFileSync(tempTsFile, codeToRun);

        try {
            const esbuild = require('esbuild');
            const buildOptions: any = {
                entryPoints: [tempTsFile],
                bundle: true,
                platform: 'node',
                packages: 'external',
                outfile: tempJsFile,
                sourcemap: 'inline',
                logLevel: 'silent'
            };

            if (tsconfigPath) {
                 buildOptions.tsconfig = tsconfigPath;
            }

            await esbuild.build(buildOptions);

            const child = cp.spawn('node', ['--enable-source-maps', tempJsFile], {
                cwd: rootPath
            });

            let output = '';
            child.stdout.on('data', d => output += d.toString());
            child.stderr.on('data', d => output += d.toString());

            child.on('close', () => {
                this.parseOutput(output, editor, wrapperLines);
            });

        } catch (err: any) {
            this.outputChannel.appendLine(`Error: ${err.message}`);
        }
    }

    private parseOutput(output: string, editor: vscode.TextEditor, lineOffset: number) {
        const lines = output.split('\n');
        const decorations: vscode.DecorationOptions[] = [];
        const lineMap = new Map<number, string[]>();

        for (const line of lines) {
            // Check for prefix
            if (line.startsWith('__VOID__|')) {
                const secondPipeIndex = line.indexOf('|', 9);
                if (secondPipeIndex === -1) continue;

                const stackTracePart = line.substring(9, secondPipeIndex);
                // The rest is the logged content, might be separated by space from the pipe? 
                // console.log("a", "b") -> "a b"
                // _originalLog("prefix", "a", "b") -> "prefix a b"
                // So there is a space after the second pipe usually.
                let argsPart = line.substring(secondPipeIndex + 1);
                if (argsPart.startsWith(' ')) argsPart = argsPart.substring(1);

                const match = /\.void\.ts:(\d+)/.exec(stackTracePart);
                if (match) {
                    let lineNo = parseInt(match[1], 10);
                    lineNo = lineNo - lineOffset;
                    const editorLine = lineNo - 1;

                    if (editorLine >= 0) {
                        if (!lineMap.has(editorLine)) {
                            lineMap.set(editorLine, []);
                        }
                        lineMap.get(editorLine)?.push(argsPart);
                    }
                }
            } else {
                 // Maybe show runtime errors in output channel?
                 // But logs also go to stdout which we capture.
                 // We could show clean logs (without valid prefix) in output channel.
            }
        }

        lineMap.forEach((texts, line) => {
             decorations.push({
                 range: new vscode.Range(line, 0, line, 1000),
                 renderOptions: {
                     after: {
                         contentText: `  => ${texts.join(', ')}`,
                         color: '#888888',
                         fontStyle: 'italic',
                         margin: '0 0 0 2em'
                     }
                 }
             });
        });

        editor.setDecorations(this.decorationType, decorations);
    }
    
    public dispose() {
        this.decorationType.dispose();
        this.outputChannel.dispose();
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
    }
}
