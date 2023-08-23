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
import * as json from 'jsonc-parser';
import * as path from 'path';
import {Memento} from "vscode";

import * as CtmCliCommand from '../commands/CliCommand';
import {MessageUtils} from "../utils/MessageUtils";
import {OutputUtils} from "../utils/OutputUtils";
import {CommonUtils} from '../utils/CommonUtils';

let processNumber: number = 0;
let strMessage: string = "Control-M Discover Infrastructure";
let strCommand: string;
let strPrefix: string = "D";
let procNumString: string;
let validJson: boolean = false;
let strEnvironmentCmd: string |undefined;

let debugApiEnabled: boolean = vscode.workspace.getConfiguration('CTM.Automation.debug').get('api');
let debugDataEnabled: boolean = vscode.workspace.getConfiguration('CTM.Automation.debug').get('data');
let debugExtensionEnabled: boolean = vscode.workspace.getConfiguration('CTM.Automation.debug').get('extension');
let strConfiguredEnvironmentName: string = vscode.workspace.getConfiguration('CTM.Automation.API').get('env');

/**
 * Get Control-M Infrastructure via CTM AAPI
 * Using Async to handle GUI update of output channel 
 * @param context VS Code Extension Context
 */
export async function discoverCtmInfrastructure(context: vscode.ExtensionContext) {
    let ctmInfrastructure = await getCtmInfrastructure(context);
    return ctmInfrastructure;
}

/**
 * Get Control-M Infrastructure via CTM AAPI
 * Using Async to handle GUI update of output channel
 *  @param context VS Code Extension Context
 */
