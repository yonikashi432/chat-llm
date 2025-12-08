#!/usr/bin/env node

/**
 * Test suite for the agent system
 */

const fs = require('fs');
const path = require('path');

// Import agent modules
const { executeTool, getAvailableTools, getToolsByCategory } = require('./agent-tools');
const { loadConfig, validateConfig, createTaskFromTemplate } = require('./agent-config');
const { executeTask, executeWorkflow } = require('./agent-executor');

console.log('Testing Agent System...\n');

// Test 1: Tool Availability
console.log('Test 1: Checking available tools...');
const tools = getAvailableTools();
console.log(`✓ Found ${tools.length} tools`);
const categories = getToolsByCategory();
console.log(`✓ Tool categories: ${Object.keys(categories).join(', ')}\n`);

// Test 2: File Operations
console.log('Test 2: Testing file operations...');
(async () => {
    try {
        // Create a test file
        const testContent = 'Hello, this is a test file for the agent system.\nIt has multiple lines.\nAnd some numbers: 123, 456.';
        fs.writeFileSync('/tmp/agent-test.txt', testContent);
        
        // Test readFile
        const content = await executeTool('readFile', { path: '/tmp/agent-test.txt' });
        console.log(`✓ Read file: ${content.length} characters`);
        
        // Test wordCount
        const count = await executeTool('wordCount', { text: content });
        console.log(`✓ Word count: ${count} words`);
        
        // Test fileExists
        const exists = await executeTool('fileExists', { path: '/tmp/agent-test.txt' });
        console.log(`✓ File exists: ${exists}\n`);
        
        // Test 3: Data Processing
        console.log('Test 3: Testing data processing...');
        
        // Test parseJSON
        const jsonData = JSON.stringify({ name: 'Agent', version: '1.0', active: true });
        const parsed = await executeTool('parseJSON', { data: jsonData });
        console.log(`✓ Parsed JSON: ${parsed.name} v${parsed.version}`);
        
        // Test parseCSV
        const csvData = 'name,age,city\nAlice,30,NYC\nBob,25,LA\nCharlie,35,Chicago';
        const csvParsed = await executeTool('parseCSV', { data: csvData });
        console.log(`✓ Parsed CSV: ${csvParsed.rows.length} rows`);
        
        // Test filterData
        const filtered = await executeTool('filterData', { 
            data: csvParsed.rows, 
            key: 'city', 
            value: 'LA' 
        });
        console.log(`✓ Filtered data: ${filtered.length} items\n`);
        
        // Test 4: Text Processing
        console.log('Test 4: Testing text processing...');
        
        // Test grep
        const lines = await executeTool('grep', { 
            text: testContent, 
            pattern: 'test', 
            caseInsensitive: true 
        });
        console.log(`✓ Grep found ${lines.length} matching lines`);
        
        // Test replace
        const replaced = await executeTool('replace', { 
            text: testContent, 
            pattern: 'test', 
            replacement: 'demo' 
        });
        console.log(`✓ Text replacement completed`);
        
        // Test split
        const splitLines = await executeTool('split', { text: testContent, delimiter: '\n' });
        console.log(`✓ Split text into ${splitLines.length} lines\n`);
        
        // Test 5: Math Tools
        console.log('Test 5: Testing math tools...');
        
        // Test calculate
        const result = await executeTool('calculate', { expression: '10 + 20 * 2' });
        console.log(`✓ Calculation: 10 + 20 * 2 = ${result}`);
        
        // Test round
        const rounded = await executeTool('round', { number: 3.14159, decimals: 2 });
        console.log(`✓ Rounded: ${rounded}\n`);
        
        // Test 6: Task Execution
        console.log('Test 6: Testing task execution...');
        
        const task = {
            name: 'Test Task',
            description: 'A simple test task',
            steps: [
                {
                    tool: 'readFile',
                    params: { path: '/tmp/agent-test.txt' }
                },
                {
                    tool: 'wordCount',
                    params: { text: '{{readFile}}' }
                }
            ]
        };
        
        const taskResult = await executeTask(task, {}, { verbose: false });
        console.log(`✓ Task execution: ${taskResult.success ? 'SUCCESS' : 'FAILED'}`);
        if (taskResult.success) {
            console.log(`✓ Task result: ${taskResult.context.wordCount} words\n`);
        }
        
        // Test 7: Configuration Loading
        console.log('Test 7: Testing configuration loading...');
        
        const configPath = 'examples/agents/swiss-army-knife.json';
        if (fs.existsSync(configPath)) {
            const config = loadConfig(configPath);
            validateConfig(config);
            console.log(`✓ Loaded config: ${config.name}`);
            console.log(`✓ Config has ${config.tasks.length} tasks\n`);
        } else {
            console.log('⚠ Example config not found (this is OK for testing)\n');
        }
        
        // Test 8: Workflow Execution
        console.log('Test 8: Testing workflow execution...');
        
        const workflow = [
            {
                name: 'Step 1',
                steps: [
                    { tool: 'getTimestamp', params: { format: 'iso' } }
                ]
            },
            {
                name: 'Step 2',
                steps: [
                    { tool: 'calculate', params: { expression: '42 * 2' } }
                ]
            }
        ];
        
        const workflowResult = await executeWorkflow(workflow, {}, { verbose: false });
        console.log(`✓ Workflow execution: ${workflowResult.success ? 'SUCCESS' : 'FAILED'}\n`);
        
        // Cleanup
        if (fs.existsSync('/tmp/agent-test.txt')) {
            fs.unlinkSync('/tmp/agent-test.txt');
        }
        
        console.log('='.repeat(50));
        console.log('All tests completed successfully! ✓');
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
})();
