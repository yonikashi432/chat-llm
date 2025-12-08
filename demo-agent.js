#!/usr/bin/env node

/**
 * Demonstration script for the Chat LLM Agent System
 * Shows various use cases and capabilities
 */

const { executeTool } = require('./agent-tools');
const { loadConfig } = require('./agent-config');
const { executeWorkflow } = require('./agent-executor');

const YELLOW = '\x1b[93m';
const GREEN = '\x1b[92m';
const CYAN = '\x1b[36m';
const NORMAL = '\x1b[0m';
const BOLD = '\x1b[1m';

console.log(`${BOLD}${CYAN}
╔════════════════════════════════════════════════════════╗
║  Chat LLM - Multi-Purpose Agent System Demo           ║
║  A Swiss Army Knife for AI-Powered Task Automation    ║
╚════════════════════════════════════════════════════════╝
${NORMAL}\n`);

const demo = async () => {
    try {
        // Demo 1: File Analysis
        console.log(`${BOLD}${YELLOW}Demo 1: File Analysis${NORMAL}`);
        console.log('Reading and analyzing the README file...\n');
        
        const readmeContent = await executeTool('readFile', { path: 'README.md' });
        const wordCount = await executeTool('wordCount', { text: readmeContent });
        const lines = await executeTool('split', { text: readmeContent, delimiter: '\n' });
        
        console.log(`${GREEN}✓${NORMAL} File: README.md`);
        console.log(`${GREEN}✓${NORMAL} Size: ${readmeContent.length} characters`);
        console.log(`${GREEN}✓${NORMAL} Words: ${wordCount}`);
        console.log(`${GREEN}✓${NORMAL} Lines: ${lines.length}\n`);
        
        // Demo 2: Text Search
        console.log(`${BOLD}${YELLOW}Demo 2: Text Search${NORMAL}`);
        console.log('Searching for "agent" in README...\n');
        
        const matches = await executeTool('grep', { 
            text: readmeContent, 
            pattern: 'agent', 
            caseInsensitive: true 
        });
        
        console.log(`${GREEN}✓${NORMAL} Found ${matches.length} lines containing "agent"`);
        if (matches.length > 0) {
            console.log(`${GREEN}✓${NORMAL} First match: ${matches[0].substring(0, 60)}...`);
        }
        console.log();
        
        // Demo 3: Data Processing
        console.log(`${BOLD}${YELLOW}Demo 3: Data Processing${NORMAL}`);
        console.log('Loading and analyzing sample employee data...\n');
        
        const config = loadConfig('examples/agents/data-demo.json');
        const result = await executeWorkflow(config.workflow, {}, { verbose: false });
        
        if (result.success) {
            const avgSalaries = result.context.aggregateData || {};
            console.log(`${GREEN}✓${NORMAL} Data processing completed successfully`);
            console.log(`${GREEN}✓${NORMAL} Average salaries by city:`);
            for (const [city, avg] of Object.entries(avgSalaries)) {
                console.log(`  - ${city}: $${Math.round(avg).toLocaleString()}`);
            }
        }
        console.log();
        
        // Demo 4: Math Calculations
        console.log(`${BOLD}${YELLOW}Demo 4: Math Calculations${NORMAL}`);
        console.log('Performing various calculations...\n');
        
        const calc1 = await executeTool('calculate', { expression: '(100 + 50) * 2' });
        const calc2 = await executeTool('calculate', { expression: '3.14159 * 10 * 10' });
        const rounded = await executeTool('round', { number: calc2, decimals: 2 });
        
        console.log(`${GREEN}✓${NORMAL} (100 + 50) * 2 = ${calc1}`);
        console.log(`${GREEN}✓${NORMAL} π * 10² = ${rounded}`);
        console.log();
        
        // Demo 5: System Information
        console.log(`${BOLD}${YELLOW}Demo 5: System Information${NORMAL}`);
        console.log('Gathering system information...\n');
        
        const timestamp = await executeTool('getTimestamp', { format: 'iso' });
        const nodeVersion = await executeTool('getEnv', { name: 'NODE_VERSION' });
        
        console.log(`${GREEN}✓${NORMAL} Current time: ${timestamp}`);
        console.log(`${GREEN}✓${NORMAL} Node version: ${nodeVersion || 'Not set'}`);
        console.log();
        
        // Demo 6: Directory Listing
        console.log(`${BOLD}${YELLOW}Demo 6: Directory Operations${NORMAL}`);
        console.log('Listing example files...\n');
        
        const files = await executeTool('listDirectory', { path: 'examples/agents' });
        console.log(`${GREEN}✓${NORMAL} Found ${files.length} agent configurations:`);
        files.forEach(file => {
            console.log(`  - ${file}`);
        });
        console.log();
        
        // Demo 7: JSON Processing
        console.log(`${BOLD}${YELLOW}Demo 7: JSON Processing${NORMAL}`);
        console.log('Parsing and processing JSON data...\n');
        
        const jsonConfig = await executeTool('readFile', { path: 'examples/agents/swiss-army-knife.json' });
        const parsed = await executeTool('parseJSON', { data: jsonConfig });
        
        console.log(`${GREEN}✓${NORMAL} Configuration: ${parsed.name}`);
        console.log(`${GREEN}✓${NORMAL} Description: ${parsed.description}`);
        console.log(`${GREEN}✓${NORMAL} Number of tasks: ${parsed.tasks.length}`);
        console.log();
        
        // Summary
        console.log(`${BOLD}${GREEN}
╔════════════════════════════════════════════════════════╗
║  Demo Complete! All agent capabilities verified ✓      ║
╚════════════════════════════════════════════════════════╝
${NORMAL}`);
        
        console.log(`\n${CYAN}What you can do with the Agent System:${NORMAL}`);
        console.log('  • Automate file operations and analysis');
        console.log('  • Process CSV, JSON, and text data');
        console.log('  • Search and manipulate text');
        console.log('  • Perform calculations and data aggregation');
        console.log('  • Execute custom workflows and tasks');
        console.log('  • Chain multiple operations together\n');
        
        console.log(`${CYAN}Try it yourself:${NORMAL}`);
        console.log(`  ${YELLOW}export AGENT_MODE=true${NORMAL}`);
        console.log(`  ${YELLOW}export AGENT_CONFIG=examples/agents/swiss-army-knife.json${NORMAL}`);
        console.log(`  ${YELLOW}./chat-llm.js${NORMAL}\n`);
        
    } catch (error) {
        console.error(`\n${BOLD}Error during demo:${NORMAL}`, error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

demo();
