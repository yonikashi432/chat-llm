# Chat LLM Agent System v2.0 - Developer Guide

## What's New in v2.0

### Enhanced Features

1. **Advanced Error Handling**
   - Detailed error messages with actionable suggestions
   - Stack trace logging for debugging
   - Graceful degradation for failed operations

2. **Logging System**
   - Configurable log levels (DEBUG, INFO, WARN, ERROR)
   - Structured logging with timestamps
   - Performance metrics tracking

3. **New Tools Added** (10 additional tools)
   - HTTP request tool (`httpRequest`, `fetchJSON`)
   - JSON schema validation (`validateSchema`)
   - Email and URL validation
   - Advanced data transformation (`transformData`, `mergeData`, `deduplicateData`)
   - Enhanced environment variable management
   - File statistics (`getStats`)
   - Recursive directory listing

4. **Security Improvements**
   - Path traversal protection
   - System directory access prevention
   - Enhanced command sanitization
   - Rate limiting support

5. **Performance Optimizations**
   - Execution time tracking
   - Memory-efficient data processing
   - Async operation improvements

### Migration from v1.0

The v2.0 API is backward compatible with v1.0. Existing configurations will continue to work.

New features are opt-in via environment variables:
```bash
export AGENT_LOG_LEVEL=DEBUG    # Enable debug logging
export AGENT_METRICS=true       # Track performance metrics
```

## New Tools Reference

### Network Tools

#### httpRequest
Make HTTP/HTTPS requests with full control.

```json
{
  "tool": "httpRequest",
  "params": {
    "url": "https://api.example.com/data",
    "method": "GET",
    "headers": {
      "Authorization": "Bearer token"
    },
    "timeout": 30000
  }
}
```

**Parameters:**
- `url` (string, required): URL to request
- `method` (string, default: 'GET'): HTTP method
- `headers` (object): Request headers
- `body` (string): Request body for POST/PUT
- `timeout` (number, default: 30000): Timeout in milliseconds

**Returns:** Object with `status`, `headers`, and `body`

#### fetchJSON
Simplified JSON API requests.

```json
{
  "tool": "fetchJSON",
  "params": {
    "url": "https://api.example.com/users"
  }
}
```

### Validation Tools

#### validateSchema
Validate data against JSON schema (basic implementation).

```json
{
  "tool": "validateSchema",
  "params": {
    "data": {"name": "John", "age": 30},
    "schema": {
      "type": "object",
      "required": ["name", "age"],
      "properties": {
        "name": {"type": "string"},
        "age": {"type": "number"}
      }
    }
  }
}
```

**Returns:** Object with `valid` (boolean) and `errors` (array)

#### validateEmail
Validate email address format.

```json
{
  "tool": "validateEmail",
  "params": {
    "email": "user@example.com"
  }
}
```

#### validateURL
Validate URL format.

```json
{
  "tool": "validateURL",
  "params": {
    "url": "https://example.com"
  }
}
```

### Advanced Data Processing

#### transformData
Transform data with various operations.

**Select specific fields:**
```json
{
  "tool": "transformData",
  "params": {
    "data": [{"name": "John", "age": 30, "email": "john@example.com"}],
    "operation": "select",
    "mapping": {
      "fields": ["name", "email"]
    }
  }
}
```

**Rename fields:**
```json
{
  "tool": "transformData",
  "params": {
    "data": [{"first_name": "John"}],
    "operation": "rename",
    "mapping": {
      "fields": {
        "first_name": "firstName"
      }
    }
  }
}
```

**Compute new fields:**
```json
{
  "tool": "transformData",
  "params": {
    "data": [{"price": 10, "quantity": 5}],
    "operation": "compute",
    "mapping": {
      "fields": {
        "total": "item.price * item.quantity"
      }
    }
  }
}
```

#### mergeData
Merge multiple datasets.

**Concatenation:**
```json
{
  "tool": "mergeData",
  "params": {
    "datasets": [
      [{"id": 1}, {"id": 2}],
      [{"id": 3}, {"id": 4}]
    ],
    "type": "concat"
  }
}
```

**Join by key:**
```json
{
  "tool": "mergeData",
  "params": {
    "datasets": [
      [{"id": 1, "name": "John"}],
      [{"id": 1, "age": 30}]
    ],
    "joinKey": "id",
    "type": "join"
  }
}
```

#### deduplicateData
Remove duplicate entries.

```json
{
  "tool": "deduplicateData",
  "params": {
    "data": [{"id": 1}, {"id": 2}, {"id": 1}],
    "key": "id"
  }
}
```

### Enhanced File Tools

#### getStats
Get detailed file/directory statistics.

```json
{
  "tool": "getStats",
  "params": {
    "path": "/path/to/file"
  }
}
```

**Returns:**
```json
{
  "size": 1024,
  "created": "2025-12-08T09:00:00.000Z",
  "modified": "2025-12-08T09:30:00.000Z",
  "accessed": "2025-12-08T10:00:00.000Z",
  "isFile": true,
  "isDirectory": false,
  "permissions": "644"
}
```

#### Enhanced listDirectory
List with filtering and recursion.

```json
{
  "tool": "listDirectory",
  "params": {
    "path": "./src",
    "filter": "\\.js$",
    "recursive": true
  }
}
```

### Environment Tools

#### setEnv
Set environment variable (runtime only).

```json
{
  "tool": "setEnv",
  "params": {
    "name": "MY_VAR",
    "value": "my_value"
  }
}
```

