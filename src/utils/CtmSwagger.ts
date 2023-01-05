/**
* ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES
* ARE TRADEMARKS OF THEIR RESPECTIVE OWNERS.
*
* (c) Copyright 2022 BMC Software, Inc.
* This code is licensed under BSD-3 license (see LICENSE.txt for details)
*/

/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-useless-escape */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-async-promise-executor */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
    return {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]

    };
}

/**
 * Manages CTM Swagger webview panels
 */
export class ctmSwaggerPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */

    public static currentPanel: ctmSwaggerPanel | undefined;
    public static readonly viewType = 'ctmSwagger';
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
 
    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (ctmSwaggerPanel.currentPanel) {
            ctmSwaggerPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            ctmSwaggerPanel.viewType,
            'Control-M AAPI Swagger',
            column || vscode.ViewColumn.One,
            getWebviewOptions(extensionUri)
        );

        ctmSwaggerPanel.currentPanel = new ctmSwaggerPanel(panel, extensionUri);
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        ctmSwaggerPanel.currentPanel = new ctmSwaggerPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri ) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._getHtmlForWebview();
        this._panel.title = "Control-M AAPI Swagger";

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);


    }

    public doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: 'refactor' });
    }

    public dispose() {
        ctmSwaggerPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private async _getHtmlForWebview() {

        const webview = this._panel.webview;
        this._panel.title = "Control-M Swagger";
        
        const projectHome: string = this._extensionUri.fsPath.toString();
        const webContentHome: string = path.join(projectHome, 'media');
        const webContentFile: string = path.join(webContentHome, 'swagger.html');
        let webContentHtml: any = "";
        
        const exists = await _.exists(webContentFile);
        if (!exists) {
            webContentHtml = "File not found ...";
            throw vscode.FileSystemError.FileNotFound();
        } else {
            webContentHtml = fs.readFileSync(webContentFile,'utf8');

        }
        this._panel.webview.html = webContentHtml;

    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


namespace _ {
    function handleResult<T>(resolve: (result: T) => void, reject: (error: Error) => void, error: Error | null | undefined, result: T | undefined): void {
        if (error) {
            reject(messageError(error));
        } else {
            resolve(result!);
        }
    }

	function messageError(error: Error & { code?: string }): Error {
        if (error.code === 'ENOENT') {
            return vscode.FileSystemError.FileNotFound();
        }

        if (error.code === 'EISDIR') {
            return vscode.FileSystemError.FileIsADirectory();
        }

        if (error.code === 'EEXIST') {
            return vscode.FileSystemError.FileExists();
        }

        if (error.code === 'EPERM' || error.code === 'EACCESS') {
            return vscode.FileSystemError.NoPermissions();
        }

        return error;
    }
	
    export function exists(path: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fs.exists(path, exists => handleResult(resolve, reject, null, exists));
        });
    }

    export function readfile(path: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            fs.readFile(path, (error, buffer) => handleResult(resolve, reject, error, buffer));
        });
    }
}