#!/usr/bin/env node

/**
 * @fileoverview Enhanced Agent Tools v2.0 - Additional utilities
 * @version 2.0.0
 * 
 * Additional tools for HTTP requests, JSON schema validation,
 * advanced data processing, and more.
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * HTTP/Network Tools
 * Tools for making HTTP requests and network operations
 */
const networkTools = {
    /**
     * Make HTTP/HTTPS request
     * @param {Object} params
     * @param {string} params.url - URL to request
     * @param {string} [params.method='GET'] - HTTP method
     * @param {Object} [params.headers] - Request headers
     * @param {string} [params.body] - Request body (for POST/PUT)
     * @param {number} [params.timeout=30000] - Request timeout in ms
     * @returns {Promise<Object>} Response with status, headers, and body
     */
    httpRequest: async (params) => {
        const { url, method = 'GET', headers = {}, body, timeout = 30000 } = params;
        
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const protocol = parsedUrl.protocol === 'https:' ? https : http;
            
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port,
                path: parsedUrl.pathname + parsedUrl.search,
                method,
                headers: {
                    'User-Agent': 'Chat-LLM-Agent/2.0',
                    ...headers
                },
                timeout
            };
            
            if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                options.headers['Content-Length'] = Buffer.byteLength(body);
            }
            
            const req = protocol.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                });
            });
            
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error(`Request timeout after ${timeout}ms`));
            });
            
            if (body) {
                req.write(body);
            }
            
            req.end();
        });
    },

    /**
     * Parse JSON from HTTP response
     * @param {Object} params
     * @param {string} params.url - URL to fetch JSON from
     * @param {Object} [params.headers] - Request headers
     * @returns {Promise<Object>} Parsed JSON response
     */
    fetchJSON: async (params) => {
        const { url, headers = {} } = params;
        const response = await networkTools.httpRequest({
            url,
            method: 'GET',
            headers: { 'Accept': 'application/json', ...headers }
        });
        
        if (response.status < 200 || response.status >= 300) {
            throw new Error(`HTTP ${response.status}: ${response.body}`);
        }
        
        return JSON.parse(response.body);
    }
};

/**
 * Validation Tools
 * Tools for validating data against schemas and patterns
 */
