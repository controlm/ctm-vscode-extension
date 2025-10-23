# Control-M Extension - Complete Features Guide

This guide provides detailed information about all features available in the Control-M Extension for Visual Studio Code.

## Table of Contents

- [Overview](#overview)
- [Infrastructure Management](#infrastructure-management)
- [Workload Management](#workload-management)
- [Data Services (MFT/MFTE)](#data-services-mftmfte)
- [Job Development](#job-development)
- [Code Snippets](#code-snippets)
- [Connection Management](#connection-management)
- [Configuration Options](#configuration-options)
- [Advanced Features](#advanced-features)

---

## Overview

The Control-M Extension brings enterprise workflow automation directly into Visual Studio Code, enabling you to:

- **Browse** Control-M infrastructure (servers, agents, resources)
- **Manage** jobs, folders, and configurations
- **Develop** new jobs using Jobs-as-Code methodology
- **Test** connection profiles and agents
- **Configure** MFT/MFTE data transfer services
- **Deploy** changes to Control-M environments

---

## Infrastructure Management

### Datacenters View

View all Control-M/Server instances in your environment.

**Features:**
- List all Control-M/Servers with version information
- View server status and health
- Expand servers to see agents, resources, and run-as credentials

**Actions:**
- Refresh datacenter list
- Copy server names to clipboard

### Agents Management

Manage Control-M Agents across your infrastructure.

**Agent Types:**
- **Managed Agents** - Full Control-M Agents with local scheduling
- **Agentless Hosts** - Remote execution targets without agent installation

**Features:**
- View agent status (Available, Unavailable, Disabled)
- See agent version and operating system
- View agent directory paths and Java home
- Browse agent parameters
- See host group memberships
- View run-as credentials (local and global)

**Available Actions:**

1. **Ping Agent** - Test connectivity to an agent
   - Sends a ping command to verify agent is responsive
   - Returns success message or error details
   - Timeout: 60 seconds with 30-second buffer

2. **Get MFT Configuration** - Retrieve Managed File Transfer settings
   - Shows if MFT is enabled on the agent
   - Displays FTS (File Transfer Server) configuration
   - Lists available SSL keystores and PGP templates

3. **Test Run As User** - Verify run-as credentials
   - Tests if a specific user account can execute on the agent
   - Validates permissions and authentication
   - Returns success/failure status

4. **Agent Analysis** - Comprehensive agent diagnostics
   - Detailed analysis of agent configuration
   - System resource information
   - Installed plugins and versions
   - Performance metrics

5. **Refresh Agent Data** - Reload agent information

### Host Groups

View and manage logical groupings of agents.

**Features:**
- List all host groups with member agents
- View application type and tags
- See agent count per group

**Available Actions:**

1. **Super Dupa Agent Ping Test (All Agents)** ⚡
   - Tests connectivity to all agents in the host group
   - Runs ping tests in parallel for speed
   - Provides comprehensive pass/fail summary
   - Timeout per agent: 60 seconds
   - Great for quick health checks

2. **Super Dupa Analysis (All Agents)** ⚡
   - Runs full diagnostic analysis on all agents in the group
   - Parallel execution for fast results
   - Comprehensive system and configuration details
   - Useful for audits and troubleshooting

### Remote Hosts

Manage agentless remote host definitions.

**Features:**
- List all defined remote hosts
- View host properties and configuration
- Test connectivity to agentless hosts

**Available Actions:**
- **Ping Remote Host** - Verify connectivity to agentless host

### Connection Profiles

Manage centralized connection profiles for various technologies.

**Supported Profile Types:**
- **File Transfer** - FTP, SFTP, FTPS, AS2, etc.
- **Database** - Oracle, SQL Server, PostgreSQL, MySQL, DB2, etc.
- **AWS** - S3, EC2, ECS, Lambda, etc.
- **Azure** - Blob Storage, SQL, etc.
- **Hadoop** - HDFS, Hive, Spark, etc.
- **Application Integrator** - SAP, PeopleSoft, Informatica, etc.
- And many more...

**Features:**
- Browse profiles by type and subtype
- View profile details and configuration
- Test connections to verify functionality

**Available Actions:**

1. **Test Connection Profile** - Verify profile connectivity
   - Requires selecting a server and agent
   - Tests actual connection using profile settings
   - Returns success message or error details
   - Timeout: 90 seconds

2. **Super Dupa CCP Test (All Servers & Agents)** ⚡
   - Comprehensive connection profile testing
   - Tests profile across all available servers and agents
   - Runs tests in parallel for fast results
   - Provides detailed pass/fail summary
   - Useful for validating profile configuration across environment

### Calendars

Manage Control-M calendar definitions.

**Calendar Types:**
- **Regular Calendars** - Standard date-based calendars
- **Periodic Calendars** - Interval-based schedules
- **Rule-Based Calendars** - Complex scheduling rules

**Features:**
- Browse calendars by type
- View calendar aliases and servers
- Export calendar definitions

**Available Actions:**
- **Get Calendar Details** - View complete calendar definition
- Export to JSON file for version control

### Workload Policies

View active and inactive workload policies.

**Features:**
- List all workload policies with status
- View policy descriptions and update history
- See policy order numbers

### Site Standards

Manage Control-M Site Standards and policies.

**Features:**
- View all defined site standards
- See business parameters and rule counts
- View associated policies and their scope
- Check which servers and folders are affected

### Secrets

View registered Control-M secrets for secure credential management.

**Features:**
- List all defined secrets
- Copy secret names for use in job definitions

### Resources

Monitor Control-M resources (quantitative and semaphore).

**Features:**
- View available vs. maximum resource counts
- See associated workload policies
- Monitor resource utilization

---

## Workload Management

### Folders View

Browse and manage Control-M folders and jobs.

**Features:**
- Filter folders using wildcards (e.g., `PROD*`)
- Browse folder hierarchy
- View subfolder structure
- See jobs within folders
- Pagination support for large folder lists

**Available Actions:**

1. **Export Folder** - Save folder definition to JSON
   - Exports complete folder with all jobs
   - Saves to local file system
   - Ready for version control

2. **Refresh Folder** - Reload folder contents
   - Updates job list
   - Refreshes folder metadata

3. **Save Job** - Export individual job definition
   - Saves job as JSON file
   - Includes all job properties

4. **Save Subfolder** - Export subfolder definition
   - Saves subfolder with its jobs

5. **Save Script** - Extract embedded scripts
   - For jobs with embedded scripts
   - Saves script to separate file

### Job Analysis

When viewing jobs, you can see:
- Job type and details
- Host/agent assignments (single agent or host group)
- Run-as credentials
- Connection profiles used
- Embedded scripts (if applicable)

**For Host Groups in Jobs:**
- Expand to see all member agents
- Ping individual agents
- Test agent connectivity
- View MFT configuration per agent

**For Connection Profiles in Jobs:**
- Test profile connectivity
- View profile configuration

---

## Data Services (MFT/MFTE)

The Data Services view provides comprehensive management of Managed File Transfer capabilities.

### MFT (Managed File Transfer)

Manage agent-level file transfer capabilities.

**Features:**
- Browse MFT-enabled agents
- View FTS (File Transfer Server) configuration
- Manage SSL keystores
- Handle PGP/GPG key management

**SSL Keystore Management:**

**Available Actions:**
1. **Get Keystore Details** - View SSL certificates
   - Lists all certificates in keystore
   - Shows certificate validity periods
   - Displays certificate subjects and issuers

2. **Show Keystore Metadata** - View keystore properties
   - Keystore type and location
   - Last modified date
   - Certificate count

**GPG/PGP Key Management:**

**Available Actions:**
1. **List GPG Keys** - View installed PGP keys
   - Shows public and private keys
   - Displays key IDs and fingerprints
   - Lists user IDs associated with keys

2. **Import GPG Keys** - Add new PGP keys
   - Import public keys for encryption
   - Import private keys for decryption
   - Supports ASCII-armored format

**Configuration:**
- Set custom run-as users for GPG operations (Linux/Windows)
- Configure GPG command syntax
- Set keystore run-as users

### MFTE (Managed File Transfer Enterprise)

Enterprise-level file transfer hub management.

**Site Architecture:**
- **Hub** - Central MFTE server with SSL keystore
- **Gateways** - Connection points for external transfers
- **Processing Rules** - Automated file processing workflows
- **Users** - External user accounts for file transfers
- **Groups** - User groups for permission management
- **Virtual Folders** - Logical folder structures

#### Site Settings Management

**Features:**
- View all MFTE site settings
- Export settings to JSON
- Monitor site configuration

**Available Actions:**
- **Save Settings** - Export site settings to file

#### Hub Management

**Features:**
- View hub configuration and status
- Manage hub SSL keystore
- Monitor hub health

**Available Actions:**
- **Get Keystore Details** - View hub certificates
- **Show Keystore Metadata** - View keystore properties

#### Processing Rules

Automated workflows for incoming/outgoing files.

**Features:**
- View all processing rules
- See rule status (Enabled/Disabled)
- Browse rule configuration
- View folder variable mappings

**Available Actions:**

1. **Save Rule** - Export rule definition
   - Saves complete rule to JSON file

2. **Enable Rule** - Activate a processing rule
   - Starts rule processing

3. **Disable Rule** - Deactivate a processing rule
   - Stops rule processing temporarily

4. **Copy Variables** - Export folder variables
   - Generates JSON with variable mappings
   - Maps folder variables to MFTE variables (e.g., `ZZM_FILE_PATH` → `$$FILE_PATH$$`)
   - Configurable variable prefix (default: `ZZM_`)

#### User Management

**Features:**
- Browse external users
- View user status (Active/Locked)
- See user groups and permissions
- Monitor user access levels

**Available Actions:**

1. **Lock User** - Disable user account
   - Prevents user from logging in
   - Maintains user configuration

2. **Unlock User** - Re-enable user account
   - Restores user access

#### Group Management

**Features:**
- View all user groups
- See group members
- Browse group permissions

#### Virtual Folders

**Features:**
- Browse virtual folder structure
- View folder permissions
- See user/group access levels

#### MFTE Configuration

**Settings:**
- **Variable Mappings** - Define available MFTE variables for auto-mapping
- **Variable Prefix** - Set prefix for folder variable matching (default: `ZZM_`)

**Creating MFTE Objects:**

The extension provides commands to create MFTE objects from JSON files:

1. **Create User** - Define new external user
2. **Create Group** - Define new user group
3. **Create Virtual Folder** - Define new virtual folder
4. **Create Rule** - Define new processing rule
5. **Onboard User** - Complete user onboarding workflow (see below)

#### MFTE User Onboarding

The **Onboard User** feature provides an automated workflow to set up new MFTE users with all required components in a single operation.

**What It Does:**

The onboarding process automatically:
1. Creates a virtual folder for the user
2. Creates the external user account
3. Creates or updates a user group
4. Assigns appropriate permissions
5. Sets up fixed subfolders (incoming/outgoing)

**How to Use:**

1. **Create an onboarding configuration JSON file** using the template:
   - Template location: `samples/mfte.user.onboarding.template.json`
   - Customize user, virtual folder, and group settings

2. **Right-click on the JSON file** in VS Code

3. **Select** `Control-M` → `Data Services (MFTE)` → `Onboard User`

4. **Select the MFTE site** from the dropdown

5. **Confirm the onboarding operation**

6. **Monitor progress** - The extension will:
   - Create virtual folder
   - Create or check user existence
   - Create or update group
   - Assign user to virtual folder and group

**Onboarding Configuration Template:**

```json
{
  "user": {
    "name": "external_user_01",
    "email": "user@company.com",
    "company": "CompanyName",
    "phoneNumber": "555-1234",
    "description": "User onboarded via VS Code extension",
    "password": "GENERATE_PASSWORD",
    "changePasswordAtNextLogin": true,
    "passwordNeverExpires": false
  },
  "virtualFolder": {
    "name": "external_user_01",
    "authorizedInternalUsers": ["*"],
    "deleteFilesAfterDownload": true,
    "deleteFilesAfterDownloadByExternalUsers": true,
    "notifyByEmailWhenFileArrive": true,
    "accessLevel": "Full control",
    "retentionPolicy": 10,
    "sizeLimit": 100,
    "allowedFilePattern": "",
    "blockedFilePattern": "",
    "fixedSubFolders": [
      {
        "name": "incoming",
        "accessLevel": "Full control",
        "operation": "",
        "originalName": ""
      },
      {
        "name": "outgoing",
        "accessLevel": "Read only",
        "operation": "",
        "originalName": ""
      }
    ]
  },
  "group": {
    "name": "CompanyName",
    "createIfNotExists": true
  },
  "accessLevel": "Full control"
}
```

**Configuration Fields:**

**User Section:**
- `name` (required) - External user login name
- `email` - User's email address
- `company` - Company name (used for group if not specified)
- `phoneNumber` - Contact phone number
- `description` - User description
- `password` - Use "GENERATE_PASSWORD" to auto-generate
- `changePasswordAtNextLogin` - Force password change on first login
- `passwordNeverExpires` - Disable password expiration

**Virtual Folder Section:**
- `name` - Virtual folder name (defaults to username if not specified)
- `authorizedInternalUsers` - Internal users who can access folder
- `deleteFilesAfterDownload` - Auto-delete after internal users download
- `deleteFilesAfterDownloadByExternalUsers` - Auto-delete after external users download
- `notifyByEmailWhenFileArrive` - Send email notifications
- `accessLevel` - Default access level
- `retentionPolicy` - Days to retain files
- `sizeLimit` - Max folder size (MB)
- `allowedFilePattern` - Regex pattern for allowed files
- `blockedFilePattern` - Regex pattern for blocked files
- `fixedSubFolders` - Predefined subfolders (incoming/outgoing typical)

**Group Section:**
- `name` - User group name (defaults to company name if not specified)
- `createIfNotExists` - Create group if it doesn't exist

**Root Level:**
- `accessLevel` - Permission level: "Read only", "Read and write", "Full control"

**Best Practices:**

1. **Use descriptive user names** - Include company prefix or identifier
2. **Generate passwords** - Use "GENERATE_PASSWORD" for security
3. **Set retention policies** - Configure based on data requirements
4. **Configure fixed subfolders** - Separate incoming/outgoing for clarity
5. **Review permissions** - Verify access levels before onboarding
6. **Test first** - Try onboarding in test environment first

**Example Workflow:**

```
1. Copy template: samples/mfte.user.onboarding.template.json
2. Create: onboarding-newclient.json
3. Update user information:
   - name: "newclient_user01"
   - company: "NewClient"
   - email: "user01@newclient.com"
4. Right-click file → Control-M → Data Services → Onboard User
5. Select MFTE site
6. Confirm onboarding
7. Verify user, group, and virtual folder created
```

**Notes:**

- The onboarding process is transactional - if any step fails, previous steps are not rolled back
- Passwords are automatically generated if "GENERATE_PASSWORD" is specified
- Users are prompted if the user already exists (update or skip)
- Groups are created automatically if they don't exist and `createIfNotExists` is true
- Virtual folder structure matches standard MFTE conventions

---

## Job Development

### Build Service

Validate job definitions before deployment.

**Features:**
- Syntax validation for JSON job definitions
- Semantic checking for job properties
- Error reporting with line numbers

**Usage:**
1. Open a JSON file with job definitions
2. Right-click in editor
3. Select **Control-M** → **Build**
4. View results in output panel

**What Gets Validated:**
- JSON syntax
- Job type validity
- Required properties
- Property value ranges
- Connection profile references
- Calendar references

### Run Service

Execute jobs directly from VS Code.

**Features:**
- Run job definitions without deploying
- Track job execution status
- Retrieve job output

**Usage:**
1. Open a JSON file with job definitions
2. Right-click in editor
3. Select **Control-M** → **Run** → **Run Folder**
4. Monitor execution in output panel

**Available Actions:**
- **Run Folder** - Execute all jobs in definition
- **Get Output** - Retrieve job execution logs

### Deploy Service

Deploy job definitions to Control-M.

**Features:**
- Deploy jobs to specific Control-M/Server
- Deploy with deployment descriptor for advanced options
- Automatic folder creation

**Usage:**
1. Open a JSON file with job definitions
2. Right-click in editor
3. Select **Control-M** → **Deploy** → **Deploy Content**
4. Confirm deployment

**Deploy Options:**
- **Deploy Content** - Standard deployment
- **Deploy with Descriptor** - Advanced deployment with descriptor file

---

## Code Snippets

The extension includes comprehensive code snippets for rapid development.

### JSON Snippets

Type these prefixes in JSON files and press Tab:

**Basic Jobs:**
- `ctm-job-simple` - Basic command job
- `ctm-job-script` - Script job template
- `ctm-job-embedded-script` - Job with embedded script

**AWS Jobs:**
- `ctm-job-aws-ecs` - AWS ECS container job
- `ctm-job-aws-lambda` - AWS Lambda function job
- `ctm-job-aws-batch` - AWS Batch job
- `ctm-connection-aws` - AWS connection profile

**Database Jobs:**
- `ctm-job-database` - Database job template
- `ctm-connection-oracle` - Oracle connection profile
- `ctm-connection-sqlserver` - SQL Server connection profile
- `ctm-connection-postgres` - PostgreSQL connection profile

**File Transfer:**
- `ctm-connection-sftp` - SFTP connection profile
- `ctm-connection-ftps` - FTPS connection profile

**MFTE:**
- `ctm-mfte-rule` - MFTE processing rule
- `ctm-mfte-user` - MFTE external user
- `ctm-mfte-group` - MFTE user group
- `ctm-mfte-virtualfolder` - MFTE virtual folder

### Python Snippets

Type these prefixes in Python files and press Tab:

**Basic Structure:**
- `ctm-python-imports` - Import statements for Control-M API
- `ctm-python-connection` - Connection setup code
- `ctm-python-job-simple` - Simple job creation

**Job Operations:**
- `ctm-python-job-build` - Build job definition
- `ctm-python-job-run` - Run job
- `ctm-python-job-deploy` - Deploy job

**AWS ECS:**
- `ctm-python-aws-ecs` - AWS ECS job in Python

---

## Connection Management

### Connection Settings

Configure your Control-M environment connection.

**Settings Location:**
- VS Code Settings (`Cmd+,` or `Ctrl+,`)
- Search for "Control-M"

**Required Settings:**
- **Hostname** - Control-M Enterprise Manager hostname
- **Port** - Automation API port (typically 8443)
- **Use HTTPS** - Enable secure connections (recommended)
- **API Token** - Stored securely in VS Code SecretStorage

### Multiple Environments

While the extension connects to one environment at a time, you can:
- Save different workspace settings
- Switch between environments by changing settings
- Use workspace-specific configurations

### Token Management

**Security:**
- Tokens are stored in VS Code's SecretStorage
- Never stored in plain text
- Automatically used for all API calls

**Token Commands:**
- `Control-M: Set API Token` - Update token
- `Control-M: Test Connection` - Verify token validity

---

## Configuration Options

### General Settings

**Debug Level** (`control-m.debug.level`)
- Options: `off`, `error`, `warn`, `info`, `debug`
- Default: `info`
- Controls log verbosity

**Enable Debug Logging** (`control-m.enableDebugLogging`)
- Type: Boolean
- Default: `false`
- Verbose logging for infrastructure tree creation

### Workload Settings

**Folder Filter** (`control-m.workload.folderFilter`)
- Type: String
- Default: `*`
- Filter pattern for folder discovery
- Examples: `PROD*`, `TEST_*`, `DEV_*`

### UI Settings

**Pagination Page Size** (`control-m.pagination.pageSize`)
- Type: Number
- Default: 25
- Range: 10-100
- Items per page in tree views

### MFT Settings

**MFT Host Group** (`control-m.mft.hostgroup`)
- Type: String
- Default: (empty)
- If specified, only loads agents from this host group
- Improves performance for large environments

**GPG Settings:**
- `control-m.mft.gpg.runAs.linux` - Run-as user for Linux GPG operations
- `control-m.mft.gpg.runAs.windows` - Run-as user for Windows GPG operations
- `control-m.mft.gpg.command` - Custom GPG command
  - Default: `gpg --list-keys --keyid-format LONG`

**Keystore Settings:**
- `control-m.mft.keystore.runAs.linux` - Run-as user for Linux keystore operations
- `control-m.mft.keystore.runAs.windows` - Run-as user for Windows keystore operations

### MFTE Settings

**Variable Mappings** (`control-m.mfte.variableMappings`)
- Type: Array of strings
- Default: `FILE_PATH`, `FILE_ABS_PATH`, `FILE_DIR`, etc.
- Available MFTE variables for auto-mapping
- Add custom variables as needed

**Variable Prefix** (`control-m.mfte.variablePrefix`)
- Type: String
- Default: `ZZM_`
- Prefix for matching folder variables to MFTE variables
- Example: `ZZM_FILE_PATH` maps to `$$FILE_PATH$$`

### Telemetry Settings

**Telemetry Enabled** (`control-m.telemetry.enabled`)
- Type: Boolean
- Default: `true`
- Respects global VS Code telemetry settings
- Used for product improvement and license compliance

---

## Advanced Features

### Context Actions

Right-click on items in tree views for context-specific actions:

**Infrastructure:**
- Copy node IDs to clipboard
- Export infrastructure to JSON
- Test connections and credentials

**Workload:**
- Export jobs and folders
- Save embedded scripts
- Test associated resources

**Data Services:**
- Manage users and permissions
- Enable/disable processing rules
- Export configurations

### Command Palette

Access all extension commands via Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`):

Type "Control-M" to see all available commands:
- Configuration commands
- Setup wizard
- View management
- Testing utilities

### Keyboard Shortcuts

The extension respects VS Code keyboard shortcuts:
- `Cmd+Shift+P` / `Ctrl+Shift+P` - Command Palette
- `Cmd+,` / `Ctrl+,` - Settings
- Right-click for context menus

### Logging and Diagnostics

**View Logs:**
1. Open Output panel (`Cmd+Shift+U` or `Ctrl+Shift+U`)
2. Select "Control-M" from dropdown
3. View extension activity and errors

**Enable Detailed Logging:**
1. Set `control-m.debug.level` to `debug`
2. Enable `control-m.enableDebugLogging` for tree creation details
3. Reload VS Code window

### Performance Optimization

**For Large Environments:**

1. **Use Folder Filters**
   - Set `control-m.workload.folderFilter` to limit scope
   - Example: `PROD_*` for production folders only

2. **Configure MFT Host Group**
   - Set `control-m.mft.hostgroup` to specific host group
   - Reduces agent scanning time

3. **Adjust Pagination**
   - Increase `control-m.pagination.pageSize` for faster browsing
   - Decrease for better performance on slower systems

4. **Lazy Loading**
   - Agents, host groups, and remote hosts are lazy-loaded
   - Expand only needed sections

### Integration with Git

**Version Control Best Practices:**

1. **Store job definitions** in Git repositories
2. **Export folders** to JSON files for version control
3. **Track connection profiles** and configurations
4. **Use branches** for different environments
5. **Review changes** before deployment

**Recommended Structure:**
```
project/
├── jobs/
│   ├── production/
│   ├── test/
│   └── development/
├── connection-profiles/
├── calendars/
└── site-standards/
```

### Workflow Automation

**CI/CD Integration:**

The extension enables modern DevOps practices:

1. **Develop** jobs in VS Code
2. **Validate** with Build service
3. **Test** with Run service
4. **Commit** to Git repository
5. **Deploy** via CI/CD pipeline
6. **Monitor** in Control-M

**Example Workflow:**
```bash
# Validate job definition
code --command control-m.json.build my-job.json

# Deploy to test environment
code --command control-m.json.deploy my-job.json

# Run and verify
code --command control-m.json.run my-job.json
```

---

## Summary

The Control-M Extension for VS Code provides comprehensive capabilities for:

- **Infrastructure Management** - Complete visibility and control
- **Job Development** - Modern IDE-based workflow creation
- **Testing & Validation** - Verify before deployment
- **Data Services** - Advanced file transfer management
- **DevOps Integration** - Git and CI/CD ready

For additional help, see:
- [Getting Started Guide](GETTING_STARTED.md) - Initial setup and first steps
- [REST API Reference](REST_API_REFERENCE.md) - Technical API documentation
- [Production README](../README.md) - Quick reference

---

*Documentation Version 1.0.0*
