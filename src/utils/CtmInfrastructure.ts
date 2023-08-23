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

import * as CtmCliCommand from '../commands/CliCommand';
import { MessageUtils } from "../utils/MessageUtils";
import { OutputUtils } from "../utils/OutputUtils";
import { discoverCtmInfrastructure } from "../utils/CtmDiscovery";
import { CommonUtils } from '../utils/CommonUtils';
import * as CtmTools from "../utils/CtmDiscovery";
import { Event } from 'vscode';
import { PassThrough } from 'stream';

let processNumber: number = 0;
let strMessage: string = "Control-M Discover Infrastructure";
let strCommand: string;
let strPrefix: string = "I";
let procNumString: string;
let ctmInfrastructure: string = '';
let ctmInfrastructureCache: string;
let debugApiEnabled: boolean = vscode.workspace.getConfiguration('CTM.Automation.debug').get('api');
let debugDataEnabled: boolean = vscode.workspace.getConfiguration('CTM.Automation.debug').get('data');
let debugExtensionEnabled: boolean = vscode.workspace.getConfiguration('CTM.Automation.debug').get('extension');
let strConfiguredEnvironmentName: string = vscode.workspace.getConfiguration('CTM.Automation.API').get('env');


export class CtmInfrastructureProvider implements vscode.TreeDataProvider<number> {
	private _onDidChangeTreeData: vscode.EventEmitter<number | null> = new vscode.EventEmitter<number | null>();
	readonly onDidChangeTreeData: vscode.Event<number | null> = this._onDidChangeTreeData.event;

	private tree: json.Node;
	private text: string;
	private temp: string;
	private autoRefresh = true;
	private demoMode = true;
	private ctmEnvironment: string;
	private settings: any;

	private strValueNodeType: string;
	private strValueNode: string;
	private strValueNodeTypeParent: string;
	private strValueNodeLabelParent: string;
	private strValueNodePath: any;
	private strValueNodeName: string;
	private ctmInfrastructureCache: any;

	public constructor(private context: vscode.ExtensionContext) {
		// get globalState data
		let ctmInfrastructureCacheTmp: any = context.globalState.get('ctmInfrastructureCache');
		let ctmInfrastructureCacheType: any = typeof ctmInfrastructureCacheTmp;

		// check if json needs to be converted
		if (ctmInfrastructureCacheType === "string") {
			this.ctmInfrastructureCache = ctmInfrastructureCacheTmp;
		} else {
			this.ctmInfrastructureCache = JSON.stringify(ctmInfrastructureCacheTmp);
		}

		// if (debugApiEnabled) {
		// 	console.log(' >> TreeView constructor json data: ' + this.ctmInfrastructureCache + '"');
		// }
		this.parseTree();
	}

	public refresh(offset?: number, context?: vscode.ExtensionContext,): void {
		// get globalState data
		let ctmInfrastructureCacheTmp: any = context.globalState.get('ctmInfrastructureCache');
		let ctmInfrastructureCacheType: any = typeof ctmInfrastructureCacheTmp;

		// check if json needs to be converted
		if (ctmInfrastructureCacheType === "string") {
			this.ctmInfrastructureCache = ctmInfrastructureCacheTmp;
		} else {
			this.ctmInfrastructureCache = JSON.stringify(ctmInfrastructureCacheTmp);
		}

		this.parseTree();
		if (offset) {
			this._onDidChangeTreeData.fire(offset);
		} else {
			this._onDidChangeTreeData.fire(undefined);
		}

	}

	private parseTree(): void {
		this.text = this.ctmInfrastructureCache;

		// check if data is ok
		try {
			this.tree = json.parseTree(this.ctmInfrastructureCache);
		} catch (error) {
			if (debugApiEnabled) {
				console.log(' - JSON Error Parse Tree Data: ' + error.toString() + '"');
			}
		}

	}

	getChildren(offset?: number): Thenable<number[]> {
		if (offset) {
			const path = json.getLocation(this.text, offset).path;
			const node = json.findNodeAtLocation(this.tree, path);
			return Promise.resolve(this.getChildrenOffsets(node));
		} else {
			return Promise.resolve(this.tree ? this.getChildrenOffsets(this.tree) : []);
		}
	}

	private getChildrenOffsets(node: json.Node): number[] {
		const offsets: number[] = [];
		for (const child of node.children) {
			const childPath = json.getLocation(this.text, child.offset).path;
			const childNode = json.findNodeAtLocation(this.tree, childPath);
			if (childNode) {
				offsets.push(childNode.offset);
			}
		}
		return offsets;
	}

	getTreeItem(offset: number): vscode.TreeItem {
		const path = json.getLocation(this.text, offset).path;
		const valueNode = json.findNodeAtLocation(this.tree, path);

		if (valueNode) {

			this.strValueNodeType = valueNode.type;
			this.strValueNode = valueNode.value;
			this.strValueNodeTypeParent = valueNode.parent.type;
			this.strValueNodeLabelParent = valueNode.value;
			this.strValueNodePath = path;

			const hasChildren = valueNode.type === 'object' || valueNode.type === 'array';
			const treeItem: vscode.TreeItem = new vscode.TreeItem(
				this.getLabel(valueNode),
				hasChildren ?
					valueNode.type === 'object' ?
						vscode.TreeItemCollapsibleState.Collapsed :
						vscode.TreeItemCollapsibleState.Collapsed :
					vscode.TreeItemCollapsibleState.None
			);

			// command not yet utilized
			treeItem.command = {
				title: "",
				command: "",
				arguments: [{ "uri": this.strValueNodePath }]
			};
			// this.getCommand(valueNode);
			treeItem.iconPath = this.getIcon(valueNode);
			treeItem.contextValue = this.getResourceType(valueNode);
			treeItem.description = this.getDescription(valueNode);
			treeItem.tooltip = this.getToolTip(valueNode);

			return treeItem;
		}
		return null;
	}

	private getIcon(node: json.Node): any {
		let nodeParentType: string = node.parent.type;
		let nodeType: string = node.type;
		let nodeLabel: string;
		let nodeParentName: string | undefined;
		let nodeIcon: string;
		let nodeIconFilled: string;
		let nodeIconClear: string = "";

		if (nodeParentType === 'array') {
			let prefix = node.parent.children.indexOf(node).toString();

			if (nodeType === 'object') {
				const parentName = node.parent.parent.children[0].value;

				if (parentName === "agents") {
					nodeIcon = "server-process" + ".svg";

					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}

				if (parentName === "hostgroups") {
					nodeIcon = "server-environment" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}

				if (parentName === "datacenters") {
					nodeIcon = "home" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}

				if (parentName === "profiles") {
					const nodeName = node.children[0].children[0].value.toString();

					switch (nodeName) {
						case "profiles.base":
							nodeIcon = "pulse" + ".svg";
							return {
								light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
								dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
							};
						case "profiles.ai":
							nodeIcon = "squirrel" + ".svg";
							return {
								light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
								dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
							};
						default:
							nodeIcon = "" + ".svg";
							return {
								light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
								dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
							};
					}
				}

				if (parentName === "profiles.base") {
					nodeIcon = "pulse" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}

				if (parentName === "profiles.ai") {
					nodeIcon = "squirrel" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}

				if (parentName === "calendars") {
					const nodeName = node.children[0].children[0].value.toString();

					switch (nodeName) {
						case "calendar.regular":
							nodeIcon = "watch" + ".svg";
							return {
								light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
								dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
							};
						case "calendar.periodic":
							nodeIcon = "sync" + ".svg";
							return {
								light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
								dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
							};
						case "calendar.rule":
							nodeIcon = "symbol-ruler" + ".svg";
							return {
								light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
								dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
							};
						default:
							nodeIcon = "calendar" + ".svg";
							return {
								light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
								dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
							};
					}
				}

				if (parentName === "calendar.regular") {
					nodeIcon = "group-by-ref-type" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}

				if (parentName === "calendar.periodic") {
					nodeIcon = "group-by-ref-type" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}

				if (parentName === "calendar.rule") {
					nodeIcon = "group-by-ref-type" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}

				if (parentName === "connections") {
					nodeIcon = "group-by-ref-type" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}

				if (parentName === "resources") {
					nodeIcon = "group-by-ref-type" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}

				if (parentName === "runas") {
					nodeIcon = "person" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}

				if (parentName === "remote") {
					nodeIcon = "remote" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}

				if (parentName === "active") {
					nodeIcon = "gist" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}

				if (parentName === "inactive") {
					nodeIcon = "gist-secret" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}

				if (parentName === "sitestandards") {
					nodeIcon = "checklist" + ".svg";

					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}

				nodeIcon = "" + ".svg";
				return {
					light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
					dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
				};
			}

			if (nodeType === 'array') {
				nodeIcon = "dependency" + ".svg";
				return {
					light: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon)),
					dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
				};
			}

