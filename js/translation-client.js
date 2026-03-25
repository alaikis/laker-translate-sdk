/**
 * Translation Service gRPC-Web TypeScript/JavaScript Client
 *
 * Auto-generated for api.laker.dev Translation Service
 * Service: TranslationService
 * Source: proto/translation.proto
 */
const defaultCrossTabOptions = {
    enabled: false,
    channelName: 'laker-translation-cache',
    storageKeyPrefix: 'laker_translation_'
};
/**
 * Automatic template extraction from text containing numeric variables
 * @param text Original text that may contain numeric variables
 * @returns Template extraction result
 */
export function extractTemplate(text) {
    // Regex to find numbers in text
    const numberRegex = /\d+(?:\.\d+)?/g;
    const matches = text.match(numberRegex);
    if (!matches || matches.length === 0) {
        return {
            isTemplated: false,
            srcTemplate: text,
            dstTemplate: '',
            variables: []
        };
    }
    let template = text;
    const variables = [];
    matches.forEach((match, index) => {
        const varName = `{var${index + 1}}`;
        template = template.replace(match, varName);
        variables.push(match);
    });
    return {
        isTemplated: variables.length > 0,
        srcTemplate: template,
        dstTemplate: '',
        variables
    };
}
/**
 * TranslationPool - Single-level translation cache (simplified for new API)
 *
 * Architecture:
 * - pool: stores translations (from backend, unified result field)
 * - currentFingerprint: current active fingerprint for special translations
 * - Optional cross-tab synchronization via Broadcast Channel and localStorage
 *
 * Rules:
 * - If fingerprint exists, load special translations
 * - If no fingerprint, load common translations
 * - All translations stored in single pool with unified access
 */