export async function getCtmInfrastructure(context: vscode.ExtensionContext) {

    strConfiguredEnvironmentName = vscode.workspace.getConfiguration('CTM.Automation.API').get('env');
    debugApiEnabled = vscode.workspace.getConfiguration('CTM.Automation.debug').get('api');
    debugDataEnabled = vscode.workspace.getConfiguration('CTM.Automation.debug').get('data');
    const start = new Date().getTime();

    let ctmDiscoverDate = new Date();
    let ctmInfrastructure: string = "{}";
    let ctmInfrastructureFinal: string = "{}";
    let strMessage: string |undefined;


    // CTM environment settings
    let ctmEnvironment: string |undefined;
    let ctmEndPoint: string |undefined;
    let ctmEndPointTmp: string |undefined;
    let strConfiguredEnvironmentCmd: string |undefined;

    // helper variables
    let jsonStr: string;
    let jsonStrTempA: string;
    let jsonStrTempB: string;
    let jsonStrAgents: string;

    let jsonStrC: string;
    let jsonStrE: string = "";
    let jsonStrFinal: string = '{"status":"error"}';
    let jsonCtmData: any;


    // collect CTM data
    procNumString = CommonUtils.getProcNumString(context, strPrefix);
    strMessage = " -> Evaluating 'Session' for " + strConfiguredEnvironmentName + " ...";
    (await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);

    // Assign proper environment name and cmd for ctm aapi
    if (strConfiguredEnvironmentName === "default") {
        strConfiguredEnvironmentCmd = "";
    } else {
        strConfiguredEnvironmentCmd = " -e " + strConfiguredEnvironmentName;
    }

    // Test ctm aapi coneection to given environment
    let bValidConnection = await(testEnvironmentConnection(strConfiguredEnvironmentCmd, procNumString));

    // overall data collection process
    if (bValidConnection) { // collect CTM data
        procNumString = CommonUtils.getProcNumString(context, strPrefix);
        strMessage = " -> Evaluating 'Environment' ...";
        (await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);

        // Get Environments
        let jsonEnvironments = await computeEnvironments(strConfiguredEnvironmentCmd, procNumString);

        // Remove leading and trailing {} to support insert into larger json
        jsonStrTempA = jsonEnvironments.slice(0, -1);
        jsonStrTempB = jsonStrTempA.substring(1);
        jsonEnvironments = jsonStrTempB.toString();

        // collect CTM data
        procNumString = CommonUtils.getProcNumString(context, strPrefix);
        strMessage = " -> Evaluating 'Site Standards' ...";
        (await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);
        console.log(strMessage);
        let jsonSiteStandards = await computeSiteStandards(strConfiguredEnvironmentCmd, procNumString);

        // Remove leading and trailing {} to support insert into larger json
        jsonStrTempA = jsonSiteStandards.slice(0, -1);
        jsonStrTempB = jsonStrTempA.substring(1);
        jsonSiteStandards = jsonStrTempB.toString();

        // collect CTM data
        procNumString = CommonUtils.getProcNumString(context, strPrefix);
        strMessage = " -> Evaluating 'Secrets' ...";
        (await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);
        let jsonSecrets = await computeSecrets(strConfiguredEnvironmentCmd, procNumString);

        // Remove leading and trailing {} to support insert into larger json
        jsonStrTempA = jsonSecrets.slice(0, -1);
        jsonStrTempB = jsonStrTempA.substring(1);
        jsonSecrets = jsonStrTempB.toString();

        // collect CTM data
        procNumString = CommonUtils.getProcNumString(context, strPrefix);
        strMessage = " -> Evaluating 'Servers' ...";
        (await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);
        if (debugApiEnabled) {
            strMessage = '    -> API: "ctm config servers::get' + strConfiguredEnvironmentCmd + '"';
            console.log(strCommand);
            (await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);
        }
        jsonCtmData = CtmCliCommand.runCtmCmd("config", "servers::get" + strConfiguredEnvironmentCmd);

        // Get data for each server
        let servers: any;
        let serverName: string;
        let hostName: string;
        let serverVersion: string;
        servers = json.parse(jsonCtmData.toString());

        let strServers: string |undefined;
        // document ctm aapi calls in output channel
        servers.forEach((e : any, i : any) => { // Get CTM server [datacenter] details
            serverName = e.name.toString();

            // start with empty string
            if (strServers === undefined) {
                strServers = "";
            }
            strServers = strServers + serverName + ",";

            if (debugApiEnabled) {

                strMessage = '    -> API: "ctm config calendars::get ' + serverName + strConfiguredEnvironmentCmd + '"';
                OutputUtils.getCtmOutputChannel().appendLine(procNumString + strMessage);

                strMessage = '    -> API: "ctm config server:agents::get ' + serverName + strConfiguredEnvironmentCmd + '"';
                OutputUtils.getCtmOutputChannel().appendLine(procNumString + strMessage);

                strMessage = '    -> API: "ctm config server:runasusers::get ' + serverName + strConfiguredEnvironmentCmd + '"';
                OutputUtils.getCtmOutputChannel().appendLine(procNumString + strMessage);

                strMessage = '    -> API: "ctm run resources::get ' + serverName + strConfiguredEnvironmentCmd + '"';
                OutputUtils.getCtmOutputChannel().appendLine(procNumString + strMessage);

                strMessage = '    -> API: "ctm config server:remotehosts::get ' + serverName + strConfiguredEnvironmentCmd + '"';
                OutputUtils.getCtmOutputChannel().appendLine(procNumString + strMessage);

                strMessage = '    -> API: "ctm config server:hostgroups::get ' + serverName + strConfiguredEnvironmentCmd + '"';
                OutputUtils.getCtmOutputChannel().appendLine(procNumString + strMessage);
            }
        });

        // remove ',' if it is the last char
        if (strServers !== undefined) {
            const stringLength = strServers.length;
            const lastChar = strServers.charAt(stringLength - 1);

            if (lastChar === ",") {
                strServers = strServers.slice(0, -1);
            }
        }

        strMessage = " -> Executing CTM AAPI calls for: " + strServers;
        (await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);
        console.log(strMessage);

        servers.forEach((e : any, i : any) => { // Get CTM server [datacenter] details
            serverName = e.name.toString();
            hostName = e.host.toString();
            serverVersion = e.version.toString();

            console.log(' -> Loop -> Server Name: "' + serverName.toString() + '"');
            console.log(' -> Loop -> Host Name: "' + hostName.toString() + '"');
            console.log(' -> Loop -> Version: "' + serverVersion.toString() + '"');

            // collect CTM data
            procNumString = CommonUtils.getProcNumString(context, strPrefix);
            strMessage = " -> " + serverName + " -> Evaluating 'Calendars' ...";
            console.log(strMessage);
            let jsonCalendars: any;
            jsonCalendars = computeCalendars(strConfiguredEnvironmentCmd, serverName, procNumString);

            // Remove leading and trailing {} to support insert into larger json
            jsonStrTempA = jsonCalendars.slice(0, -1);
            jsonStrTempB = jsonStrTempA.substring(1);
            let calendars = jsonStrTempB.toString();

            // collect CTM data
            procNumString = CommonUtils.getProcNumString(context, strPrefix);
            strMessage = " -> " + serverName + " -> Evaluating 'Agents' ...";
            console.log(strMessage);
            let agents = getAgents(strConfiguredEnvironmentCmd, serverName, procNumString);
            // Remove leading and trailing {} to support insert into larger json
            jsonStrTempA = json.parse(agents.toString())["agents"];
            jsonStrAgents = JSON.stringify(jsonStrTempA);


            // collect CTM data
            procNumString = CommonUtils.getProcNumString(context, strPrefix);
            strMessage = " -> " + serverName + " -> Evaluating 'RunAs' ...";
            console.log(strMessage);
            let runAs = computeRunAs(strConfiguredEnvironmentCmd, serverName, procNumString);

            // Remove leading and trailing {} to support insert into larger json
            jsonStrTempA = runAs.slice(0, -1);
            jsonStrTempB = jsonStrTempA.substring(1);
            runAs = jsonStrTempB.toString();

            // collect CTM data
            procNumString = CommonUtils.getProcNumString(context, strPrefix);
            strMessage = " -> " + serverName + " -> Evaluating 'Resources' ...";
            console.log(strMessage);
            let ctmResources = computeResources(strConfiguredEnvironmentCmd, serverName, procNumString);

            // Remove leading and trailing {} to support insert into larger json
            jsonStrTempA = ctmResources.slice(0, -1);
            jsonStrTempB = jsonStrTempA.substring(1);
            ctmResources = jsonStrTempB.toString();

            // collect CTM data
            procNumString = CommonUtils.getProcNumString(context, strPrefix);
            strMessage = " -> " + serverName + " -> Evaluating 'Remote Hosts' ...";
            console.log(strMessage);
            let remoteHosts = computeRemoteHosts(strConfiguredEnvironmentCmd, serverName, procNumString);

            // Remove leading and trailing {} to support insert into larger json
            jsonStrTempA = remoteHosts.slice(0, -1);
            jsonStrTempB = jsonStrTempA.substring(1);
            remoteHosts = jsonStrTempB.toString();


            // Get CTM host groups with corresponding agents
            // collect CTM data
            procNumString = CommonUtils.getProcNumString(context, strPrefix);
            strMessage = " -> " + serverName + " -> Evaluating 'Hostgroups' ...";
            console.log(strMessage);
            let hostGroupAgents = computeHostGroupAgents(strConfiguredEnvironmentCmd, serverName, procNumString);
            let jsonStrHostGroupAgents = JSON.stringify(hostGroupAgents);

            // Remove leading and trailing {} to support insert into larger json
            jsonStrTempA = jsonStrHostGroupAgents.slice(0, -1);
            jsonStrTempB = jsonStrTempA.substring(1);
            jsonStrHostGroupAgents = jsonStrTempB.toString();


            // Build Infrastructure json
            procNumString = CommonUtils.getProcNumString(context, strPrefix);
            strMessage = " -> " + serverName + " -> Build 'Server' Tree ...";
            console.log(strMessage);
            jsonStr = '{"server":"' + serverName + '",' + '"host":"' + hostName + '",' + '"version":"' + serverVersion + '",' + '"agents":' + jsonStrAgents + ',' + jsonStrHostGroupAgents + ',' + remoteHosts + ',' + runAs + ',' + ctmResources + ',' + calendars + '}';
            ctmInfrastructure = json.parse(jsonStr);
            checkJson(jsonStr, "CTM Infrastructure Server: " + serverName);

            // Check valid json
            if (debugDataEnabled) {
                validJson = CommonUtils.isJsonString(jsonStr);
                strMessage = " -> CTM 'Infrastructure' Server: '" + serverName + "' json status: " + validJson;
                console.log(strMessage);
            }

            jsonStrC = jsonStr;
            jsonStrE = jsonStrC + ',' + jsonStrE;
            console.log(' -> Loop -> Server: "' + serverName.toString() + '" done');
        });

        strMessage = " -> Evaluating 'Servers': done";
        (await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);
        console.log(strMessage);

        // collect CTM data
        procNumString = CommonUtils.getProcNumString(context, strPrefix);
        strMessage = " -> Evaluating 'Workload Policies' ...";
        (await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);
        console.log(strMessage);
        let jsonWorkloadPolicies = await computeWorkloadPolicies(strConfiguredEnvironmentCmd, procNumString);

        // Remove leading and trailing {} to support insert into larger json
        jsonStrTempA = jsonWorkloadPolicies.slice(0, -1);
        jsonStrTempB = jsonStrTempA.substring(1);
        jsonWorkloadPolicies = jsonStrTempB.toString();

        // collect CTM data
        procNumString = CommonUtils.getProcNumString(context, strPrefix);
        strMessage = " -> Evaluating 'Centralized Connection Profiles' ...";
        (await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);
        console.log(strMessage);
        let jsonConnectionProfilesCentralized = await computeConnectionProfilesCentralized(strConfiguredEnvironmentCmd, procNumString);

        // Remove leading and trailing {} to support insert into larger json
        jsonStrTempA = jsonConnectionProfilesCentralized.slice(0, -1);
        jsonStrTempB = jsonStrTempA.substring(1);
        jsonConnectionProfilesCentralized = jsonStrTempB.toString();


        // collect CTM data
        procNumString = CommonUtils.getProcNumString(context, strPrefix);
        strMessage = " -> Build 'Infrastructure' Tree ...";
        (await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);
        console.log(strMessage);
        let elapsed = new Date().getTime() - start;
        // Build final JSON
        jsonStrE = jsonStrE.slice(0, -1);
        jsonStr = '{"Selected": "' + strConfiguredEnvironmentName + '",' + jsonEnvironments + ',"discovery": "' + ctmDiscoverDate.toString() + '","age": "","datacenters": [' + jsonStrE + '],' + jsonConnectionProfilesCentralized + ',' + jsonWorkloadPolicies + ',' + jsonSecrets + ',' + jsonSiteStandards + ',"elapsed":"' + elapsed + '","status":"success"}';
        jsonStrFinal = jsonStr;

        // report CTM data
        procNumString = CommonUtils.getProcNumString(context, strPrefix);
        strMessage = " -> Report 'Infrastructure' ...";
        (await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);
        console.log(strMessage);
        let ctmInfrastructureJson: any = jsonStrFinal;

        // Update Global State
        try {
            let ctmInfrastructureData = JSON.parse(ctmInfrastructureJson);

            ctmEnvironment = ctmInfrastructureData["default"];
            ctmEndPoint = ctmInfrastructureData["environments"][ctmEnvironment]["endPoint"];
            ctmEndPointTmp = ctmEndPoint.split("automation-api")[0];

            await context.globalState.update('ctmEndPointSelfService', ctmEndPointTmp + "ControlM/");
            await context.globalState.update('ctmEndPointAI', ctmEndPointTmp + "ApplicationIntegrator/");
            await context.globalState.update('ctmEndPointConfiguration', ctmEndPointTmp + "ControlM/Configuration/");
            await context.globalState.update('ctmEndPointSharedConnectionProfile', ctmEndPointTmp + "ControlM/Configuration/SharedConnectionProfile/");
            await context.globalState.update('ctmEndPointCalendarsConfiguration', ctmEndPointTmp + "ControlM/CalendarsConfiguration/");

        } catch (error) {
            null;
        }

        return ctmInfrastructureJson;
    } else { // report CTM data
        strMessage = " -> No valid session for " + strConfiguredEnvironmentName;
        (await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);
        console.log(strMessage);
        let ctmInfrastructureJson = jsonStrFinal;
        return ctmInfrastructureJson;
    }
}

