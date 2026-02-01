import * as vscode from 'vscode';
import { Playground } from './playground';

let playground: Playground | undefined;

export const activate = (context: vscode.ExtensionContext) => {
    console.log('Void extension is now active');

    const runInCurrent = vscode.commands.registerCommand('void.runInCurrent', () => {
        if (!playground) {
            playground = new Playground();
            context.subscriptions.push(playground);
        }
        
        const editor = vscode.window.activeTextEditor;
        if (editor && (editor.document.languageId === 'typescript' || editor.document.languageId === 'javascript')) {
             playground.attach(editor.document);
        } else {
             vscode.window.showErrorMessage('No active TypeScript/JavaScript file. Use "Summon Fresh Void" to create one.');
        }
    });

    const createNew = vscode.commands.registerCommand('void.createNew', async () => {
        if (!playground) {
            playground = new Playground();
            context.subscriptions.push(playground);
        }

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            const rootPath = workspaceFolders[0].uri.fsPath;
            const filePath = vscode.Uri.file(require('path').join(rootPath, 'playground.ts'));
            
            try {
                await vscode.workspace.fs.stat(filePath);
            } catch {
                const edit = new vscode.WorkspaceEdit();
                edit.createFile(filePath, { ignoreIfExists: true });
                edit.insert(filePath, new vscode.Position(0, 0), '// Void Playground\n\nconst x = 10;\nconsole.log(x);\n');
                await vscode.workspace.applyEdit(edit);
                const doc = await vscode.workspace.openTextDocument(filePath);
                await doc.save();
            }
            
            const doc = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(doc);
            playground.attach(doc);
        } else {
            vscode.window.showErrorMessage('Open a workspace to summon the Void.');
        }
    });

    context.subscriptions.push(runInCurrent);
    context.subscriptions.push(createNew);
}

export const deactivate = () => {
    if (playground) {
        playground.dispose();
    }
}