			if (nodeType === 'string') {
				nodeParentName = node.parent.parent.children[0].value;

				if (nodeParentName) {
					if (nodeParentName === "secrets") {
						nodeIcon = "key" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					}
					if (nodeParentName === "agents") {
						nodeIcon = "vm" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					}
				}
			}

			if (nodeType === 'boolean') {
				nodeIcon = "boolean" + ".svg";
				return {
					light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
					dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
				};
			}

			if (nodeType === 'number') {
				nodeIcon = "number" + ".svg";
				return {
					light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
					dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
				};
			}			

			nodeIcon = "dependency" + ".svg";
			return {
				light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
				dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
			};
		} else {
			let property = node.parent.children[0].value.toString();

			if (nodeType === 'array' || nodeType === 'object') {
				if (nodeType === 'object') {
					const nodeChildrenLenght = node.children.length.toString();
					let nodeTemp: string | undefined;


					try {
						nodeParentName = node.parent.parent.parent.children[0].value;
					} catch (error) {
						nodeParentName = null;
					}

					try {
						nodeTemp = node.children[0].children[1].value;
					} catch (error) {
						nodeTemp = null;
					}

					if (nodeTemp) {
						if (CommonUtils.checkIfString(nodeTemp)) {
							if (nodeTemp.startsWith("ConnectionProfile:")) {
								nodeIcon = "settings" + ".svg";
								return {
									light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
									dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
								};
							}
							if (nodeTemp.startsWith("Site Standard Policy")) {
								nodeIcon = "settings" + ".svg";
								return {
									light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
									dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
								};
							}
						}
					}

					if (nodeParentName) {
						switch (nodeParentName) {
							case "environments":
								nodeIcon = "home" + ".svg";
								return {
									light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
									dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
								};
							default:
								"pass";
						}

					}

					if (property === "workloadpolicies") {
						nodeIcon = "repo-clone" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					}

					if (property === "environments") {
						nodeIcon = "globe" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					}

					if (property === "profiles") {
						nodeIcon = "radio-tower" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					}

					if (property === "properties") {
						nodeIcon = "settings" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					}

					if (property === "agents") {
						nodeIcon = "server-process" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					}

					if (property === "calendars") {
						nodeIcon = "calendar" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					}

					nodeIcon = "" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}
				if (nodeType === 'array') {
					if (property === "agents") {
						nodeIcon = "dependency" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					} else if (property === "hostgroups") {
						nodeIcon = "server" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					} else if (property === "datacenters") {
						nodeIcon = "globe" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					} else if (property === "profiles") {
						nodeIcon = "dependency" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					} else if (property === "profiles.base") {
						nodeIcon = "pulse" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					} else if (property === "profiles.ai") {
						nodeIcon = "rocket" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					} else if (property === "calendars") {
						nodeIcon = "calendar" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					} else if (property === "calendar.regular") {
						nodeIcon = "watch" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					} else if (property === "calendar.periodic") {
						nodeIcon = "sync" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					} else if (property === "calendar.rule") {
						nodeIcon = "symbol-ruler" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					} else if (property === "secrets") {
						nodeIcon = "shield" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					} else if (property === "active") {
						nodeIcon = "repo" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					} else if (property === "inactive") {
						nodeIcon = "repo" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					} else if (property === "remote") {
						nodeIcon = "remote-explorer" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					} else if (property === "runas") {
						nodeIcon = "organization" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					} else if (property === "resources") {
						nodeIcon = "package" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					} else if (property === "connections") {
						nodeIcon = "link" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					} else if (property === "sitestandards") {
						nodeIcon = "symbol-ruler" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};	
					} else if (property === "policy") {
						nodeIcon = "symbol-ruler" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};	
						
					} else {
						nodeIcon = "dependency" + ".svg";
						return {
							light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
							dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
						};
					}

					return property;
				}
			} else if (nodeType === 'string') {
				const nodeKey = node.parent.children[0].value;
				const value = node.value.toString();
				if (nodeKey === 'server') {
					nodeIcon = "home" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}
				if (nodeKey === 'servers') {
					nodeIcon = "server" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}
				if (nodeKey === 'folders') {
					nodeIcon = "file-submodule" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}				
				if (nodeKey === 'nodeid') {
					nodeIcon = "server-process" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}
				if (nodeKey === 'operatingSystem') {
					nodeIcon = "vm-running" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}
				if (nodeKey === 'version') {
					nodeIcon = "code" + ".svg";
					return {
						light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
						dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
					};
				}

				nodeIcon = "symbol-string" + ".svg";
				return {
					light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
					dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
				};
			} else if (nodeType === 'boolean') {
				nodeIcon = "boolean" + ".svg";
				return {
					light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
					dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
				};
			} else if (nodeType === 'number') {
				nodeIcon = "number" + ".svg";
				return {
					light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
					dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
				};
			}

			nodeIcon = "" + ".svg";
			return {
				light: this.context.asAbsolutePath(path.join('resources', 'light', nodeIcon)),
				dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeIcon))
			};
		}
	}

	private getLabel(node: json.Node): string {
		let nodeParentType: string = node.parent.type;
		let nodeType: string = node.type;
		let nodeParentName: string | undefined;

		if (nodeParentType === 'array') {
			let prefix = node.parent.children.indexOf(node).toString();

			if (nodeType === 'object') {
				const parentName = node.parent.parent.children[0].value;

				if (parentName === "agents") {
					const nodeName = node.children[0].children[1].value.toString();
					return prefix = nodeName;
				}

				if (parentName === "hostgroups") {
					const nodeName = node.children[0].children[1].value.toString();
					return prefix = nodeName;
				}

				if (parentName === "datacenters") {
					const nodeName = node.children[0].children[1].value.toString();
					return prefix = nodeName;
				}

				if (parentName === "profiles") {
					const nodeName = node.children[0].children[0].value.toString();

					switch (nodeName) {
						case "profiles.base":
							prefix = " Base Modules";
							return prefix;
						case "profiles.ai":
							prefix = " Application Integrator";
							return prefix;
						default:
							prefix = nodeName; // + " Profile Type";
							return prefix;
					}
				}

				if (parentName === "profiles.base") {
					const nodeName = node.children[0].children[1].value.toString();
					return prefix = nodeName;
				}

				if (parentName === "profiles.ai") {
					const nodeName: string = node.children[0].children[1].value.toString();
					let nodeLabel: string = nodeName.substring(nodeName.indexOf(" ") + 1);
					return prefix = nodeLabel;
				}

				if (parentName === "calendar.regular") {
					const nodeName: string = node.children[0].children[1].value.toString();
					let nodeLabel: string = nodeName.substring(nodeName.indexOf(" ") + 1);
					return prefix = nodeLabel;
				}

				if (parentName === "calendar.periodic") {
					const nodeName: string = node.children[0].children[1].value.toString();
					let nodeLabel: string = nodeName.substring(nodeName.indexOf(" ") + 1);
					return prefix = nodeLabel;
				}

				if (parentName === "calendar.rule") {
					const nodeName: string = node.children[0].children[1].value.toString();
					let nodeLabel: string = nodeName.substring(nodeName.indexOf(" ") + 1);
					return prefix = nodeLabel;
				}

				if (parentName === "connections") {
					const nodeChildrenLenght = node.children.length;
					let nodeLabel: string = "Definitions (" + nodeChildrenLenght + ")";
					return prefix = nodeLabel;
				}

				if (parentName === "resources") {
					const nodeName: string = node.children[0].children[1].value.toString();
					let nodeLabel: string = nodeName.substring(nodeName.indexOf(" ") + 1);
					return prefix = nodeLabel;
				}

				if (parentName === "runas") {
					const nodeName: string = node.children[1].children[1].value.toString();
					let nodeLabel: string = nodeName.substring(nodeName.indexOf(" ") + 1);
					return prefix = nodeLabel;
				}

				if (parentName === "remote") {
					const nodeName: string = node.children[0].children[1].value;
					let nodeLabel: string = nodeName.substring(nodeName.indexOf(" ") + 1);
					return prefix = nodeLabel;
				}

				if (parentName === "active") {
					const nodeName = node.children[0].children[1].value.toString();
					return prefix = nodeName;
				}

				if (parentName === "inactive") {
					const nodeName = node.children[0].children[1].value.toString();
					return prefix = nodeName;
				}

				if (parentName === "sitestandards") {
					const nodeName = node.children[0].children[1].value.toString();
					return prefix = nodeName;
				}

				return prefix + ':[ ] L4';
			}

			if (nodeType === 'array') {
				return prefix + ':[ ] L3';
			}

			if (nodeType === 'string') {
				nodeParentName = node.parent.parent.children[0].value;

				if (nodeParentName) {
					if (nodeParentName === "secrets") {
						return prefix = "Name: " + node.value.toString();
					}
					if (nodeParentName === "agents") {
						return prefix = "Node ID: " + node.value.toString();
					}
				}
			}

			prefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
			return prefix + ': (L5) ' + node.value.toString();
		} else {
			let property = node.parent.children[0].value.toString();

			if (nodeType === 'array' || nodeType === 'object') {
				if (nodeType === 'object') {
					const nodeChildrenLenght = node.children.length.toString();
					let nodeTemp: string | undefined;


					try {
						nodeParentName = node.parent.parent.parent.children[0].value;
					} catch (error) {
						nodeParentName = null;
					}

					try {
						nodeTemp = node.children[0].children[1].value;
					} catch (error) {
						nodeTemp = null;
					}

					if (nodeTemp) {
						if (CommonUtils.checkIfString(nodeTemp)) {
							if (nodeTemp.startsWith("ConnectionProfile:")) {
								return property;
							}
						}
					}

					if (nodeParentName) {
						switch (nodeParentName) {
							case "environments":
								return "Environment: " + property;
							default:
								"pass";
						}

					}

					if (property === "workloadpolicies") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Workload Policies (" + nodeChildrenLenght + ")";
					}

					if (property === "environments") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "AAPI Environments (" + nodeChildrenLenght + ")";
					}

					if (property === "profiles") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Connection Profiles (" + nodeChildrenLenght + ")";
					}

					if (property === "properties") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Properties (" + nodeChildrenLenght + ")";
					}

					if (property === "agents") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Agents (" + nodeChildrenLenght + ")";
					}

					if (property === "calendars") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Calendars (" + nodeChildrenLenght + ")";
					}

					if (property === "policy") {
						nodeTemp = node.children[1].children[1].value;
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Policy: " + nodeTemp;
					}
					
					return property + " L1 (" + nodeChildrenLenght + ")";
				}
				if (nodeType === 'array') {
					if (property === "agents") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Agents (" + nodeChildrenLenght + ")";
					} else if (property === "hostgroups") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Host Groups (" + nodeChildrenLenght + ")";
					} else if (property === "datacenters") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Datacenters (" + nodeChildrenLenght + ")";
					} else if (property === "profiles") {
						// const nodeChildrenLenght = node.children.length.toString();
						return property = "Connection Profiles";
					} else if (property === "profiles.base") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Base Profiles (" + nodeChildrenLenght + ")";
					} else if (property === "profiles.ai") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Application Integrator Profiles (" + nodeChildrenLenght + ")";
					} else if (property === "calendar.regular") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Regular (" + nodeChildrenLenght + ")";
					} else if (property === "calendar.periodic") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Periodic (" + nodeChildrenLenght + ")";
					} else if (property === "calendar.rule") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Rule Based (" + nodeChildrenLenght + ")";
					} else if (property === "secrets") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Secrets (" + nodeChildrenLenght + ")";
					} else if (property === "active") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Active Policies (" + nodeChildrenLenght + ")";
					} else if (property === "inactive") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Inactive Policies (" + nodeChildrenLenght + ")";
					} else if (property === "remote") {
						const nodeChildrenLenght = node.children.length.toString();
						property = "Remote Hosts (" + nodeChildrenLenght + ")";
					} else if (property === "runas") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "RunAs Credentials (" + nodeChildrenLenght + ")";
					} else if (property === "resources") {
						const nodeChildrenLenght = node.children.length.toString();
						return property = "Workflow Resources (" + nodeChildrenLenght + ")";
					} else if (property === "connections") {
						return property = "Profiles";
					} else if (property === "sitestandards") {
                        const nodeChildrenLenght = node.children.length.toString();
                        return property = "Site Standards (" + nodeChildrenLenght + ")";
					} else {
						return property = '[ ] L2 ' + property;
					}

					return property;
				}
			} else if (nodeType === 'string') {
				const nodeKey = node.parent.children[0].value;
				const value = node.value.toString();
				if (nodeKey === 'server') {
					return property = 'Datacenter: ' + value;
				}
				if (nodeKey === 'nodeid') {
					return property = 'Node ID: ' + value;
				}
				if (nodeKey === 'operatingSystem') {
					return property = 'Operating System: ' + value;
				}
				if (nodeKey === 'version') {
					return property = 'AAPI Version: ' + value;
				}

				property = property.charAt(0).toUpperCase() + property.slice(1);
				return `${property}: ${value}`;
			}
			const value = node.value.toString();
			property = property.charAt(0).toUpperCase() + property.slice(1);
			return `${property}: ${value}`; // (L6)`;
		}
	}

	private getDescription(node: json.Node): string {
		let nodeParentType: string = node.parent.type;
		let nodeType: string = node.type;
		let nodeLabel: string;
		let nodeParentName: string | undefined;
		let nodeDescription: string = "";

		if (nodeParentType === 'array') {
			let prefix = node.parent.children.indexOf(node).toString();

			if (nodeType === 'object') {
				const parentName = node.parent.parent.children[0].value;
				let nodeTemp: string | undefined;

				if (parentName === "agents") {
					nodeDescription = "";
					return nodeDescription;
				}

				if (parentName === "hostgroups") {
					nodeDescription = "";
					return nodeDescription;
				}

				if (parentName === "datacenters") {
					nodeDescription = "";
					return nodeDescription;
				}

				if (parentName === "profiles") {
					const nodeName = node.children[0].children[0].value.toString();

					switch (nodeName) {
						case "profiles.base":
							nodeDescription = "";
							return nodeDescription;
						case "profiles.ai":
							nodeDescription = "";
							return nodeDescription;
						default:
							nodeDescription = "";
							return nodeDescription;
					}
				}

				if (parentName === "profiles.base") {
					nodeDescription = "";
					return nodeDescription;
				}

				if (parentName === "profiles.ai") {
					nodeDescription = "";
					return nodeDescription;
				}

				if (parentName === "connections") {
					nodeDescription = "";
					return nodeDescription;
				}

				if (parentName === "resources") {
					nodeDescription = "";
					return nodeDescription;
				}

				if (parentName === "runas") {
					nodeDescription = "";
					return nodeDescription;
				}

				if (parentName === "remote") {
					nodeDescription = "";
					return nodeDescription;
				}

				if (parentName === "active") {
					nodeDescription = "";
					return nodeDescription;
				}

				if (parentName === "inactive") {
					nodeDescription = "";
					return nodeDescription;
				}

				if (parentName === "calendar.regular") {
					// Get alias from calendar name
					try {
						nodeTemp = node.children[1].children[1].value;
					} catch (error) {
						nodeTemp = null;
					}
					nodeDescription = "";
					if (CommonUtils.checkIfString(nodeTemp)) {
						if (nodeTemp.length > 0) {
							nodeDescription = nodeTemp;
						}
					}
					return nodeDescription;
				}

				if (parentName === "calendar.periodic") {
					// Get alias from calendar name
					try {
						nodeTemp = node.children[1].children[1].value;
					} catch (error) {
						nodeTemp = null;
					}
					nodeDescription = "";
					if (CommonUtils.checkIfString(nodeTemp)) {
						if (nodeTemp.length > 0) {
							nodeDescription = nodeTemp;
						}
					}
					return nodeDescription;
				}

				if (parentName === "calendar.rule") {
					// Get alias from calendar name
					try {
						nodeTemp = node.children[1].children[1].value;
					} catch (error) {
						nodeTemp = null;
					}
					nodeDescription = "";
					if (CommonUtils.checkIfString(nodeTemp)) {
						if (nodeTemp.length > 0) {
							nodeDescription = nodeTemp;
						}
					}
					return nodeDescription;
				}

				nodeDescription = "";
				return nodeDescription;
			}

			if (nodeType === 'array') {
				nodeDescription = "";
				return nodeDescription;
			}

			if (nodeType === 'string') {
				nodeParentName = node.parent.parent.children[0].value;

				if (nodeParentName) {
					if (nodeParentName === "secrets") {
						nodeDescription = "";
						return nodeDescription;
					}
					if (nodeParentName === "agents") {
						nodeDescription = " - CTM Agent B";
						return nodeDescription;
					}
				}
			}

			nodeDescription = "";
			return nodeDescription;
		} else {
			let property = node.parent.children[0].value.toString();

			if (nodeType === 'array' || nodeType === 'object') {
				if (nodeType === 'object') {
					const nodeChildrenLenght = node.children.length.toString();
					let nodeTemp: string | undefined;
					let nodeAlias: string | undefined;

					try {
						nodeParentName = node.parent.parent.parent.children[0].value;
					} catch (error) {
						nodeParentName = null;
					}

					// Connection Profile
					try {
						nodeTemp = node.children[0].children[1].value;
					} catch (error) {
						nodeTemp = null;
					}


					if (nodeTemp) {
						if (CommonUtils.checkIfString(nodeTemp)) {

							if (nodeTemp.startsWith("ConnectionProfile:FileTransfer:")) {
								let nodeLabelTempA = nodeTemp.substring(nodeTemp.indexOf(":") + 1);
								let nodeLabelTempB = nodeLabelTempA.substring(nodeLabelTempA.indexOf(":") + 1);
								let nodeLabelTempC = nodeLabelTempB.replace(":", " ");
								nodeDescription = nodeLabelTempC;
								return nodeDescription;
							} else if (nodeTemp.startsWith("ConnectionProfile:Database:")) {
								let nodeLabelTempA = nodeTemp.substring(nodeTemp.indexOf(":") + 1);
								let nodeLabelTempB = nodeLabelTempA.substring(nodeLabelTempA.indexOf(":") + 1);
								let nodeLabelTempC = nodeLabelTempB.replace(":", " ");
								nodeDescription = nodeLabelTempC;
								return nodeDescription;
							} else {
								nodeDescription = "";
								return nodeDescription;
							}
						}
					}

					if (nodeAlias) {
						if (CommonUtils.checkIfString(nodeTemp)) {
							console.log(nodeAlias);
						}

					}

					if (nodeParentName) {
						switch (nodeParentName) {
							case "environments":
								nodeDescription = "";
								return nodeDescription;
							default:
								"pass";
						}

					}

					if (property === "workloadpolicies") {
						nodeDescription = "";
						return nodeDescription;
					}

					if (property === "environments") {
						nodeDescription = "";
						return nodeDescription;
					}

					if (property === "profiles") {
						nodeDescription = "";
						return nodeDescription;
					}

					if (property === "properties") {
						nodeDescription = "";
						return nodeDescription;
					}

					if (property === "agents") {
						nodeDescription = "";
						return nodeDescription;
					}

					nodeDescription = "";
					return nodeDescription;
				}
				if (nodeType === 'array') {
					if (property === "agents") {
						nodeDescription = "";
						return nodeDescription;
					} else if (property === "hostgroups") {
						nodeDescription = "";
						return nodeDescription;
					} else if (property === "datacenters") {
						nodeDescription = "";
						return nodeDescription;
					} else if (property === "profiles") {
						nodeDescription = "";
						return nodeDescription;
					} else if (property === "profiles.base") {
						nodeDescription = "";
						return nodeDescription;
					} else if (property === "profiles.ai") {
						nodeDescription = "";
						return nodeDescription;
					} else if (property === "secrets") {
						nodeDescription = "";
						return nodeDescription;
					} else if (property === "active") {
						nodeDescription = "";
						return nodeDescription;
					} else if (property === "inactive") {
						nodeDescription = "";
						return nodeDescription;
					} else if (property === "remote") {
						nodeDescription = "";
						return nodeDescription;
					} else if (property === "runas") {
						nodeDescription = "";
						return nodeDescription;
					} else if (property === "resources") {
						nodeDescription = "";
						return nodeDescription;
					} else if (property === "connections") {
						nodeDescription = "";
						return nodeDescription;
					} else {
						nodeDescription = "";
						return nodeDescription;
					}


				}
			} else if (nodeType === 'string') {
				const nodeKey = node.parent.children[0].value;
				const value = node.value.toString();
				if (nodeKey === 'server') {
					nodeDescription = "";
					return nodeDescription;
				}
				if (nodeKey === 'nodeid') {
					nodeDescription = "";
					return nodeDescription;
				}
				if (nodeKey === 'operatingSystem') {
					nodeDescription = "";
					return nodeDescription;
				}
				if (nodeKey === 'version') {
					nodeDescription = "";
					return nodeDescription;
				}

				nodeDescription = "";
				return nodeDescription;
			}
			nodeDescription = "";
			return nodeDescription;
		}
	}

	private getResourceType(node: json.Node): string {
		let nodeResourceType: string = "";
		let nodeParentType: string = node.parent.type;
		let nodeType: string = node.type;
		let nodeParentName: string | undefined;
		let nodeDescription: string = "";

		if (nodeParentType === 'array') {
			let prefix = node.parent.children.indexOf(node).toString();

			if (nodeType === 'object') {
				const parentName = node.parent.parent.children[0].value;

				if (parentName === "agents") {
					nodeResourceType = "ctm.agent";
					return nodeResourceType;
				}

				if (parentName === "hostgroups") {
					nodeResourceType = "ctm.hostgroup";
					return nodeResourceType;
				}

				// CTTM Datacenter, Server
				if (parentName === "datacenters") {
					nodeResourceType = "ctm.datacenter";
					return nodeResourceType;
				}

				if (parentName === "profiles.base") {
					nodeResourceType = "";
					return nodeResourceType;
				}

				if (parentName === "profiles.ai") {
					nodeResourceType = "";
					return nodeResourceType;
				}

				if (parentName === "connections") {
					nodeResourceType = "";
					return nodeResourceType;
				}

				if (parentName === "resources") {
					nodeResourceType = "ctm.resources";
					return nodeResourceType;
				}

				if (parentName === "runas") {
					nodeResourceType = "ctm.run.as";
					return nodeResourceType;
				}

				if (parentName === "remote") {
					nodeResourceType = "ctm.remote.host";
					return nodeResourceType;
				}

				if (parentName === "active") {
					nodeResourceType = "ctm.workload.policies";
					return nodeResourceType;
				}

				if (parentName === "inactive") {
					nodeResourceType = "ctm.workload.policies";
					return nodeResourceType;
				}

				if (parentName === "calendar.regular") {
					nodeResourceType = "ctm.calendar";
					return nodeResourceType;
				}

				if (parentName === "calendar.periodic") {
					nodeResourceType = "ctm.calendar";
					return nodeResourceType;
				}

				if (parentName === "calendar.rule") {
					nodeResourceType = "ctm.calendar";
					return nodeResourceType;
				}

				if (parentName === "sitestandards") {
					nodeResourceType = "ctm.sitestandards";
					return nodeResourceType;
				}

				nodeResourceType = "";
				return nodeResourceType;
			}

			if (nodeType === 'array') {
				nodeResourceType = "";
				return nodeResourceType;
			}

			if (nodeType === 'string') {
				nodeParentName = node.parent.parent.children[0].value;

				if (nodeParentName) {
					if (nodeParentName === "secrets") {
						nodeResourceType = "ctm.secrets";
						return nodeResourceType;
					}
					if (nodeParentName === "agents") {
						nodeResourceType = "ctm.agent";
						return nodeResourceType;
					}
				}
			}

			nodeResourceType = "";
			return nodeResourceType;
		} else {
			let property = node.parent.children[0].value.toString();

			if (nodeType === 'array' || nodeType === 'object') {
				if (nodeType === 'object') {
					const nodeChildrenLenght = node.children.length.toString();
					let nodeTemp: string | undefined;


					try {
						nodeParentName = node.parent.parent.parent.children[0].value;
					} catch (error) {
						nodeParentName = null;
					}

					try {
						nodeTemp = node.children[0].children[1].value;
					} catch (error) {
						nodeTemp = null;
					}

					if (nodeTemp) {
						if (CommonUtils.checkIfString(nodeTemp)) {
							if (nodeTemp.startsWith("ConnectionProfile:")) {
								nodeResourceType = "ctm.connection.profile";
								return nodeResourceType;
							}
						}
					}

					if (nodeParentName) {
						switch (nodeParentName) {
							case "environments":
								nodeResourceType = "";
								return nodeResourceType;
							default:
								"pass";
						}

					}

					if (property === "workloadpolicies") {
						nodeResourceType = "";
						return nodeResourceType;
					}

					if (property === "environments") {
						nodeResourceType = "";
						return nodeResourceType;
					}

					if (property === "profiles") {
						nodeResourceType = "ctm.connection.profiles";
						return nodeResourceType;
					}

					if (property === "properties") {
						nodeResourceType = "";
						return nodeResourceType;
					}

					if (property === "agents") {
						nodeResourceType = "";
						return nodeResourceType;
					}

					if (property === "connections") {
						nodeResourceType = "";
						return nodeResourceType;
					}

					if (property === "calendars") {
						nodeResourceType = "";
						return nodeResourceType;
					}

					if (property === "sitestandards") {
						nodeResourceType = "";
						return nodeResourceType;
					}
					

					nodeResourceType = "";
					return nodeResourceType;
				}
				if (nodeType === 'array') {
					if (property === "agents") {
						nodeResourceType = "ctm.configuration";
						return nodeResourceType;
					} else if (property === "hostgroups") {
						nodeResourceType = "";
						return nodeResourceType;
					} else if (property === "datacenters") {
						nodeResourceType = "";
						return nodeResourceType;
					} else if (property === "profiles") {
						nodeResourceType = "";
						return nodeResourceType;
					} else if (property === "profiles.base") {
						nodeResourceType = "";
						return nodeResourceType;
					} else if (property === "profiles.ai") {
						nodeResourceType = "";
						return nodeResourceType;
					} else if (property === "secrets") {
						nodeResourceType = "";
						return nodeResourceType;
					} else if (property === "active") {
						nodeResourceType = "";
						return nodeResourceType;
					} else if (property === "inactive") {
						nodeResourceType = "";
						return nodeResourceType;
					} else if (property === "remote") {
						nodeResourceType = "";
						return nodeResourceType;
					} else if (property === "runas") {
						nodeResourceType = "";
						return nodeResourceType;
					} else if (property === "resources") {
						nodeResourceType = "";
						return nodeResourceType;
					} else if (property === "connections") {
						nodeResourceType = "";
						return nodeResourceType;
					} else {
						nodeResourceType = "";
						return nodeResourceType;
					}
				}
			} else if (nodeType === 'string') {
				const nodeKey = node.parent.children[0].value;
				const value = node.value.toString();
				if (nodeKey === 'server') {
					nodeResourceType = "ctm.server";
					return nodeResourceType;
				}
				if (nodeKey === 'nodeid') {
					nodeResourceType = "ctm.node";
					return nodeResourceType;
				}

				nodeResourceType = "";
				return nodeResourceType;
			}
			nodeResourceType = "";
			return nodeResourceType;
		}
	}

	private getCommand(node: json.Node): any {
		let nodeCommand: any = {
			command: 'ctm',
			title: 'Control-M AAPI',
			arguments: []
		};

		// const item = Array.from(this._inputs.values()).pop();

		let nodeParentType: string = node.parent.type;
		let nodeType: string = node.type;
		let parentName: string;

		if (nodeParentType === 'array') {

			if (nodeType === 'object') {
				// parentName = node.parent.parent.children[0].value;
				// nodeTemp = node.parent.children.indexOf(node).toString();

				// // description for agents
				// if (parentName === "agents") {
				// 	nodeCommand = "ctm.agent";
				// 	return nodeCommand;
				// }
				return;
			}

			return;
		} else {
			parentName = node.parent.children[0].value.toString();

			if (nodeType === 'array' || nodeType === 'object') {
				if (nodeType === 'object') {
					const nodeTemp = node.children[0].children[1].value;
					return nodeCommand;
				}
				return;
			}
		}
		return;
	}


	private getToolTip(node: json.Node): string {
		let nodeParentType: string = node.parent.type;
		let nodeType: string = node.type;
		let nodeLabel: string;
		let nodeParentName: string | undefined;
		let nodeToolTip: string = "";

		if (nodeParentType === 'array') {
			let prefix = node.parent.children.indexOf(node).toString();

			if (nodeType === 'object') {
				const parentName = node.parent.parent.children[0].value;

				if (parentName === "agents") {
					nodeToolTip = "";
					return nodeToolTip;
				}

				if (parentName === "hostgroups") {
					nodeToolTip = "";
					return nodeToolTip;
				}

				if (parentName === "datacenters") {
					nodeToolTip = "";
					return nodeToolTip;
				}

				if (parentName === "profiles") {
					const nodeName = node.children[0].children[0].value.toString();

					switch (nodeName) {
						case "profiles.base":
							nodeToolTip = "";
							return nodeToolTip;
						case "profiles.ai":
							nodeToolTip = "";
							return nodeToolTip;
						default:
							nodeToolTip = "";
							return nodeToolTip;
					}
				}

				if (parentName === "profiles.base") {
					nodeToolTip = "";
					return nodeToolTip;
				}

				if (parentName === "profiles.ai") {
					nodeToolTip = "";
					return nodeToolTip;
				}

				if (parentName === "calendar.regular") {
					nodeToolTip = "";
					return nodeToolTip;
				}

				if (parentName === "calendar.periodic") {
					nodeToolTip = "";
					return nodeToolTip;
				}

				if (parentName === "calendar.rule") {
					nodeToolTip = "";
					return nodeToolTip;
				}

				if (parentName === "connections") {
					nodeToolTip = "";
					return nodeToolTip;
				}

				if (parentName === "resources") {
					nodeToolTip = "";
					return nodeToolTip;
				}

				if (parentName === "runas") {
					nodeToolTip = "";
					return nodeToolTip;
				}

				if (parentName === "remote") {
					nodeToolTip = "";
					return nodeToolTip;
				}

				if (parentName === "active") {
					nodeToolTip = "";
					return nodeToolTip;
				}

				if (parentName === "inactive") {
					nodeToolTip = "";
					return nodeToolTip;
				}

				if (parentName === "sitestandards") {
					nodeToolTip = "";
					return nodeToolTip;
				}
			
				return prefix + ':[ ] L4';
			}

			if (nodeType === 'array') {
				return prefix + ':[ ] L3';
			}

			if (nodeType === 'string') {
				nodeParentName = node.parent.parent.children[0].value;

				if (nodeParentName) {
					if (nodeParentName === "secrets") {
						nodeToolTip = "";
						return nodeToolTip;
					}
					if (nodeParentName === "agents") {
						nodeToolTip = "";
						return nodeToolTip;
					}
				}
			}

			prefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
			return prefix + ': (L5) ' + node.value.toString();
		} else {
			let property = node.parent.children[0].value.toString();

			if (nodeType === 'array' || nodeType === 'object') {
				if (nodeType === 'object') {
					const nodeChildrenLenght = node.children.length.toString();
					let nodeTemp: string | undefined;


					try {
						nodeParentName = node.parent.parent.parent.children[0].value;
					} catch (error) {
						nodeParentName = null;
					}

					try {
						nodeTemp = node.children[0].children[1].value;
					} catch (error) {
						nodeTemp = null;
					}

					if (nodeTemp) {
						if (CommonUtils.checkIfString(nodeTemp)) {
							if (nodeTemp.startsWith("ConnectionProfile:")) {
								nodeToolTip = "";
								return nodeToolTip;
							}
						}
					}

					if (nodeParentName) {
						switch (nodeParentName) {
							case "environments":
								nodeToolTip = "";
								return nodeToolTip;
							default:
								"pass";
						}

					}

					if (property === "workloadpolicies") {
						nodeToolTip = "";
						return nodeToolTip;
					}

					if (property === "environments") {
						nodeToolTip = "";
						return nodeToolTip;
					}

					if (property === "profiles") {
						nodeToolTip = "";
						return nodeToolTip;
					}

					if (property === "properties") {
						nodeToolTip = "";
						return nodeToolTip;
					}

					if (property === "agents") {
						nodeToolTip = "";
						return nodeToolTip;
					}

					if (property === "calendars") {
						nodeToolTip = "";
						return nodeToolTip;
					}

					return property + " L1 (" + nodeChildrenLenght + ")";
				}
				if (nodeType === 'array') {
					if (property === "agents") {
						nodeToolTip = 'The Control-M/Agent (CTM AGENT) is a small-footprint application that is installed on each target server for jobs, as well as the CTM SERVER. It runs as a service on Windows-based systems and has a “hook” into “inetd” on UNIX systems. It is dormant until a request comes from the CTM SERVER or until a job-related message needs to be sent to CTM SERVER.';
						return nodeToolTip;
					} else if (property === "hostgroups") {
						nodeToolTip = "";
						return nodeToolTip;
					} else if (property === "datacenters") {
						nodeToolTip = "";
						return nodeToolTip;
					} else if (property === "profiles") {
						nodeToolTip = "";
						return nodeToolTip;
					} else if (property === "profiles.base") {
						nodeToolTip = "";
						return nodeToolTip;
					} else if (property === "profiles.ai") {
						nodeToolTip = "";
						return nodeToolTip;
					} else if (property === "calendar.regular") {
						nodeToolTip = "";
						return nodeToolTip;
					} else if (property === "calendar.periodic") {
						nodeToolTip = "";
						return nodeToolTip;
					} else if (property === "calendar.rule") {
						nodeToolTip = 'With Rule-Based Calendars you can create complex scheduling definitions. You can have the Rule-Based Calendar definition with the "Advanced Scheduling" option, and with these calendars, you do not have to worry about maintaining the calendar definition every year.';
						return nodeToolTip;
					} else if (property === "secrets") {
						nodeToolTip = "";
						return nodeToolTip;
					} else if (property === "active") {
						nodeToolTip = "";
						return nodeToolTip;
					} else if (property === "inactive") {
						nodeToolTip = "";
						return nodeToolTip;
					} else if (property === "remote") {
						nodeToolTip = "";
						return nodeToolTip;
					} else if (property === "runas") {
						nodeToolTip = "";
						return nodeToolTip;
					} else if (property === "resources") {
						nodeToolTip = "";
						return nodeToolTip;
					} else if (property === "connections") {
						nodeToolTip = "";
						return nodeToolTip;
					} else {
						return property = '[ ] L2 ' + property;
					}

					return property;
				}
			} else if (nodeType === 'string') {
				const nodeKey = node.parent.children[0].value;
				const value = node.value.toString();
				if (nodeKey === 'server') {
					nodeToolTip = "";
					return nodeToolTip;
				}
				if (nodeKey === 'nodeid') {
					nodeToolTip = "";
					return nodeToolTip;
				}
				if (nodeKey === 'operatingSystem') {
					nodeToolTip = "";
					return nodeToolTip;
				}
				if (nodeKey === 'version') {
					nodeToolTip = "";
					return nodeToolTip;
				}

				nodeToolTip = "";
				return nodeToolTip;
			}
			nodeToolTip = "";
			return nodeToolTip;
		}

	}

}



