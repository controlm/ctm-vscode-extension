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

'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Memento } from "vscode";

import * as CtmCliCommand from "./commands/CliCommand";
import { Constants } from './utils/Constants';
import { SettingsUtils } from "./utils/SettingsUtils";
import { CommonUtils } from './utils/CommonUtils';
import { MessageUtils } from "./utils/MessageUtils";
import { OutputUtils } from "./utils/OutputUtils";
import { CtmInfrastructureProvider } from "./utils/CtmInfrastructure";
import { ctmSwaggerPanel } from "./utils/CtmSwagger";
import { gzip } from 'node-gzip';
import { discoverCtmInfrastructure } from "./utils/CtmDiscovery";
import * as CtmToolsTreeView from "./utils/CtmInfrastructure";
import { Url } from 'url';

let ctmInfrastructureDemoData = '{"default":"demo","version":"9.20.250 (node: 16.14.2)","environments":{"demo":{"endPoint":"https://demo.local/automation-api","user":"emuser"},"test":{"endPoint":"https://test.local:8443/automation-api","user":"emuser"}},"discovery":"0","age":"0","datacenters":[{"server":"Sandbox","host":"sandbox.dev.local","version":"9.0.20.200","agents":[{"nodeid":"demo-gcp-linux-1.dev.local","status":"Available","version":"9.0.20.200","operatingSystem":"Linux Ubuntu 20"},{"nodeid":"demo-azure-linux-1.dev.local","status":"Available","version":"9.0.20.200","operatingSystem":"Linux Ubuntu 20"},{"nodeid":"demo-aws-windows-2.dev.local","status":"Available","version":"9.0.20.200","operatingSystem":"Microsoft Windows Server 2019  (Build 17763)"},{"nodeid":"demo-aws-windows-1.dev.local","status":"Available","version":"9.0.20.200","operatingSystem":"Microsoft Windows Server 2019  (Build 17763)"},{"nodeid":"demo-aws-linux-3.dev.local","status":"Available","version":"9.0.20.201","operatingSystem":"Linux Red Hat 8"},{"nodeid":"demo-aws-linux-2.dev.local","status":"Available","version":"9.0.20.200","operatingSystem":"Linux Red Hat 8"},{"nodeid":"demo-aws-linux-1.dev.local","status":"Available","version":"9.0.20.200","operatingSystem":"Linux Ubuntu 20"}],"hostgroups":[{"group":"demo-windows-agents","agents":[{"nodeid":"demo-aws-windows-2.dev.local"},{"nodeid":"demo-aws-windows-1.dev.local"}]},{"group":"demo-linux-agents","agents":[{"nodeid":"demo-aws-linux-2.dev.local"}]}],"remote":[{"host":"255.255.255.255","properties":{"port":22,"encryptAlgorithm":"BLOWFISH","compression":false,"agents":["ctm-aws-sandbox.dev.local"]}},{"host":"127.0.0.1","properties":{"port":22,"encryptAlgorithm":"BLOWFISH","compression":false,"agents":["ctm-aws-sandbox.dev.local"]}}],"runas":[{"nodeid":"demo-aws-windows-1.dev.local","user":"root"},{"nodeid":"demo-azure-linux-1.dev.local","user":"user"},{"nodeid":"demo-gcp-linux-1.dev.local","user":"user"}],"resources":[{"name":"ABC","server":"Sandbox","available":"4","max":4,"workloadPolicy":"N/A"},{"name":"123","server":"Sandbox","available":"3","max":3,"workloadPolicy":"N/A"}],"calendars":{"calendar.regular":[{"name":"abcd","alias":"ABCD","type":"Calendar:Regular","server":""},{"name":"wxyz","alias":"DEMO-WXYZ","type":"Calendar:Regular","server":""}],"calendar.periodic":[{"name":"1234","alias":"DEMO-1234","type":"Calendar:Periodic","server":""},{"name":"0987","alias":"","type":"Calendar:Periodic","server":""}],"calendar.rule":[{"name":"EVERYDAY","alias":"EVERYDAY","type":"Calendar:RuleBasedCalendar","server":""},{"name":"DEMO","alias":"","type":"Calendar:RuleBasedCalendar","server":""}]}}],"profiles":{"profiles.base":[{"type":"AWS","connections":[{"ABC_AWS":{"Type":"ConnectionProfile:AWS","SecretAccessKey":"*****","Region":"us-east-2","AccessKey":"abc","Description":"","Centralized":true},"123_AWS":{"Type":"ConnectionProfile:AWS","SecretAccessKey":"*****","Region":"us-east-1","AccessKey":"123","Description":"","Centralized":true}}]},{"type":"Azure","connections":[{"ABC-AZURE":{"Type":"ConnectionProfile:Azure","ActiveDirectoryDomainName":"abc","SubscriptionID":"abc","User":"abc","ApplicationID":"abc","Password":"*****","Description":"","Centralized":true}}]},{"type":"FileTransfer","connections":[{"ABC-CP":{"Type":"ConnectionProfile:FileTransfer:SFTP","VerifyBytes":true,"WorkloadAutomationUsers":["emuser"],"User":"ctm9020","Password":"*****","HomeDirectory":"/app/ctm9020/","Description":"","Centralized":true}}]}],"profiles.ai":[{"type":"ApplicationIntegrator:AI AWS Glue CLI","connections":[{"JFI-GLUECLI":{"Type":"ConnectionProfile:ApplicationIntegrator:AI AWS Glue CLI","AI-RunAs-Pass":"*****","AI-AWS Command":"aws","AI-AWS CLI Profile":"jfi","AI-Run As":"ctmsand","Description":"","Centralized":true}}]}]},"workloadpolicies":{"active":[{"name":"ABC","state":"Active","orderNo":"2","lastUpdate":"","updatedBy":"","description":""},{"name":"123","state":"Active","orderNo":"3","lastUpdate":"","updatedBy":"","description":""}],"inactive":[{"name":"XYZ","state":"Inactive","orderNo":"1","lastUpdate":"","updatedBy":"","description":""}]},"secrets":["abcd","1234"],"elapsed":"77042","status": "demo"}';
let processNumber: number = 0;
let strPrefix: string = "E";
let procNumString: string;



