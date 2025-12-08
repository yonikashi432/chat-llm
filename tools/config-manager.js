/**
 * Configuration management for Chat LLM v2
 * Handles application settings, profiles, and user preferences
 * 
 * @module ConfigManager
 * @author yonikashi432
 * @version 2.0.0
 */

const fs = require('fs');
const path = require('path');

/**
 * ConfigManager - Centralized configuration management
 * Provides persistent storage for application settings with support for
 * nested keys, profiles, and runtime updates.
 */
class ConfigManager {
    /**
     * Initialize the configuration manager
     * 
     * @param {string} configDir - Directory to store configuration files
     */
    constructor(configDir = './config') {
        this.configDir = configDir;
        this.configFile = path.join(configDir, 'settings.json');
        this.profilesDir = path.join(configDir, 'profiles');
        this.defaultConfig = {
            version: '2.0',
            apiDefaults: {
                timeout: 30,
                retries: 3,
                streaming: true
            },
            caching: {
                enabled: true,
                ttl: 86400000 // 24 hours
            },
            logging: {
                enabled: true,
                level: 'info',
                maxFileSize: 10485760 // 10MB
            },
            models: {
                default: 'gpt-4',
                temperature: 0.7,
                maxTokens: 2000
            }
        };
        this.ensureConfigDir();
        this.loadConfig();
    }

    /**
     * Ensure configuration directories exist
     * Creates the config directory and profiles subdirectory if they don't exist
     * 
     * @private
     */
    ensureConfigDir() {
        [this.configDir, this.profilesDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    /**
     * Load configuration from disk
     * If no configuration file exists, creates one with default values
     * 
     * @private
     */
    loadConfig() {
        try {
            if (fs.existsSync(this.configFile)) {
                const data = fs.readFileSync(this.configFile, 'utf-8');
                this.config = JSON.parse(data);
            } else {
                this.config = { ...this.defaultConfig };
                this.saveConfig();
            }
        } catch (e) {
            console.error('Error loading config:', e.message);
            this.config = { ...this.defaultConfig };
        }
    }

    /**
     * Save configuration to disk
     * Writes the current configuration to the settings file
     * 
     * @private
     */
    saveConfig() {
        try {
            fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2), 'utf-8');
        } catch (e) {
            console.error('Error saving config:', e.message);
        }
    }

    /**
     * Get configuration value using dotted notation
     * 
     * @param {string} key - Configuration key (e.g., 'caching.enabled', 'models.temperature')
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Configuration value or default
     * 
     * @example
     * const cachingEnabled = config.get('caching.enabled', true);
     * const temperature = config.get('models.temperature', 0.7);
     */
    get(key, defaultValue = null) {
        const keys = key.split('.');
        let value = this.config;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }

        return value;
    }

    /**
     * Set configuration value
     */
    set(key, value) {
        const keys = key.split('.');
        let obj = this.config;

        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in obj) || typeof obj[k] !== 'object') {
                obj[k] = {};
            }
            obj = obj[k];
        }

        obj[keys[keys.length - 1]] = value;
        this.saveConfig();
    }

    /**
     * Save a named profile
     */
    saveProfile(name, settings) {
        try {
            const filepath = path.join(this.profilesDir, `${name}.json`);
            fs.writeFileSync(filepath, JSON.stringify(settings, null, 2), 'utf-8');
        } catch (e) {
            console.error('Error saving profile:', e.message);
        }
    }

    /**
     * Load a named profile
     */
    loadProfile(name) {
        try {
            const filepath = path.join(this.profilesDir, `${name}.json`);
            if (fs.existsSync(filepath)) {
                return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
            }
        } catch (e) {
            console.error('Error loading profile:', e.message);
        }
        return null;
    }

    /**
     * List all available profiles
     */
    listProfiles() {
        try {
            const files = fs.readdirSync(this.profilesDir);
            return files.filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));
        } catch (e) {
            return [];
        }
    }

    /**
     * Export current configuration
     */
    export() {
        return JSON.stringify(this.config, null, 2);
    }

    /**
     * Reset to default configuration
     */
    reset() {
        this.config = { ...this.defaultConfig };
        this.saveConfig();
    }
}

module.exports = { ConfigManager };