/**
 * Get Control-M all Agents in a all host group via CTM AAPI
 * @data CTM data in json format
 */
export function getJsonTree(data: string) {
	json.parseTree(data);
	return "";
}

/**
 * Checks if the Control-M/Agent is available.
 * @param node CTM Infrastructure TreeView Node
 * @param context VS Code Extension Context
 */
export async function pingAgent(node: vscode.TreeItem, context: vscode.ExtensionContext) {

	strConfiguredEnvironmentName = vscode.workspace.getConfiguration('CTM.Automation.API').get('env');
	procNumString = CommonUtils.getProcNumString(context, strPrefix);
	let strMessage: string = "";
	let responseMessage: string | undefined;
	let responseMessageError: string | undefined;
	let responseMessageBase: string | undefined;
	let strConfiguredEnvironmentCmd: string | undefined;

	// let ctmInfrastructureCache: string = context.globalState.get('ctmInfrastructureCache');

	// get globalState data
	let ctmInfrastructureCacheTmp: any = context.globalState.get('ctmInfrastructureCache');
	let ctmInfrastructureCacheType: any = typeof ctmInfrastructureCacheTmp;

	// check if json needs to be converted
	if (ctmInfrastructureCacheType === "string") {
		ctmInfrastructureCache = ctmInfrastructureCacheTmp;
	} else {
		ctmInfrastructureCache = JSON.stringify(ctmInfrastructureCacheTmp);
	}

	// get CTM environmant
	// Assign proper environment name and cmd for ctm aapi
	if (strConfiguredEnvironmentName === "default") {
		strConfiguredEnvironmentCmd = "";
	} else {
		strConfiguredEnvironmentCmd = " -e " + strConfiguredEnvironmentName;
	}

	let tree: json.Node = json.parseTree(ctmInfrastructureCache);
	let nodeKey: string | undefined = "";

	let offsetTemp: number = Number(node.toString());
	let offset: number = Number(offsetTemp) + 10;

	// Get parent
	const pathTemp = json.getLocation(ctmInfrastructureCache, offsetTemp).path;
	const valueNodeTemp = json.findNodeAtLocation(tree, pathTemp);
	let ctmResourceType = getResourceType(valueNodeTemp);

	// Get CTM node name
	const path = json.getLocation(ctmInfrastructureCache, offset).path;
	const valueNode = json.findNodeAtLocation(tree, path);
	const nodeid = valueNode.value.toString();

	// execute ctm aapi based on resource type
	if (ctmResourceType === "ctm.agent") {
		// let ParentTemp = getParent(valueNodeTemp);
		let ctmDatacenterName = getDatacenterName(valueNodeTemp);
		// CTM agent name
		let ctmAgent: string = nodeid;

		try {
			nodeKey = valueNode.parent.children[0].value;
		} catch (error) {
			nodeKey = null;
		}

		let statusBarTip = new vscode.MarkdownString("Last action: Ping Agent **" + ctmAgent + "** <br> at Datacenter: **" + ctmDatacenterName + "**");
		let statusBarText = "$(ports-view-icon) JAC: PING";
		await CommonUtils.updateCtmStatusBar(statusBarText, statusBarTip);

		strMessage = "Awaiting Agent Status of: '" + ctmAgent + "' managed by: " + ctmDatacenterName;
		(await OutputUtils.getOutputChannel()).appendLine(procNumString + ' Message  : ' + strMessage);

		// execute ctm aapi
		let jsonStrA = await CtmTools.cmdPingAgent(strConfiguredEnvironmentCmd, ctmDatacenterName, ctmAgent, procNumString);
		let jsonStrB = json.parse(jsonStrA.replace(/\n/g, ''));


		try {
			responseMessageBase = jsonStrB["message"].toString();
			// eslint-disable-next-line no-empty
		} catch { }

		try {
			responseMessageError = jsonStrB["errors"][0]["message"];
			// eslint-disable-next-line no-empty
		} catch { }

		if (responseMessageBase) {
			responseMessage = responseMessageBase;
		} else if (responseMessageError) {
			responseMessage = responseMessageError;
		}

		let reStrA = "unavailable";
		let reStrB = "available";
		let reStrC = "Failed";

		if (responseMessage.includes(reStrA)) {
			strMessage = 'Status : ' + responseMessage;
			MessageUtils.showWarningMessage(strMessage);
		} else if (responseMessage.includes(reStrB)) {
			strMessage = 'Status : ' + responseMessage;
			MessageUtils.showInfoMessage(strMessage);
		} else if (responseMessage.includes(reStrC)) {
			strMessage = 'Status : ' + responseMessage;
			MessageUtils.showErrorMessage(strMessage);
		} else {
			strMessage = 'Status : ' + responseMessage;
			MessageUtils.showWarningMessage(strMessage);
		}

		(await OutputUtils.getOutputChannel()).appendLine(procNumString + ' Message  : ' + responseMessage);

	}
}

