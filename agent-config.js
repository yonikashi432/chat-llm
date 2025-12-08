#!/usr/bin/env node

/**
 * Agent Configuration System
 * Handles loading and managing agent configurations, tasks, and workflows
 */

const fs = require('fs');
const path = require('path');

/**
 * Load agent configuration from a file
 * Supports JSON and YAML-like formats
 */
const loadConfig = (configPath) => {
    if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file not found: ${configPath}`);
    }

    const content = fs.readFileSync(configPath, 'utf-8');
    const ext = path.extname(configPath).toLowerCase();

    if (ext === '.json') {
        return JSON.parse(content);
    } else {
        // For simplicity, treat other formats as JSON too
        // In a production system, you'd add YAML parsing here
        return JSON.parse(content);
    }
};

/**
 * Validate agent configuration
 */
const validateConfig = (config) => {
    if (!config.name) {
        throw new Error('Agent configuration must have a name');
    }

    if (!config.tasks && !config.workflow) {
        throw new Error('Agent configuration must have either tasks or workflow');
    }

    if (config.tasks && !Array.isArray(config.tasks)) {
        throw new Error('Tasks must be an array');
    }

    if (config.workflow && !Array.isArray(config.workflow)) {
        throw new Error('Workflow must be an array');
    }

    return true;
};

/**
 * Create a default agent configuration
 */
const createDefaultConfig = () => {
    return {
        name: 'Default Agent',
        description: 'A general-purpose AI agent',
        version: '1.0.0',
        tasks: [],
        workflow: [],
        settings: {
            maxRetries: 3,
            timeout: 30000,
            verbose: false
        }
    };
};

/**
 * Save configuration to file
 */
const saveConfig = (config, configPath) => {
    validateConfig(config);
    const content = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, content, 'utf-8');
    return true;
};

/**
 * Merge configurations
 */
const mergeConfigs = (baseConfig, overrideConfig) => {
    return {
        ...baseConfig,
        ...overrideConfig,
        settings: {
            ...baseConfig.settings,
            ...overrideConfig.settings
        },
        tasks: [
            ...(baseConfig.tasks || []),
            ...(overrideConfig.tasks || [])
        ],
        workflow: overrideConfig.workflow || baseConfig.workflow || []
    };
};

/**
 * Task templates for common operations
 */
const taskTemplates = {
    fileAnalysis: {
        name: 'File Analysis',
        description: 'Analyze file contents',
        steps: [
            { tool: 'readFile', params: { path: '{{filePath}}' } },
            { tool: 'wordCount', params: { text: '{{fileContent}}' } }
        ]
    },
    dataProcessing: {
        name: 'Data Processing',
        description: 'Process CSV or JSON data',
        steps: [
            { tool: 'readFile', params: { path: '{{dataPath}}' } },
            { tool: 'parseCSV', params: { data: '{{fileContent}}' } },
            { tool: 'filterData', params: { data: '{{parsedData}}', key: '{{filterKey}}', value: '{{filterValue}}' } }
        ]
    },
    textSearch: {
        name: 'Text Search',
        description: 'Search for patterns in text files',
        steps: [
            { tool: 'readFile', params: { path: '{{filePath}}' } },
            { tool: 'grep', params: { text: '{{fileContent}}', pattern: '{{searchPattern}}' } }
        ]
    },
    codeExecution: {
        name: 'Code Execution',
        description: 'Execute shell commands',
        steps: [
            { tool: 'executeCommand', params: { command: '{{command}}', timeout: 30000 } }
        ]
    }
};

/**
 * Get task template by name
 */
const getTaskTemplate = (templateName) => {
    return taskTemplates[templateName] || null;
};

/**
 * Get all available templates
 */
const getAvailableTemplates = () => {
    return Object.keys(taskTemplates);
};

/**
 * Create task from template
 */
const createTaskFromTemplate = (templateName, variables = {}) => {
    const template = getTaskTemplate(templateName);
    if (!template) {
        throw new Error(`Template not found: ${templateName}`);
    }

    // Deep clone the template
    const task = JSON.parse(JSON.stringify(template));

    // Replace variables in the task
    const replaceVariables = (obj) => {
        if (typeof obj === 'string') {
            return obj.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                return variables[key] !== undefined ? variables[key] : match;
            });
        } else if (Array.isArray(obj)) {
            return obj.map(replaceVariables);
        } else if (typeof obj === 'object' && obj !== null) {
            const result = {};
            for (const key in obj) {
                result[key] = replaceVariables(obj[key]);
            }
            return result;
        }
        return obj;
    };

    return replaceVariables(task);
};

module.exports = {
    loadConfig,
    validateConfig,
    createDefaultConfig,
    saveConfig,
    mergeConfigs,
    getTaskTemplate,
    getAvailableTemplates,
    createTaskFromTemplate,
    taskTemplates
};