const validationTools = {
    /**
     * Validate JSON schema (basic implementation)
     * @param {Object} params
     * @param {Object} params.data - Data to validate
     * @param {Object} params.schema - JSON schema
     * @returns {Promise<Object>} Validation result
     */
    validateSchema: async (params) => {
        const { data, schema } = params;
        
        const errors = [];
        
        // Basic type validation
        if (schema.type) {
            const dataType = Array.isArray(data) ? 'array' : typeof data;
            if (dataType !== schema.type) {
                errors.push(`Expected type ${schema.type}, got ${dataType}`);
            }
        }
        
        // Required properties
        if (schema.required && typeof data === 'object') {
            for (const prop of schema.required) {
                if (!(prop in data)) {
                    errors.push(`Missing required property: ${prop}`);
                }
            }
        }
        
        // Properties validation
        if (schema.properties && typeof data === 'object') {
            for (const [key, propSchema] of Object.entries(schema.properties)) {
                if (key in data) {
                    const propType = typeof data[key];
                    if (propSchema.type && propType !== propSchema.type) {
                        errors.push(`Property ${key}: expected ${propSchema.type}, got ${propType}`);
                    }
                }
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Validate email address
     * @param {Object} params
     * @param {string} params.email - Email to validate
     * @returns {Promise<boolean>} True if valid email
     */
    validateEmail: async (params) => {
        const { email } = params;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate URL
     * @param {Object} params
     * @param {string} params.url - URL to validate
     * @returns {Promise<boolean>} True if valid URL
     */
    validateURL: async (params) => {
        const { url } = params;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
};

/**
 * Advanced Data Processing Tools
 */
const advancedDataTools = {
    /**
     * Transform data using a mapping function
     * @param {Object} params
     * @param {Array} params.data - Array of data to transform
     * @param {string} params.operation - Operation: 'map', 'select', 'rename'
     * @param {Object} params.mapping - Mapping configuration
     * @returns {Promise<Array>} Transformed data
     */
    transformData: async (params) => {
        const { data, operation, mapping } = params;
        
        if (!Array.isArray(data)) {
            throw new Error('Data must be an array');
        }
        
        switch (operation) {
            case 'select':
                // Select specific fields
                return data.map(item => {
                    const selected = {};
                    for (const field of mapping.fields || []) {
                        if (field in item) {
                            selected[field] = item[field];
                        }
                    }
                    return selected;
                });
                
            case 'rename':
                // Rename fields
                return data.map(item => {
                    const renamed = { ...item };
                    for (const [oldName, newName] of Object.entries(mapping.fields || {})) {
                        if (oldName in renamed) {
                            renamed[newName] = renamed[oldName];
                            delete renamed[oldName];
                        }
                    }
                    return renamed;
                });
                
            case 'compute':
                // Add computed fields
                return data.map(item => {
                    const computed = { ...item };
                    for (const [field, expression] of Object.entries(mapping.fields || {})) {
                        // Simple expression evaluation (e.g., "price * quantity")
                        try {
                            const value = new Function('item', `return ${expression}`)(item);
                            computed[field] = value;
                        } catch (e) {
                            computed[field] = null;
                        }
                    }
                    return computed;
                });
                
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
    },

    /**
     * Merge multiple arrays of data
     * @param {Object} params
     * @param {Array<Array>} params.datasets - Arrays to merge
     * @param {string} [params.joinKey] - Key to join on
     * @param {string} [params.type='concat'] - Merge type: 'concat' or 'join'
     * @returns {Promise<Array>} Merged data
     */
    mergeData: async (params) => {
        const { datasets, joinKey, type = 'concat' } = params;
        
        if (!Array.isArray(datasets) || datasets.length === 0) {
            throw new Error('Datasets must be a non-empty array');
        }
        
        if (type === 'concat') {
            return datasets.flat();
        } else if (type === 'join' && joinKey) {
            // Inner join on key
            const [first, ...rest] = datasets;
            let result = first;
            
            for (const dataset of rest) {
                const joined = [];
                for (const item1 of result) {
                    for (const item2 of dataset) {
                        if (item1[joinKey] === item2[joinKey]) {
                            joined.push({ ...item1, ...item2 });
                        }
                    }
                }
                result = joined;
            }
            
            return result;
        }
        
        throw new Error('Invalid merge type or missing joinKey');
    },

    /**
     * Deduplicate data
     * @param {Object} params
     * @param {Array} params.data - Data to deduplicate
     * @param {string} [params.key] - Key to use for deduplication
     * @returns {Promise<Array>} Deduplicated data
     */
    deduplicateData: async (params) => {
        const { data, key } = params;
        
        if (!Array.isArray(data)) {
            throw new Error('Data must be an array');
        }
        
        if (key) {
            const seen = new Set();
            return data.filter(item => {
                const value = item[key];
                if (seen.has(value)) {
                    return false;
                }
                seen.add(value);
                return true;
            });
        } else {
            // Deduplicate by stringified value
            const seen = new Set();
            return data.filter(item => {
                const str = JSON.stringify(item);
                if (seen.has(str)) {
                    return false;
                }
                seen.add(str);
                return true;
            });
        }
    }
};

/**
 * Environment and Configuration Tools
 */
const envTools = {
    /**
     * Set environment variable (runtime only, not persistent)
     * @param {Object} params
     * @param {string} params.name - Variable name
     * @param {string} params.value - Variable value
     * @returns {Promise<string>} Success message
     */
    setEnv: async (params) => {
        const { name, value } = params;
        process.env[name] = value;
        return `Environment variable ${name} set`;
    },

    /**
     * Get multiple environment variables
     * @param {Object} params
     * @param {Array<string>} params.names - Variable names to get
     * @returns {Promise<Object>} Object with variable values
     */
    getEnvVars: async (params) => {
        const { names } = params;
        const result = {};
        for (const name of names) {
            result[name] = process.env[name] || null;
        }
        return result;
    },

    /**
     * List all environment variables (filtered)
     * @param {Object} params
     * @param {string} [params.prefix] - Only return vars starting with prefix
     * @returns {Promise<Object>} Environment variables
     */
    listEnv: async (params) => {
        const { prefix } = params;
        const env = process.env;
        
        if (prefix) {
            const filtered = {};
            for (const [key, value] of Object.entries(env)) {
                if (key.startsWith(prefix)) {
                    filtered[key] = value;
                }
            }
            return filtered;
        }
        
        return { ...env };
    }
};

module.exports = {
    networkTools,
    validationTools,
    advancedDataTools,
    envTools
};