export function getResourceType(node: json.Node): string {
	let nodeResourceType: string = "";
	let nodeParentType: string = node.parent.type;
	let nodeType: string = node.type;
	let nodeParentName: string | undefined;
	let nodeDescription: string = "";

	if (nodeParentType === 'array') {
		let prefix = node.parent.children.indexOf(node).toString();

		if (nodeType === 'object') {
			const parentName = node.parent.parent.children[0].value;

			if (parentName === "agents") {
				nodeResourceType = "ctm.agent";
				return nodeResourceType;
			}

			if (parentName === "hostgroups") {
				nodeResourceType = "ctm.hostgroup";
				return nodeResourceType;
			}

			// CTTM Datacenter, Server
			if (parentName === "datacenters") {
				nodeResourceType = "ctm.datacenter";
				return nodeResourceType;
			}

			if (parentName === "profiles.base") {
				nodeResourceType = "";
				return nodeResourceType;
			}

			if (parentName === "profiles.ai") {
				nodeResourceType = "";
				return nodeResourceType;
			}

			if (parentName === "connections") {
				nodeResourceType = "";
				return nodeResourceType;
			}

			if (parentName === "resources") {
				nodeResourceType = "ctm.resources";
				return nodeResourceType;
			}

			if (parentName === "runas") {
				nodeResourceType = "ctm.run.as";
				return nodeResourceType;
			}

			if (parentName === "remote") {
				nodeResourceType = "ctm.remote.host";
				return nodeResourceType;
			}

			if (parentName === "active") {
				nodeResourceType = "ctm.workload.policies";
				return nodeResourceType;
			}

			if (parentName === "inactive") {
				nodeResourceType = "ctm.workload.policies";
				return nodeResourceType;
			}

			if (parentName === "calendar.regular") {
				nodeResourceType = "ctm.calendar";
				return nodeResourceType;
			}

			if (parentName === "calendar.periodic") {
				nodeResourceType = "ctm.calendar";
				return nodeResourceType;
			}

			if (parentName === "calendar.rule") {
				nodeResourceType = "ctm.calendar";
				return nodeResourceType;
			}

			nodeResourceType = "";
			return nodeResourceType;
		}

		if (nodeType === 'array') {
			nodeResourceType = "";
			return nodeResourceType;
		}

		if (nodeType === 'string') {
			nodeParentName = node.parent.parent.children[0].value;

			if (nodeParentName) {
				if (nodeParentName === "secrets") {
					nodeResourceType = "ctm.secrets";
					return nodeResourceType;
				}
				if (nodeParentName === "agents") {
					nodeResourceType = "ctm.agent";
					return nodeResourceType;
				}
			}
		}

		nodeResourceType = "";
		return nodeResourceType;
	} else {
		let property = node.parent.children[0].value.toString();

		if (nodeType === 'array' || nodeType === 'object') {
			if (nodeType === 'object') {
				const nodeChildrenLenght = node.children.length.toString();
				let nodeTemp: string | undefined;


				try {
					nodeParentName = node.parent.parent.parent.children[0].value;
				} catch (error) {
					nodeParentName = null;
				}

				try {
					nodeTemp = node.children[0].children[1].value;
				} catch (error) {
					nodeTemp = null;
				}

				if (nodeTemp) {
					if (CommonUtils.checkIfString(nodeTemp)) {
						if (nodeTemp.startsWith("ConnectionProfile:")) {
							nodeResourceType = "ctm.connection.profile";
							return nodeResourceType;
						}
					}
				}

				if (nodeParentName) {
					switch (nodeParentName) {
						case "environments":
							nodeResourceType = "";
							return nodeResourceType;
						default:
							"pass";
					}

				}

				if (property === "workloadpolicies") {
					nodeResourceType = "";
					return nodeResourceType;
				}

				if (property === "environments") {
					nodeResourceType = "";
					return nodeResourceType;
				}

				if (property === "profiles") {
					nodeResourceType = "ctm.connection.profiles";
					return nodeResourceType;
				}

				if (property === "properties") {
					nodeResourceType = "";
					return nodeResourceType;
				}

				if (property === "agents") {
					nodeResourceType = "";
					return nodeResourceType;
				}

				if (property === "connections") {
					nodeResourceType = "";
					return nodeResourceType;
				}

				if (property === "calendars") {
					nodeResourceType = "ctm.calendars";
					return nodeResourceType;
				}



				nodeResourceType = "";
				return nodeResourceType;
			}
			if (nodeType === 'array') {
				if (property === "agents") {
					nodeResourceType = "ctm.configuration";
					return nodeResourceType;
				} else if (property === "hostgroups") {
					nodeResourceType = "";
					return nodeResourceType;
				} else if (property === "datacenters") {
					nodeResourceType = "";
					return nodeResourceType;
				} else if (property === "profiles") {
					nodeResourceType = "";
					return nodeResourceType;
				} else if (property === "profiles.base") {
					nodeResourceType = "";
					return nodeResourceType;
				} else if (property === "profiles.ai") {
					nodeResourceType = "";
					return nodeResourceType;
				} else if (property === "secrets") {
					nodeResourceType = "";
					return nodeResourceType;
				} else if (property === "active") {
					nodeResourceType = "";
					return nodeResourceType;
				} else if (property === "inactive") {
					nodeResourceType = "";
					return nodeResourceType;
				} else if (property === "remote") {
					nodeResourceType = "";
					return nodeResourceType;
				} else if (property === "runas") {
					nodeResourceType = "";
					return nodeResourceType;
				} else if (property === "resources") {
					nodeResourceType = "";
					return nodeResourceType;
				} else if (property === "connections") {
					nodeResourceType = "";
					return nodeResourceType;
				} else {
					nodeResourceType = "";
					return nodeResourceType;
				}
			}
		} else if (nodeType === 'string') {
			const nodeKey = node.parent.children[0].value;
			const value = node.value.toString();
			if (nodeKey === 'server') {
				nodeResourceType = "ctm.server";
				return nodeResourceType;
			}
			if (nodeKey === 'nodeid') {
				nodeResourceType = "ctm.node";
				return nodeResourceType;
			}

			nodeResourceType = "";
			return nodeResourceType;
		}
		nodeResourceType = "";
		return nodeResourceType;
	}
}