// this method is called once when your extension is activated
export async function activate(context: vscode.ExtensionContext) {
	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

	// Create StatusBar
	CommonUtils.createCtmStatusBar();

	// Get current CTM environment
	const strConfiguredEnvironmentName: string = vscode.workspace.getConfiguration('CTM.Automation.API').get('env');

	// Update StatusBar item
	let statusBarTip = new vscode.MarkdownString("Assigned CTM Environment: **" + strConfiguredEnvironmentName + "**");
	let statusBarText = "$(search) JAC: " + strConfiguredEnvironmentName.toUpperCase();
	await CommonUtils.updateCtmStatusBar(statusBarText, statusBarTip);

	// cocunter for output channel
	// let procNumString: string = strPrefix + processNumber.toString().padStart(4, "0");
	procNumString = CommonUtils.getProcNumString(context, strPrefix);


	// debug & QA
	const debugEnabled: boolean = vscode.workspace.getConfiguration('CTM.Automation.API').get('debug');
	const qaEnabled: boolean = false;

	// Initialize variables
	let strMessage: string;
	let validFile: boolean = true;
	let validJson: boolean = false;

	// CTM Infra Data
	let jsonDataStatus: string | undefined;
	let ctmDataStatus: boolean = false;
	let ctmInfrastructureDicsovery: any | undefined;
	let ctmInfrastructureCacheData: any;
	// Extension related variables
	let extensionPath = path.join(context.extensionPath, "package.json");

	// Update CTM environment
	// const configuration = vscode.workspace.getConfiguration('CTM.Automation.API');
	// await configuration.update("env", "1234", vscode.ConfigurationTarget.Global);



	// Assign values to variables
	strMessage = 'Congratulations, your extension view "Control-M Jobs-As-Code" is now active!\nAssigned AAPI Environment: "' + strConfiguredEnvironmentName + '"\n';
	console.log(strMessage);
	MessageUtils.showInfoMessage(strMessage);
	(await OutputUtils.getOutputChannel()).appendLine(strMessage);

	// Where to save CTM Infrastructure Data File
	const ctmInfrastructureFolder: string = rootPath;
	const ctmInfrastructureFile = path.join(ctmInfrastructureFolder, "." + strConfiguredEnvironmentName + ".ctm.infrastructure.json");
	const ctmInfrastructureDebugFile = path.join(ctmInfrastructureFolder, "." + strConfiguredEnvironmentName + ".debug.ctm.infrastructure.json");

	// let packageFile = JSON.parse(fs.readFileSync(extensionPath, 'utf8'));
	// Initilize Demo Data

	let ctmInfrastructureCacheTmp: any = context.globalState.get('ctmInfrastructureCache');
	let ctmInfrastructureCache: string = JSON.stringify(ctmInfrastructureCacheTmp);
	try {
		ctmInfrastructureCacheData = JSON.parse(ctmInfrastructureCache);
		jsonDataStatus = ctmInfrastructureCacheData["status"];
	} catch (error) {
		if (debugEnabled) {
			console.log(' - JSON Error Cache Data: ' + error.toString() + '"');
		}
	}

	if (jsonDataStatus === undefined) {
		ctmDataStatus = false;
		await context.globalState.update('ctmInfrastructureCache', ctmInfrastructureDemoData);
	} else {
		if (jsonDataStatus.startsWith("success")) {
			ctmDataStatus = true;
		} else if (jsonDataStatus.startsWith("demo")) {
			ctmDataStatus = true;
		} else {
			ctmDataStatus = false;
		}
	}
	if (ctmDataStatus) {
		// calulate age of report
		let ctmReportAge: string | undefined;
		let ctmReportAgeTempA: number | undefined;
		let ctmReportAgeTempB: number | undefined;
		let ctmReportAgeTempC: any | undefined;

		// CTM environment settings
		let ctmEnvironment: string | undefined;
		let ctmEndPoint: string | undefined;
		let ctmEndPointTmp: string | undefined;
		let ctmDiscoveryDate: Date | undefined;

		try {
			ctmDiscoveryDate = ctmInfrastructureCacheData["discovery"];
			ctmEnvironment = ctmInfrastructureCacheData["default"];
			ctmEndPoint = ctmInfrastructureCacheData["environments"][ctmEnvironment]["endPoint"];
			ctmEndPointTmp = ctmEndPoint.split("automation-api")[0];
		} catch (error) {
			if (debugEnabled) {
				console.log(' >> CTM Environment Data: ' + error.toString() + '"');
				console.log('    No Data available');
			}
		}

		// calculate age of report
		try {
			let currentTime: Date = new Date();
			let discoTime: Date;
			if (ctmDiscoveryDate.toString() === "0") {
				discoTime = new Date();
			} else {
				discoTime = new Date(ctmDiscoveryDate);
			}

			ctmReportAgeTempA = Math.abs(currentTime.getTime() - discoTime.getTime());
			ctmReportAgeTempB = Math.ceil(ctmReportAgeTempA / (1000 * 3600));
			ctmReportAgeTempC = CommonUtils.SplitTime(ctmReportAgeTempB);
			ctmReportAge = "Days: '" + ctmReportAgeTempC.Days + "' Hours: '" + ctmReportAgeTempC.Hours + "' Minutes: '" + ctmReportAgeTempC.Minutes + "'";
		} catch (error) {
			ctmReportAge = "TBD: " + error.toString();
		}


		await context.globalState.update('ctmEndPointSelfService', ctmEndPointTmp + "ControlM/");
		await context.globalState.update('ctmEndPointAI', ctmEndPointTmp + "ApplicationIntegrator/");
		await context.globalState.update('ctmEndPointConfiguration', ctmEndPointTmp + "ControlM/Configuration/");
		await context.globalState.update('ctmEndPointSharedConnectionProfile', ctmEndPointTmp + "ControlM/Configuration/SharedConnectionProfile/");
		await context.globalState.update('ctmEndPointCalendarsConfiguration', ctmEndPointTmp + "ControlM/CalendarsConfiguration/");

		ctmInfrastructureCacheData.age = ctmReportAge;
		context.globalState.update('ctmInfrastructureCache', ctmInfrastructureCacheData);
		if (debugEnabled) {
			console.log(' -> Extension Global Config "Self Service"               : ' + context.globalState.get('ctmEndPointSelfService'));
			console.log(' -> Extension Global Config "Application Integrator"     : ' + context.globalState.get('ctmEndPointAI'));
			console.log(' -> Extension Global Config "Configuration"              : ' + context.globalState.get('ctmEndPointConfiguration'));
			console.log(' -> Extension Global Config "Shared Connection Profiles" : ' + context.globalState.get('ctmEndPointSharedConnectionProfile'));
			console.log(' -> Extension Global Config "Calendars"                  : ' + context.globalState.get('ctmEndPointCalendarsConfiguration'));
		}

	}



	// future use
	// let ctmInfrastructureCacheGzip =  await gzip(JSON.stringify(ctmInfrastructure));

	const ctmInfrastructureProvider = new CtmInfrastructureProvider(context);
	vscode.window.registerTreeDataProvider('ctmInfrastructure', ctmInfrastructureProvider);

	vscode.commands.registerCommand('ctm.infrastructure.ping', (node: vscode.TreeItem) => CtmToolsTreeView.pingAgent(node, context));
	vscode.commands.registerCommand('ctm.infrastructure.copy', (node: vscode.TreeItem) => CtmToolsTreeView.copyNodeName(node, context));

	// CTM Infrastructure
	let ctmInfrastructureRefreshEntry = vscode.commands.registerCommand(
		'ctm.infrastructure.refreshEntry',
		async () => {
			vscode.window
				.showInformationMessage("Discovering Control-M infrastructure by means of the Automation API will take a few minutes and block the UI. Do you want to continue?", "Discover Control-M", "Cancel", "Help")
				.then(async answer => {
					if (answer === "Discover Control-M") {
						vscode.window.showInformationMessage('Discover Control-M Infrastructure in default environment. This will take a few minutes. ....');
						procNumString = CommonUtils.getProcNumString(context, strPrefix);
						strMessage = " -> Start -> 'Discovery' ...";
						(await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);

						// Assign QA data for test
						if (qaEnabled) {
							let ctmInfrastructureDemoDataTemp = '{"default":"qa","age":"0","elapsed":"77042","status": "demo"}';
							ctmInfrastructureDicsovery = ctmInfrastructureDemoDataTemp;
							if (CommonUtils.exists(ctmInfrastructureFolder)) {
								CommonUtils.replacefile(ctmInfrastructureDebugFile, ctmInfrastructureDicsovery);
							}
						} else {
							// collect CTM data
							ctmInfrastructureDicsovery = await discoverCtmInfrastructure(context);
						}

						try {
							const jsonData: any = JSON.parse(ctmInfrastructureDicsovery);
							jsonDataStatus = jsonData["status"];
						} catch (error) {
							if (debugEnabled) {
								console.log(' - JSON Error Final Data: ' + error.toString() + '"');
							}
						}


						if (jsonDataStatus === undefined) {
							ctmDataStatus = false;
						} else {
							if (jsonDataStatus.startsWith("success")) {
								ctmDataStatus = true;
							} else if (jsonDataStatus.startsWith("demo")) {
								ctmDataStatus = true;
							} else {
								ctmDataStatus = false;
							}
						}

						if (ctmDataStatus) {
							strMessage = " -> Processing 'CTM Infrastructure Cache' ...";
							(await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);
							console.log(strMessage);

							// calulate age of report
							let ctmReportAge: string | undefined;
							let ctmReportAgeTempA: number | undefined;
							let ctmReportAgeTempB: number | undefined;
							let ctmReportAgeTempC: any | undefined;
							let ctmDiscoveryDate: Date | undefined;

							const jsonData: any = JSON.parse(ctmInfrastructureDicsovery);
							ctmDiscoveryDate = jsonData["discovery"];
							// calculate age of report
							try {
								let currentTime: Date = new Date();
								let discoTime: Date;
								if (ctmDiscoveryDate.toString() === "0") {
									discoTime = new Date();
								} else {
									discoTime = new Date(ctmDiscoveryDate);
								}

								ctmReportAgeTempA = Math.abs(currentTime.getTime() - discoTime.getTime());
								ctmReportAgeTempB = Math.ceil(ctmReportAgeTempA / (1000 * 3600));
								ctmReportAgeTempC = CommonUtils.SplitTime(ctmReportAgeTempB);
								ctmReportAge = "Days: '" + ctmReportAgeTempC.Days + "' Hours: '" + ctmReportAgeTempC.Hours + "' Minutes: '" + ctmReportAgeTempC.Minutes + "'";
							} catch (error) {
								ctmReportAge = "TBD: " + error.toString();
							}
							jsonData.age = ctmReportAge;
							strMessage = " -> Update 'CTM Infrastructure Cache' ...";
							(await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);
							console.log(strMessage);

							// update globalState variables
							let strConfiguredEnvironmentName: string = vscode.workspace.getConfiguration('CTM.Automation.API').get('env');
							let ctmInfrastructureDicsoveryData = JSON.parse(ctmInfrastructureDicsovery);
							let ctmEnvironment = strConfiguredEnvironmentName;
							let ctmEndPoint = ctmInfrastructureDicsoveryData["environments"][ctmEnvironment]["endPoint"];
							let ctmEndPointTmp = ctmEndPoint.split("automation-api")[0];

							await context.globalState.update('ctmEndPointSelfService', ctmEndPointTmp + "ControlM/");
							await context.globalState.update('ctmEndPointAI', ctmEndPointTmp + "ApplicationIntegrator/");
							await context.globalState.update('ctmEndPointConfiguration', ctmEndPointTmp + "ControlM/Configuration/");
							await context.globalState.update('ctmEndPointSharedConnectionProfile', ctmEndPointTmp + "ControlM/Configuration/SharedConnectionProfile/");
							await context.globalState.update('ctmEndPointCalendarsConfiguration', ctmEndPointTmp + "ControlM/CalendarsConfiguration/");


							const contents = new vscode.MarkdownString("Last action: Update Cached Data for: '" + strConfiguredEnvironmentName + "'");
							await CommonUtils.updateCtmStatusBar("CACHE", contents);

							context.globalState.update('ctmInfrastructureCache', jsonData);
							ctmInfrastructureProvider.refresh(undefined, context);

							// Update StatusBar item
							let statusBarTip = new vscode.MarkdownString("Assigned CTM Environment: **" + strConfiguredEnvironmentName + "**");
							let statusBarText = "$(search) JAC: " + strConfiguredEnvironmentName.toUpperCase();
							await CommonUtils.updateCtmStatusBar(statusBarText, statusBarTip);

							strMessage = " -> End -> 'Discovery'";
							(await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);
							console.log(strMessage);

						} else {
							strMessage = " -> Invalid CTM Infrastructure Data ...";
							(await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);
							MessageUtils.showErrorMessage(strMessage);
							console.log(strMessage);

							strMessage = " -> End -> 'Discovery'";
							(await OutputUtils.getOutputChannel()).appendLine(procNumString + strMessage);
							console.log(strMessage);
						}
					} else if (answer === "Help") {
						vscode.env.openExternal(vscode.Uri.parse('https://documents.bmc.com/supportu/9.0.20/help/Main_help/en-US/index.htm#94103.htm'));
						// Update StatusBar item
						let statusBarTip = new vscode.MarkdownString("Assigned CTM Environment: **" + strConfiguredEnvironmentName + "**");
						let statusBarText = "$(search) JAC: " + strConfiguredEnvironmentName.toUpperCase();
						await CommonUtils.updateCtmStatusBar(statusBarText, statusBarTip);
						return;
					} else {
						// Update StatusBar item
						let statusBarTip = new vscode.MarkdownString("Assigned CTM Environment: **" + strConfiguredEnvironmentName + "**");
						let statusBarText = "$(search) JAC: " + strConfiguredEnvironmentName.toUpperCase();
						await CommonUtils.updateCtmStatusBar(statusBarText, statusBarTip);
						return;
					}
				});
		}
	);
	context.subscriptions.push(ctmInfrastructureRefreshEntry);

	// CTM Infrastructure
	let ctmInfrastructureDemoDataLoad = vscode.commands.registerCommand(
		'ctm.infrastructure.demo.data.load',
		async () => {
			vscode.window
				.showInformationMessage("Load Control-M Demo Data. Control-M Infrastructure interaction limited. Do you want to continue?", "Load Control-M Demo Data", "Cancel")
				.then(async answer => {
					if (answer === "Load Control-M Demo Data") {
						vscode.window.showInformationMessage('Discover Control-M Infrastructure in default environment. This will take a few minutes. ....');
						context.globalState.update('ctmInfrastructureCache', JSON.parse(ctmInfrastructureDemoData));

						// update globalState variables
						let ctmInfrastructureDicsoveryData = JSON.parse(ctmInfrastructureDemoData);
						let ctmEnvironment = "demo";
						let ctmEndPoint = ctmInfrastructureDicsoveryData["environments"][ctmEnvironment]["endPoint"];
						let ctmEndPointTmp = ctmEndPoint.split("automation-api")[0];

						await context.globalState.update('ctmEndPointSelfService', ctmEndPointTmp + "ControlM/");
						await context.globalState.update('ctmEndPointAI', ctmEndPointTmp + "ApplicationIntegrator/");
						await context.globalState.update('ctmEndPointConfiguration', ctmEndPointTmp + "ControlM/Configuration/");
						await context.globalState.update('ctmEndPointSharedConnectionProfile', ctmEndPointTmp + "ControlM/Configuration/SharedConnectionProfile/");
						await context.globalState.update('ctmEndPointCalendarsConfiguration', ctmEndPointTmp + "ControlM/CalendarsConfiguration/");
						await ctmInfrastructureProvider.refresh(undefined, context);

						const contents = new vscode.MarkdownString("Last action: Load Demo Data for: '" + strConfiguredEnvironmentName + "'");
						await CommonUtils.updateCtmStatusBar("DEMO", contents);

					} else {
						return;
					}
				});
		}
	);
	context.subscriptions.push(ctmInfrastructureDemoDataLoad);


	// CTM Self-Service
	let ctmSelfService = vscode.commands.registerCommand(
		'ctm.infrastructure.self.service',
		async () => {
			// get url from extension globbal config
			let url: string = context.globalState.get('ctmEndPointSelfService');
			vscode.env.openExternal(vscode.Uri.parse(url));
			let statusBarTip = new vscode.MarkdownString("Last action: Open **" + url + "**");
			let statusBarText = "$(ports-open-browser-icon) JAC: Self-Service";
			await CommonUtils.updateCtmStatusBar(statusBarText, statusBarTip);
		}
	);
	context.subscriptions.push(ctmSelfService);

	// CTM Application Integrator
	let ctmApplicationIntegrator = vscode.commands.registerCommand(
		'ctm.infrastructure.application.integrator',
		async () => {
			// get url from extension globbal config
			const url: string = context.globalState.get('ctmEndPointAI');
			vscode.env.openExternal(vscode.Uri.parse(url));
			let statusBarTip = new vscode.MarkdownString("Last action: Open **" + url + "**");
			let statusBarText = "$(ports-open-browser-icon) JAC: AI";
			await CommonUtils.updateCtmStatusBar(statusBarText, statusBarTip);
		}
	);
	context.subscriptions.push(ctmApplicationIntegrator);

	// CTM ctmEndPointSharedConnectionProfile
	let ctmSharedConnectionProfile = vscode.commands.registerCommand(
		'ctm.infrastructure.shared.connection.profile',
		async () => {
			// get url from extension globbal config
			const url: string = context.globalState.get('ctmEndPointSharedConnectionProfile');
			vscode.env.openExternal(vscode.Uri.parse(url));
			let statusBarTip = new vscode.MarkdownString("Last action: Open **" + url + "**");
			let statusBarText = "$(ports-open-browser-icon) JAC: CCP";
			await CommonUtils.updateCtmStatusBar(statusBarText, statusBarTip);
		}
	);
	context.subscriptions.push(ctmSharedConnectionProfile);


	// CTM Configuration - ctmEndPointConfiguration
	let ctmConfiguration = vscode.commands.registerCommand(
		'ctm.infrastructure.configuration',
		async () => {
			// get url from extension globbal config
			const url: string = context.globalState.get('ctmEndPointConfiguration');
			vscode.env.openExternal(vscode.Uri.parse(url));
			let statusBarTip = new vscode.MarkdownString("Last action: Open **" + url + "**");
			let statusBarText = "$(ports-open-browser-icon) JAC: Config";
			await CommonUtils.updateCtmStatusBar(statusBarText, statusBarTip);
		}
	);
	context.subscriptions.push(ctmConfiguration);

	// CTTM Calendars
	let ctmCalendars = vscode.commands.registerCommand(
		'ctm.infrastructure.calendars',
		async () => {
			// get url from extension globbal config
			const url: string = context.globalState.get('ctmEndPointCalendarsConfiguration');
			vscode.env.openExternal(vscode.Uri.parse(url));
			let statusBarTip = new vscode.MarkdownString("Last action: Open **" + url + "**");
			let statusBarText = "$(ports-open-browser-icon) JAC: Calendars";
			await CommonUtils.updateCtmStatusBar(statusBarText, statusBarTip);
		}
	);
	context.subscriptions.push(ctmCalendars);

	// CTM Session Login
	let ctmSessionLogin = vscode.commands.registerCommand(
		'ctm.activity.bar.session.login',
		async () => {
			vscode.window.showInformationMessage('CTM Session Login');
		}
	);
	context.subscriptions.push(ctmSessionLogin);

	// CTM Documentation onPrem
	let ctmDocsOnPrem = vscode.commands.registerCommand(
		'ctm.activity.bar.documentation.on.prem',
		async () => {
			let url = "https://docs.bmc.com/docs/automation-api/monthly/control-m-automation-api-home-1086347871.html";
			vscode.env.openExternal(vscode.Uri.parse(url));
			let statusBarTip = new vscode.MarkdownString("Last action: Open **" + url + "**");
			let statusBarText = "$(ports-open-browser-icon) JAC: Docs";
			await CommonUtils.updateCtmStatusBar(statusBarText, statusBarTip);
		}
	);
	context.subscriptions.push(ctmDocsOnPrem);

	// CTM Documentation SaaS
	let ctmDocsSaaS = vscode.commands.registerCommand(
		'ctm.activity.bar.documentation.saas',
		async () => {
			let url = "https://docs.bmc.com/docs/saas-api/control-m-saas-automation-api-home-941878993.html";
			vscode.env.openExternal(vscode.Uri.parse(url));
			let statusBarTip = new vscode.MarkdownString("Last action: Open **" + url + "**");
			let statusBarText = "$(ports-open-browser-icon) JAC: SaaS AAPI";
			await CommonUtils.updateCtmStatusBar(statusBarText, statusBarTip);
		}
	);
	context.subscriptions.push(ctmDocsSaaS);

	// CTM build
	let ctmBuild = vscode.commands.registerCommand(Constants.CMD_CTM_BUILD, async (selectedFile: vscode.Uri) => {
		let selectedFileUris: vscode.Uri[] = await getSelectedFileUris();
		CtmCliCommand.runCommand(Constants.OP_BUILD, undefined);
		let statusBarTip = new vscode.MarkdownString("Last action: Build **" + selectedFileUris + "**");
		let statusBarText = "$(callstack-view-icon) JAC: BUILD";
		await CommonUtils.updateCtmStatusBar(statusBarText, statusBarTip);
	});
	context.subscriptions.push(ctmBuild);

	// CTM run
	let ctmRun = vscode.commands.registerCommand(Constants.CMD_CTM_RUN, async (selectedFile: vscode.Uri) => {
		let selectedFileUris: vscode.Uri[] = await getSelectedFileUris();
		CtmCliCommand.runCommand(Constants.OP_RUN, undefined);
		let statusBarTip = new vscode.MarkdownString("Last action: RUN **" + selectedFileUris + "**");
		let statusBarText = "$(debug-console) JAC: RUN";
		await CommonUtils.updateCtmStatusBar(statusBarText, statusBarTip);
	});
	context.subscriptions.push(ctmRun);

	// CTM deploy
	let ctmDeploy = vscode.commands.registerCommand(Constants.CMD_CTM_DEPLOY, async (selectedFile: vscode.Uri) => {
		let selectedFileUris: vscode.Uri[] = await getSelectedFileUris();
		CtmCliCommand.runCommand(Constants.OP_DEPLOY, undefined);
		let statusBarTip = new vscode.MarkdownString("Last action: DEPLOY **" + selectedFileUris + "**");
		let statusBarText = "$(search-new-editor) JAC: DEPLOY";
		await CommonUtils.updateCtmStatusBar(statusBarText, statusBarTip);
	});
	context.subscriptions.push(ctmDeploy);

	// CTM deploy
	let ctmDeployTransform = vscode.commands.registerCommand(Constants.CMD_CTM_DEPLOY_TRANFORM, async (selectedFile: vscode.Uri) => {
		let selectedFileUris: vscode.Uri[] = await getSelectedFileUris();
		// let ctmDeployDescriptorFile: vscode.Uri[] = await getDirectory();

		let deployDescriptorFile: string | undefined = await SettingsUtils.getCtmDeployDescriptorWithPrompt();
		if (CommonUtils.isBlank(deployDescriptorFile) || deployDescriptorFile === undefined || !fs.existsSync(deployDescriptorFile)) {
			validFile = false;
			console.debug("A valid Control-M Deploy Descriptor File was not found.");
			MessageUtils.showWarningMessage('A valid Control-M Deploy Descriptor File was not found.');
		}

		if (validFile) {

			let deployDescriptorFileUri = vscode.Uri.file(deployDescriptorFile!);
			// selectedFileUris.push(deployDescriptorFileUri);
			selectedFileUris.push(vscode.Uri.file(deployDescriptorFile!));
			CtmCliCommand.runCommand(Constants.OP_DEPLOY_TRANSFORM, selectedFileUris);
			let statusBarTip = new vscode.MarkdownString("Last action: DEPLOY **" + selectedFileUris + "**");
			let statusBarText = "$(preferences-open-settings) JAC: DEPLOY";
			await CommonUtils.updateCtmStatusBar(statusBarText, statusBarTip);
		}
		// convert string paths into file URIs


	});
	context.subscriptions.push(ctmDeployTransform);

	// CTM Swagger
	context.subscriptions.push(
		vscode.commands.registerCommand('ctmSwagger.start', () => {
			ctmSwaggerPanel.createOrShow(context.extensionUri);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ctmSwagger.doRefactor', () => {
			if (ctmSwaggerPanel.currentPanel) {
				ctmSwaggerPanel.currentPanel.doRefactor();
			}
		})
	);

	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(ctmSwaggerPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				vscode.window.showInformationMessage("CTM API Swagger");
				// Reset the webview options so we use latest uri for `localResourceRoots`.
				webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
				ctmSwaggerPanel.revive(webviewPanel, context.extensionUri);
			}
		});
	}


}