class TranslationPool {
    client;
    senseId;
    pool = new Map();
    currentFingerprint = null;
    crossTabOptions;
    broadcastChannel = null;
    loading = false;
    loadedFingerprints = new Set();
    /**
     * Create a new TranslationPool for a specific sense
     * @param client TranslationClient instance
     * @param senseId The semantic sense ID
     * @param crossTabOptions Cross-tab synchronization options
     */
    constructor(client, senseId, crossTabOptions) {
        this.client = client;
        this.senseId = senseId;
        this.crossTabOptions = { ...defaultCrossTabOptions, ...crossTabOptions };
        if (this.crossTabOptions.enabled && typeof BroadcastChannel !== 'undefined') {
            this.initCrossTabSync();
        }
        // Load from localStorage if cross-tab enabled and storage available
        this.loadFromStorage();
    }
    /**
     * Initialize cross-tab synchronization
     */
    initCrossTabSync() {
        this.broadcastChannel = new BroadcastChannel(this.crossTabOptions.channelName);
        this.broadcastChannel.onmessage = (event) => {
            const message = event.data;
            // Ignore messages for other senses
            if (message.senseId !== this.senseId) {
                return;
            }
            switch (message.type) {
                case 'cache_update':
                    this.handleCacheUpdate(message);
                    break;
                case 'cache_clear':
                    this.handleCacheClear(message);
                    break;
                case 'request_initial_sync':
                    this.handleInitialSyncRequest();
                    break;
            }
        };
        // Request other tabs to share their cache
        this.broadcastChannel.postMessage({
            type: 'request_initial_sync',
            senseId: this.senseId
        });
    }
    /**
     * Load cache from localStorage
     */
    loadFromStorage() {
        if (typeof localStorage === 'undefined' || !this.crossTabOptions.enabled) {
            return;
        }
        const storageKey = this.getStorageKey();
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                data.forEach(({ text, translation }) => {
                    this.pool.set(text, translation);
                });
            }
        }
        catch (e) {
            console.warn('Failed to load translation cache from localStorage:', e);
        }
    }
    /**
     * Get storage key based on current fingerprint
     */
    getStorageKey() {
        const fp = this.currentFingerprint || 'common';
        return `${this.crossTabOptions.storageKeyPrefix}${this.senseId}_${fp}`;
    }
    /**
     * Save cache to localStorage
     */
    saveToStorage() {
        if (typeof localStorage === 'undefined' || !this.crossTabOptions.enabled) {
            return;
        }
        const storageKey = this.getStorageKey();
        try {
            const data = this.getAll();
            localStorage.setItem(storageKey, JSON.stringify(data));
        }
        catch (e) {
            console.warn('Failed to save translation cache to localStorage:', e);
        }
    }
    /**
     * Broadcast cache update to all other tabs
     */
    broadcastUpdate(text, translation) {
        if (!this.broadcastChannel || !this.crossTabOptions.enabled) {
            return;
        }
        const message = {
            type: 'cache_update',
            senseId: this.senseId,
            fingerprint: this.currentFingerprint || undefined,
            data: {
                result: this.getAll(),
                ...(text && translation && { text, translation })
            }
        };
        this.broadcastChannel.postMessage(message);
        this.saveToStorage();
    }
    /**
     * Handle incoming cache update from another tab
     */
    handleCacheUpdate(message) {
        if (message.data?.result) {
            // Update full cache
            this.pool.clear();
            message.data.result.forEach(({ text, translation }) => {
                this.pool.set(text, translation);
            });
        }
        // Update specific entry
        if (message.data?.text && message.data?.translation) {
            this.pool.set(message.data.text, message.data.translation);
            this.saveToStorage();
        }
    }
    /**
     * Handle incoming cache clear from another tab
     */
    handleCacheClear(message) {
        this.clearAll();
    }
    /**
     * Handle initial sync request from a new tab
     */
    handleInitialSyncRequest() {
        // Send our current cache to the new tab
        this.broadcastUpdate();
    }
    /**
     * Check if currently loading
     */
    isLoading() {
        return this.loading;
    }
    /**
     * Initialize the pool - loads translations from backend using streaming
     * If fingerprint is set, loads special translations; otherwise loads common
     */
    async initialize() {
        if (this.loading) {
            return;
        }
        // Check if already loaded for this fingerprint
        const fpKey = this.currentFingerprint || 'common';
        if (this.loadedFingerprints.has(fpKey) && this.pool.size > 0) {
            return;
        }
        this.loading = true;
        try {
            // Use streaming for batch loading
            await this.client.translateStream({
                senseId: this.senseId,
                fingerprint: this.currentFingerprint || undefined,
                batchSize: 500
            }, (response) => {
                // Add all translations from this batch
                response.translations.forEach(record => {
                    this.pool.set(record.text, record.translate);
                });
                return true; // Continue streaming
            });
            // Mark as loaded
            this.loadedFingerprints.add(fpKey);
            // Broadcast to other tabs after full initialization
            this.broadcastUpdate();
        }
        finally {
            this.loading = false;
        }
    }
    /**
     * Switch to a different fingerprint, loads its translations
     * @param fingerprint The fingerprint to switch to
     */
    async switchFingerprint(fingerprint) {
        // Clear current pool
        this.pool.clear();
        this.currentFingerprint = fingerprint;
        // Load from localStorage first
        this.loadFromStorage();
        // Check if we need to load from backend
        if (!this.loadedFingerprints.has(fingerprint)) {
            await this.initialize();
        }
    }
    /**
     * Clear the current fingerprint to free memory
     */
    clearCurrentFingerprint() {
        this.currentFingerprint = null;
        this.pool.clear();
    }
    /**
     * Lookup translation
     * @param text Original text to lookup
     * @returns Lookup result
     */
    lookup(text) {
        if (this.pool.has(text)) {
            return {
                found: true,
                translation: this.pool.get(text),
                source: this.currentFingerprint ? 'special' : 'common'
            };
        }
        // Not found
        return {
            found: false,
            translation: '',
            source: null
        };
    }
    /**
     * Add a translation to the pool
     * @param text Original text
     * @param translation Translated text
     */
    addTranslation(text, translation) {
        this.pool.set(text, translation);
        this.broadcastUpdate(text, translation);
    }
    /**
     * Request translation from backend, automatically adds to pool if found
     *
     * @param text Text to translate
     * @param fromLang Source language
     * @param toLang Target language
     * @returns Translation response
     */
    async requestTranslation(text, fromLang, toLang) {
        const response = await this.client.llmTranslate({
            text,
            fromLang,
            toLang,
            senseId: this.senseId
        });
        // Add to pool automatically
        if (response.translatedText) {
            this.addTranslation(text, response.translatedText);
        }
        return response;
    }
    /**
     * Get all translations
     * @returns Array of {text, translation}
     */
    getAll() {
        const result = [];
        this.pool.forEach((translation, text) => {
            result.push({ text, translation });
        });
        return result;
    }
    /**
     * Clear all cached data to free memory
     */
    clearAll() {
        this.pool.clear();
        this.loadedFingerprints.clear();
        this.currentFingerprint = null;
        // Clear localStorage
        if (typeof localStorage !== 'undefined' && this.crossTabOptions.enabled) {
            const storageKey = this.getStorageKey();
            localStorage.removeItem(storageKey);
        }
        // Broadcast clear to other tabs
        if (this.broadcastChannel && this.crossTabOptions.enabled) {
            this.broadcastChannel.postMessage({
                type: 'cache_clear',
                senseId: this.senseId
            });
        }
    }
    /**
     * Close the broadcast channel to free resources
     * Should be called when the pool is no longer needed
     */
    destroy() {
        if (this.broadcastChannel) {
            this.broadcastChannel.close();
            this.broadcastChannel = null;
        }
    }
    /**
     * Check if cross-tab synchronization is enabled
     */
    isCrossTabEnabled() {
        return this.crossTabOptions.enabled;
    }
}
/**
 * TranslationService - Main entry point for translation operations
 * Provides a clean API with automatic caching and cross-tab synchronization
 *
 * Features:
 * - Lazy initialization: automatically initializes on first translate() call
 * - Streaming batch load: uses streaming API for efficient initialization
 * - On-demand loading: automatically loads when fingerprint changes
 * - Cross-tab sync: optional Broadcast Channel + localStorage synchronization
 *
 * Usage:
 * - Simple: Just create and call translate() - initialization is automatic
 * - Advanced: Call initialize() explicitly to preload all translations upfront
 */
