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

import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from "constants";
import * as fs from 'fs';
import * as vscode from 'vscode';
let ctmStatusBarItem: vscode.StatusBarItem;


/**
 * Utility namespace for functions related to VSCode output channels
 */
export namespace CommonUtils {

    const _ = require('lodash');


    // Status Bar
    // create a new status bar item that we can now manage

    export function createCtmStatusBar(): string {
        const id: string = "ctmStatusBarItem";
        ctmStatusBarItem = vscode.window.createStatusBarItem(id, vscode.StatusBarAlignment.Right, 100);
        ctmStatusBarItem.text = "$(comments-view-icon) JAC:";
        ctmStatusBarItem.tooltip = "Jobs-As-Code Status Updates";
        ctmStatusBarItem.show();
        return id;
    }

    export async function updateCtmStatusBar(data: string, tip: vscode.MarkdownString): Promise<boolean> {
        let status: boolean = true;
        ctmStatusBarItem.text = data;
        ctmStatusBarItem.tooltip = tip;
        ctmStatusBarItem.show();
        return status;
    }

    /**
     * Test if the input value is blank
     * 
     * @param value the value to be tested
     */
    export function isBlank(value: any): boolean {
        let newValue = value;

        if (_.isString(value)) {
            newValue = _.trim(value);
        }

        return _.isEmpty(newValue) && !_.isNumber(newValue) || _.isNaN(newValue);
    }

    /**
     * Test if the input value is not blank
     * 
     * @param value the value to be tested
     */
    export function isNotBlank(value: any): boolean {
        return !isBlank(value);
    }

    /**
     * Detect if running inside Mocha
     */
    export function isInMocha() {
        const context = require('global-var');
        return ['suite', 'test'].every(function (functionName) {
            return context[functionName] instanceof Function;
        });
    }

    /**
     * Adds escaped quotation marks around the given string
     * @param value a string to add quotes around
     */
    export function escapeString(value: any): string {
        let escapedString: string = '\"' + (value || '') + '\"';
        return escapedString;
    }

    /**
     * Check if data is valid JSON
     * @param json string to verify
     */
    export function isJsonString(data: string): boolean {
        try {
            JSON.parse(data);
        } catch (e) {
            return false;
        }
        return true;
    }

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

    export function existsfile(path: string): boolean {
        return fs.existsSync(path);
    }

    export function readfile(path: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            fs.readFile(path, (error, buffer) => handleResult(resolve, reject, error, buffer));
        });
    }

    export function writefile(path: string, data: string) {
        fs.writeFile(path, data, { flag: 'w', encoding: "utf8" }, (error) => {
            if (error) {
                console.debug("File Write Error: " + error);
            }
        });
    }

    export function deletefile(path: string) {
        fs.unlink(path, (error) => {
            if (error) {
                console.debug("File Delete Error: " + error);
            }
        });
    }

    export function replacefile(path: string, data: string) {
        let pathStatus = existsfile(path);
        if (pathStatus) {
            deletefile(path);
        }
        pathStatus = existsfile(path);
        writefile(path, data);
    }

    export function checkIfString(data: any): boolean {
        if (typeof data === 'string') {
            return true;
        }
        return false;
    }

    export function SplitTime(numberOfHours: number): any {
        let Days = Math.floor(numberOfHours / 24);
        let Remainder = numberOfHours % 24;
        let Hours = Math.floor(Remainder);
        let Minutes = Math.floor(60 * (Remainder - Hours));
        return ({ "Days": Days, "Hours": Hours, "Minutes": Minutes });
    }

    export function getProcNumString(context: vscode.ExtensionContext, prefix: string): string {

        let proccessNumber: any = context.globalState.get('ctmInfrastructureProcNum' + prefix);
        if (proccessNumber < 9999) {
            proccessNumber++;
        }
        else {
            proccessNumber = 1;
        }

        let procNumString: string = prefix + proccessNumber.toString().padStart(4, "0");
        context.globalState.update('ctmInfrastructureProcNum' + prefix, proccessNumber);

        return procNumString;
    }
}