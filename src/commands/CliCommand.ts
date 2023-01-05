/**
* ALL BMC SOFTWARE PRODUCTS LISTED WITHIN THE MATERIALS ARE TRADEMARKS OF BMC SOFTWARE, INC. ALL OTHER COMPANY PRODUCT NAMES
* ARE TRADEMARKS OF THEIR RESPECTIVE OWNERS.
*
* (c) Copyright 2022 BMC Software, Inc.
* This code is licensed under MIT license (see LICENSE.txt for details)
*/

/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-useless-escape */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-async-promise-executor */

import { CliUtils } from "../utils/CliUtils";
import { MessageUtils } from "../utils/MessageUtils";
import * as vscode from "vscode";

// get CTM AAPI environment name from VS Code extension config
const strConfiguredEnvironmentName: string = vscode.workspace.getConfiguration('CTM.Automation.API').get('env');


/**
 * This function will call the CLI for the specified operation.
 * @param operation The cli operation to call (Constants.OP_BUILD, Constants.OP_RUN, Constants.OP_DEPLOY)
 * @param selectedFiles The file URI to pass to the CLI. This will be undefined if the command is issued from the command palette or the editor.
 */
export async function runCommand(operation: string, selectedFiles: vscode.Uri[] | undefined) {

    if (selectedFiles === undefined || selectedFiles.length === 0) { // command came from command palette or editor menu
        console.debug("SelectedFiles was undefined, attempting to use editor file");
        let editorUri = vscode.window.activeTextEditor?.document.uri;
        if (editorUri === undefined || vscode.workspace.getWorkspaceFolder(editorUri) === undefined) {
            // the active output channel will also be considered a text editor, but that's not useful to us
            MessageUtils.showErrorMessage("A workspace file must be open in the editor.");
            return;
        }
        else {
            selectedFiles = [];
            selectedFiles.push(editorUri);
        }
    }

    console.debug("Starting Control-M AAPI CLI command. File URI: " + selectedFiles);

    let child = await CliUtils.runCliCommandForOperation(operation, selectedFiles);
    CliUtils.addCloseListener(child, operation, CliUtils.getFileNameToShow(selectedFiles));
}

/**
 * This function will call the CTM AAPI CLI for the specified operation.
 * @param command The CTM AAPI command arguments.
 * @param args The CTM AAPI command arguments.
 */
export function runCtmCommand(command: string, args: string): string {
    let responseData = CliUtils.executeCtmCommand(command, args);
    return responseData;
}

/**
 * This function will call the CTM AAPI CLI for the specified operation.
 * @param command The CTM AAPI command arguments.
 * @param args The CTM AAPI command arguments.
 */
export function runCtmCmd(command: string, args: string): string {
    let responseData = CliUtils.executeCtmCommand(command, args);
    return responseData;
}