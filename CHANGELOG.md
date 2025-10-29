# Changelog

All notable changes to the Control-M Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0]

### Added
- **Infrastructure Browser**: View Control-M/Servers, Agents, and Host Groups in tree view
- **Agent Status Indicators**: Visual indicators for agent states (Active, Inactive, Error)
- **Connection Profile Management**: Support for multiple Control-M environments
- **Jobs-as-Code Support**: Create and manage jobs in JSON and Python formats
- **Code Snippets**: Pre-built templates for jobs and configurations
  - Job types: Command, Script, Database, File Transfer, AWS ECS, API
  - Connection profiles
  - Python API examples
- **Job Deployment**: Deploy jobs directly to Control-M from VS Code
- **Job Validation**: Syntax and structure validation before deployment
- **Settings Configuration**: Flexible configuration via VS Code settings or workspace files
- **Secure Credential Storage**: Passwords stored in VS Code secure storage
- **Telemetry Integration**: Usage tracking for license compliance and product improvement
- **Comprehensive Documentation**: User guide, developer guide, and build instructions

### Features
- Multi-environment support with profile switching
- Real-time agent status monitoring
- Context menu actions for infrastructure items
- Auto-refresh infrastructure view
- Filter and search agents
- Export infrastructure configuration
- Job templates and samples
- Integration with Control-M Automation API
- SSL/TLS certificate verification
- Debug logging and diagnostics

### Security
- Secure password storage using OS keychain
- SSL certificate verification
- Sensitive data redaction in logs
- Environment variable support for CI/CD

### Telemetry
- Extension activation tracking
- Command usage analytics
- Job type creation metrics
- Agent inventory tracking
- Connection profile usage
- MFTE rule tracking
- Error and crash reporting
- **Note**: Telemetry is required and cannot be disabled for license compliance

## [1.0.5]

### Added

- **Environment Switch**: Support multiple Control-M environments
 

### Changed
- **Environment Components Display**: Restructured component information in infrastructure tree view
  - "Desired State" now displayed as a separate child parameter instead of inline description
  - Added "State" placeholder parameter (future use) to all components
  - Improved component tree expandability for better visibility
  
### Fixed
- **Component API Endpoint Mapping**: Corrected API endpoint component name parameters
  - GCS: Uses "GCS" as component name
  - CMS: Uses "CMS" as component name  
  - Web_Server: Uses "WS" as component name
  - Self_Service_Server: Uses EM name as component name
  - Other components: Use EM name as component name
  - Gateway: Uses datacenter/server name as component name

### Improved
- Component status retrieval from Automation API
- Infrastructure tree data structure for future state tracking
- Visual organization of component parameters in tree view

## [Unreleased]

### Planned
- Job monitoring and execution history
- Advanced filtering and search capabilities
- Job dependency visualization
- Bulk operations on agents
- Additional job type templates
- Performance optimizations
- Enhanced error messages

---



**BMC Software - Orchestrate the Impossible™**