export class TranslationService {
    client;
    pool;
    initialized = false;
    initPromise = null;
    options;
    /**
     * Create a new TranslationService instance
     * @param client TranslationClient instance (or base URL string to create one automatically)
     * @param options Translation service options including senseId and optional fingerprint/cross-tab settings
     */
    constructor(client, options) {
        if (typeof client === 'string') {
            this.client = new TranslationClient(client);
        }
        else {
            this.client = client;
        }
        this.options = options;
        // Configure cross-tab options
        const crossTabOptions = {
            enabled: options.crossTab === true,
        };
        if (options.crossTabChannelName) {
            crossTabOptions.channelName = options.crossTabChannelName;
        }
        if (options.crossTabStorageKeyPrefix) {
            crossTabOptions.storageKeyPrefix = options.crossTabStorageKeyPrefix;
        }
        // Create internal translation pool
        this.pool = new TranslationPool(this.client, options.senseId, crossTabOptions);
        // Set initial fingerprint if provided
        if (options.fingerprint) {
            this.pool['currentFingerprint'] = options.fingerprint;
        }
    }
    /**
     * Ensure the service is initialized (lazy initialization)
     * Called automatically by translate() if needed
     */
    async ensureInitialized() {
        if (this.initialized && !this.pool.isLoading()) {
            return;
        }
        // Use singleton pattern for initialization promise
        if (!this.initPromise) {
            this.initPromise = this.doInitialize();
        }
        await this.initPromise;
    }
    /**
     * Actual initialization logic
     */
    async doInitialize() {
        // Initialize the pool (loads translations via streaming)
        await this.pool.initialize();
        this.initialized = true;
    }
    /**
     * Initialize the translation service - loads all translations from backend
     *
     * This is optional - translate() will automatically initialize if needed.
     * Call this explicitly if you want to preload all translations upfront.
     *
     * Automatically handles cross-tab synchronization if enabled.
     */
    async initialize() {
        await this.ensureInitialized();
    }
    /**
     * Check if service has been initialized
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Switch to a different fingerprint (for personalized/custom translations)
     * Automatically loads all translations for this fingerprint
     * @param fingerprint - The fingerprint to switch to
     */
    async switchFingerprint(fingerprint) {
        // Reset initialization state
        this.initialized = false;
        this.initPromise = null;
        await this.pool.switchFingerprint(fingerprint);
        this.initialized = true;
    }
    /**
     * Clear the current fingerprint - frees memory
     */
    clearCurrentFingerprint() {
        this.pool.clearCurrentFingerprint();
    }
    /**
     * Add a custom translation to the current pool
     * @param text - Original text
     * @param translation - Translated text
     */
    addCustomTranslation(text, translation) {
        this.pool.addTranslation(text, translation);
    }
    /**
     * Lookup translation in cache
     * Note: If not initialized, will return not found
     * @param text - Text to lookup
     * @returns Lookup result with found flag and translation if available
     */
    lookup(text) {
        return this.pool.lookup(text);
    }
    /**
     * Translate text with automatic caching
     *
     * Features:
     * - Lazy initialization: automatically initializes on first call
     * - Checks cache first
     * - If not found in cache, requests from backend and caches result
     *
     * @param text - Text to translate
     * @param toLang - Target language (2-letter code)
     * @param fromLang - Optional source language (2-letter code)
     * @param provider - Optional translation provider name
     * @returns Translation response
     */
    async translate(text, toLang, fromLang, provider) {
        // Lazy initialization - ensure initialized before checking cache
        await this.ensureInitialized();
        // Check cache first
        const lookupResult = this.lookup(text);
        if (lookupResult.found) {
            return {
                originalText: text,
                translatedText: lookupResult.translation,
                provider: 'cache',
                timestamp: Date.now(),
                finished: true,
                cached: true,
                fromLang: fromLang,
                toLang: toLang,
            };
        }
        // Not in cache, request from backend
        const senseId = this.getSenseId();
        const response = await this.client.llmTranslate({
            text,
            toLang,
            fromLang,
            provider,
            senseId,
        });
        // Add to cache automatically
        if (response.translatedText) {
            this.pool.addTranslation(text, response.translatedText);
        }
        return response;
    }
    /**
     * Direct translation - bypasses cache and always requests from backend
     * Use this for one-off translations when you don't need caching
     *
     * @param text - Text to translate
     * @param toLang - Target language (2-letter code)
     * @param fromLang - Optional source language (2-letter code)
     * @param provider - Optional translation provider name
     * @returns Translation response
     */
    async translateDirect(text, toLang, fromLang, provider) {
        const senseId = this.getSenseId();
        return this.client.llmTranslate({
            text,
            toLang,
            fromLang,
            provider,
            senseId,
        });
    }
    /**
     * Stream translations from backend in batches
     * Used for bulk loading all translations in a sense
     *
     * @param request - Stream request parameters
     * @param onBatch - Callback for each batch received
     */
    async streamTranslate(request, onBatch) {
        await this.client.translateStream(request, onBatch);
    }
    /**
     * Get the sense ID this service is connected to
     */
    getSenseId() {
        return this.pool.senseId;
    }
    /**
     * Clear all cached data to free memory
     */
    clearAll() {
        this.pool.clearAll();
    }
    /**
     * Destroy the service, close connections and free resources
     * Should be called when the service is no longer needed
     */
    destroy() {
        this.pool.destroy();
        this.client.destroy();
        this.initialized = false;
        this.initPromise = null;
    }
}
/**
 * Simple LRU Cache implementation for TranslationClient
 * Uses Map with access order for O(1) get/set operations
 */