/**
 * Get Control-M Agent Infrastructure via CTM AAPI
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param ctm Control-M datacenter name, server name
 * @param sProcNum Output channel message prefix
 */
export function getAgents(envCmd: string, ctm: string, sProcNum: string) {

    let parametersCtm: string = "server:agents::get " + ctm + envCmd;
    let commandCtm: string = "config";
    let jsonCtmData = CtmCliCommand.runCtmCommand(commandCtm, parametersCtm);
    strCommand = "ctm config " + parametersCtm;

    if (debugApiEnabled) {
        console.log(strCommand);
    }

    if (! jsonCtmData.length) {
        jsonCtmData = "";
    } else {
        jsonCtmData = jsonCtmData.replace(/\n/g, '');
    }
    return jsonCtmData;

}

/**
 * Get Control-M Host Groups Infrastructure via CTM AAPI
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param ctm Control-M datacenter name, server name
 * @param sProcNum Output channel message prefix
 */
export function getHostGroups(envCmd: string, ctm: string, sProcNum: string) {
    let parametersCtm: string = "server:hostgroups::get " + ctm + envCmd;
    let commandCtm: string = "config";
    let jsonCtmData = CtmCliCommand.runCtmCmd(commandCtm, parametersCtm);

    strCommand = "ctm config " + parametersCtm;
    if (debugApiEnabled) {
        console.log(strCommand);
    }
    if (! jsonCtmData.length) {
        return "";
    } else {
        jsonCtmData = jsonCtmData.replace(/\n/g, '');
        return jsonCtmData;
    }
}

/**
 * Get Control-M Connection Profile Types via CTM AAPI
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param sProcNum Output channel message prefix
 */
export async function getConnectionProfileTypes(envCmd: string, sProcNum: string) { // Command will return with error, this is on purpose
    let parametersCtm: string = 'connectionprofiles:centralized::get -s "type=JAC&name=*"' + envCmd;
    let commandCtm: string = "deploy";
    let jsonCtmData = CtmCliCommand.runCtmCommand(commandCtm, parametersCtm);
    let jsonCtmDataMessage: string;
    let sCtmDataTmpA: string;
    let sCtmDataTmpB: string;

    strCommand = "ctm deploy " + parametersCtm;
    if (debugApiEnabled) {
        (await OutputUtils.getOutputChannel()).appendLine(sProcNum + '    -> API: "' + strCommand + '"');
    }

    if (! jsonCtmData.length) {
        return "";
    } else {
        jsonCtmData = jsonCtmData.replace(/\n/g, '');
        if (debugApiEnabled) {
            (await OutputUtils.getOutputChannel()).appendLine(sProcNum + '    -> API: "' + strCommand + '"');
        }
        let jsonCtmDataTemp = json.parseTree(jsonCtmData);
        jsonCtmDataMessage = jsonCtmDataTemp.children[0].children[1].children[0].children[0].children[1].value.toString();
        sCtmDataTmpA = jsonCtmDataMessage.substring(jsonCtmDataMessage.indexOf("[") + 1);
        sCtmDataTmpB = sCtmDataTmpA.substring(0, sCtmDataTmpA.indexOf("]"));
        let sCtmData = sCtmDataTmpB.split(",");
        return sCtmData;
    }
}

/**
 * Get Control-M Host Groups Infrastructure via CTM AAPI
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param type Connection Profile Type
 * @param sProcNum Output channel message prefix
 */
export async function getConnectionProfileCentralized(envCmd: string, type: string, sProcNum: string) {
    let parametersCtm: string = 'connectionprofiles:centralized::get -s "type=' + type + '&name=*"' + envCmd;
    let commandCtm: string = "deploy";
    let jsonCtmData = CtmCliCommand.runCtmCommand(commandCtm, parametersCtm);

    strCommand = "ctm config " + parametersCtm;
    if (debugApiEnabled) {
        (await OutputUtils.getOutputChannel()).appendLine(sProcNum + '    -> API: "' + strCommand + '"');
    }

    if (! jsonCtmData.length) {
        return "";
    } else {
        jsonCtmData = jsonCtmData.replace(/\n/g, '');
        return jsonCtmData;
    }
}

/**
 * Get Control-M Agents in a sepcified host group via CTM AAPI
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param ctm Control-M datacenter name, server name
 * @param group Control-M host group
 * @param sProcNum Output channel message prefix
 */
export function getHostGroupAgents(envCmd: string, ctm: string, group: string, sProcNum: string) {
    let parametersCtm: string = "server:hostgroup:agents::get " + ctm + " " + group + envCmd;
    let commandCtm: string = "config";
    let jsonCtmData = CtmCliCommand.runCtmCmd(commandCtm, parametersCtm);
    strCommand = "ctm config " + parametersCtm;
    if (debugApiEnabled) {
        console.log(strCommand);
    }
    if (! jsonCtmData.length) {
        return "";
    } else {
        jsonCtmData = jsonCtmData.replace(/\n/g, '');
        return jsonCtmData;
    }
}

