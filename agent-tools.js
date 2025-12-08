#!/usr/bin/env node

/**
 * Agent Tools - A collection of built-in tools for the multi-purpose agent
 * Each tool is a function that can be invoked by the agent to perform specific tasks
 */

const fs = require('fs');
const { execSync } = require('child_process');

/**
 * File System Tools
 */
const fileTools = {
    /**
     * Read file contents
     */
    readFile: async (params) => {
        const { path } = params;
        if (!fs.existsSync(path)) {
            throw new Error(`File not found: ${path}`);
        }
        return fs.readFileSync(path, 'utf-8');
    },

    /**
     * Write to file
     */
    writeFile: async (params) => {
        const { path, content } = params;
        fs.writeFileSync(path, content, 'utf-8');
        return `Successfully wrote to ${path}`;
    },

    /**
     * List directory contents
     */
    listDirectory: async (params) => {
        const { path = '.' } = params;
        if (!fs.existsSync(path)) {
            throw new Error(`Directory not found: ${path}`);
        }
        return fs.readdirSync(path);
    },

    /**
     * Check if file/directory exists
     */
    fileExists: async (params) => {
        const { path } = params;
        return fs.existsSync(path);
    }
};

/**
 * Data Processing Tools
 */
const dataTools = {
    /**
     * Parse JSON data
     */
    parseJSON: async (params) => {
        const { data } = params;
        return JSON.parse(data);
    },

    /**
     * Parse CSV data
     */
    parseCSV: async (params) => {
        const { data, delimiter = ',' } = params;
        const lines = data.trim().split('\n');
        const headers = lines[0].split(delimiter).map(h => h.trim());
        const rows = lines.slice(1).map(line => {
            const values = line.split(delimiter).map(v => v.trim());
            const obj = {};
            headers.forEach((header, i) => {
                obj[header] = values[i] || '';
            });
            return obj;
        });
        return { headers, rows };
    },

    /**
     * Filter array data
     */
    filterData: async (params) => {
        const { data, key, value } = params;
        if (!Array.isArray(data)) {
            throw new Error('Data must be an array');
        }
        return data.filter(item => item[key] === value);
    },

    /**
     * Sort array data
     */
    sortData: async (params) => {
        const { data, key, order = 'asc' } = params;
        if (!Array.isArray(data)) {
            throw new Error('Data must be an array');
        }
        return data.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            if (order === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    },

    /**
     * Aggregate/summarize data
     */
    aggregateData: async (params) => {
        const { data, groupBy, aggregateKey, operation = 'sum' } = params;
        if (!Array.isArray(data)) {
            throw new Error('Data must be an array');
        }
        const groups = {};
        data.forEach(item => {
            const key = item[groupBy];
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        });

        const result = {};
        Object.keys(groups).forEach(key => {
            const items = groups[key];
            if (operation === 'sum') {
                result[key] = items.reduce((sum, item) => sum + (parseFloat(item[aggregateKey]) || 0), 0);
            } else if (operation === 'count') {
                result[key] = items.length;
            } else if (operation === 'avg') {
                const sum = items.reduce((s, item) => s + (parseFloat(item[aggregateKey]) || 0), 0);
                result[key] = sum / items.length;
            }
        });
        return result;
    }
};

/**
 * Text Processing Tools
 */
const textTools = {
    /**
     * Count words in text
     */
    wordCount: async (params) => {
        const { text } = params;
        const words = text.trim().split(/\s+/);
        return words.length;
    },

    /**
     * Extract lines matching pattern
     */
    grep: async (params) => {
        const { text, pattern, caseInsensitive = false } = params;
        const flags = caseInsensitive ? 'gi' : 'g';
        const regex = new RegExp(pattern, flags);
        const lines = text.split('\n');
        return lines.filter(line => regex.test(line));
    },

    /**
     * Replace text pattern
     */
    replace: async (params) => {
        const { text, pattern, replacement, global = true } = params;
        const flags = global ? 'g' : '';
        const regex = new RegExp(pattern, flags);
        return text.replace(regex, replacement);
    },

    /**
     * Extract substring
     */
    substring: async (params) => {
        const { text, start, end } = params;
        return text.substring(start, end);
    },

    /**
     * Split text
     */
    split: async (params) => {
        const { text, delimiter = '\n' } = params;
        return text.split(delimiter);
    },

    /**
     * Join array into text
     */
    join: async (params) => {
        const { array, delimiter = '\n' } = params;
        return array.join(delimiter);
    }
};

/**
 * System/Shell Tools
 */
const systemTools = {
    /**
     * Execute shell command (⚠️ SECURITY WARNING: Use with extreme caution!)
     * 
     * This tool allows arbitrary command execution and should only be used in trusted
     * environments with validated input. Consider the security implications:
     * - Can execute any system command
     * - May access sensitive files
     * - Could modify system state
     * 
     * Only use when absolutely necessary and with sanitized inputs.
     */
    executeCommand: async (params) => {
        const { command, timeout = 30000 } = params;
        
        // Security check: Warn if command contains potentially dangerous patterns
        const dangerousPatterns = ['rm -rf', 'dd if=', 'mkfs', ':(){', '>(){ :', 'fork'];
        const isDangerous = dangerousPatterns.some(pattern => command.includes(pattern));
        
        if (isDangerous) {
            throw new Error('Command contains potentially dangerous operations and was blocked for safety');
        }
        
        try {
            const output = execSync(command, { 
                timeout,
                encoding: 'utf-8',
                maxBuffer: 1024 * 1024 * 10, // 10MB
                shell: '/bin/sh' // Use explicit shell
            });
            return output;
        } catch (error) {
            throw new Error(`Command failed: ${error.message}`);
        }
    },

    /**
     * Get environment variable
     */
    getEnv: async (params) => {
        const { name } = params;
        return process.env[name] || null;
    },

    /**
     * Get current timestamp
     */
    getTimestamp: async (params) => {
        const { format = 'iso' } = params;
        const now = new Date();
        if (format === 'iso') {
            return now.toISOString();
        } else if (format === 'unix') {
            return Math.floor(now.getTime() / 1000);
        } else {
            return now.toString();
        }
    }
};

/**
 * Math/Calculation Tools
 */
const mathTools = {
    /**
     * Calculate mathematical expression
     * 
     * Security Note: This uses a restricted evaluator that only allows
     * basic arithmetic operations (+, -, *, /, parentheses, and numbers).
     * All other characters are stripped before evaluation.
     */
    calculate: async (params) => {
        const { expression } = params;
        
        // Validate expression length to prevent DoS
        if (expression.length > 1000) {
            throw new Error('Expression too long (max 1000 characters)');
        }
        
        // Safe eval alternative - only allows basic math
        const safeEval = (expr) => {
            // Remove any non-math characters (only allow numbers, operators, parentheses, decimal point, and spaces)
            const cleaned = expr.replace(/[^0-9+\-*/().\s]/g, '');
            
            // Additional validation: ensure cleaned string is not empty
            if (!cleaned || cleaned.trim().length === 0) {
                throw new Error('Invalid mathematical expression: no valid math operators or numbers found');
            }
            
            // Check for balanced parentheses
            let balance = 0;
            for (const char of cleaned) {
                if (char === '(') balance++;
                if (char === ')') balance--;
                if (balance < 0) {
                    throw new Error('Invalid mathematical expression: unbalanced parentheses');
                }
            }
            if (balance !== 0) {
                throw new Error('Invalid mathematical expression: unbalanced parentheses');
            }
            
            try {
                // Use Function constructor in strict mode - safer than eval
                // Only mathematical operations are possible due to character filtering
                return Function(`"use strict"; return (${cleaned})`)();
            } catch (error) {
                throw new Error('Invalid mathematical expression: ' + error.message);
            }
        };
        
        return safeEval(expression);
    },

    /**
     * Generate random number
     */
    random: async (params) => {
        const { min = 0, max = 1 } = params;
        return Math.random() * (max - min) + min;
    },

    /**
     * Round number
     */
    round: async (params) => {
        const { number, decimals = 0 } = params;
        const multiplier = Math.pow(10, decimals);
        return Math.round(number * multiplier) / multiplier;
    }
};

/**
 * All available tools registry
 */
const allTools = {
    ...fileTools,
    ...dataTools,
    ...textTools,
    ...systemTools,
    ...mathTools
};

/**
 * Execute a tool by name
 */
const executeTool = async (toolName, params) => {
    if (!allTools[toolName]) {
        throw new Error(`Unknown tool: ${toolName}`);
    }
    return await allTools[toolName](params);
};

/**
 * Get list of available tools
 */
const getAvailableTools = () => {
    return Object.keys(allTools);
};

/**
 * Get tools by category
 */
const getToolsByCategory = () => {
    return {
        file: Object.keys(fileTools),
        data: Object.keys(dataTools),
        text: Object.keys(textTools),
        system: Object.keys(systemTools),
        math: Object.keys(mathTools)
    };
};

module.exports = {
    executeTool,
    getAvailableTools,
    getToolsByCategory,
    allTools
};