class LRUCache {
    capacity;
    cache;
    constructor(capacity = 1000) {
        this.capacity = capacity;
        this.cache = new Map();
    }
    /**
     * Get value from cache, moves to end (most recently used)
     */
    get(key) {
        if (!this.cache.has(key)) {
            return undefined;
        }
        // Move to end (most recently used)
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }
    /**
     * Set value in cache, evicts oldest if over capacity
     */
    set(key, value) {
        // Delete if exists (to move to end)
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        // Evict oldest if at capacity
        else if (this.cache.size >= this.capacity) {
            // First key is the oldest (least recently used)
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        this.cache.set(key, value);
    }
    /**
     * Check if key exists in cache
     */
    has(key) {
        return this.cache.has(key);
    }
    /**
     * Delete key from cache
     */
    delete(key) {
        return this.cache.delete(key);
    }
    /**
     * Clear all entries
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Get current cache size
     */
    get size() {
        return this.cache.size;
    }
}
/**
 * Cache key generator for translation requests
 */
function generateCacheKey(request) {
    const parts = [
        request.text,
        request.toLang || '',
        request.fromLang || '',
        request.senseId || '',
        request.provider || ''
    ];
    return parts.join('|');
}
const defaultClientCrossTabOptions = {
    enabled: false,
    channelName: 'laker-translation-client-cache',
    storageKey: 'laker_translation_client_cache'
};
/**
 * TranslationClient - Low-level gRPC-Web compatible client for TranslationService
 * Uses JSON over HTTP transport for compatibility
 * Includes LRU cache with optional Broadcast Channel + localStorage synchronization
 */
export class TranslationClient {
    baseUrl;
    token;
    timeout;
    cache;
    cacheEnabled;
    crossTabOptions;
    broadcastChannel = null;
    storageKey;
    /**
     * Create a new TranslationClient
     * @param baseUrl Base URL of the gRPC-Web endpoint, defaults to https://api.hottol.com/laker/
     * @param token JWT authentication token (optional)
     * @param timeout Request timeout in milliseconds (default: 30000)
     * @param cacheSize LRU cache size (default: 1000, set to 0 to disable cache)
     * @param crossTabOptions Cross-tab synchronization options (default: disabled)
     */
    constructor(baseUrl = 'https://api.hottol.com/laker/', token = '', timeout = 30000, cacheSize = 1000, crossTabOptions) {
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        this.token = token;
        this.timeout = timeout;
        this.cacheEnabled = cacheSize > 0;
        this.cache = new LRUCache(cacheSize);
        this.crossTabOptions = { ...defaultClientCrossTabOptions, ...crossTabOptions };
        this.storageKey = this.crossTabOptions.storageKey;
        // Initialize cross-tab synchronization if enabled
        if (this.crossTabOptions.enabled && typeof BroadcastChannel !== 'undefined') {
            this.initCrossTabSync();
        }
        // Load from localStorage if cross-tab enabled
        this.loadFromStorage();
    }
    /**
     * Initialize cross-tab synchronization via Broadcast Channel
     */
    initCrossTabSync() {
        this.broadcastChannel = new BroadcastChannel(this.crossTabOptions.channelName);
        this.broadcastChannel.onmessage = (event) => {
            const message = event.data;
            switch (message.type) {
                case 'cache_update':
                    if (message.key && message.data) {
                        // Update local cache from another tab's update
                        this.cache.set(message.key, message.data);
                    }
                    break;
                case 'cache_clear':
                    this.cache.clear();
                    break;
                case 'request_sync':
                    // Another tab is requesting our cache, send our data
                    this.broadcastFullCache();
                    break;
            }
        };
        // Request other tabs to share their cache
        this.broadcastChannel.postMessage({ type: 'request_sync' });
    }
    /**
     * Load cache from localStorage
     */
    loadFromStorage() {
        if (typeof localStorage === 'undefined' || !this.crossTabOptions.enabled) {
            return;
        }
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                data.forEach(({ key, value }) => {
                    this.cache.set(key, value);
                });
            }
        }
        catch (e) {
            console.warn('Failed to load translation cache from localStorage:', e);
        }
    }
    /**
     * Save cache to localStorage
     */
    saveToStorage() {
        if (typeof localStorage === 'undefined' || !this.crossTabOptions.enabled) {
            return;
        }
        try {
            const data = this.getAllCacheEntries();
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        }
        catch (e) {
            console.warn('Failed to save translation cache to localStorage:', e);
        }
    }
    /**
     * Get all cache entries for storage/broadcast
     */
    getAllCacheEntries() {
        const result = [];
        // Access internal cache map for iteration
        const cacheMap = this.cache.cache;
        cacheMap.forEach((value, key) => {
            result.push({ key, value });
        });
        return result;
    }
    /**
     * Broadcast full cache to other tabs
     */
    broadcastFullCache() {
        if (!this.broadcastChannel || !this.crossTabOptions.enabled) {
            return;
        }
        const entries = this.getAllCacheEntries();
        entries.forEach(({ key, value }) => {
            this.broadcastChannel.postMessage({
                type: 'cache_update',
                key,
                data: value
            });
        });
    }
    /**
     * Broadcast a single cache update to other tabs
     */
    broadcastCacheUpdate(key, value) {
        if (!this.broadcastChannel || !this.crossTabOptions.enabled) {
            return;
        }
        this.broadcastChannel.postMessage({
            type: 'cache_update',
            key,
            data: value
        });
        this.saveToStorage();
    }
    /**
     * Set or update the JWT authentication token
     * @param token JWT token
     */
    setToken(token) {
        this.token = token;
    }
    /**
     * Enable or disable cache
     * @param enabled Whether to enable cache
     */
    setCacheEnabled(enabled) {
        this.cacheEnabled = enabled;
    }
    /**
     * Clear the translation cache (also clears localStorage and broadcasts to other tabs)
     */
    clearCache() {
        this.cache.clear();
        // Clear localStorage
        if (typeof localStorage !== 'undefined' && this.crossTabOptions.enabled) {
            localStorage.removeItem(this.storageKey);
        }
        // Broadcast clear to other tabs
        if (this.broadcastChannel && this.crossTabOptions.enabled) {
            this.broadcastChannel.postMessage({ type: 'cache_clear' });
        }
    }
    /**
     * Get current cache size
     */
    getCacheSize() {
        return this.cache.size;
    }
    /**
     * Check if cross-tab synchronization is enabled
     */
    isCrossTabEnabled() {
        return this.crossTabOptions.enabled;
    }
    /**
     * Destroy the client, close broadcast channel and free resources
     */
    destroy() {
        if (this.broadcastChannel) {
            this.broadcastChannel.close();
            this.broadcastChannel = null;
        }
    }
    /**
  凤   * GetSenseTranslate - One-shot unary request with pagination
     * @param request Request parameters
     */
    async getSenseTranslate(request) {
        const url = `${this.baseUrl}/TranslationService/GetSenseTranslate`;
        const response = await this.fetchJson(url, request);
        return response;
    }
    /**
     * TranslateStream - Server streaming, receives multiple batches progressively
     * @param request Request parameters
     * @param onBatch Callback for each batch received. Return false to stop streaming early.
     */
    async translateStream(request, onBatch) {
        const url = `${this.baseUrl}/TranslationService/TranslateStream`;
        // For gRPC-Web streaming over HTTP, we use POST with streaming response
        const response = await this.fetchWithTimeout(url, {
            method: 'POST',
            body: JSON.stringify(request),
            headers: this.getHeaders()
        });
        if (!response.body) {
            throw new Error('No response body for streaming request');
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const chunk = decoder.decode(value);
            // Parse each line as a JSON message
            const lines = chunk.split('\n').filter(line => line.trim().length > 0);
            for (const line of lines) {
                try {
                    const data = JSON.parse(line);
                    const shouldContinue = onBatch(data);
                    if (shouldContinue === false) {
                        reader.cancel();
                        return;
                    }
                }
                catch (e) {
                    console.warn('Failed to parse streaming chunk:', line, e);
                }
            }
        }
    }
    /**
     * Collect all streaming responses into an array
     * @param request Request parameters
     */
    async translateStreamCollect(request) {
        const result = [];
        await this.translateStream(request, (response) => {
            result.push(response);
            return true;
        });
        return result;
    }
    /**
     * LLMTranslate - One-shot large language model translation
     * Uses LRU cache to avoid repeated requests for the same text
     * With cross-tab enabled, automatically syncs cache across browser tabs
     * @param request Translation request
     * @param skipCache If true, bypass cache and always request from backend
     */
    async llmTranslate(request, skipCache = false) {
        const cacheKey = generateCacheKey(request);
        // Check cache first
        if (this.cacheEnabled && !skipCache) {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                // Return cached response with cached flag set
                return { ...cached, cached: true };
            }
        }
        // Request from backend
        const url = `${this.baseUrl}/TranslationService/LLMTranslate`;
        const response = await this.fetchJson(url, request);
        // Cache the response
        if (this.cacheEnabled && response.translatedText) {
            const cachedResponse = { ...response, cached: true };
            this.cache.set(cacheKey, cachedResponse);
            // Broadcast to other tabs and save to localStorage
            this.broadcastCacheUpdate(cacheKey, cachedResponse);
        }
        return { ...response, cached: false };
    }
    /**
     * LLMTranslateStream - Streaming large language model translation
     * Note: Streaming requests are not cached
     * @param request Translation request
     * @param onResponse Callback for each response chunk
     */
    async llmTranslateStream(request, onResponse) {
        const url = `${this.baseUrl}/TranslationService/LLMTranslateStream`;
        const response = await this.fetchWithTimeout(url, {
            method: 'POST',
            body: JSON.stringify(request),
            headers: this.getHeaders()
        });
        if (!response.body) {
            throw new Error('No response body for streaming request');
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim().length > 0);
            for (const line of lines) {
                try {
                    const data = JSON.parse(line);
                    const shouldContinue = onResponse(data);
                    if (shouldContinue === false) {
                        reader.cancel();
                        return;
                    }
                }
                catch (e) {
                    console.warn('Failed to parse streaming chunk:', line, e);
                }
            }
        }
    }
    getHeaders() {
        const headers = {
            'Content-Type': 'application/grpc-web+json',
            'X-Grpc-Web': '1'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }
    async fetchJson(url, body) {
        const response = await this.fetchWithTimeout(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: this.getHeaders()
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }
    async fetchWithTimeout(url, options) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), this.timeout);
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    }
}
/**
 * AppTranslation - Application-level translation interface
 * Single entry point for all translation needs with automatic initialization,
 * intelligent caching, and on-demand loading.
 *
 * Features:
 * - Single entry point: just provide token and senseId
 * - Automatic streaming batch initialization
 * - On-demand loading when fingerprint changes
 * - Intelligent translation with cache-first strategy
 * - Cross-tab synchronization support
 *
 * Usage:
 * ```typescript
 * // Create instance
 * const appTranslate = new AppTranslation({
 *   token: 'your-jwt-token',
 *   senseId: 'your-sense-id',
 *   baseUrl: 'https://api.laker.dev'
 * });
 *
 * // Simple translation - auto-initializes
 * const result = await appTranslate.translate('Hello', 'zh');
 *
 * // Switch fingerprint - auto-loads special translations
 * await appTranslate.setFingerprint('user-123');
 *
 * // Destroy when done
 * appTranslate.destroy();
 * ```
 */