/**
 * Get Control-M all Agents in a all host group via CTM AAPI
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param ctm Control-M datacenter name, server name
 * @param sProcNum Output channel message prefix
 */
export function computeHostGroupAgents(envCmd: string, ctm: string, sProcNum: string) {
    let tempAG: string;
    let jsonCtmData = getHostGroups(envCmd, ctm, sProcNum);
    let jsonStr: string = "";
    let jsonStrB: string;
    let jsonStrC: string;
    let jsonStrE: string = "";
    let jsonStrFinal: string = "";

    if (jsonCtmData.length < 3) {
        jsonStr = '{"hostgroups": []}';
        jsonStrFinal = JSON.parse(jsonStr);
    } else {

        let tempHG = json.parse(jsonCtmData.toString());
        let hostGroup: string;

        tempHG.forEach(async (e : any, i : any) => {
            hostGroup = e;
            let jsonCtmDataB = getHostGroupAgents(envCmd, ctm, hostGroup, sProcNum);
            let tempHGA = json.parse(jsonCtmDataB.toString());

            let re = /\"host\"/gi;
            let jsonStrA = JSON.stringify(tempHGA).replace(re, '\"nodeid\"');
            jsonStrB = JSON.parse(jsonStrA);
            jsonStrC = '{"group":"' + hostGroup + '", "agents":' + JSON.stringify(jsonStrB) + '}';
            jsonStrE = jsonStrC + ',' + jsonStrE;

        });
        jsonStrE = jsonStrE.slice(0, -1);
        jsonStr = '{"hostgroups": [' + jsonStrE + ']}';
        jsonStrFinal = JSON.parse(jsonStr);

    }
    return jsonStrFinal;
}

/**
 * Get Control-M all Agents in a all host group via CTM AAPI
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param sProcNum Output channel message prefix
 */
export async function computeConnectionProfilesCentralized(envCmd: string, sProcNum: string) {

    let profileTypes = await getConnectionProfileTypes(envCmd, sProcNum);
    let jsonStrA: string;
    let jsonStrB: string;
    let jsonStrC: string;
    let jsonStrBaseCMs: string |undefined;
    let jsonStrCpBase: string;
    let jsonStrAIs: string |undefined;
    let jsonStrCpAI: string;
    let jsonStrFinal: string = "";

    let aiProfiles: string;
    let baseProfiles: string;

    if (! profileTypes.length) {
        return jsonStrFinal;
    } else {
        for (let profileType of profileTypes) {
            profileType = profileType.trim();

            // Run only for base CM's connection profiles
            if (! profileType.startsWith("ApplicationIntegrator:AI")) {
                let profile = await getConnectionProfileCentralized(envCmd, profileType, sProcNum);
                jsonStrA = json.parse(profile.toString());
                jsonStrB = JSON.stringify(jsonStrA);
                let jsonStrLenght = jsonStrB.length;

                if (jsonStrLenght > 2) {
                    jsonStrC = '{"type":"' + profileType + '", "connections":[' + jsonStrB + ']}';

                    if (jsonStrBaseCMs === undefined) {
                        jsonStrBaseCMs = jsonStrC;
                    } else {
                        jsonStrBaseCMs = jsonStrBaseCMs + ',' + jsonStrC;
                    }
                }
            }

            // Run only for ApplicationIntegrator connection profiles
            if (profileType.startsWith("ApplicationIntegrator:AI")) {
                let profile = await getConnectionProfileCentralized(envCmd, profileType, sProcNum);
                jsonStrA = json.parse(profile.toString());
                jsonStrB = JSON.stringify(jsonStrA);
                let jsonStrLenght = jsonStrB.length;

                if (jsonStrLenght > 2) {
                    jsonStrC = '{"type":"' + profileType + '", "connections":[' + jsonStrB + ']}';

                    if (jsonStrAIs === undefined) {
                        jsonStrAIs = jsonStrC;
                    } else {
                        jsonStrAIs = jsonStrAIs + ',' + jsonStrC;
                    }
                }
            }
        }

        // Run only for base CM's connection profiles
        // remove ',' if it is the last char
        if (jsonStrBaseCMs !== undefined) {
            const stringLength = jsonStrBaseCMs.length;
            const lastChar = jsonStrBaseCMs.charAt(stringLength - 1);

            if (lastChar === ",") {
                jsonStrBaseCMs = jsonStrBaseCMs.slice(0, -1);
            }
            jsonStrCpBase = '{"profiles.base": [' + jsonStrBaseCMs + ']}';
        } else {
            jsonStrCpBase = '{"profiles.base": []}';
        }

        // Remove leading and trailing {} to support insert into larger json
        jsonStrA = jsonStrCpBase.slice(0, -1);
        jsonStrB = jsonStrA.substring(1);
        jsonStrCpBase = jsonStrB.toString();

        baseProfiles = jsonStrCpBase;

        // Run only for ApplicationIntegrator connection profiles
        // remove ',' if it is the last char
        if (jsonStrAIs !== undefined) {
            const stringLength = jsonStrAIs.length;
            const lastChar = jsonStrAIs.charAt(stringLength - 1);

            if (lastChar === ",") {
                jsonStrAIs = jsonStrAIs.slice(0, -1);
            }
            jsonStrCpAI = '{"profiles.ai": [' + jsonStrAIs + ']}';
        } else {
            jsonStrCpAI = '{"profiles.ai": []}';
        }

        // Remove leading and trailing {} to support insert into larger json
        jsonStrA = jsonStrCpAI.slice(0, -1);
        jsonStrB = jsonStrA.substring(1);
        jsonStrCpAI = jsonStrB.toString();

        aiProfiles = jsonStrCpAI;

        // Build Final JSON
        jsonStrFinal = '{"profiles": {' + baseProfiles + ',' + aiProfiles + '}}';
        return jsonStrFinal;
    }
}


export async function checkJson(data: string, step: string) {
    const jsonStr = JSON.stringify(data);
    try {
        const json = JSON.parse(jsonStr);
    } catch (error) {
        console.log(' - JSON Error: "' + step + ' with: ' + error.toString() + '"');
    }
}

/**
 * Get Control-M RunAs user via CTM AAPI
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param ctm Control-M datacenter name, server name
 * @param sProcNum Output channel message prefix
 */
export function getRunAs(envCmd: string, ctm: string, sProcNum: string) {
    let parametersCtm: string = "server:runasusers::get " + ctm + envCmd;
    let commandCtm: string = "config";
    let jsonCtmData = CtmCliCommand.runCtmCommand(commandCtm, parametersCtm);
    strCommand = "ctm config " + parametersCtm;
    if (debugApiEnabled) {
        console.log(strCommand);
    }
    if (! jsonCtmData.length) {
        console.log('Infrastructure Servers: No Data');
        return "";
    } else {
        jsonCtmData = jsonCtmData.replace(/\n/g, '');
        return jsonCtmData;
    }

}

