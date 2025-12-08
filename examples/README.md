# Agent Examples

This directory contains example agent configurations and sample data files to help you get started with the Chat LLM Agent System.

## Agent Configurations

### 1. Swiss Army Knife Agent (`swiss-army-knife.json`)

A versatile, multi-purpose agent with 5 different task categories:

- **File Operations**: List directories, read files
- **Text Analysis**: Count words in documents
- **Data Processing**: Parse JSON data
- **Math Calculations**: Evaluate mathematical expressions
- **System Commands**: Execute shell commands

**Use case**: General-purpose tasks, perfect as a starting template

**Run it**:
```bash
export AGENT_MODE=true
export AGENT_CONFIG=examples/agents/swiss-army-knife.json
./chat-llm.js
```

### 2. File Analyzer (`file-analyzer.json`)

Analyzes text files and provides comprehensive statistics.

**Features**:
- Reads file contents
- Counts words
- Provides file statistics

**Use case**: Document analysis, content statistics

**Run it**:
```bash
export AGENT_MODE=true
export AGENT_CONFIG=examples/agents/file-analyzer.json
export AGENT_VERBOSE=true
./chat-llm.js
```

### 3. Data Processor (`data-processor.json`)

Process CSV data with filtering and aggregation capabilities.

**Features**:
- Load and parse CSV files
- Filter data by criteria
- Aggregate and compute statistics

**Use case**: Business intelligence, data analysis, reporting

**Run it**:
```bash
export AGENT_MODE=true
export AGENT_CONFIG=examples/agents/data-processor.json
./chat-llm.js
```

### 4. Text Searcher (`text-searcher.json`)

Search for patterns in text files using regular expressions.

**Features**:
- Read text files
- Search with regex patterns
- Case-insensitive matching

**Use case**: Log analysis, code searching, pattern finding

**Run it**:
```bash
export AGENT_MODE=true
export AGENT_CONFIG=examples/agents/text-searcher.json
./chat-llm.js
```

### 5. Data Analysis Demo (`data-demo.json`)

Complete demonstration of CSV data processing workflow.

**Features**:
- Loads sample employee data
- Calculates average salaries by city
- Demonstrates workflow orchestration

**Use case**: Learning workflows, data analysis tutorial

**Run it**:
```bash
export AGENT_MODE=true
export AGENT_CONFIG=examples/agents/data-demo.json
export AGENT_VERBOSE=true
./chat-llm.js
```

This will analyze the `sample-data.csv` file and show average salaries by city.

## Sample Data

### `sample-data.csv`

Employee data with the following structure:
- name: Employee name
- age: Employee age
- city: Location (NYC, LA, Chicago)
- salary: Annual salary

Perfect for testing data processing, filtering, and aggregation.

## Creating Your Own Agent

1. Start with a simple configuration:

```json
{
  "name": "My Agent",
  "version": "1.0.0",
  "workflow": [
    {
      "name": "My Task",
      "steps": [
        {
          "tool": "readFile",
          "params": { "path": "myfile.txt" }
        }
      ]
    }
  ]
}
```

2. Save it as `my-agent.json`

3. Run it:
```bash
export AGENT_MODE=true
export AGENT_CONFIG=my-agent.json
./chat-llm.js
```

## Available Tools

See the full list of available tools in the [Agent Guide](../AGENT_GUIDE.md#available-tools).

Quick reference:
- **File**: readFile, writeFile, listDirectory, fileExists
- **Data**: parseJSON, parseCSV, filterData, sortData, aggregateData
- **Text**: wordCount, grep, replace, substring, split, join
- **System**: executeCommand, getEnv, getTimestamp
- **Math**: calculate, random, round

## Tips for Configuration

1. **Use descriptive names**: Name your tasks clearly
2. **Reference previous results**: Use `{{toolName}}` to reference previous step outputs
3. **Nested properties**: Access object properties with `{{parseCSV.rows}}`
4. **Enable verbose mode**: Set `AGENT_VERBOSE=true` for debugging
5. **Start simple**: Begin with single-step tasks before building complex workflows

## Common Patterns

### Pattern 1: File Analysis

```json
{
  "workflow": [
    {
      "name": "Analyze",
      "steps": [
        { "tool": "readFile", "params": { "path": "{{filePath}}" } },
        { "tool": "wordCount", "params": { "text": "{{readFile}}" } }
      ]
    }
  ]
}
```

### Pattern 2: Data Processing

```json
{
  "workflow": [
    {
      "name": "Process CSV",
      "steps": [
        { "tool": "readFile", "params": { "path": "data.csv" } },
        { "tool": "parseCSV", "params": { "data": "{{readFile}}" } },
        { "tool": "filterData", "params": { 
          "data": "{{parseCSV.rows}}", 
          "key": "status", 
          "value": "active" 
        }}
      ]
    }
  ]
}
```

### Pattern 3: Text Search

```json
{
  "workflow": [
    {
      "name": "Search",
      "steps": [
        { "tool": "readFile", "params": { "path": "{{logFile}}" } },
        { "tool": "grep", "params": { 
          "text": "{{readFile}}", 
          "pattern": "ERROR",
          "caseInsensitive": true
        }}
      ]
    }
  ]
}
```

## Next Steps

- Read the [Quick Start Guide](../QUICKSTART.md)
- Review the [Complete Agent Guide](../AGENT_GUIDE.md)
- Run the demo: `node demo-agent.js` from the root directory
- Test the system: `node test-agent.js` from the root directory

## Questions?

Check the main documentation:
- [Quick Start](../QUICKSTART.md)
- [Agent Guide](../AGENT_GUIDE.md)
- [Main README](../README.md)
