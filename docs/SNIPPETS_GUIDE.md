# Control-M Extension - Complete Snippets Guide

The Control-M Extension includes over 200 code snippets to help you quickly create jobs, connection profiles, and configurations. This guide provides a comprehensive reference organized by category.

## Table of Contents

- [How to Use Snippets](#how-to-use-snippets)
- [Job Type Snippets](#job-type-snippets)
- [Connection Profile Snippets](#connection-profile-snippets)
- [MFTE Snippets](#mfte-snippets)
- [Python API Snippets](#python-api-snippets)
- [Configuration Snippets](#configuration-snippets)
- [Quick Reference Tables](#quick-reference-tables)

---

## How to Use Snippets

### Basic Usage

1. **Open a JSON or Python file** in VS Code
2. **Type the snippet prefix** (e.g., `jac.job.Command`)
3. **Press Tab or Enter** to insert the snippet
4. **Fill in placeholders** - press Tab to move between fields

### Example Workflow

```
1. Create file: my-backup-job.json
2. Type: jac.job.Command
3. Press: Tab
4. Fill in: 
   - Name: "DailyBackup"
   - Command: "/scripts/backup.sh"
   - Host: "backup-server"
   - RunAs: "backupuser"
5. Save and test with Build command
```

### Snippet Discovery

- **IntelliSense**: Snippets appear automatically as you type
- **Prefix Search**: Type `jac.job` to see all job snippets
- **Hover for Details**: Hover over snippet name to see description
- **Filter by Type**: Use prefixes like `jac.connection` for connection profiles

---

## Job Type Snippets

### Basic Operations

**Command Jobs** - Execute system commands

| Prefix | Description |
|--------|-------------|
| `jac.job.Command` | Execute OS command with pre/post commands |

```json
"MyCommandJob": {
  "Type": "Job:Command",
  "Command": "echo hello",
  "Host": "myhost.mycomp.com",
  "RunAs": "user1"
}
```

**Script Jobs** - Run scripts from files or embedded

| Prefix | Description |
|--------|-------------|
| `jac.job.Script` | Run script from file system |
| `jac.job.Script.Embedded` | Run embedded inline script |

**Utility Jobs**

| Prefix | Description |
|--------|-------------|
| `jac.job.Dummy` | Placeholder job (always succeeds) |

### File Transfer & Monitoring

**File Transfer Jobs**

| Prefix | Transfer Type |
|--------|---------------|
| `jac.job.File.Transfer.Local.SFTP` | Local → SFTP |
| `jac.job.File.Transfer.S3.Local` | S3 → Local |
| `jac.job.File.Transfer.S3.S3` | S3 → S3 |
| `jac.job.File.Transfer.Local.AS2` | Local → AS2 |
| `jac.job.File.Transfer.Event.Based` | Event-based with File Watcher |

**File Watcher Jobs**

| Prefix | Description |
|--------|-------------|
| `jac.job.File.Watcher.Create` | Watch for file creation |
| `jac.job.File.Watcher.Delete` | Watch for file deletion |

### Database Operations

| Prefix | Database Operation |
|--------|-------------------|
| `jac.job.Database.Embedded.Query` | Run embedded SQL query |
| `jac.job.Database.SQL.Script.Basic` | Run SQL script (basic) |
| `jac.job.Database.SQL.Script.Parameters` | Run SQL script with parameters |
| `jac.job.Database.Stored.Procedure` | Execute stored procedure |
| `jac.job.Database.MSSQL.Agent.Job` | MSSQL Agent job |
| `jac.job.Database.MSSQL.SSIS` | MSSQL SSIS package |

### Hadoop & Big Data

**Apache Spark**

| Prefix | Description |
|--------|-------------|
| `jac.job.Hadoop.Spark.Python.Basic` | Spark Python (basic) |
| `jac.job.Hadoop.Spark.Python.Advanced` | Spark Python (advanced) |
| `jac.job.Hadoop.Spark.Scala.Java.Basic` | Spark Scala/Java (basic) |
| `jac.job.Hadoop.Spark.Scala.Java.Advanced` | Spark Scala/Java (advanced) |

**Data Processing**

| Prefix | Tool |
|--------|------|
| `jac.job.Hadoop.Pig.Basic/Advanced` | Pig scripts |
| `jac.job.Hadoop.Hive.Basic/Advanced` | Hive queries |
| `jac.job.Hadoop.Sqoop.Basic/Advanced` | Sqoop data transfer |
| `jac.job.Hadoop.Tajo.InputFile/Query` | Tajo operations |

**Cluster Operations**

| Prefix | Description |
|--------|-------------|
| `jac.job.Hadoop.Map.Reduce.Basic/Advanced` | MapReduce jobs |
| `jac.job.Hadoop.Map.Reduce.Streaming` | Streaming MapReduce |
| `jac.job.Hadoop.DistCp.Basic/Advanced` | Distributed copy |
| `jac.job.Hadoop.HDFS.Commands` | HDFS commands |
| `jac.job.Hadoop.HDFS.File.Watcher` | HDFS file watcher |
| `jac.job.Hadoop.Oozie` | Oozie workflow |

### Cloud Platform Jobs

**AWS (Amazon Web Services)**

| Prefix | AWS Service |
|--------|-------------|
| `jac.job.AWS.Lambda` | Lambda function |
| `jac.job.AWS.Step.Function` | Step Functions |
| `jac.job.AWS.Batch` | Batch job |
| `jac.job.AWS.Glue` | Glue ETL job |

**Azure (Microsoft)**

| Prefix | Azure Service |
|--------|---------------|
| `jac.job.Azure.Function` | Azure Functions |
| `jac.job.Azure.Logic.Apps` | Logic Apps |
| `jac.job.Azure.Batch.Account` | Batch Account |
| `jac.job.Azure.DF` | Data Factory |
| `jac.job.Azure.Databricks` | Databricks |
| `jac.job.Azure.Functions` | Cloud Functions |

**Google Cloud Platform**

| Prefix | GCP Service |
|--------|-------------|
| `jac.job.Google.Data.Flow` | Dataflow |
| `jac.job.Google.Data.Proc.Workflow` | Dataproc Workflow |
| `jac.job.Google.Data.Proc.Job` | Dataproc Job |

### Enterprise Applications

**SAP**

| Prefix | Description |
|--------|-------------|
| `jac.job.SAP.R3.Create.Basic/Advanced` | Create SAP R3 job |
| `jac.job.SAP.R3.Copy` | Copy existing SAP job |
| `jac.job.SAP.BW.Process.Chain` | SAP BW Process Chain |
| `jac.job.SAP.BW.Info.Package` | SAP BW InfoPackage |

**Other Enterprise Apps**

| Prefix | Application |
|--------|-------------|
| `jac.job.PeopleSoft` | PeopleSoft process |
| `jac.job.Informatica` | Informatica workflow |
| `jac.job.Informatica.CS.Basic` | Informatica Cloud (basic) |
| `jac.job.Informatica.CS.Taskflow` | Informatica Cloud taskflow |

### Integration & Automation

| Prefix | Description |
|--------|-------------|
| `jac.job.Application.Integrator` | Application Integrator job |
| `jac.job.WebServices.Input.Parameters` | Web Services with parameters |
| `jac.job.WebServices.Input.File` | Web Services with input file |
| `jac.job.WebServices.REST` | REST service call |
| `jac.job.UI.Path` | UiPath RPA job |
| `jac.job.Boomi` | Boomi integration |
| `jac.job.Databricks` | Databricks job |
| `jac.job.Microsoft.Power.BI` | Power BI refresh |

### Advanced Features

| Prefix | Description |
|--------|-------------|
| `jac.job.SLA.Management` | SLA Management job |
| `jac.job.SLA.Management.Service.Action` | SLA Service Actions |
| `jac.job.zOS.Member` | z/OS Member job |
| `jac.job.zOS.InStream.JCL` | z/OS In-Stream JCL |
| `jac.job.Azure.Blob.*` | Azure Blob Storage operations |

---

## Connection Profile Snippets

All connection profile snippets use prefix: `jac.connection.profile.{Type}`

### File Transfer Profiles

**Basic Protocols**

| Prefix | Protocol |
|--------|----------|
| `jac.connection.profile.FileTransfer.FTP.Basic/Advanced` | FTP |
| `jac.connection.profile.FileTransfer.SFTP.Basic/Advanced` | SFTP |
| `jac.connection.profile.FileTransfer.Local` | Local filesystem |

**Cloud Storage**

| Prefix | Storage Type |
|--------|--------------|
| `jac.connection.profile.FileTransfer.S3.Amazon` | Amazon S3 |
| `jac.connection.profile.FileTransfer.S3.Compatible` | S3-compatible storage |

**Advanced**

| Prefix | Description |
|--------|-------------|
| `jac.connection.profile.FileTransfer.Dual.End.Point` | Dual endpoint (source & destination) |
| `jac.connection.profile.FileTransfer.Group` | Group profile (multiple destinations) |

### Database Profiles

| Prefix | Database |
|--------|----------|
| `jac.connection.profile.Database.Oracle.ServiceName` | Oracle (Service Name) |
| `jac.connection.profile.Database.Oracle.SID` | Oracle (SID) |
| `jac.connection.profile.Database.Oracle.Connection.String` | Oracle (Connection String) |
| `jac.connection.profile.Database.PostgreSQL` | PostgreSQL |
| `jac.connection.profile.Database.MSSQL.Basic` | SQL Server (basic) |
| `jac.connection.profile.Database.MSSQL.SSIS` | SQL Server SSIS |
| `jac.connection.profile.Database.DB2` | IBM DB2 |
| `jac.connection.profile.Database.Sybase` | Sybase |
| `jac.connection.profile.Database.JDBC.Basic` | JDBC (custom) |
| `jac.connection.profile.Database.JDBC.Driver` | JDBC Driver definition |

### Hadoop & Big Data Profiles

| Prefix | Technology |
|--------|------------|
| `jac.connection.profile.Hadoop.Basic/Advanced` | Hadoop cluster |
| `jac.connection.profile.Apache.Spark` | Apache Spark |
| `jac.connection.profile.Apache.Hive.Basic/Advanced` | Apache Hive |
| `jac.connection.profile.Apache.Oozie` | Apache Oozie |
| `jac.connection.profile.Apache.Sqoop` | Apache Sqoop |
| `jac.connection.profile.Apache.Tajo` | Apache Tajo |

### Cloud Platform Profiles

**AWS**

| Prefix | Description |
|--------|-------------|
| `jac.connection.profile.AWS` | AWS (Access Key & Secret) |
| `jac.connection.profile.AWS.Glue.Secret` | AWS Glue (Secret) |
| `jac.connection.profile.AWS.Glue.IAM` | AWS Glue (IAM Role) |

**Azure**

| Prefix | Description |
|--------|-------------|
| `jac.connection.profile.Azure.Basic` | Azure (basic) |
| `jac.connection.profile.Azure.Data.Factory.Service.Principal` | Azure Data Factory (Service Principal) |
| `jac.connection.profile.Azure.Data.Factory.Managed.Identities` | Azure Data Factory (Managed Identity) |
| `jac.connection.profile.Azure.Databricks` | Azure Databricks |
| `jac.connection.profile.Azure.Functions.Service.Principal` | Azure Functions (Service Principal) |
| `jac.connection.profile.Azure.Functions.Managed.Identities` | Azure Functions (Managed Identity) |

**Google Cloud**

| Prefix | Description |
|--------|-------------|
| `jac.connection.profile.Google.Dataflow` | Google Dataflow |
| `jac.connection.profile.Google.Dataproc` | Google Dataproc |

### Enterprise Application Profiles

| Prefix | Application |
|--------|-------------|
| `jac.connection.profile.SAP.Application.Server` | SAP Application Server |
| `jac.connection.profile.SAP.Logon.Group` | SAP Logon Group |
| `jac.connection.profile.PeopleSoft` | PeopleSoft |
| `jac.connection.profile.Informatica.Basic` | Informatica |
| `jac.connection.profile.Informatica.Cloud.Services` | Informatica Cloud |
| `jac.connection.profile.Application.Integrator` | Application Integrator |

### Integration Platforms

| Prefix | Platform |
|--------|----------|
| `jac.connection.profile.WebServices.SOAP` | Web Services (SOAP) |
| `jac.connection.profile.WebServices.REST` | Web Services (REST) |
| `jac.connection.profile.UI.Path` | UiPath |
| `jac.connection.profile.Boomi` | Boomi |
| `jac.connection.profile.Databricks` | Databricks |
| `jac.connection.profile.Microsoft.Power.BI` | Microsoft Power BI |

---

## MFTE Snippets

MFTE (Managed File Transfer Enterprise) snippets for B2B file transfer configuration.

| Prefix | Description |
|--------|-------------|
| `ctm-mfte-rule` | MFTE Processing Rule |
| `ctm-mfte-user` | MFTE External User |
| `ctm-mfte-group` | MFTE User Group |
| `ctm-mfte-virtualfolder` | MFTE Virtual Folder |

**Example - MFTE User:**
```json
{
  "name": "external_user",
  "password": "********",
  "groups": ["group1"],
  "homeDirPath": "/home/users/external_user",
  "publicKey": "ssh-rsa ..."
}
```

---

## Python API Snippets

Python snippets for Control-M Automation API scripts.

### Setup & Connection

| Prefix | Description |
|--------|-------------|
| `ctm-python-imports` | Import Control-M API modules |
| `ctm-python-connection` | Setup API connection |

**Example:**
```python
from ctm_python_client.core.workflow import *
from ctm_python_client import Configuration

config = Configuration()
config.username = "user"
config.password = "pass"
config.api_endpoint = "https://ctm:8443/automation-api"
```

### Job Operations

| Prefix | Description |
|--------|-------------|
| `ctm-python-job-simple` | Create simple job |
| `ctm-python-job-build` | Build job definition |
| `ctm-python-job-run` | Run job |
| `ctm-python-job-deploy` | Deploy job |

### AWS ECS Jobs

| Prefix | Description |
|--------|-------------|
| `ctm-python-aws-ecs` | AWS ECS job in Python |

---

## Configuration Snippets

### Workload Policies

| Prefix | Description |
|--------|-------------|
| `jac.run.workload.policy.basic` | Basic workload policy |
| `jac.run.workload.policy.advanced` | Advanced workload policy |
| `jac.run.workload.policy.filter` | Policy filter |
| `jac.run.workload.policy.running.jobs` | Running jobs limits |
| `jac.run.workload.policy.resource.pool` | Resource pool configuration |
| `jac.run.workload.policy.host.mapping` | Host mapping rules |

### Order & Run Configuration

| Prefix | Description |
|--------|-------------|
| `jac.run.order.config.basic` | Basic order configuration |
| `jac.run.order.config.rerun` | Rerun configuration (z/OS) |

### Alert Management

| Prefix | Description |
|--------|-------------|
| `jac.run.alerts.update` | Update job alerts |
| `jac.run.alerts.status` | Update alert status |

### Job Corrections

| Prefix | Description |
|--------|-------------|
| `jac.job.fix.failed.job` | Fix failed job with corrective flow |

---

## Quick Reference Tables

### Most Commonly Used Snippets

| Snippet | Use Case |
|---------|----------|
| `jac.job.Command` | Execute shell commands |
| `jac.job.Script` | Run scripts from files |
| `jac.job.File.Transfer.Local.SFTP` | Transfer files via SFTP |
| `jac.job.Database.Embedded.Query` | Run SQL queries |
| `jac.connection.profile.FileTransfer.SFTP.Basic` | SFTP connection |
| `jac.connection.profile.Database.Oracle.ServiceName` | Oracle connection |
| `jac.connection.profile.AWS` | AWS service connection |

### Snippet Prefix Patterns

| Pattern | Category | Example |
|---------|----------|---------|
| `jac.job.*` | Job types | `jac.job.Command` |
| `jac.connection.profile.*` | Connection profiles | `jac.connection.profile.AWS` |
| `jac.run.*` | Runtime configurations | `jac.run.workload.policy.basic` |
| `ctm-mfte-*` | MFTE objects | `ctm-mfte-user` |
| `ctm-python-*` | Python API | `ctm-python-connection` |

### Tips for Finding Snippets

1. **Type prefix and wait** - IntelliSense will show matches
2. **Use partial prefixes** - `jac.job.AWS` shows all AWS job types
3. **Browse by category** - Type `jac.connection` to see all connection profiles
4. **Check descriptions** - Hover over snippet names for details
5. **Experiment** - Try different variations to find what you need

---

## Best Practices

### Naming Conventions

✅ **Good:**
```json
"DailyBackupJob": { ... }
"FileTransfer_LogsToArchive": { ... }
"Database_ReportGeneration": { ... }
```

❌ **Avoid:**
```json
"job1": { ... }  // Too generic
"test": { ... }  // Not descriptive
"ThisIsMyVeryLongJobNameThatIsHardToRead": { ... }  // Too long
```

### Using Snippets Effectively

1. **Start with Basic, Upgrade to Advanced**
   - Use basic snippets first
   - Add advanced features as needed

2. **Combine Multiple Snippets**
   - Use job snippet + connection profile snippet
   - Build complex workflows from simple parts

3. **Customize After Insert**
   - Snippets are templates - customize for your needs
   - Remove unused optional parameters

4. **Save Custom Configurations**
   - Save commonly used patterns as your own snippets
   - Share team-specific snippets

### Common Patterns

**Pattern 1: File Transfer with Monitoring**
```
1. Insert: jac.job.File.Watcher.Create
2. Insert: jac.job.File.Transfer.Local.SFTP
3. Link with conditions
```

**Pattern 2: Database Query + Notification**
```
1. Insert: jac.job.Database.Embedded.Query
2. Add: Output capture
3. Add: Email notification on completion
```

**Pattern 3: Cloud Job with Error Handling**
```
1. Insert: jac.job.AWS.Lambda
2. Add: Retry logic
3. Add: Error notification
```

### Troubleshooting Snippets

**Snippet Doesn't Appear:**
- Check file extension (must be .json for JSON snippets, .py for Python)
- Verify you're typing the correct prefix
- Restart VS Code if snippets aren't loading

**Invalid JSON After Insert:**
- Check for missing commas between objects
- Verify all strings are properly quoted
- Use VS Code's JSON validation (shows errors in red)

**Placeholder Navigation:**
- Press Tab to move to next placeholder
- Press Shift+Tab to move to previous placeholder
- Press Esc to exit placeholder mode

---

## Additional Resources

### Learn More

- [Getting Started Guide](GETTING_STARTED.md) - Setup and first steps
- [Features Guide](FEATURES_GUIDE.md) - Complete feature reference
- [REST API Reference](REST_API_REFERENCE.md) - API documentation
- [BMC Control-M Documentation](https://documents.bmc.com/products/Control-M) - Official documentation

### Community

- Share your custom snippets with the team
- Request new snippets via extension feedback
- Contribute to snippet improvements

---

*Documentation Version 1.0.0 - Over 200 snippets available*