/**
 * Get Control-M RunAs user via CTM AAPI and re-format output
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param ctm Control-M datacenter name, server name
 * @param sProcNum Output channel message prefix
 */
export function computeRunAs(envCmd: string, ctm: string, sProcNum: string) {
    let jsonStrFinal: string = "";
    let jsonCtmData = getRunAs(envCmd, ctm, sProcNum);
    let jsonStrA: string;
    let jsonStrB: string;
    let jsonStrRunAsAccounts: string |undefined;

    if (! jsonCtmData.length) {
        jsonStrRunAsAccounts = '{"runas":[]}';
    } else {
        let tempJson = json.parse(jsonCtmData.toString());

        let re = /\"agent\"/gi;
        jsonStrA = JSON.stringify(tempJson).replace(re, '\"nodeid\"');
        jsonStrB = '{"runas":' + jsonStrA + '}';
        jsonStrRunAsAccounts = jsonStrB;
    } jsonStrFinal = jsonStrRunAsAccounts;
    return jsonStrFinal;
}

/**
 * Get Control-M resources user via CTM AAPI
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param ctm Control-M datacenter name, server name
 * @param sProcNum Output channel message prefix
 */
export function getResources(envCmd: string, ctm: string, sProcNum: string) {
    let parametersCtm: string = "resources::get " + ctm + envCmd;
    let commandCtm: string = "run";
    let jsonCtmData = CtmCliCommand.runCtmCmd(commandCtm, parametersCtm);
    strCommand = "ctm run " + parametersCtm;
    if (debugApiEnabled) {
        console.log(strCommand);
    }
    if (! jsonCtmData.length) {
        return "";
    } else {
        jsonCtmData = jsonCtmData.replace(/\n/g, '');
        return jsonCtmData;
    }

}

/**
 * Get Control-M Resources user via CTM AAPI and re-format output
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param ctm Control-M datacenter name, server name
 * @param sProcNum Output channel message prefix
 */
export function computeResources(envCmd: string, ctm: string, sProcNum: string) {
    let jsonStrFinal: string = "";
    let jsonCtmData = getResources(envCmd, ctm, sProcNum);
    let jsonStrA: string;
    let jsonStrB: string;
    let jsonStrResources: string |undefined;

    if (! jsonCtmData.length) {
        jsonStrResources = '{"resources":[]}';
    } else {
        let tempJson = json.parse(jsonCtmData.toString());

        let re = /\"ctm\"/gi;
        jsonStrA = JSON.stringify(tempJson).replace(re, '\"server\"');
        jsonStrB = '{"resources":' + jsonStrA + '}';
        jsonStrResources = jsonStrB;
    } jsonStrFinal = jsonStrResources;
    return jsonStrFinal;
}

/**
 * Get Control-M resources user via CTM AAPI
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param ctm Control-M datacenter name, server name
 * @param state Control-M Workload Policy State [Active|Inactive]
 * @param sProcNum Output channel message prefix
 */
export async function getWorkloadPolicies(envCmd: string, state: string, sProcNum: string) {
    let parametersCtm: string = "workloadpolicies::get " + state + envCmd;
    let commandCtm: string = "run";
    let jsonCtmData = await CtmCliCommand.runCtmCommand(commandCtm, parametersCtm);
    strCommand = "ctm run " + parametersCtm;
    if (debugApiEnabled) {
        (await OutputUtils.getOutputChannel()).appendLine(sProcNum + '    -> API: "' + strCommand + '"');
    }
    if (! jsonCtmData.length) {
        return "";
    } else {
        jsonCtmData = jsonCtmData.replace(/\n/g, '');
        return jsonCtmData;
    }

}

/**
 * Get Control-M Resources user via CTM AAPI and re-format output
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param sProcNum Output channel message prefix
 */
export async function computeWorkloadPolicies(envCmd: string, sProcNum: string) {
    let jsonStrFinal: string = "";
    let jsonCtmDataActive = await getWorkloadPolicies(envCmd, "Active", sProcNum);
    let jsonCtmDataInactive = await getWorkloadPolicies(envCmd, "Inactive", sProcNum);
    let jsonStrA: string;
    let jsonStrB: string;
    let tempJson: string;
    let jsonStrWorkloadPoliciesActive: string |undefined;
    let jsonStrWorkloadPoliciesInactive: string |undefined;
    let re = /\"workloadPolicies\"/gi;

    // Get Active
    if (jsonCtmDataActive.length < 3) { // sonStrA = '{"active":[]}';
        jsonStrA = '"active":[]';
        jsonStrWorkloadPoliciesActive = jsonStrA;
    } else {
        tempJson = json.parse(jsonCtmDataActive.toString());
        jsonStrA = JSON.stringify(tempJson);

        // Replace JSON
        jsonStrWorkloadPoliciesActive = String(jsonStrA).replace(re, '\"active\"');
        // Remove leading and trailing {} to support insert into larger json
        jsonStrA = jsonStrWorkloadPoliciesActive.slice(0, -1);
        jsonStrB = jsonStrA.substring(1);
        jsonStrWorkloadPoliciesActive = jsonStrB.toString();

    }

    // Get Inactive
    if (jsonCtmDataInactive.length < 3) {
        jsonStrA = '"inactive":[]';
        jsonStrWorkloadPoliciesInactive = jsonStrA;
    } else {
        tempJson = json.parse(jsonCtmDataInactive.toString());
        jsonStrA = JSON.stringify(tempJson);

        // Replace JSON
        jsonStrWorkloadPoliciesInactive = String(jsonStrA).replace(re, '\"inactive\"');
        // Remove leading and trailing {} to support insert into larger json
        jsonStrA = jsonStrWorkloadPoliciesInactive.slice(0, -1);
        jsonStrB = jsonStrA.substring(1);
        jsonStrWorkloadPoliciesInactive = jsonStrB.toString();
    }

    // combine json's
    jsonStrB = '{"workloadpolicies": {' + jsonStrWorkloadPoliciesActive.toString() + ',' + jsonStrWorkloadPoliciesInactive.toString() + '}}';
    jsonStrFinal = jsonStrB;
    return jsonStrFinal;
}

/**
 * Get Control-M Site Standards user via CTM AAPI
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param sProcNum Output channel message prefix
 */
export async function getSiteStandardPolicies(envCmd: string, sProcNum: string) {

    let parametersCtm: string = "sitestandardpolicies::get " + envCmd;
    let commandCtm: string = "deploy";

    let jsonCtmData = await CtmCliCommand.runCtmCmd(commandCtm, parametersCtm);
    strCommand = "ctm deploy " + parametersCtm;
    if (debugApiEnabled) {
        (await OutputUtils.getOutputChannel()).appendLine(sProcNum + '    -> API: "' + strCommand + '"');
    }
    if (! jsonCtmData.length) {
        return "";
    } else {
        jsonCtmData = jsonCtmData.replace(/\n/g, '');
        return jsonCtmData;
    }

}

/**
 * Get Control-M Site Standards user via CTM AAPI
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param sProcNum Output channel message prefix
 */
