# Quick Start Guide - Chat LLM Agent System

## Installation

No installation needed! The agent system is built into Chat LLM.

## 5-Minute Quick Start

### 1. Run the Demo

See all agent capabilities in action:

```bash
node demo-agent.js
```

### 2. Enable Agent Mode

```bash
export AGENT_MODE=true
export AGENT_CONFIG=examples/agents/swiss-army-knife.json
./chat-llm.js
```

### 3. Try Interactive Commands

Once in agent mode, try these commands:

```
/agent help         # Show available commands
/agent tools        # List all tools
/agent config       # Show current configuration
```

### 4. Run Your First Task

Create a simple task configuration:

```json
{
  "name": "My First Agent",
  "version": "1.0.0",
  "workflow": [
    {
      "name": "Hello World",
      "steps": [
        {
          "tool": "getTimestamp",
          "params": { "format": "iso" }
        }
      ]
    }
  ]
}
```

Save it as `my-agent.json` and run:

```bash
export AGENT_MODE=true
export AGENT_CONFIG=my-agent.json
./chat-llm.js
```

## Common Use Cases

### File Analysis

```bash
export AGENT_CONFIG=examples/agents/file-analyzer.json
export AGENT_MODE=true
./chat-llm.js
```

### Data Processing

```bash
export AGENT_CONFIG=examples/agents/data-processor.json
export AGENT_MODE=true
./chat-llm.js
```

### Text Search

```bash
export AGENT_CONFIG=examples/agents/text-searcher.json
export AGENT_MODE=true
./chat-llm.js
```

## Environment Variables

- `AGENT_MODE` - Set to `true` to enable agent mode
- `AGENT_CONFIG` - Path to agent configuration file
- `AGENT_VERBOSE` - Set to `true` for detailed logs

## Next Steps

1. Read the [complete Agent Guide](AGENT_GUIDE.md)
2. Explore example configurations in `examples/agents/`
3. Run the test suite: `node test-agent.js`
4. Create your own custom agent configurations

## Getting Help

- Check the [Agent Guide](AGENT_GUIDE.md) for detailed documentation
- Look at example configurations in `examples/agents/`
- Run `/agent help` in interactive mode
- Review available tools with `/agent tools`

## Examples

### Example 1: Count Words in a File

```json
{
  "name": "Word Counter",
  "workflow": [
    {
      "name": "Count",
      "steps": [
        { "tool": "readFile", "params": { "path": "README.md" } },
        { "tool": "wordCount", "params": { "text": "{{readFile}}" } }
      ]
    }
  ]
}
```

### Example 2: Process CSV Data

```json
{
  "name": "CSV Processor",
  "workflow": [
    {
      "name": "Load Data",
      "steps": [
        { "tool": "readFile", "params": { "path": "data.csv" } },
        { "tool": "parseCSV", "params": { "data": "{{readFile}}" } }
      ]
    }
  ]
}
```

### Example 3: Math Calculations

```json
{
  "name": "Calculator",
  "workflow": [
    {
      "name": "Calculate",
      "steps": [
        { "tool": "calculate", "params": { "expression": "100 * 2 + 50" } }
      ]
    }
  ]
}
```

## Tips

1. Start with simple workflows and build complexity gradually
2. Use `AGENT_VERBOSE=true` for debugging
3. Reference previous step results with `{{toolName}}`
4. Use dot notation for nested properties: `{{parseCSV.rows}}`
5. Check the test suite (`test-agent.js`) for more examples

Happy automating! 🚀
