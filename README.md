# Control-M Extension for VS Code

**Orchestrate the Impossible™**

Integrate BMC Control-M workflows with Visual Studio Code. Write, manage, and deploy Control-M jobs using modern development practices.

![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen) ![License](https://img.shields.io/badge/License-Apache%202.0-blue) ![Publisher](https://img.shields.io/badge/Publisher-BMC%20Software-blue) ![](https://img.shields.io/badge/dynamic/json.svg?label=Build%20State&url=https://raw.githubusercontent.com/controlm/ctm-vscode-extension/refs/heads/main/info.json&query=build&colorB=red)

## Overview

The Control-M Extension brings enterprise workflow automation capabilities directly into VS Code. Build, test, and deploy Control-M jobs using Jobs-as-Code with full IDE support.

**Key Features:**
- 🌳 **Visual Infrastructure Browser** - Browse Control-M/Servers, Agents, and Host Groups
- 📋 **Job Management** - Create and manage Control-M jobs from VS Code
- 🔌 **Connection Profiles** - Manage multiple Control-M environments
- 📝 **Code Snippets** - Pre-built templates for jobs and configurations
- 🔄 **Jobs-as-Code** - Define workflows in JSON or Python
- 📊 **Telemetry** - Usage tracking for license compliance (required)

## Quick Start

### 1. Installation

Install from VS Code Marketplace:
```
ext install controlm-nxtgn
```

Or install manually:
```bash
code --install-extension controlm-nxtgn-1.0.0.vsix
```

### 2. Configure Connection

1. Open VS Code Settings (`Cmd+,` or `Ctrl+,`)
2. Search for "Control-M"
3. Configure:
   - **Control-M URL**: Your Automation API endpoint (e.g., `https://ctm.example.com:8443/automation-api`)
   - **API Token**: Your Control-M API token (stored securely)

Or use `.ctm_connection.json` in your workspace:
```json
{
  "endpoint": "https://ctm.example.com:8443/automation-api",
  "token": "your-api-token"
}
```

**Getting an API Token:**
```bash
# Login to get token
https://ctm.example.com:8443/
```

### 3. Start Using

1. Open Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Type "Control-M" to see available commands
3. Try "Control-M: Show Infrastructure" to browse your environment

## Features in Detail

### Infrastructure Browser

View your Control-M environment structure:
- **Control-M/Servers** - All registered servers
- **Agents** - Agents by server with status indicators
- **Host Groups** - Logical agent groupings

**Usage:**
1. Click Control-M icon in Activity Bar
2. Expand servers to see agents
3. Right-click items for context actions

### Job Management

Create and manage jobs using modern development practices:
- **JSON Jobs** - Define jobs in JSON format
- **Python Jobs** - Use Python API for complex workflows
- **Snippets** - Quick templates for common job types

**Supported Job Types:**
- Command jobs
- Script jobs
- Application Integrator jobs
- AWS ECS jobs
- And more...

### Code Snippets

Type `ctm-` in JSON or Python files to see available snippets:
- `ctm-job-simple` - Basic job template
- `ctm-job-aws-ecs` - AWS ECS job
- `ctm-connection-profile` - Connection profile
- `ctm-python-job` - Python API job

### Settings

Configure the extension behavior:

| Setting | Description | Default |
|---------|-------------|---------|
| `controlm.endpoint` | Automation API URL | (none) |
| `controlm.token` | API authentication token | (none) |

## Documentation

Comprehensive documentation is available to help you get the most out of the Control-M Extension:

### 📚 [Getting Started Guide](docs/GETTING_STARTED.md)
Complete guide for new users:
- Installation and setup instructions
- Initial configuration walkthrough
- Your first tasks with the extension
- Troubleshooting common issues

### 📖 [Features Guide](docs/FEATURES_GUIDE.md)
Detailed reference for all extension capabilities:
- Infrastructure Management (Datacenters, Agents, Host Groups, etc.)
- Workload Management (Folders, Jobs, Export functionality)
- Data Services (MFT/MFTE configuration and management)
- Job Development (Build, Run, Deploy services)
- Code Snippets and templates
- Configuration options and advanced features

### 🔧 [REST API Reference](docs/REST_API_REFERENCE.md)
Technical documentation for developers:
- Complete list of Control-M Automation API endpoints used
- Request/response formats and examples
- Authentication and security details
- Performance considerations and best practices

### 📝 [Snippets Guide](docs/SNIPPETS_GUIDE.md)
Complete reference for all 200+ code snippets:
- Job type snippets for all Control-M job types
- Connection profile snippets for all platforms
- MFTE configuration snippets
- Python API snippets
- Usage examples and best practices