/**
 * Gets the file URIs of the files selected in the File Explorer view
 */
async function getSelectedFileUris(): Promise<vscode.Uri[]> {
	// get what's currently on the clipboard
	let prevText: string = await vscode.env.clipboard.readText();
	// copy selected file paths to clipboard and read
	await vscode.commands.executeCommand('copyFilePath');
	let selectedFilesStr: string = await vscode.env.clipboard.readText();
	// put old contents back on clipboard
	await vscode.env.clipboard.writeText(prevText);

	// convert string paths into file URIs
	let selectedFilesArr: string[] = selectedFilesStr.split(/\r\n/);
	console.debug("selectedFiles length: " + selectedFilesArr.length);
	let selectedFileUris: vscode.Uri[] = [];
	selectedFilesArr.forEach(filePath => {
		selectedFileUris.push(vscode.Uri.file(filePath));
	});
	return selectedFileUris;
}


async function getDirectory(): Promise<vscode.Uri[]> {
	return new Promise(async (resolve, reject) => {
		const dir = await showDialog();
		console.log("#1: " + String(dir)); //Outputs before dialog is closed.
	});
}

function showDialog() {
	// let dir = "";
	let dir: vscode.Uri[] = [];
	const options: vscode.OpenDialogOptions = {
		canSelectMany: false,
		openLabel: 'Open Deploy Descriptor file',
		canSelectFiles: true,
		canSelectFolders: false,
		filters: {
			'JSON files': ['json']
		}
	};
	vscode.window.showOpenDialog(options).then(fileUri => {

		if (fileUri && fileUri[0]) {
			console.log('#2: ' + fileUri[0].fsPath); //Outputs when dialog is closed.
			dir.push(vscode.Uri.file(fileUri[0].fsPath));
		}
	});
	return Promise.resolve(dir);
}

// WebView Options
function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}


// load the CTM AAPI Swagger html file
// Created with https://redocly.com/redoc/
function getSwaggerHtml(extensionUri: vscode.Uri) {

	const projectHome: string = extensionUri.fsPath.toString();
	const webContentHome: string = path.join(projectHome, 'media');
	const webContentFile: string = path.join(webContentHome, 'swagger.html');
	let webContentHtml: any = "";

	if (fs.existsSync(webContentFile)) {
		webContentHtml = fs.readFileSync(webContentFile, 'utf8');
	} else {
		webContentHtml = "File not found ...";
		throw vscode.FileSystemError.FileNotFound();
	}
	return webContentHtml;
}

// this method is called when your extension is deactivated
export function deactivate() { }

export class LocalStorageService {

	constructor(private storage: Memento) { }

	public getValue<T>(key: string): T {
		return this.storage.get<T>(key, null);
	}

	public setValue<T>(key: string, value: T) {
		this.storage.update(key, value);
	}
}