export async function getSiteStandards(envCmd: string, sProcNum: string) {

    let parametersCtm: string = "sitestandards::get " + envCmd;
    let commandCtm: string = "deploy";

    let jsonCtmData = await CtmCliCommand.runCtmCmd(commandCtm, parametersCtm);
    strCommand = "ctm deploy " + parametersCtm;
    if (debugApiEnabled) {
        (await OutputUtils.getOutputChannel()).appendLine(sProcNum + '    -> API: "' + strCommand + '"');
    }
    if (! jsonCtmData.length) {
        return "";
    } else {
        jsonCtmData = jsonCtmData.replace(/\n/g, '');
        return jsonCtmData;
    }

}

/**
 * Get Control-M Site Standards via CTM AAPI and re-format output
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param sProcNum Output channel message prefix
 */
export async function computeSiteStandards(envCmd: string, sProcNum: string) {
    let jsonStrFinal: string = "";
    let jsonStrFinalB: string = "";
    let jsonCtmData = await getSiteStandards(envCmd, sProcNum);
    let jsonCtmDataB = await getSiteStandardPolicies(envCmd, sProcNum);
    let jsonStr: string;
    let jsonStrA: string;
    let jsonStrB: string;
    let jsonStrC: string;
    let jsonStrE: string = "";
    let jsonStrSiteStandards: string |undefined;
    let jsonStrSiteStandardPolicies: string |undefined;
    // let jsonSiteStandardPolicies: any | undefined;

    // Standard variables
    let itemSiteStandard: any;
    let strSiteStandardName: string |undefined;
    let intSiteStandardBusinessParameters: number |undefined;
    let strSiteStandardDescription: string |undefined;
    let intSiteStandardRules: number |undefined;
    let jsonDesiredPolicy: any;

    let itemSiteStandardPolicy: any;
    let strSiteStandardPolicyName: string;
    let strSiteStandardPolicyDescription: string;
    let strSiteStandardPolicyParent: string;
    let strSiteStandardPolicyApplyOn: string;
    let strSiteStandardPolicyApplyOnServer: string;
    let strSiteStandardPolicyApplyOnFolder: string;

    let desiredPolicyDescription: string |undefined;
    let desiredPolicyApplyOnServer: string |undefined;
    let desiredPolicyApplyOnFolder: string |undefined;

    jsonStrA = json.parse(jsonCtmData.toString());
    jsonStrB = JSON.stringify(jsonStrA);
    let jsonStrLenght = jsonStrB.length;


    interface Policy {
        name: string;
        SiteStandard: string;
        description: string;
        ApplyOn: {
            Server: string;
            Folder: string;
        };
    }

    // Site Standard Policies
    if (! jsonCtmDataB.length) {
        jsonStrFinalB = '{"sitestandardpolicies":[]}';
    } else {
        let jsonStrSiteStandardPolicies = json.parse(jsonCtmDataB.toString());
        for (let item in jsonStrSiteStandardPolicies) {

            itemSiteStandardPolicy = jsonStrSiteStandardPolicies[item];
            strSiteStandardPolicyName = item;
            try {
                strSiteStandardPolicyDescription = itemSiteStandardPolicy["Description"];
            } catch (error) { // pass
            }

            try {
                strSiteStandardPolicyApplyOnServer = itemSiteStandardPolicy["ApplyOn"]["Server"];
            } catch (error) { // pass
            }


            try {
                strSiteStandardPolicyApplyOnFolder = itemSiteStandardPolicy["ApplyOn"]["Folder"];
            } catch (error) { // pass
            }strSiteStandardPolicyApplyOn = '{"Server":"' + strSiteStandardPolicyApplyOnServer + '", "Folder":"' + strSiteStandardPolicyApplyOnFolder + '"}';
            strSiteStandardPolicyParent = itemSiteStandardPolicy["SiteStandard"];
            jsonStrC = '{"name":"' + strSiteStandardPolicyName + '", "SiteStandard":"' + strSiteStandardPolicyParent + '", "description":"' + strSiteStandardPolicyDescription + '", "ApplyOn":' + strSiteStandardPolicyApplyOn + '}';
            jsonStrE = jsonStrC + ',' + jsonStrE;
        }
        jsonStrE = '[' + jsonStrE.slice(0, -1) + ']';

    }

    let jsonSiteStandardPolicies: Policy[] = json.parse(jsonStrE.toString());

    // Site Standards
    jsonStrE = "";
    if (! jsonCtmData.length) {
        jsonStrFinal = '{"sitestandards":[]}';

    } else {
        if (jsonStrLenght > 2) {
            let jsonSiteStandards = json.parse(jsonCtmData.toString());

            for (let item in jsonSiteStandards) {

                itemSiteStandard = jsonSiteStandards[item];
                strSiteStandardName = item;

                let desiredPolicy = jsonSiteStandardPolicies.find(Policy => Policy.SiteStandard === strSiteStandardName);


                if (desiredPolicy) {
                    desiredPolicyDescription = desiredPolicy.description;
                    desiredPolicyApplyOnServer = desiredPolicy.ApplyOn.Server;
                    desiredPolicyApplyOnFolder = desiredPolicy.ApplyOn.Folder;
                }

                if (desiredPolicyDescription === "undefined" || desiredPolicyDescription.length === 0) {
                    desiredPolicyDescription = "";
                }

                if (desiredPolicyApplyOnServer === "undefined" || desiredPolicyApplyOnServer.length === 0) {
                    desiredPolicyApplyOnServer = "";
                }

                if (desiredPolicyApplyOnFolder === "undefined" || desiredPolicyApplyOnFolder.length === 0) {
                    desiredPolicyApplyOnFolder = "";
                }


                if (desiredPolicy) {
                    jsonDesiredPolicy = '"policy":{"type":"Site Standard Policy","name":"' + desiredPolicy.name + '", "description":"' + desiredPolicyDescription + '", "servers":"' + desiredPolicyApplyOnServer + '", "folders":"' + desiredPolicyApplyOnFolder + '"}';
                } else {
                    jsonDesiredPolicy = "";
                }

                try {
                    strSiteStandardDescription = itemSiteStandard["Description"];
                } catch (error) { // pass
                }

                try {
                    intSiteStandardBusinessParameters = itemSiteStandard["BusinessParameters"].length;
                } catch (error) { // pass
                }

                try {
                    intSiteStandardRules = itemSiteStandard["Rules"].length;
                } catch (error) { // pass
                }

                if (desiredPolicy) {
                    jsonStrC = '{"name":"' + strSiteStandardName + '", "Business Parameters":' + intSiteStandardBusinessParameters + ', "description":"' + strSiteStandardDescription + '", "rules":' + intSiteStandardRules + ',' + jsonDesiredPolicy + '}';
                } else {
                    jsonStrC = '{"name":"' + strSiteStandardName + '", "Business Parameters":' + intSiteStandardBusinessParameters + ', "description":"' + strSiteStandardDescription + '", "rules":' + intSiteStandardRules + '}';
                } jsonStrE = jsonStrC + ',' + jsonStrE;

            }
            jsonStrE = jsonStrE.slice(0, -1);
            jsonStrFinal = '{"sitestandards": [' + jsonStrE + ']}';

        } else {
            jsonStrFinal = '{"sitestandards":[]}';
        }
    }

    return jsonStrFinal;
}


