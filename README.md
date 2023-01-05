# Jobs-As-Code Werkzeugkiste for Control-M README

# Jobs-As-Code Werkzeugkiste #
![](https://img.shields.io/badge/dynamic/json.svg?label=Version&url=https://raw.githubusercontent.com/controlm/ctm-vscode-extension/main/package.json&query=version&colorB=brightgreen) ![](https://img.shields.io/badge/dynamic/json.svg?label=License&url=https://raw.githubusercontent.com/controlm/ctm-vscode-extension/main/package.json&query=license&colorB=blue) ![](https://img.shields.io/badge/dynamic/json.svg?label=Publisher&url=https://raw.githubusercontent.com/controlm/ctm-vscode-extension/main/package.json&query=publisher&colorB=blue) ![](https://img.shields.io/badge/dynamic/json.svg?label=Build%20State&url=https://raw.githubusercontent.com/controlm/ctm-vscode-extension/main/package.json&query=build&colorB=red)

## Overview
This extension enables key features from BMC Software's Control-M product that will allow users to integrate their Workflow Jobs-As-Code, Git, and Visual Studio Code development processes. Now you can write and debug Control-M Workflow Jobs-As-Code scripts using the excellent IDE-like interface that Visual Studio Code provides.

> Tip: No prior experience with Control-M is required to write jobs.

<br/>
<br/>

## Supported file types or languages
| language    | extension                | description                 |
| ----------- | ------------------------ | --------------------------- |
| JSON        | .json                    | Jobs-As-Code script files    |
| Python      | .py                      | Jobs-As-Code python files    |


<br/>
<br/>

## Features
- Use pre-built code snippets while writing and debugging your Control-M Workflow Jobs-As-Code scripts. 
- **build**, **run** and **deploy** the Jobs-As-Code scripts directly out of ***Visual Studio Code*** or ***Visual Studio Code Server*** 


> Tip: start entering ***jac*** to get a list of predefined code snippets in your json file.



<br/>
<br/>

## Install the Control-M Visual Studio Code extension
The Control-M extension can be found in the Visual Studio Code Extension Marketplace. More information on adding extensions to Visual Studio Code can be found [here](https://code.visualstudio.com/docs/introvideos/extend).

As in any Visual Studio Code Extension you have several options to install:

* Enter the Visual Studio Code Marketplace, search for _Jobs-As-Code Werkzeugkiste for Control-M_ (or enter directly on [the extension page](https://marketplace.visualstudio.com/items?itemName=bmcsoftware.Jobs-As-Code)) and click on _Install_ button.
* Inside Visual Studio Code, enter in the Extensions panel, search for _Jobs-As-Code Werkzeugkiste for Control-M_ and click on _Install_ button
* Run the following command in the Command Palette:
	```
	code --install-extension jobs-as-code-*.vsix
	```

<br/>
<br/>

## Getting Started & Installing the Control-M Automation CLI
Control-M Automation API is a set of programmatic interfaces that give developers and DevOps engineers access to the capabilities of Control-M within the modern application release process. Job flows and related configuration objects are built in JSON and managed together with other application artifacts in any source code management solution, such as GIT. This approach enables capabilities such as sophisticated scheduling, flow control, and SLA management to be built in right from inception and used during the running of batch applications as they are automatically deployed in dev, test, and production environments. Click on the image to watch the introduction video:

<div style="width: 20%; height: 20%">
  
  [![CTM AAPI Introduction Video](https://raw.githubusercontent.com/controlm/ctm-vscode-extension/main/images/ctm.api.getting.started.video.bumper.png)](https://youtu.be/7QAuMDym9cw "Click to watch")
  
</div>

To manually install the CLI, ensure that the platform supports the installation of ***Node.js*** version 4.x or later and ***Java*** version 8 or later. Installation instructions for the CLI are provided separately for each of the following platforms:

- [Windows](https://docs.bmc.com/docs/automation-api/9021/installation-1123726012.html#Installation-windowsCLIinstallationforWindows)
- [Linux](https://docs.bmc.com/docs/automation-api/9021/installation-1123726012.html#Installation-LinuxCLIinstallationforLinuxorUNIX)
- [macOS](https://docs.bmc.com/docs/automation-api/9021/installation-1123726012.html#Installation-MacCLIinstallationformacOS)


In general these are the two steps: ***download*** **ctm-cli.tgz**, then run ***npm install***. Example:


	curl --insecure --output ~/ctm-cli.tgz https://localhost:8443/automation-api/ctm-cli.tgz
	npm -g install ctm-cli.tgz


<br/>
<br/>

## Platform Support

The extension _should_ work anywhere VS Code itself is [supported]. 

Read the [Start using a Jobs-as-Code approach to build workflows with Control-M](https://controlm.github.io/)
to get more details on how to use the extension on these platforms.


<br/>
<br/>

## API Support

Control-M Automation API [Swagger](http://aapi-swagger-doc.s3-website-us-west-2.amazonaws.com/swagger.json) builds the basis of the Jobs-As-Code integration and code snippets.

<br/>
<br/>

### Control-M objects in JSON code

Control-M Automation API enables you to manage jobs through JSON code. See [Code Reference](https://docs.bmc.com/docs/display/workloadautomation/Control-M+Automation+API+-+Code+Reference) for more details.


> Tip: Each Control-M object begins with a **Name** and then a **Type** specifier as the first property. All object names are defined in ***PascalCase*** notation with first letters in capital case.

The Control-M Automation API allows you to automate and work interactively with Control-M. Services are groups of API commands available via either a CLI (Command Line Interface) or as REST API commands. Using the services, you can build job definitions to test whether they are valid, test-run a job to debug job definitions , combine multiple definition files into a package, deploy job definitions and packages to Control-M, provision a Control-M/Agent, manage environments, and more. Click on the link below for more information. 

<br/>
<br/>

| Name           | description              | 
| -----------    | ------------------------ |
| [archive](https://docs.bmc.com/docs/automation-api/9021/archive-service-1123726087.html) | The Archive service enables you to search through job data archived in the Workload Archiving server by the Control-M Workload Archiving add-on, as well as to obtain job outputs and job logs for individual jobs. Not supported in Control-M SaaS | 
| authentication | Creates and manages authentication tokens | 
| [build](https://docs.bmc.com/docs/automation-api/9021/build-service-1123726062.html) | The build service allows you to compile definitions of jobs, folders, or calendars and verify that they are valid for your Control-M environment. Control-M validation includes basic Control-M rules such as length of fields, allowed characters, and mandatory fields. Build will also check that the JSON is valid. If Control-M Change Manager is part of your solution, definitions will be evaluated against the relevant site standard. build can receive definition files in .json format or packages of multiple definition files in .zip or .tar.gz format. | 
| [config](https://docs.bmc.com/docs/automation-api/9021/config-service-1123726072.html) | Using the Config service, you can access, update, and add configuration data for the major components of the Control-M environment. | 
| [deploy](https://docs.bmc.com/docs/automation-api/9021/deploy-service-1123726064.html) | The deploy service allows you to transfer job and configuration definitions to Control-M. | 
| documentation  | Get documentation | 
| [environment](https://docs.bmc.com/docs/automation-api/9021/environment-service-1123726088.html) | The Environment service enables you to manage environments, including defining and selecting the Control-M environment to use. | 
| [package](https://docs.bmc.com/docs/automation-api/9021/package-service-1123726070.html) | Package a directory of definition files into a deployable archive | 
| [provision](https://docs.bmc.com/docs/automation-api/9021/provision-service-1123726081.html) | For Control-M to run and monitor jobs on your application host, a Control-M/Server and Control-M/Agent should be installed. The Provision service allows you access to the full cycle of the following setup processes for agents and servers. | 
| [reporting](https://docs.bmc.com/docs/automation-api/9021/reporting-service-1123726084.html) | The Reporting service enables you to generate reports that were set up through Control-M Reports. You can generate reports either synchronously or asynchronously. | 
| [run](https://docs.bmc.com/docs/automation-api/9021/run-service-1123726067.html) | The Run service enables you to run jobs and track their status, as well as manage several other types of objects used by jobs. | 
| [session](https://docs.bmc.com/docs/automation-api/9021/session-service-1123726090.html) | The Session service allows you to log in and log out of Control-M and receive a token that can be reused in subsequent requests. | 
| usage          | Run the usage service in order to get a usage report. Supported only in Control-M SaaS | 

<br/>
<br/>

## Usage / Tutorials

To get you started, BMC provides you with a group of tutorials to introduce you to common best practices of using Control-M Automation API. See [Tutorials](https://docs.bmc.com/docs/automation-api/9021/tutorials-1123726015.html).

Create a new *.json or *.py file. Enter "jac." to utilize provided code snippets.
**Right-Mouse-Click* to invoke the Visual Studio Code conext menus to activate the Control-M AAPI commands.

<br/>
<br/>

### Snippets

#### **Folder and Object Defaults**
| Category | Prefix  | 
| -----------    | ------------------------ |
| Flow Control | jac.Flow.* |
| Folder Structure | jac.Folder.* |
| Properties | jac.Property.* |
| Secrets | jac.Secret.* |
| Deploy Descriptor | jac.deploy.* |

<br/>

#### **Job Types - Python**
| Category | Prefix  | 
| -----------    | ------------------------ |
| AWS | jac-Job-***AWS*** |
| Azure | jac-Job-***Azure*** |
| Command Job | jac-Job-***Command*** |
| Control-M Folders | jac-Job-***Folder*** |
| Database Jobs | jac-Job-***Database*** |
| File Transfer Jobs | jac-Job-***File*** |
| Hadoop Jobs | jac-Job-***Hadoop*** |
| Informatica | jac-Job-***Informatica*** |
| PeopleSoft | jac-Job-***PeopleSoft*** |
| Script Jobs | jac-Job-***Script*** |
| WebServices | jac-Job-***WebServices*** |

<br/>

#### **Job Types - JSON**
| Category | Prefix  | 
| -----------    | ------------------------ |
| AWS | jac.Job.***AWS***.* |
| Application Integrator | jac.Job.***Application.Integrator***.* |
| Azure | jac.Job.***Azure***.* |
| Boomi | jac.Job.***Boomi***.* |
| Command Job | jac.Job.***Command*** |
| Database Jobs | jac.Job.***Database***.* |
| Databricks | jac.Job.***Databricks***.* |
| File Transfer Jobs | jac.Job.***File***.* |
| Google | jac.Job.***Google***.* |
| Hadoop Jobs | jac.Job.***Hadoop***.* |
| Informatica | jac.Job.***Informatica***.* |
| Microsoft Power BI | jac.Job.***Microsoft***.* |
| PeopleSoft | jac.Job.***PeopleSoft***.* |
| REST | jac.Job.***WebServices***.* |
| SAP Jobs | jac.Job.***SAP***.* |
| Script Jobs | jac.Job.***Script***.* |
| SLA | jac.Job.***SLA***.* |
| UI Path | jac.Job.***UI.Path***.* |
| WebServices | jac.Job.***WebServices***.* |
| zOS | jac.Job.***zOS***.* |

<br/>

#### **Connection Profiles - Python**
| Category | Prefix  | 
| -----------    | ------------------------ |
| Apache | jac-Connection-Profile-***Apache***.* |
| AWS | jac-Connection-Profile-***AWS***.* |
| Azure | jac-Connection-Profile-***Azure***.* |
| Database | jac-Connection-Profile-***Database***.* |
| File Transfer | jac-Connection-Profile-***FileTransfer***.* |
| Hadoop | jac-Connection-Profile-***Hadoop***.* |
| Informatica | jac-Connection-Profile-***Informatica***.* |
| SAP | jac-Connection-Profile-***SAP***.* |
| WebServices | jac-Connection-Profile-***WebServices***.* |

<br/>

#### **Connection Profiles - JSON**
| Category | Prefix  | 
| -----------    | ------------------------ |
| Application Integrator | jac.Connection.Profile.***Application.Integrator***.* |
| Apache | jac.Connection.Profile.***Apache***.* |
| AWS | jac.Connection.Profile.***AWS***.* |
| Azure | jac.Connection.Profile.***Azure***.* |
| Boomi | jac.Connection.Profile.***Boomi***.* |
| Database | jac.Connection.Profile.***Database***.* |
| Databricks | jac.Connection.Profile.***Databricks***.* |
| File Transfer | jac.Connection.Profile.***FileTransfer***.* |
| Google | jac.Connection.Profile.***Google***.* |
| Hadoop | jac.Connection.Profile.***Hadoop***.* |
| Informatica | jac.Connection.Profile.***Informatica***.* |
| Microsoft Power BI | jac.Connection.Profile.***Microsoft***.* |
| PeopleSoft | jac.Connection.Profile.***PeopleSoft***.* |
| REST | jac.Connection.Profile.***WebServices***.* |
| SAP | jac.Connection.Profile.***SAP***.* |
| UI Path | jac.Connection.Profile.***UI.Path***.* |
| WebServices | jac.Connection.Profile.***WebServices***.* |

<br/>
<br/>

### **Menu Commands**

Under ***Control-M: Jobs-As-Code:***

| Category | Menu | Command  | 
| -----------    | ------------------------ | ------------------------ |
| Build Service | CTM: Build | ctm build ***definitionsFile*** |
| Build Service | CTM: Build Transform* | ctm build ***definitionsFile*** deployDescriptorFile |
| Run Service | CTM: Run | ctm run ***definitionsFile*** |
| Run Service | CTM: Run Transform* | ctm run ***definitionsFile***  deployDescriptorFile
| Deploy Service | CTM: Deploy | ctm deploy ***definitionsFile*** |
| Deploy Service | CTM: Deploy Transform | ctm deploy ***definitionsFile***  deployDescriptorFile

topic * on roadmap 

<br/>
<br/>

## License

Please see the [BMC License](https://raw.githubusercontent.com/controlm/ctm-vscode-extension/main/LICENSE) file for details on the project.
The licenses for this project do not grant you rights to use any BMC Software names, logos, or trademarks. BMC Software and any contributors reserve all other rights, whether under their respective copyrights, patents, or trademarks, whether by implication, estoppel or otherwise.

<br/>
<br/>

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us the rights to use your contribution.

This project has adopted the Open Source Code of Conduct. For more information see the Code of Conduct FAQ or contact orchestrator@bmc.com with any additional questions or comments.

<br/>
<br/>


## Release Notes

### 0.1.*

Initial Alpha Test Versions

### 0.3.*

Beta Test Versions

### 1.0.*
Initial release of the Control-M extension. The extension supports code snippets for Python and JSON Jobs-As-Code files.

