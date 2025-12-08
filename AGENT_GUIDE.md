# Agent System Documentation

## Overview

The Chat LLM Agent System transforms the basic chat interface into a powerful, multi-purpose AI agent capable of performing various tasks with custom data processing, file operations, and workflow automation.

## Features

- **Modular Tool System**: Built-in tools for file operations, data processing, text manipulation, and more
- **Configurable Workflows**: Define complex multi-step workflows using JSON configuration files
- **Task Templates**: Pre-built templates for common operations
- **Custom Data Handling**: Process CSV, JSON, and text data
- **LLM Integration**: Intelligent task selection and execution based on user queries
- **Extensible Architecture**: Easy to add new tools and capabilities

## Getting Started

### Enable Agent Mode

Set the `AGENT_MODE` environment variable:

```bash
export AGENT_MODE=true
./chat-llm.js
```

### Load a Configuration

Specify an agent configuration file:

```bash
export AGENT_MODE=true
export AGENT_CONFIG=examples/agents/swiss-army-knife.json
./chat-llm.js
```

### Enable Verbose Output

For detailed execution logs:

```bash
export AGENT_MODE=true
export AGENT_VERBOSE=true
export AGENT_CONFIG=examples/agents/file-analyzer.json
./chat-llm.js
```

## Available Tools

### File System Tools

- `readFile` - Read file contents
  - Parameters: `path` (string)
  
- `writeFile` - Write content to file
  - Parameters: `path` (string), `content` (string)
  
- `listDirectory` - List directory contents
  - Parameters: `path` (string, default: ".")
  
- `fileExists` - Check if file/directory exists
  - Parameters: `path` (string)

### Data Processing Tools

- `parseJSON` - Parse JSON data
  - Parameters: `data` (string)
  
- `parseCSV` - Parse CSV data
  - Parameters: `data` (string), `delimiter` (string, default: ",")
  
- `filterData` - Filter array data
  - Parameters: `data` (array), `key` (string), `value` (any)
  
- `sortData` - Sort array data
  - Parameters: `data` (array), `key` (string), `order` (string: "asc" or "desc")
  
- `aggregateData` - Aggregate/summarize data
  - Parameters: `data` (array), `groupBy` (string), `aggregateKey` (string), `operation` (string: "sum", "count", or "avg")

### Text Processing Tools

- `wordCount` - Count words in text
  - Parameters: `text` (string)
  
- `grep` - Extract lines matching pattern
  - Parameters: `text` (string), `pattern` (string), `caseInsensitive` (boolean, default: false)
  
- `replace` - Replace text pattern
  - Parameters: `text` (string), `pattern` (string), `replacement` (string), `global` (boolean, default: true)
  
- `substring` - Extract substring
  - Parameters: `text` (string), `start` (number), `end` (number)
  
- `split` - Split text
  - Parameters: `text` (string), `delimiter` (string, default: "\n")
  
- `join` - Join array into text
  - Parameters: `array` (array), `delimiter` (string, default: "\n")

### System Tools

- `executeCommand` - Execute shell command
  - Parameters: `command` (string), `timeout` (number, default: 30000)
  
- `getEnv` - Get environment variable
  - Parameters: `name` (string)
  
- `getTimestamp` - Get current timestamp
  - Parameters: `format` (string: "iso", "unix", or "string")

### Math Tools

- `calculate` - Calculate mathematical expression
  - Parameters: `expression` (string)
  
- `random` - Generate random number
  - Parameters: `min` (number, default: 0), `max` (number, default: 1)
  
- `round` - Round number
  - Parameters: `number` (number), `decimals` (number, default: 0)

## Agent Configuration Format

Agent configurations are JSON files with the following structure:

```json
{
  "name": "Agent Name",
  "description": "What this agent does",
  "version": "1.0.0",
  "tasks": [
    {
      "name": "Task Name",
      "description": "Task description",
      "steps": [
        {
          "tool": "toolName",
          "params": {
            "param1": "value1",
            "param2": "{{variable}}"
          }
        }
      ]
    }
  ],
  "workflow": [
    {
      "name": "Workflow Step",
      "steps": [...]
    }
  ],
  "settings": {
    "maxRetries": 3,
    "timeout": 30000,
    "verbose": false
  }
}
```

## Variable Substitution

Use `{{variableName}}` in configuration parameters to reference values from the execution context:

```json
{
  "tool": "readFile",
  "params": {
    "path": "{{filePath}}"
  }
}
```

Variables can come from:
- User query context
- Previous step results
- Environment variables

## Interactive Commands

When running in agent mode, special commands are available:

- `/agent help` - Show help and available tools
- `/agent tools` - List all available tools
- `/agent config` - Show current agent configuration
- `/agent templates` - List available task templates

## Example Configurations

### 1. File Analyzer

Analyzes text files and provides statistics:

```bash
export AGENT_CONFIG=examples/agents/file-analyzer.json
export AGENT_MODE=true
./chat-llm.js
```

### 2. Data Processor

Processes CSV files with filtering and aggregation:

```bash
export AGENT_CONFIG=examples/agents/data-processor.json
export AGENT_MODE=true
./chat-llm.js
```

### 3. Text Searcher

Searches for patterns in text files:

```bash
export AGENT_CONFIG=examples/agents/text-searcher.json
export AGENT_MODE=true
./chat-llm.js
```

### 4. Swiss Army Knife

Multi-purpose agent for any task:

```bash
export AGENT_CONFIG=examples/agents/swiss-army-knife.json
export AGENT_MODE=true
./chat-llm.js
```

## Creating Custom Agents

### Step 1: Define Your Configuration

Create a JSON file with your agent's tasks and workflows:

```json
{
  "name": "My Custom Agent",
  "description": "Does custom stuff",
  "tasks": [
    {
      "name": "Custom Task",
      "steps": [
        {
          "tool": "readFile",
          "params": { "path": "data.txt" }
        },
        {
          "tool": "wordCount",
          "params": { "text": "{{readFile}}" }
        }
      ]
    }
  ]
}
```

### Step 2: Test Your Agent

```bash
export AGENT_MODE=true
export AGENT_CONFIG=path/to/your-agent.json
export AGENT_VERBOSE=true
./chat-llm.js
```

### Step 3: Refine and Iterate

Monitor the verbose output to debug your workflows and refine the configuration.

## Advanced Features

### Conditional Execution

Add conditions to steps:

```json
{
  "tool": "writeFile",
  "params": { "path": "output.txt", "content": "{{data}}" },
  "condition": "count > 10"
}
```

### Error Handling

Continue workflow even if a step fails:

```json
{
  "tool": "executeCommand",
  "params": { "command": "optional-command" },
  "continueOnError": true
}
```

### Task Chaining

Results from previous steps are automatically available to subsequent steps using the tool name as the variable.

## Use Cases

1. **File Processing**: Batch process files, analyze logs, extract data
2. **Data Analysis**: Parse CSV/JSON, filter, aggregate, and transform data
3. **Text Mining**: Search patterns, extract information, process documents
4. **Automation**: Execute shell commands, manage files, orchestrate workflows
5. **Calculations**: Perform math operations, generate reports, compute statistics

## Best Practices

1. **Keep tasks focused**: Each task should have a single, clear purpose
2. **Use meaningful names**: Name your tasks and variables descriptively
3. **Test incrementally**: Start with simple workflows and build complexity
4. **Handle errors**: Use `continueOnError` for optional steps
5. **Use templates**: Leverage built-in templates for common patterns
6. **Document your configs**: Add clear descriptions to help users understand

## Troubleshooting

### Agent not loading

- Check that `AGENT_MODE=true` is set
- Verify the configuration file path is correct
- Validate JSON syntax in your configuration

### Tools not executing

- Enable verbose mode with `AGENT_VERBOSE=true`
- Check tool parameters match the expected format
- Verify variable names are correct

### Workflow failures

- Review step-by-step execution in verbose mode
- Check file paths and permissions
- Validate data formats (CSV, JSON structure)

## Extending the Agent System

To add custom tools, edit `agent-tools.js` and add your tool function:

```javascript
const myCustomTool = async (params) => {
    const { param1, param2 } = params;
    // Your implementation
    return result;
};

// Add to the appropriate category
const customTools = {
    myCustomTool
};

// Export in allTools
const allTools = {
    ...fileTools,
    ...dataTools,
    ...customTools
};
```

## Conclusion

The Chat LLM Agent System provides a powerful foundation for building multi-purpose AI agents. With its modular architecture, extensive tool library, and flexible configuration system, you can create agents tailored to any task or domain.