/**
 * Returns a list of all remote hosts registered to the Control-M/Server. 
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param ctm Control-M datacenter name, server name
 * @param sProcNum Output channel message prefix
 */
export function getRemoteHosts(envCmd: string, ctm: string, sProcNum: string) {
    let parametersCtm: string = "server:remotehosts::get " + ctm + envCmd;
    let commandCtm: string = "config";
    let jsonCtmData = CtmCliCommand.runCtmCmd(commandCtm, parametersCtm);
    strCommand = "ctm config " + parametersCtm;
    if (debugApiEnabled) {
        console.log(strCommand);
    }
    if (! jsonCtmData.length) {
        return "";
    } else {
        jsonCtmData = jsonCtmData.replace(/\n/g, '');
        return jsonCtmData;
    }

}

/**
 * Returns the remote host configuration properties from the Control-M/Server. 
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param ctm Name of the Control-M/Server
 * @param host Name of host or alias of the remote host
 * @param sProcNum Output channel message prefix
 */
export function getRemoteHost(envCmd: string, ctm: string, host: string, sProcNum: string) {
    let parametersCtm: string = "server:remotehost::get " + ctm + " " + host + envCmd;
    let commandCtm: string = "config";
    let jsonCtmData = CtmCliCommand.runCtmCmd(commandCtm, parametersCtm);
    strCommand = "ctm config " + parametersCtm;
    if (debugApiEnabled) {
        console.log(strCommand);
    }
    if (! jsonCtmData.length) {
        return "";
    } else {
        jsonCtmData = jsonCtmData.replace(/\n/g, '');
        return jsonCtmData;
    }

}

/**
 * Get Control-M all Agents in a all host group via CTM AAPI
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param ctm Control-M datacenter name, server name
 * @param sProcNum Output channel message prefix
 */
export function computeRemoteHosts(envCmd: string, ctm: string, sProcNum: string) {
    let tempAG: string;
    let jsonCtmData = getRemoteHosts(envCmd, ctm, sProcNum);
    let jsonStr: string = "";
    let jsonStrB: string;
    let jsonStrC: string;
    let jsonStrE: string |undefined;
    let jsonStrFinal: string = "";

    if (jsonCtmData.length < 3) {
        jsonStr = '{"remote": []}';
    } else {

        let tempCtmData = json.parse(jsonCtmData.toString());

        for (let remoteHost of tempCtmData) {
            let jsonCtmDataB = getRemoteHost(envCmd, ctm, remoteHost, sProcNum);
            jsonStrB = json.parse(jsonCtmDataB.toString());
            jsonStrC = '{"host":"' + remoteHost + '", "properties":' + JSON.stringify(jsonStrB) + '}';

            if (jsonStrE === undefined) {
                jsonStrE = jsonStrC;
            } else {
                jsonStrE = jsonStrE + ',' + jsonStrC;
            }
        }
        jsonStr = '{"remote": [' + jsonStrE + ']}';
    } jsonStrFinal = jsonStr;
    return jsonStrFinal;
}

/**
 * Returns a list of names of defined secrets.
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param sProcNum Output channel message prefix
 */
export async function getSecrets(envCmd: string, sProcNum: string) {
    let parametersCtm: string = "secrets::get" + envCmd;
    let commandCtm: string = "config";
    let jsonCtmData = CtmCliCommand.runCtmCommand(commandCtm, parametersCtm);
    strCommand = "ctm config " + parametersCtm;
    if (debugApiEnabled) {
        (await OutputUtils.getOutputChannel()).appendLine(sProcNum + '    -> API: "' + strCommand + '"');
    }
    if (! jsonCtmData.length) {
        return "";
    } else {
        jsonCtmData = jsonCtmData.replace(/\n/g, '');
        return jsonCtmData;
    }

}

/**
 * Returns a list of names of defined secrets.
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param sProcNum Output channel message prefix
 */
export async function computeSecrets(envCmd: string, sProcNum: string) {
    let jsonStrFinal: string = "";
    let jsonCtmData = await getSecrets(envCmd, sProcNum);
    let jsonStrA: string;
    let jsonStrB: string;
    let jsonStrSecrets: string |undefined;

    if (! jsonCtmData.length) {
        jsonStrSecrets = '{"secrets":[]}';
    } else {
        let jsonStrA = jsonCtmData.toString();
        jsonStrB = '{"secrets":' + jsonStrA + '}';
        jsonStrSecrets = jsonStrB;
    } jsonStrFinal = jsonStrSecrets;
    return jsonStrFinal;
}

/**
 * Returns a list of all defined environments.
 * @param sProcNum Output channel message prefix
 */
export async function getEnvironments(sProcNum: string) {
    let parametersCtm: string = "show";
    let commandCtm: string = "environment";
    let jsonCtmData = CtmCliCommand.runCtmCommand(commandCtm, parametersCtm);
    strCommand = "ctm environment " + parametersCtm;
    if (debugApiEnabled) {
        (await OutputUtils.getOutputChannel()).appendLine(sProcNum + '    -> API: "' + strCommand + '"');
    }
    if (! jsonCtmData.length) {
        return "";
    } else {
        return jsonCtmData;
    }

}

/**
 * Returns a list of all defined environments.
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param sProcNum Output channel message prefix
 */
export async function computeEnvironments(envCmd: string, sProcNum: string) {
    let jsonStrFinal: string = "";
    let jsonCtmData = await getEnvironments(sProcNum);
    let jsonStrA: string;
    let jsonStrB: string;
    let jsonStrC: string;
    let jsonStrD: string;
    let jsonStrEnvironments: string |undefined;

    let apiVersion: string = await getApiVersion(envCmd, sProcNum);

    if (! jsonCtmData.length) {
        jsonStrEnvironments = '{"environments":[]}';
    } else { // Get Active CTM Environment
        jsonStrA = jsonCtmData.substring(jsonCtmData.indexOf("{"));
        jsonStrA = jsonStrA.replace(/\n/g, '');
        jsonStrD = jsonCtmData.split("\n")[0];
        jsonStrB = jsonStrD.split(" ")[2];

        // build new json
        jsonStrC = '{"default":"' + jsonStrB + '","version":"' + apiVersion + '","environments":' + jsonStrA + '}';
        jsonStrEnvironments = jsonStrC;
    } jsonStrFinal = jsonStrEnvironments;
    return jsonStrFinal;
}

/**
 * Returns the local CTM AAPI version.
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param sProcNum Output channel message prefix
 */