export class AppTranslation {
    client;
    service;
    config;
    currentFingerprint = null;
    useCache;
    /**
     * Create a new AppTranslation instance
     * @param config Configuration options
     */
    constructor(config) {
        this.config = config;
        // Default to using cache unless explicitly disabled
        this.useCache = config.useCache !== false;
        // If cache is disabled, set cacheSize to 0
        const cacheSize = this.useCache ? (config.cacheSize || 1000) : 0;
        this.client = new TranslationClient(config.baseUrl || 'https://api.hottol.com/laker/', config.token, config.timeout || 30000, cacheSize, { enabled: config.crossTab ?? false });
        this.service = new TranslationService(this.client, {
            senseId: config.senseId,
            fingerprint: config.fingerprint,
            crossTab: config.crossTab ?? false
        });
        if (config.fingerprint) {
            this.currentFingerprint = config.fingerprint;
        }
    }
    /**
     * Update the authentication token
     * @param token New JWT token
     */
    setToken(token) {
        this.client.setToken(token);
    }
    /**
     * Set or change the current fingerprint
     * Automatically loads special translations for this fingerprint
     * @param fingerprint The fingerprint to use
     */
    async setFingerprint(fingerprint) {
        if (this.currentFingerprint === fingerprint) {
            return;
        }
        this.currentFingerprint = fingerprint;
        await this.service.switchFingerprint(fingerprint);
    }
    /**
     * Clear the current fingerprint
     * Falls back to common translations
     */
    clearFingerprint() {
        this.currentFingerprint = null;
        this.service.clearCurrentFingerprint();
    }
    /**
     * Get the current fingerprint
     */
    getFingerprint() {
        return this.currentFingerprint;
    }
    /**
     * Translate text with automatic caching and initialization
     *
     * - First call initializes the service automatically
     * - Checks cache first (fingerprint-specific → common)
     * - Falls back to LLM translation if not found
     * - Caches result automatically (unless useCache: false)
     *
     * @param text Text to translate
     * @param toLang Target language code (e.g., 'zh', 'en')
     * @param fromLang Optional source language code (auto-detected if not provided)
     * @returns Translation result
     */
    async translate(text, toLang, fromLang) {
        const response = await this.service.translate(text, toLang, fromLang);
        return response.translatedText;
    }
    /**
     * Translate text with full response details
     * @param text Text to translate
     * @param toLang Target language code
     * @param fromLang Optional source language code
     * @returns Full translation response
     */
    async translateWithDetails(text, toLang, fromLang) {
        return this.service.translate(text, toLang, fromLang);
    }
    /**
     * Translate text without using cache (always request from backend)
     * @param text Text to translate
     * @param toLang Target language code
     * @param fromLang Optional source language code
     * @returns Translation result
     */
    async translateNoCache(text, toLang, fromLang) {
        const response = await this.service.translateDirect(text, toLang, fromLang);
        return response.translatedText;
    }
    /**
     * Batch translate multiple texts
     * @param texts Array of texts to translate
     * @param toLang Target language code
     * @param fromLang Optional source language code
     * @returns Array of translated texts in same order
     */
    async translateBatch(texts, toLang, fromLang) {
        const results = await Promise.all(texts.map(text => this.translate(text, toLang, fromLang)));
        return results;
    }
    /**
     * Check if cache is enabled
     * @returns true if cache is enabled
     */
    isCacheEnabled() {
        return this.useCache;
    }
    /**
     * Check if a translation exists in cache
     * @param text Text to check
     * @returns true if translation exists in cache
     */
    hasTranslation(text) {
        if (!this.useCache) {
            return false;
        }
        return this.service.lookup(text).found;
    }
    /**
     * Get translation from cache without requesting from backend
     * @param text Text to look up
     * @returns Translation if found, null otherwise
     */
    getCached(text) {
        if (!this.useCache) {
            return null;
        }
        const result = this.service.lookup(text);
        return result.found ? result.translation : null;
    }
    /**
     * Add a custom translation to the cache
     * @param text Original text
     * @param translation Translated text
     */
    addTranslation(text, translation) {
        if (this.useCache) {
            this.service.addCustomTranslation(text, translation);
        }
    }
    /**
     * Preload all translations for current context
     * Call this to warm up the cache before translating
     */
    async preload() {
        if (this.useCache) {
            await this.service.initialize();
        }
    }
    /**
     * Check if the service is initialized
     */
    isInitialized() {
        return this.service.isInitialized();
    }
    /**
     * Clear all cached translations
     */
    clearCache() {
        this.service.clearAll();
        this.client.clearCache();
    }
    /**
     * Destroy the instance and free resources
     * Call this when the instance is no longer needed
     */
    destroy() {
        this.service.destroy();
    }
}
/**
 * Create an AppTranslation instance with simplified configuration
 * @param token JWT authentication token
 * @param senseId Translation sense ID
 * @param options Additional options
 * @returns AppTranslation instance
 */
export function createTranslation(token, senseId, options) {
    return new AppTranslation({
        token,
        senseId,
        ...options
    });
}
export default TranslationClient;