#### getEnvVars
Get multiple environment variables.

```json
{
  "tool": "getEnvVars",
  "params": {
    "names": ["PATH", "HOME", "USER"]
  }
}
```

#### listEnv
List environment variables with optional prefix filter.

```json
{
  "tool": "listEnv",
  "params": {
    "prefix": "NODE_"
  }
}
```

## Advanced Configuration Examples

### API Integration Example

```json
{
  "name": "API Data Fetcher",
  "version": "2.0.0",
  "workflow": [
    {
      "name": "Fetch User Data",
      "steps": [
        {
          "tool": "fetchJSON",
          "params": {
            "url": "https://api.example.com/users"
          }
        },
        {
          "tool": "transformData",
          "params": {
            "data": "{{fetchJSON}}",
            "operation": "select",
            "mapping": {
              "fields": ["id", "name", "email"]
            }
          }
        },
        {
          "tool": "writeFile",
          "params": {
            "path": "users.json",
            "content": "{{transformData}}"
          }
        }
      ]
    }
  ]
}
```

### Data Validation Pipeline

```json
{
  "name": "Data Validator",
  "version": "2.0.0",
  "workflow": [
    {
      "name": "Validate Input",
      "steps": [
        {
          "tool": "readFile",
          "params": {
            "path": "data.json"
          }
        },
        {
          "tool": "parseJSON",
          "params": {
            "data": "{{readFile}}"
          }
        },
        {
          "tool": "validateSchema",
          "params": {
            "data": "{{parseJSON}}",
            "schema": {
              "type": "object",
              "required": ["name", "email"],
              "properties": {
                "name": {"type": "string"},
                "email": {"type": "string"}
              }
            }
          }
        }
      ]
    }
  ]
}
```

### ETL Pipeline Example

```json
{
  "name": "ETL Pipeline",
  "version": "2.0.0",
  "workflow": [
    {
      "name": "Extract",
      "steps": [
        {
          "tool": "readFile",
          "params": {
            "path": "sales.csv"
          }
        },
        {
          "tool": "parseCSV",
          "params": {
            "data": "{{readFile}}"
          }
        }
      ]
    },
    {
      "name": "Transform",
      "steps": [
        {
          "tool": "transformData",
          "params": {
            "data": "{{parseCSV.rows}}",
            "operation": "compute",
            "mapping": {
              "fields": {
                "total": "item.price * item.quantity",
                "profit": "(item.price - item.cost) * item.quantity"
              }
            }
          }
        },
        {
          "tool": "deduplicateData",
          "params": {
            "data": "{{transformData}}",
            "key": "order_id"
          }
        }
      ]
    },
    {
      "name": "Load",
      "steps": [
        {
          "tool": "aggregateData",
          "params": {
            "data": "{{deduplicateData}}",
            "groupBy": "product",
            "aggregateKey": "profit",
            "operation": "sum"
          }
        }
      ]
    }
  ]
}
```

## Logging and Debugging

### Enable Debug Logging

```bash
export AGENT_LOG_LEVEL=DEBUG
export AGENT_MODE=true
export AGENT_CONFIG=my-config.json
./chat-llm.js
```

### Log Levels

- **DEBUG**: Detailed information for debugging
- **INFO**: General information about execution
- **WARN**: Warning messages
- **ERROR**: Error messages only

### Log Format

```
[2025-12-08T09:16:44.329Z] DEBUG: Executing tool: file.readFile - {"path":"data.txt"}
[2025-12-08T09:16:44.352Z] DEBUG: Tool file.readFile completed - {"executionTime":23}
```

## Performance Monitoring

All tools in v2.0 automatically track execution time. This helps identify bottlenecks.

Example output:
```
Tool file.readFile completed in 23ms
Tool parseCSV completed in 156ms
Tool aggregateData completed in 89ms
Total workflow time: 268ms
```

## Security Best Practices

1. **Path Validation**: All file paths are validated to prevent directory traversal
2. **Command Sanitization**: Dangerous commands are blocked
3. **Input Validation**: All inputs are validated before processing
4. **Timeout Limits**: Network requests have configurable timeouts
5. **Schema Validation**: Validate external data before processing

## Error Handling

v2.0 provides detailed error messages:

```
Error in tool file.readFile:
  Message: File not found: /path/to/file.txt
  Suggestion: Check that the file path is correct and the file exists
  
Error in tool validateSchema:
  Message: Validation failed
  Errors:
    - Missing required property: email
    - Property age: expected number, got string
```

## Best Practices for v2.0

1. **Use Logging**: Enable appropriate log levels for your use case
2. **Validate Data**: Use `validateSchema` for external data
3. **Handle Errors**: Use `continueOnError` for non-critical steps
4. **Monitor Performance**: Review execution times for optimization
5. **Security First**: Always validate file paths and inputs
6. **Test Incrementally**: Test workflows step by step

## Upgrading from v1.0

No code changes required! v2.0 is fully backward compatible.

To use new features:
1. Add new tools to your configurations
2. Enable logging with `AGENT_LOG_LEVEL`
3. Review enhanced error messages for better debugging

## Future Roadmap

Planned for v2.1:
- Database connectivity tools
- Webhook support
- Scheduled task execution
- Plugin system for custom tools
- Web UI for workflow builder
- Cloud storage integration

## Support and Contribution

For issues, feature requests, or contributions:
- Check the main [Agent Guide](AGENT_GUIDE.md)
- Review [Quick Start](QUICKSTART.md)
- See [Examples](examples/README.md)