export function getParent(node: json.Node): string {
	let nodeParentType: string = node.parent.type;
	let nodeType: string = node.type;
	let parentName: string;

	if (nodeParentType === 'array') {
		if (nodeType === 'object') {
			parentName = node.parent.parent.children[0].value;
		}
		if (nodeType === 'string') {
			parentName = node.parent.parent.children[0].value;
		}
	} else {
		if (nodeType === 'array' || nodeType === 'object') {
			if (nodeType === 'object') {
				try {
					parentName = node.parent.parent.parent.children[0].value;
				} catch (error) {
					parentName = null;
				}
			}
		} else if (nodeType === 'string') {
			const parentName = node.value.toString();
		} else if (nodeType === 'property') {
			const parentName = node.value.toString();
		}
	}
	return parentName;
}

export function getParentjson(node: json.Node): json.Node {
	let nodeParentType: string = node.parent.type;
	let nodeType: string = node.type;
	let parentNode: json.Node;

	if (nodeParentType === 'array') {
		if (nodeType === 'object') {
			parentNode = node.parent.parent.children[0];
		}
		if (nodeType === 'string') {
			parentNode = node.parent.parent.children[0];
		}
	} else {
		if (nodeType === 'array' || nodeType === 'object') {
			if (nodeType === 'object') {
				try {
					parentNode = node.parent.parent.parent.children[0];
				} catch (error) {
					parentNode = null;
				}
			}

		} else if (nodeType === 'string') {
			parentNode = node.parent.parent.children[0];
		} else if (nodeType === 'property') {
			parentNode = node.children[1];
		}
	}
	return parentNode;
}

