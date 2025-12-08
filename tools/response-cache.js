/**
 * Response caching module for Chat LLM
 * Provides two-tier caching (memory + disk) to reduce API calls and improve performance
 * 
 * @module ResponseCache
 * @author yonikashi432
 * @version 2.0.0
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * ResponseCache - Intelligent caching system for LLM responses
 * Implements a two-tier cache with in-memory cache for fast access
 * and disk cache for persistence across restarts.
 */
class ResponseCache {
    /**
     * Initialize the response cache
     * 
     * @param {string} cacheDir - Directory to store cached responses
     */
    constructor(cacheDir = './cache') {
        this.cacheDir = cacheDir;
        this.ttl = 24 * 60 * 60 * 1000; // 24 hours default TTL
        this.memoryCache = new Map();
        this.ensureCacheDir();
    }

    /**
     * Ensure cache directory exists
     * Creates the cache directory if it doesn't exist
     * 
     * @private
     */
    ensureCacheDir() {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }

    /**
     * Generate a cache key from input text
     * Uses SHA-256 hashing for consistent, unique keys
     * 
     * @param {string} input - Input text to generate key from
     * @returns {string} SHA-256 hash as hexadecimal string
     * @private
     */
    generateKey(input) {
        return crypto.createHash('sha256').update(input).digest('hex');
    }

    /**
     * Retrieve cached response for given input
     * Checks memory cache first, then disk cache
     * Automatically removes expired entries
     * 
     * @param {string} input - Input text to lookup
     * @returns {string|null} Cached response or null if not found/expired
     * 
     * @example
     * const cached = cache.get('What is the capital of France?');
     * if (cached) {
     *   console.log('Using cached response:', cached);
     * }
     */
    get(input) {
        const key = this.generateKey(input);
        
        // Check memory cache first
        if (this.memoryCache.has(key)) {
            const cached = this.memoryCache.get(key);
            if (Date.now() - cached.timestamp < this.ttl) {
                return cached.value;
            } else {
                this.memoryCache.delete(key);
            }
        }

        // Check disk cache
        try {
            const filepath = path.join(this.cacheDir, `${key}.json`);
            if (fs.existsSync(filepath)) {
                const cached = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
                if (Date.now() - cached.timestamp < this.ttl) {
                    this.memoryCache.set(key, cached);
                    return cached.value;
                } else {
                    fs.unlinkSync(filepath);
                }
            }
        } catch (e) {
            // Ignore cache read errors
        }

        return null;
    }

    /**
     * Store response in cache
     * Saves to both memory and disk for redundancy
     * 
     * @param {string} input - Input text (cache key)
     * @param {string} response - Response to cache
     * 
     * @example
     * cache.set('What is AI?', 'Artificial Intelligence is...');
     */
    set(input, response) {
        const key = this.generateKey(input);
        const cached = {
            timestamp: Date.now(),
            value: response,
            input: input.substring(0, 100) // Store truncated input for reference
        };

        // Store in memory
        this.memoryCache.set(key, cached);

        // Store on disk
        try {
            const filepath = path.join(this.cacheDir, `${key}.json`);
            fs.writeFileSync(filepath, JSON.stringify(cached), 'utf-8');
        } catch (e) {
            // Ignore cache write errors
        }
    }

    /**
     * Clear all cached responses
     * Removes entries from both memory and disk cache
     * 
     * @example
     * cache.clear();
     * console.log('Cache cleared');
     */
    clear() {
        this.memoryCache.clear();
        try {
            const files = fs.readdirSync(this.cacheDir).filter(f => f.endsWith('.json'));
            files.forEach(file => {
                fs.unlinkSync(path.join(this.cacheDir, file));
            });
        } catch (e) {
            // Ignore clear errors
        }
    }

    /**
     * Get cache statistics
     * Returns information about cache size and usage
     * 
     * @returns {Object} Statistics object
     * @returns {number} returns.memoryCacheSize - Number of items in memory cache
     * @returns {number} returns.diskCacheSize - Total disk space used (bytes)
     * @returns {string} returns.diskCachePath - Path to disk cache directory
     * 
     * @example
     * const stats = cache.getStats();
     * console.log(`Memory cache: ${stats.memoryCacheSize} entries`);
     * console.log(`Disk usage: ${stats.diskCacheSize} bytes`);
     */
    getStats() {
        let diskSize = 0;
        try {
            const files = fs.readdirSync(this.cacheDir).filter(f => f.endsWith('.json'));
            files.forEach(file => {
                const stats = fs.statSync(path.join(this.cacheDir, file));
                diskSize += stats.size;
            });
        } catch (e) {
            // Ignore stats errors
        }

        return {
            memoryCacheSize: this.memoryCache.size,
            diskCacheSize: diskSize,
            diskCachePath: this.cacheDir
        };
    }
}

module.exports = { ResponseCache };