export async function getApiVersion(envCmd: string, sProcNum: string) {
    let parametersCtm: string = "--version";
    let commandCtm: string = "";
    let jsonCtmData = CtmCliCommand.runCtmCommand(commandCtm, parametersCtm);
    jsonCtmData = jsonCtmData.replace(/\n/g, '');

    strCommand = "ctm " + parametersCtm;
    if (debugApiEnabled) {
        (await OutputUtils.getOutputChannel()).appendLine(sProcNum + '    -> API: "' + strCommand + '"');
    }
    if (! jsonCtmData.length) {
        return "";
    } else {
        jsonCtmData = jsonCtmData.replace(/\n/g, '');
        return jsonCtmData;
    }

}

/**
 * Checks if the Control-M/Agent is available.
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param agent Name of Control-M/Agent
 * @param ctm Name of Control-M/Server
 * @param sProcNum Output channel message prefix
 */
export async function cmdPingAgent(envCmd: string, ctm: string, agent: string, sProcNum: string) {

    debugApiEnabled = vscode.workspace.getConfiguration('CTM.Automation.debug').get('api');
    let parametersCtm: string = "server:agent::ping " + ctm + " " + agent + envCmd;
    let commandCtm: string = "config";
    let jsonCtmData = await CtmCliCommand.runCtmCommand(commandCtm, parametersCtm);
    strCommand = "ctm config " + parametersCtm;
    if (debugApiEnabled) {
        (await OutputUtils.getOutputChannel()).appendLine(sProcNum + '    -> API: "' + strCommand + '"');
    }
    if (! jsonCtmData.length) {
        return "";
    } else {
        jsonCtmData = jsonCtmData.replace(/\n/g, '');
        return jsonCtmData;
    }

}

/**
 * Get Control-M Agent Infrastructure via CTM AAPI
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param ctm Control-M datacenter name, server name
 * @param sProcNum Output channel message prefix
 */
export function getCalendars(envCmd: string, ctm: string, sProcNum: string) {
    let parametersCtm: string = "calendars::get " + ctm + envCmd;
    let commandCtm: string = "deploy";
    let jsonCtmData = CtmCliCommand.runCtmCmd(commandCtm, parametersCtm);
    strCommand = "ctm config " + parametersCtm;
    if (debugApiEnabled) {
        console.log(strCommand);
    }
    if (! jsonCtmData.length) {
        return "";
    } else {
        jsonCtmData = jsonCtmData.replace(/\n/g, '');
        return jsonCtmData;
    }

}

/**
 * Returns a list of all defined environments.
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 * @param ctm Control-M datacenter name, server name
 * @param sProcNum Output channel message prefix
 */
export function computeCalendars(envCmd: string, ctm: string, sProcNum: string) {
    let jsonStrFinal: string = "";
    let jsonCtmData = getCalendars(envCmd, ctm, sProcNum);
    let jsonStrA: string |undefined;
    let jsonStrB: string |undefined;
    let jsonStrC: string |undefined;
    let jsonStrX: string |undefined;
    let jsonStrCalendars: string |undefined;

    // Calendar variables
    let itemCalendar: any;
    let strCalendarName: string |undefined;
    let strCalendarAlias: string |undefined;
    let strCalendarType: string |undefined;
    let strCalendarServer: string |undefined;


    if (! jsonCtmData.length) {
        jsonStrCalendars = '{"calendars":{}}';
    } else { // Get Calendars
        let jsonCalendars = json.parse(jsonCtmData.toString());
        let strCalendar = JSON.stringify(jsonCalendars);

        for (let item in jsonCalendars) {

            itemCalendar = jsonCalendars[item];
            strCalendarName = item;
            strCalendarAlias = itemCalendar["Alias"];
            strCalendarType = itemCalendar["Type"];
            strCalendarServer = itemCalendar["Server"];

            if (strCalendarServer === undefined) {
                strCalendarServer = "";
            }

            if (strCalendarAlias === undefined) {
                strCalendarAlias = "";
            }


            jsonStrX = '{"name":"' + strCalendarName + '","alias":"' + strCalendarAlias + '","type":"' + strCalendarType + '","server":"' + strCalendarServer + '"}';

            // 'Calendar:Periodic'
            if (strCalendarType.includes("Periodic")) {
                if (jsonStrA === undefined) {
                    jsonStrA = jsonStrX;
                } else {
                    jsonStrA = jsonStrA + ',' + jsonStrX;
                }
            }

            // 'Calendar:Regular'
            if (strCalendarType.includes("Regular")) {
                if (jsonStrB === undefined) {
                    jsonStrB = jsonStrX;
                } else {
                    jsonStrB = jsonStrB + ',' + jsonStrX;
                }
            }

            // 'Calendar:RuleBasedCalendar'
            if (strCalendarType.includes("RuleBasedCalendar")) {
                if (jsonStrC === undefined) {
                    jsonStrC = jsonStrX;
                } else {
                    jsonStrC = jsonStrC + ',' + jsonStrX;
                }
            }
        }

        // build new json
        let CalendarPeriodic: string;
        if (jsonStrA === undefined) {
            CalendarPeriodic = '"calendar.periodic" : []';
        } else {
            CalendarPeriodic = '"calendar.periodic" : [' + jsonStrA + ']';
        }

        let CalendarRegular: string;
        if (jsonStrB === undefined) {
            CalendarRegular = '"calendar.regular" : []';
        } else {
            CalendarRegular = '"calendar.regular" : [' + jsonStrB + ']';
        }

        let CalendarRuleBased: string;
        if (jsonStrC === undefined) {
            CalendarRuleBased = '"calendar.rule" : []';
        } else {
            CalendarRuleBased = '"calendar.rule" : [' + jsonStrC + ']';
        } jsonStrCalendars = '{"calendars":{' + CalendarRegular + ',' + CalendarPeriodic + ',' + CalendarRuleBased + '}}';

    } jsonStrFinal = jsonStrCalendars;
    return jsonStrFinal;
}

/**
 * Test connnectivity for assigned environment
 * @param envCmd CTM AAPI environment command, example: ' -e default'
 */
export async function testEnvironmentConnection(envCmd: string = "default", sProcNum: string) {

    let status: boolean = false;
    let jsonCtmDataTmp: any;
    let sData: string |undefined;
    let lData: number |undefined;
    let sDataTmp: any |undefined;

    // assign commands
    let parametersCtm = "servers::get" + envCmd;
    let commandCtm: string = "config";

    // execute ctm aapi
    let jsonCtmData = CtmCliCommand.runCtmCommand(commandCtm, parametersCtm);

    strCommand = "ctm config " + parametersCtm;
    if (debugApiEnabled) {
        (await OutputUtils.getOutputChannel()).appendLine(sProcNum + '    -> API: "' + strCommand + '"');
    }

    // Check valid json as inidicator of successful connection
    validJson = CommonUtils.isJsonString(jsonCtmData);
    if (validJson) {
        jsonCtmDataTmp = json.parse(jsonCtmData.toString());

        try {
            sData = jsonCtmDataTmp[0];
            sDataTmp = JSON.stringify(sData);
            lData = sDataTmp.length;
            if (lData > 1) {
                status = true;
            }

        } catch (error) {
            console.log(error.toString());
            status = false;
        }

    } else {
        status = false;
    }

    return status;

}