export function getDatacenterName(node: json.Node): string {
	let nodeParent: json.Node = getParentjson(node);
	let nodeGrandParent: json.Node = getParentjson(nodeParent);
	let nodeGrandGrandParent: json.Node = getParentjson(nodeGrandParent);
	let parentName: string = nodeGrandGrandParent.value.toString();

	return parentName;
}

export function getCtmEnvironment(data: string): string {
	let jData = json.parse(data);
	let value = jData["default"];
	return value;
}


/**
 * Checks if the Control-M/Agent is available.
 * @param node CTM Infrastructure TreeView Node
 * @param context VS Code Extension Context
 */
export async function copyNodeName(node: vscode.TreeItem, context: vscode.ExtensionContext) {
	debugExtensionEnabled = vscode.workspace.getConfiguration('CTM.Automation.debug').get('extension');

	procNumString = CommonUtils.getProcNumString(context, strPrefix);
	let strMessage: string = "";
	let nodeid: string | undefined;
	let nodeKey: string | undefined = "";

	// get globalState data
	let ctmInfrastructureCacheTmp: any = context.globalState.get('ctmInfrastructureCache');
	let ctmInfrastructureCacheType: any = typeof ctmInfrastructureCacheTmp;

	// check if json needs to be converted
	if (ctmInfrastructureCacheType === "string") {
		ctmInfrastructureCache = ctmInfrastructureCacheTmp;
	} else {
		ctmInfrastructureCache = JSON.stringify(ctmInfrastructureCacheTmp);
	}

	let tree: json.Node = json.parseTree(ctmInfrastructureCache);
	let offsetTemp: number = Number(node.toString());
	let offset: number = Number(offsetTemp) + 10;

	// Get parent
	const pathTemp = json.getLocation(ctmInfrastructureCache, offsetTemp).path;
	const valueNodeTemp = json.findNodeAtLocation(tree, pathTemp);
	let ctmResourceType = getResourceType(valueNodeTemp);

	if (debugExtensionEnabled) {
		try {
			strMessage = "Resource Type for Clipboard: " + ctmResourceType;
			(await OutputUtils.getOutputChannel()).appendLine(procNumString + ' Message  : ' + strMessage);
		} catch (error) {
			null;
		}
	}

	// Get CTM node name
	const path = json.getLocation(ctmInfrastructureCache, offset).path;
	const valueNode = json.findNodeAtLocation(tree, path);

	let nodeValue: string;
	switch (ctmResourceType) {
		case "ctm.run.as":
			nodeValue = valueNode.parent.parent.children[1].children[1].value;
			break;
		case "ctm.connection.profile":
			nodeValue = valueNode.parent.parent.parent.children[0].value;
			break;
		case "ctm.secrets":
			nodeValue = valueNode.parent.children[0].value;
			break;
		default:
			nodeid = valueNode.value.toString();
			nodeValue = nodeid;
	}

	try {
		if (nodeValue.length) {
			strMessage = "Copy to Clipboard: " + nodeValue;
			if (debugExtensionEnabled) {
				(await OutputUtils.getOutputChannel()).appendLine(procNumString + ' Message  : ' + strMessage);
			}
			await vscode.env.clipboard.writeText(nodeValue);
			// StatusBarItem
			let statusBarTip = new vscode.MarkdownString("Last action: Copied **" + nodeValue + "** to clipboard. <br> Resource Type: **" + ctmResourceType + "**");
			let statusBarText = "$(notebook-unfold) JAC: CPY";
			await CommonUtils.updateCtmStatusBar(statusBarText, statusBarTip);

		}
	} catch (error) {
		null;
	}

}