# Control-M Extension - REST API Reference

This document lists all Control-M Automation API REST calls made by the extension, organized by service category. Each API call includes a link to the official BMC documentation.

## Table of Contents

- [About This Reference](#about-this-reference)
- [Build Service](#build-service)
- [Run Service](#run-service)
- [Deploy Service](#deploy-service)
- [Config Service](#config-service)
- [Internal APIs](#internal-apis)
- [Authentication](#authentication)

---

## About This Reference

The Control-M Extension uses the Control-M Automation API to communicate with your Control-M environment. All API calls are made using token-based authentication via the `x-api-key` header.

**Base URL Format:**
```
https://{hostname}:{port}/automation-api/
```

**Official Documentation:**
- [Control-M Automation API Documentation](https://documents.bmc.com/supportu/API/Monthly/en-US/Documentation/API_Intro.htm)
- [API Services Overview](https://documents.bmc.com/supportu/API/Monthly/en-US/Documentation/API_Services_Main.htm)

---

## Build Service

The Build Service compiles and validates job definitions.

**Service Documentation:** [Build Service](https://documents.bmc.com/supportu/API/Monthly/en-US/Documentation/API_Services_BuildService.htm)

### Build Job Definitions

**Endpoint:** `POST /automation-api/build`

**Description:** Validates job, folder, or calendar definitions for syntax and semantic correctness.

**Used By:**
- Job validation (right-click → Build)
- Pre-deployment checks

**Request Format:** `multipart/form-data` with field `definitionsFile`

**Implementation:**
```typescript
// AutomationApiClient.buildDefinitionsFile()
POST /automation-api/build
Content-Type: multipart/form-data
x-api-key: {token}
```

---

## Run Service

The Run Service executes jobs and tracks their status.

**Service Documentation:** [Run Service](https://documents.bmc.com/supportu/API/Monthly/en-US/Documentation/API_Services_RunService.htm)

### Run Job Definitions

**Endpoint:** `POST /automation-api/run`

**Description:** Executes job definitions without deploying them to Control-M.

**Used By:**
- Run folder command (right-click → Run → Run Folder)
- Quick job testing

**Request Format:** `multipart/form-data` with field `jobDefinitionsFile`

**Implementation:**
```typescript
// AutomationApiClient.runDefinitionsFile()
POST /automation-api/run
Content-Type: multipart/form-data
x-api-key: {token}
```

### Get Run Status

**Endpoint:** `GET /automation-api/run/status/{runId}?startIndex=0`

**Description:** Retrieves the status of a running or completed job execution.

**Used By:**
- Monitoring job execution
- Tracking run progress

**Implementation:**
```typescript
// AutomationApiClient.getRunStatus()
GET /automation-api/run/status/{runId}?startIndex=0
x-api-key: {token}
```

### Get Job Output

**Endpoint:** `GET /automation-api/run/job/{jobId}/output?runNo={runNo}`

**Description:** Retrieves the output logs from a job execution.

**Used By:**
- Get Output command (right-click → Run → Get Output)
- Viewing job execution results

**Implementation:**
```typescript
// AutomationApiClient.getJobOutput()
GET /automation-api/run/job/{jobId}/output?runNo={runNo}
x-api-key: {token}
```

### Get Resources

**Endpoint:** `GET /automation-api/run/resources?server={serverName}`

**Description:** Retrieves the current status of Control-M resources (quantitative and semaphore).

**Used By:**
- Infrastructure view - Resources node
- Resource monitoring

**Implementation:**
```typescript
// InfrastructureService.fetchResources()
GET /automation-api/run/resources?server={serverName}
x-api-key: {token}
```

### Get Workload Policies

**Endpoint:** `GET /automation-api/run/workloadpolicies?state={state}`

**Description:** Retrieves workload policies filtered by state (Active or Inactive).

**Used By:**
- Infrastructure view - Workload Policies node
- Policy management

**States:** `Active`, `Inactive`

**Implementation:**
```typescript
// InfrastructureService.fetchWorkloadPolicies()
GET /automation-api/run/workloadpolicies?state=Active
GET /automation-api/run/workloadpolicies?state=Inactive
x-api-key: {token}
```

---

## Deploy Service

The Deploy Service transfers definitions to Control-M.

**Service Documentation:** [Deploy Service](https://documents.bmc.com/supportu/API/Monthly/en-US/Documentation/API_Services_DeployService.htm)

### Deploy Job Definitions

**Endpoint:** `POST /automation-api/deploy`

**Description:** Deploys job definitions to Control-M servers.

**Used By:**
- Deploy Content command (right-click → Deploy → Deploy Content)
- Deploy with Descriptor command

**Note:** Implementation details handled by VS Code commands, not directly exposed in services.

### Get Calendars

**Endpoint:** `GET /automation-api/deploy/calendars?type={type}`

**Description:** Retrieves calendar definitions by type.

**Used By:**
- Infrastructure view - Calendars node
- Calendar management

**Types:** `Regular`, `Periodic`, `RuleBasedCalendar`

**Implementation:**
```typescript
// InfrastructureService.fetchCalendars()
GET /automation-api/deploy/calendars?type=Regular
GET /automation-api/deploy/calendars?type=Periodic
GET /automation-api/deploy/calendars?type=RuleBasedCalendar
x-api-key: {token}
```

### Get Calendar Details

**Endpoint:** `GET /automation-api/deploy/calendars?name={name}&server={server}&type={type}`

**Description:** Retrieves detailed calendar definition.

**Used By:**
- Get Calendar Details action (Infrastructure → Calendars → right-click calendar)

**Implementation:**
```typescript
// InfrastructureService.getCalendarDetails()
GET /automation-api/deploy/calendars?name={calendarName}&server={server}&type={type}
x-api-key: {token}
```

### Get Connection Profiles

**Endpoint:** `GET /automation-api/deploy/connectionprofiles/centralized?type={type}&name={name}`

**Description:** Retrieves centralized connection profiles.

**Used By:**
- Infrastructure view - Connection Profiles node
- Connection profile management

**Wildcards:** `type=*&name=*` to retrieve all profiles

**Implementation:**
```typescript
// InfrastructureService.fetchConnectionProfiles()
GET /automation-api/deploy/connectionprofiles/centralized?type=*&name=*
x-api-key: {token}
```

### Get Connection Profile Details

**Endpoint:** `GET /automation-api/deploy/connectionprofiles/centralized?type={type}&name={name}`

**Description:** Retrieves specific connection profile details.

**Used By:**
- Viewing connection profile configuration

**Implementation:**
```typescript
// InfrastructureService.getConnectionProfileDetails()
GET /automation-api/deploy/connectionprofiles/centralized?type={profileType}&name={profileName}
x-api-key: {token}
```

### Test Connection Profile

**Endpoint:** `POST /automation-api/deploy/connectionprofile/centralized/test/{type}/{name}/{server}/{agent}`

**Description:** Tests a connection profile to verify connectivity.

**Used By:**
- Test Connection Profile action
- Connection validation

**Implementation:**
```typescript
// InfrastructureService.testConnectionProfile()
POST /automation-api/deploy/connectionprofile/centralized/test/{profileType}/{profileName}/{serverName}/{agentId}
x-api-key: {token}
```

### Get Local Connection Profiles

**Endpoint:** `GET /automation-api/deploy/connectionprofiles?ctm={ctm}&server={server}&agent={agent}&type=FileTransfer`

**Description:** Retrieves agent-local connection profiles.

**Used By:**
- MFT view - Local connection profiles

**Implementation:**
```typescript
// InfrastructureService.getLocalConnectionProfiles()
GET /automation-api/deploy/connectionprofiles?ctm={ctm}&server={server}&agent={agent}&type=FileTransfer
x-api-key: {token}
```

### Get Folders

**Endpoint:** `GET /automation-api/deploy/folders?folder={filter}&server={server}&folderType=Folder`

**Description:** Retrieves folder names matching a filter pattern.

**Used By:**
- Workload view - Folders node
- Folder browsing

**Implementation:**
```typescript
// InfrastructureService.getFolders()
GET /automation-api/deploy/folders?folder={folderFilter}&server={serverName}&folderType=Folder
x-api-key: {token}
```

### Get Jobs for Folder

**Endpoint:** `GET /automation-api/deploy/jobs?format=json&folder={folder}&server={server}`

**Description:** Retrieves all jobs within a specific folder.

**Used By:**
- Workload view - Job browsing
- Folder export

**Implementation:**
```typescript
// InfrastructureService.getJobsForFolder()
GET /automation-api/deploy/jobs?format=json&folder={folderName}&server={serverName}
x-api-key: {token}
```

### Get Site Standards

**Endpoint:** `GET /automation-api/deploy/sitestandards`

**Description:** Retrieves all site standard definitions.

**Used By:**
- Infrastructure view - Site Standards node

**Implementation:**
```typescript
// InfrastructureService.fetchSiteStandards()
GET /automation-api/deploy/sitestandards
x-api-key: {token}
```

### Get Site Standard Policies

**Endpoint:** `GET /automation-api/deploy/sitestandardpolicies`

**Description:** Retrieves site standard policy assignments.

**Used By:**
- Infrastructure view - Site Standards with policy information

**Implementation:**
```typescript
// InfrastructureService.fetchSiteStandards()
GET /automation-api/deploy/sitestandardpolicies
x-api-key: {token}
```

---

## Config Service

The Config Service manages configuration definitions in your Control-M environment.

**Service Documentation:** [Config Service](https://documents.bmc.com/supportu/API/Monthly/en-US/Documentation/API_Services_ConfigService_Main.htm)

### Get Servers

**Endpoint:** `GET /automation-api/config/servers`

**Description:** Retrieves list of Control-M/Servers with metadata.

**Used By:**
- Infrastructure view - Datacenters node
- Environment discovery

**Implementation:**
```typescript
// InfrastructureService.collectSnapshot()
GET /automation-api/config/servers
x-api-key: {token}
```

### Get System Settings

**Endpoint:** `GET /automation-api/config/systemsettings`

**Description:** Retrieves Control-M system settings including version information.

**Used By:**
- Environment summary
- Version detection

**Implementation:**
```typescript
// InfrastructureService.buildEnvironmentSummary()
GET /automation-api/config/systemsettings
x-api-key: {token}
```

### Get Agents

**Endpoint:** `GET /automation-api/config/server/{serverName}/agents`

**Description:** Lists all agents registered to a Control-M/Server.

**Used By:**
- Infrastructure view - Agents node (lazy-loaded)
- Agent discovery

**Implementation:**
```typescript
// InfrastructureService.fetchAgents()
GET /automation-api/config/server/{serverName}/agents
x-api-key: {token}
```

### Get Agent Info

**Endpoint:** `GET /automation-api/config/server/{serverName}/agents?agent={agentId}`

**Description:** Retrieves detailed information about a specific agent.

**Used By:**
- Agent type detection
- Agent metadata

**Implementation:**
```typescript
// InfrastructureService.getAgentInfo()
GET /automation-api/config/server/{serverName}/agents?agent={agentId}
x-api-key: {token}
```

### Get Agent Parameters

**Endpoint:** `GET /automation-api/config/server/{serverName}/agent/{agentId}/params?extendedData=false`

**Description:** Retrieves agent configuration parameters.

**Used By:**
- Agent details (AGENT_DIR, LOGICAL_AGENT_NAME, AG_JAVA_HOME)
- Agent configuration viewing

**Implementation:**
```typescript
// InfrastructureService.getAgentParameters()
GET /automation-api/config/server/{serverName}/agent/{agentId}/params?extendedData=false
x-api-key: {token}
```

### Ping Agent

**Endpoint:** `POST /automation-api/config/server/{serverName}/agent/{agentId}/ping`

**Description:** Tests connectivity to an agent.

**Used By:**
- Ping Agent action
- Agent health check

**Request Body:**
```json
{
  "discover": false,
  "timeout": 60
}
```

**Implementation:**
```typescript
// InfrastructureService.pingAgent()
POST /automation-api/config/server/{serverName}/agent/{agentId}/ping
Content-Type: application/json
x-api-key: {token}
Body: { "discover": false, "timeout": 60 }
```

### Ping Agentless Host

**Endpoint:** `POST /automation-api/config/server/{serverName}/agentlesshost/{host}/ping`

**Description:** Tests connectivity to an agentless remote host.

**Used By:**
- Ping Agentless Host action
- Remote host verification

**Implementation:**
```typescript
// InfrastructureService.pingAgentlessHost()
POST /automation-api/config/server/{serverName}/agentlesshost/{agentlessHost}/ping
Content-Type: application/json
x-api-key: {token}
```

### Get Agent Analysis

**Endpoint:** `GET /automation-api/config/server/{serverName}/agent/{agentId}/analysis`

**Description:** Retrieves comprehensive agent diagnostics and analysis.

**Used By:**
- Agent Analysis action
- Detailed agent diagnostics

**Implementation:**
```typescript
// InfrastructureService.getAgentAnalysis()
GET /automation-api/config/server/{serverName}/agent/{agentId}/analysis
x-api-key: {token}
```

### Get MFT Configuration

**Endpoint:** `GET /automation-api/config/server/{serverName}/agent/{agentId}/mft/configuration`

**Description:** Retrieves Managed File Transfer configuration for an agent.

**Used By:**
- Get MFT Configuration action
- MFT capability detection

**Implementation:**
```typescript
// InfrastructureService.getMftConfiguration()
GET /automation-api/config/server/{serverName}/agent/{agentId}/mft/configuration
x-api-key: {token}
```

### Get FTS Settings

**Endpoint:** `GET /automation-api/config/server/{serverName}/agent/{agentId}/mft/fts/settings`

**Description:** Retrieves File Transfer Server settings for an agent.

**Used By:**
- FTS configuration viewing
- MFT setup validation

**Implementation:**
```typescript
// InfrastructureService.getFtsSettings()
GET /automation-api/config/server/{serverName}/agent/{agentId}/mft/fts/settings
x-api-key: {token}
```

### Get PGP Templates

**Endpoint:** `GET /automation-api/config/server/{serverName}/agent/{agentId}/mft/pgptemplates`

**Description:** Retrieves PGP/GPG template definitions for an agent.

**Used By:**
- PGP key management
- Encryption configuration

**Implementation:**
```typescript
// InfrastructureService.getPgpTemplates()
GET /automation-api/config/server/{serverName}/agent/{agentId}/mft/pgptemplates
x-api-key: {token}
```

### Get Host Groups

**Endpoint:** `GET /automation-api/config/server/{serverName}/hostgroups/agents`

**Description:** Retrieves all host groups with their member agents.

**Used By:**
- Infrastructure view - Host Groups node (lazy-loaded)
- Host group management

**Implementation:**
```typescript
// InfrastructureService.fetchHostGroups()
GET /automation-api/config/server/{serverName}/hostgroups/agents
x-api-key: {token}
```

### Get Host Group Agents

**Endpoint:** `GET /automation-api/config/server/{serverName}/hostgroup/{hostName}/agents`

**Description:** Retrieves agents belonging to a specific host group.

**Used By:**
- Host group expansion
- Agent listing within host groups

**Implementation:**
```typescript
// InfrastructureService.getHostGroupAgents()
GET /automation-api/config/server/{serverName}/hostgroup/{hostName}/agents
x-api-key: {token}
```

### Get Remote Hosts

**Endpoint:** `GET /automation-api/config/server/{serverName}/remotehosts`

**Description:** Retrieves remote host aliases and configurations.

**Used By:**
- Infrastructure view - Remote Hosts node (lazy-loaded)
- Agentless host management

**Implementation:**
```typescript
// InfrastructureService.fetchRemoteHosts()
GET /automation-api/config/server/{serverName}/remotehosts
x-api-key: {token}
```

### Get Run As Users

**Endpoint:** `GET /automation-api/config/server/{serverName}/runasusers`

**Description:** Retrieves run-as user credentials configured for agents.

**Used By:**
- Infrastructure view - Run As credentials display
- Credential management

**Implementation:**
```typescript
// InfrastructureService.fetchRunAs()
GET /automation-api/config/server/{serverName}/runasusers
x-api-key: {token}
```

### Test Run As User

**Endpoint:** `POST /automation-api/config/server/{serverName}/runasuser/{agentId}/{userName}/test`

**Description:** Tests if a run-as user can execute on an agent.

**Used By:**
- Test Run As User action
- Credential validation

**Implementation:**
```typescript
// InfrastructureService.testRunAsUser()
POST /automation-api/config/server/{serverName}/runasuser/{agentId}/{userName}/test
Content-Type: application/json
x-api-key: {token}
```

### Get Secrets

**Endpoint:** `GET /automation-api/config/secrets`

**Description:** Retrieves list of registered Control-M secrets.

**Used By:**
- Infrastructure view - Secrets node
- Secret management

**Implementation:**
```typescript
// InfrastructureService.fetchSecrets()
GET /automation-api/config/secrets
x-api-key: {token}
```

### MFTE - Get Gateways

**Endpoint:** `GET /automation-api/config/mfte/site/{siteName}/gateways`

**Description:** Retrieves MFTE gateway configurations for a site.

**Used By:**
- Data Services view - MFTE gateways
- Gateway management

**Implementation:**
```typescript
// InfrastructureService.getMftEnterpriseGateways()
GET /automation-api/config/mfte/site/{siteName}/gateways
x-api-key: {token}
```

### MFTE - Get Processing Rules

**Endpoint:** `GET /automation-api/config/mfte/site/{siteName}/processingRules`

**Description:** Retrieves all processing rules for an MFTE site.

**Used By:**
- Data Services view - Processing Rules
- Rule management

**Implementation:**
```typescript
// InfrastructureService.getMftEnterpriseProcessingRules()
GET /automation-api/config/mfte/site/{siteName}/processingRules
x-api-key: {token}
```

### MFTE - Enable Processing Rule

**Endpoint:** `POST /automation-api/config/mfte/site/{siteName}/processingRule/{ruleName}/enable`

**Description:** Enables a processing rule.

**Used By:**
- Enable Rule action
- Rule activation

**Implementation:**
```typescript
// InfrastructureService.enableMftEnterpriseRule()
POST /automation-api/config/mfte/site/{siteName}/processingRule/{ruleName}/enable
Content-Type: application/json
x-api-key: {token}
```

### MFTE - Disable Processing Rule

**Endpoint:** `POST /automation-api/config/mfte/site/{siteName}/processingRule/{ruleName}/disable`

**Description:** Disables a processing rule.

**Used By:**
- Disable Rule action
- Rule deactivation

**Implementation:**
```typescript
// InfrastructureService.disableMftEnterpriseRule()
POST /automation-api/config/mfte/site/{siteName}/processingRule/{ruleName}/disable
Content-Type: application/json
x-api-key: {token}
```

### MFTE - Get External Users

**Endpoint:** `GET /automation-api/config/mfte/site/{siteName}/externalusers`

**Description:** Retrieves all external users for an MFTE site.

**Used By:**
- Data Services view - Users
- User management

**Implementation:**
```typescript
// InfrastructureService.getMftEnterpriseUsers()
GET /automation-api/config/mfte/site/{siteName}/externalusers
x-api-key: {token}
```

### MFTE - Check User Exists

**Endpoint:** `GET /automation-api/config/mfte/site/{siteName}/externalusers?name={userName}`

**Description:** Checks if an external user exists.

**Used By:**
- User validation before creation
- Duplicate checking

**Implementation:**
```typescript
// AutomationApiClient.checkMfteUserExists()
GET /automation-api/config/mfte/site/{siteName}/externalusers?name={userName}
x-api-key: {token}
```

### MFTE - Create External User

**Endpoint:** `POST /automation-api/config/mfte/site/{siteName}/externaluser`

**Description:** Creates a new external user.

**Used By:**
- Create User command
- User onboarding

**Implementation:**
```typescript
// AutomationApiClient.createMfteUser()
POST /automation-api/config/mfte/site/{siteName}/externaluser
Content-Type: application/json
x-api-key: {token}
Body: {user definition JSON}
```

### MFTE - Update External User

**Endpoint:** `POST /automation-api/config/mfte/site/{siteName}/externaluser/{userName}`

**Description:** Updates an existing external user.

**Used By:**
- User modification
- Permission updates

**Implementation:**
```typescript
// AutomationApiClient.updateMfteUser()
POST /automation-api/config/mfte/site/{siteName}/externaluser/{userName}
Content-Type: application/json
x-api-key: {token}
Body: {user definition JSON}
```

### MFTE - Lock User

**Endpoint:** `POST /automation-api/config/mfte/site/{siteName}/externaluser/{userName}/lock`

**Description:** Locks an external user account.

**Used By:**
- Lock User action
- Account security

**Implementation:**
```typescript
// InfrastructureService.lockMftEnterpriseUser()
POST /automation-api/config/mfte/site/{siteName}/externaluser/{userName}/lock
Content-Type: application/json
x-api-key: {token}
```

### MFTE - Unlock User

**Endpoint:** `POST /automation-api/config/mfte/site/{siteName}/externaluser/{userName}/unlock`

**Description:** Unlocks an external user account.

**Used By:**
- Unlock User action
- Account restoration

**Implementation:**
```typescript
// InfrastructureService.unlockMftEnterpriseUser()
POST /automation-api/config/mfte/site/{siteName}/externaluser/{userName}/unlock
Content-Type: application/json
x-api-key: {token}
```

### MFTE - Get User Groups

**Endpoint:** `GET /automation-api/config/mfte/site/{siteName}/usergroups`

**Description:** Retrieves all user groups for an MFTE site.

**Used By:**
- Data Services view - Groups
- Group management

**Implementation:**
```typescript
// InfrastructureService.getMftEnterpriseGroups()
GET /automation-api/config/mfte/site/{siteName}/usergroups
x-api-key: {token}
```

### MFTE - Check Group Exists

**Endpoint:** `GET /automation-api/config/mfte/site/{siteName}/usergroups?name={groupName}`

**Description:** Checks if a user group exists.

**Used By:**
- Group validation before creation
- Duplicate checking

**Implementation:**
```typescript
// AutomationApiClient.checkMfteUserGroupExists()
GET /automation-api/config/mfte/site/{siteName}/usergroups?name={groupName}
x-api-key: {token}
```

### MFTE - Create User Group

**Endpoint:** `POST /automation-api/config/mfte/site/{siteName}/usergroup`

**Description:** Creates a new user group.

**Used By:**
- Create Group command
- Group setup

**Implementation:**
```typescript
// AutomationApiClient.createMfteUserGroup()
POST /automation-api/config/mfte/site/{siteName}/usergroup
Content-Type: application/json
x-api-key: {token}
Body: {group definition JSON}
```

### MFTE - Update User Group

**Endpoint:** `POST /automation-api/config/mfte/site/{siteName}/usergroup/{groupName}`

**Description:** Updates an existing user group.

**Used By:**
- Group modification
- Member updates

**Implementation:**
```typescript
// AutomationApiClient.updateMfteUserGroup()
POST /automation-api/config/mfte/site/{siteName}/usergroup/{groupName}
Content-Type: application/json
x-api-key: {token}
Body: {group definition JSON}
```

### MFTE - Get Virtual Folders

**Endpoint:** `GET /automation-api/config/mfte/site/{siteName}/virtualfolders`

**Description:** Retrieves all virtual folders for an MFTE site.

**Used By:**
- Data Services view - Virtual Folders
- Folder management

**Implementation:**
```typescript
// InfrastructureService.getMftEnterpriseVirtualFolders()
GET /automation-api/config/mfte/site/{siteName}/virtualfolders
x-api-key: {token}
```

### MFTE - Check Virtual Folder Exists

**Endpoint:** `GET /automation-api/config/mfte/site/{siteName}/virtualfolders?name={folderName}`

**Description:** Checks if a virtual folder exists.

**Used By:**
- Folder validation before creation
- Duplicate checking

**Implementation:**
```typescript
// AutomationApiClient.checkMfteVirtualFolderExists()
GET /automation-api/config/mfte/site/{siteName}/virtualfolders?name={folderName}
x-api-key: {token}
```

### MFTE - Create Virtual Folder

**Endpoint:** `POST /automation-api/config/mfte/site/{siteName}/virtualfolder`

**Description:** Creates a new virtual folder.

**Used By:**
- Create Virtual Folder command
- Folder setup

**Implementation:**
```typescript
// AutomationApiClient.createMfteVirtualFolder()
POST /automation-api/config/mfte/site/{siteName}/virtualfolder
Content-Type: application/json
x-api-key: {token}
Body: {folder definition JSON}
```

### MFTE - Add User to Virtual Folder

**Endpoint:** `POST /automation-api/config/mfte/site/{siteName}/virtualfolder/{folderName}/user/{userOrGroupName}?accessLevel={accessLevel}`

**Description:** Adds a user or group to a virtual folder with specified access level.

**Used By:**
- User onboarding
- Permission assignment

**Access Levels:** Read, Write, Full

**Implementation:**
```typescript
// AutomationApiClient.addUserToVirtualFolder()
POST /automation-api/config/mfte/site/{siteName}/virtualfolder/{folderName}/user/{userOrGroupName}?accessLevel={accessLevel}
Content-Type: application/json
x-api-key: {token}
```

---

## Authentication

All API calls use token-based authentication via the `x-api-key` header.

### Token Management

**Token Storage:**
- Tokens are stored securely in VS Code's SecretStorage
- Never stored in plain text
- Automatically included in all API requests

**Token Configuration:**
- Set via `Control-M: Set API Token` command
- Stored per workspace
- Can be updated at any time

**Token Validation:**
- Test connection with `Control-M: Test Connection` command
- Failed requests return HTTP 401 if token is invalid
- Tokens may expire based on Control-M configuration

### Obtaining a Token

**Via Control-M CLI:**
```bash
ctm session login -e https://ctm-em.yourcompany.com:8443/automation-api -u username -p password
```

**Via REST API:**
```bash
curl -k -X POST "https://ctm-em.yourcompany.com:8443/automation-api/session/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"your-username","password":"your-password"}'
```

**Token Response:**
```json
{
  "username": "your-username",
  "token": "your-api-token",
  "version": "9.0.21"
}
```

---

## API Call Summary

### By Service Category

**Build Service:** 1 endpoint
- Build job definitions

**Run Service:** 4 endpoints
- Run jobs, get status, get output, manage resources

**Deploy Service:** 11 endpoints
- Calendars, connection profiles, folders, jobs, site standards

**Config Service:** 29+ endpoints
- Servers, agents, host groups, run-as users, MFT, MFTE

**Total:** 45+ documented API endpoints

### Request Methods

- **GET:** Read operations (infrastructure, status, lists)
- **POST:** Write operations (create, update, test, execute)

### Response Formats

- **JSON** - All responses except job output
- **Plain Text** - Job output (may contain JSON or text)
- **Multipart** - Build and Run requests

---

## Error Handling

The extension handles API errors gracefully:

**HTTP Status Codes:**
- `200-299` - Success
- `401` - Authentication failed (invalid token)
- `404` - Resource not found
- `500+` - Server error

**Error Response Format:**
```json
{
  "errors": [
    {
      "message": "Error description",
      "id": "ERROR_CODE"
    }
  ]
}
```

**Extension Behavior:**
- Logs all errors to Output panel
- Displays user-friendly error messages
- Continues operation for non-critical failures
- Best-effort approach for infrastructure gathering

---

## Performance Considerations

### Timeouts

- **Default:** 30 seconds
- **Build/Run:** 60 seconds
- **Ping/Test:** 60-90 seconds

### Lazy Loading

To optimize performance in large environments:
- Agents loaded on-demand per datacenter
- Host groups loaded on-demand
- Remote hosts loaded on-demand

### Caching

- Infrastructure snapshot cached until refresh
- Connection settings cached in memory
- No persistent caching between sessions

---

## Best Practices

1. **Token Security**
   - Never commit tokens to version control
   - Use workspace-specific settings
   - Rotate tokens regularly

2. **API Rate Limiting**
   - Extension respects API timeouts
   - Uses batch operations where possible
   - Lazy loads large data sets

3. **Error Recovery**
   - Check Output panel for errors
   - Verify network connectivity
   - Confirm token validity

4. **Performance**
   - Use folder filters to limit scope
   - Configure MFT host groups for faster loading
   - Adjust pagination for your environment size

---

## Additional Resources

**Official Documentation:**
- [Control-M Automation API](https://documents.bmc.com/supportu/API/Monthly/en-US/Documentation/API_Intro.htm)
- [Build Service](https://documents.bmc.com/supportu/API/Monthly/en-US/Documentation/API_Services_BuildService.htm)
- [Deploy Service](https://documents.bmc.com/supportu/API/Monthly/en-US/Documentation/API_Services_DeployService.htm)
- [Run Service](https://documents.bmc.com/supportu/API/Monthly/en-US/Documentation/API_Services_RunService.htm)
- [Config Service](https://documents.bmc.com/supportu/API/Monthly/en-US/Documentation/API_Services_ConfigService_Main.htm)

**Extension Documentation:**
- [Getting Started Guide](GETTING_STARTED.md)
- [Features Guide](FEATURES_GUIDE.md)
- [Production README](../README.md)

---

*Documentation Version 1.0.0 - Generated for Control-M Extension*
