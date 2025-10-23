# Getting Started with Control-M Extension for VS Code

## Welcome to Control-M Next Generation

This guide will help you get started with the Control-M Extension for Visual Studio Code. Within minutes, you'll be managing Control-M workflows directly from your IDE.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Initial Setup](#initial-setup)
- [Your First Task](#your-first-task)
- [Next Steps](#next-steps)

---

## Prerequisites

Before installing the Control-M Extension, ensure you have:

### Required
- **Visual Studio Code** 1.105.0 or later
- **Control-M Enterprise Manager** with Automation API enabled
- **API Token** from your Control-M administrator

### Recommended Knowledge
- Basic understanding of Control-M concepts (jobs, folders, agents)
- Familiarity with JSON or Python for job definitions
- Access to your Control-M environment

---

## Installation

### From VS Code Marketplace

1. Open Visual Studio Code
2. Click the Extensions icon in the Activity Bar (or press `Cmd+Shift+X` / `Ctrl+Shift+X`)
3. Search for "Control-M"
4. Click **Install** on the "Control-M Next Generation" extension
5. Reload VS Code when prompted

### From VSIX File

If you have a `.vsix` file:

```bash
code --install-extension controlm-nxtgn-1.0.0.vsix
```

---

## Initial Setup

### Step 1: Open the Getting Started Walkthrough

After installation, you'll see the Control-M icon in your Activity Bar:

1. Click the **Control-M icon** (looks like a grid/network)
2. You'll see a **Getting Started** view
3. Click **Setup Connection (wizard)** to begin

### Step 2: Configure Your Connection

The setup wizard will guide you through:

#### 1. Enter Hostname
- Provide your Control-M Enterprise Manager hostname
- Example: `ctm-em.yourcompany.com`

#### 2. Enter Port
- Typically `8443` for HTTPS connections
- Check with your Control-M administrator if different

#### 3. Enter API Token
- Your API token is stored securely using VS Code's SecretStorage
- Never stored in plain text

**How to Get an API Token:**

If you have the Control-M CLI installed:
```bash
# Login to generate a token
ctm session login -e https://ctm-em.yourcompany.com:8443/automation-api

# View your current session
ctm session list
```

Contact your Control-M administrator if you need help obtaining a token.

#### 4. Test Connection
- Verify your connection works
- The extension will attempt to reach your Control-M environment

#### 5. Finish Setup
- Complete the walkthrough
- The Control-M views will now be available

---

## Your First Task

### Task 1: Browse Your Infrastructure

1. In the Control-M Activity Bar, click **Infrastructure**
2. Explore your Control-M environment:
   - **Datacenters** - Your Control-M/Server instances
   - **Agents** - All registered agents
   - **Host Groups** - Logical agent groupings
   - **Connection Profiles** - Configured connection profiles
   - **Calendars** - Available calendars

### Task 2: View Workload

1. Click the **Workload** view
2. Browse folders and jobs in your Control-M environment
3. Right-click on items to see available actions

### Task 3: Create Your First Job

1. Create a new JSON file in your workspace
2. Type `ctm-job-simple` and press `Tab`
3. A job template will be inserted
4. Modify the template with your details:

```json
{
  "Folder1": {
    "Type": "Folder",
    "ControlmServer": "ctm-prod",
    "Job1": {
      "Type": "Job:Command",
      "Command": "echo Hello from Control-M",
      "RunAs": "ctmuser"
    }
  }
}
```

### Task 4: Build and Validate

1. Right-click in your JSON file
2. Select **Control-M** → **Build**
3. The extension will validate your job definition
4. Check the output for any errors

---

## Next Steps

Now that you're set up, explore these features:

### Learn the Interface

- **Infrastructure View** - Manage servers, agents, and resources
- **Workload View** - View and export existing jobs and folders  
- **Data Services View** - Configure MFT (Managed File Transfer)
- **Actions View** - Quick access to common operations

### Explore Code Snippets

The extension includes pre-built snippets for:
- Job types (Command, Script, AWS ECS, Database, etc.)
- Connection profiles
- Python API code
- MFTE configurations

Type `ctm-` in a JSON or Python file to see available snippets.

### Read Detailed Documentation

- [**Features Guide**](FEATURES_GUIDE.md) - Complete feature reference
- [**REST API Reference**](REST_API_REFERENCE.md) - All API calls made by the extension
- [Production README](../README.md) - Overview and quick reference

### Configure Advanced Settings

Open VS Code Settings (`Cmd+,` or `Ctrl+,`) and search for "Control-M":

- **Folder Filter** - Filter which folders appear in Workload view
- **MFT Host Group** - Optimize MFT agent discovery
- **Debug Level** - Control logging verbosity
- **Pagination** - Adjust items per page in tree views

---

## Getting Help

### Documentation Resources
- [BMC Control-M Documentation](https://documents.bmc.com/products/Control-M)
- [Automation API Guide](https://documents.bmc.com/supportu/API/Monthly/en-US/Documentation/API_Intro.htm)
- [Jobs-as-Code Tutorial](https://www.bmc.com/blogs/control-m-automation-api/)

### Support Channels
- **BMC Support Central** - Official support portal
- **Control-M Community** - User forums and discussions
- **VS Code Extension Issues** - Report bugs or request features

### Troubleshooting

**Connection Issues:**
- Verify hostname and port are correct
- Check that Automation API is enabled on your Control-M/EM
- Ensure your API token is valid (tokens may expire)
- Verify network connectivity and firewall rules

**Authentication Errors:**
- Re-enter your API token using `Control-M: Set API Token`
- Check token permissions with your administrator

**Extension Not Loading:**
- Check VS Code version (must be 1.105.0+)
- Reload VS Code window: `Developer: Reload Window`
- Check the Output panel for Control-M logs

---

## Welcome Aboard!

You're now ready to use Control-M directly from Visual Studio Code. The extension brings powerful workflow automation capabilities to your favorite IDE, enabling modern DevOps practices for Control-M job development.

**Happy Automating!**

---

*For detailed feature documentation, see the [Features Guide](FEATURES_GUIDE.md)*
