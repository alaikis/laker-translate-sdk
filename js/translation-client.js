(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.LakerTranslation = {}));
})(this, (function (exports) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

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
    function extractTemplate(text) {
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
     * TranslationPool - Multi-fingerprint translation cache with automatic common preloading
     *
     * Architecture:
     * - pools: Map of fingerprint -> Map<text, translation> (each fingerprint has independent cache)
     * - currentFingerprint: current active fingerprint for special translations
     * - common is always loaded and cached forever, never cleared unless full clear happens
     * - Optional cross-tab synchronization via Broadcast Channel and localStorage
     *
     * Rules:
     * - common translations are always loaded on initialization and cached forever
     * - If fingerprint exists, load special translations for that fingerprint
     * - Switching fingerprints doesn't clear cached data for other fingerprints
     * - Lookup priority: current fingerprint first, common second
     * - All translations are cached independently by fingerprint
     */
    class TranslationPool {
        /**
         * Create a new TranslationPool for a specific sense
         * @param client TranslationClient instance
         * @param senseId The semantic sense ID
         * @param crossTabOptions Cross-tab synchronization options
         */
        constructor(client, senseId, crossTabOptions) {
            // Separate cache for each fingerprint: fingerprint -> Map<text, translation>
            this.pools = new Map();
            this.currentFingerprint = null;
            this.broadcastChannel = null;
            this.loading = false;
            this.loadedFingerprints = new Set();
            // Observer pattern for queueing translation requests during load
            this.queuedRequests = [];
            this.pendingResolutions = {};
            this.client = client;
            this.senseId = senseId;
            this.crossTabOptions = Object.assign(Object.assign({}, defaultCrossTabOptions), crossTabOptions);
            // Initialize common pool always
            this.pools.set('common', new Map());
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
            // Always load common first
            this.loadFingerprintFromStorage('common');
            // Load current fingerprint if exists
            if (this.currentFingerprint) {
                this.loadFingerprintFromStorage(this.currentFingerprint);
            }
        }
        /**
         * Load a specific fingerprint's cache from localStorage
         */
        loadFingerprintFromStorage(fp) {
            const storageKey = this.getStorageKey(fp);
            try {
                const stored = localStorage.getItem(storageKey);
                if (stored) {
                    const data = JSON.parse(stored);
                    let pool = this.pools.get(fp);
                    if (!pool) {
                        pool = new Map();
                        this.pools.set(fp, pool);
                    }
                    data.forEach(({ text, translation }) => {
                        pool.set(text, translation);
                    });
                    this.loadedFingerprints.add(fp);
                }
            }
            catch (e) {
                console.warn('Failed to load translation cache from localStorage:', e);
            }
        }
        /**
         * Get storage key for a specific fingerprint
         */
        getStorageKey(fp) {
            return `${this.crossTabOptions.storageKeyPrefix}${this.senseId}_${fp}`;
        }
        /**
         * Save cache to localStorage
         */
        saveToStorage(fp) {
            if (typeof localStorage === 'undefined' || !this.crossTabOptions.enabled) {
                return;
            }
            const storageKey = this.getStorageKey(fp);
            try {
                const pool = this.pools.get(fp);
                const data = [];
                if (pool) {
                    pool.forEach((translation, text) => {
                        data.push({ text, translation });
                    });
                }
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
            const fp = this.currentFingerprint || 'common';
            const message = {
                type: 'cache_update',
                senseId: this.senseId,
                fingerprint: this.currentFingerprint || undefined,
                data: Object.assign({ result: this.getAllForFingerprint(fp) }, (text && translation && { text, translation }))
            };
            this.broadcastChannel.postMessage(message);
            this.saveToStorage(fp);
        }
        /**
         * Handle incoming cache update from another tab
         */
        handleCacheUpdate(message) {
            var _a, _b, _c;
            const fp = message.fingerprint || 'common';
            if ((_a = message.data) === null || _a === void 0 ? void 0 : _a.result) {
                // Update full cache for this fingerprint
                let pool = this.pools.get(fp);
                if (!pool) {
                    pool = new Map();
                    this.pools.set(fp, pool);
                }
                pool.clear();
                message.data.result.forEach(({ text, translation }) => {
                    pool.set(text, translation);
                });
                this.loadedFingerprints.add(fp);
            }
            // Update specific entry
            if (((_b = message.data) === null || _b === void 0 ? void 0 : _b.text) && ((_c = message.data) === null || _c === void 0 ? void 0 : _c.translation)) {
                const pool = this.pools.get(fp) || new Map();
                pool.set(message.data.text, message.data.translation);
                this.pools.set(fp, pool);
                this.saveToStorage(fp);
            }
        }
        /**
         * Handle incoming cache clear from another tab
         */
        handleCacheClear(message) {
            const fp = message.fingerprint || 'common';
            {
                this.clearFingerprint(fp);
            }
        }
        /**
         * Handle initial sync request from a new tab
         */
        handleInitialSyncRequest() {
            // Send our current cache to the new tab
            this.broadcastUpdate();
        }
        /**
         * Queue a translation request and return original text immediately
         * This is used during pool loading when translations are not yet available
         * @param request Translation request to queue
         * @returns Original text as the initial response
         */
        queueTranslationRequest(request) {
            // Return original text immediately for fast fallback
            const initialResponse = {
                originalText: request.text,
                translatedText: request.text,
                provider: 'fast_fallback',
                timestamp: Date.now(),
                finished: true,
                cached: false,
                fromLang: request.fromLang,
                toLang: request.toLang
            };
            // Resolve immediately with original text
            const promise = new Promise((resolve) => {
                resolve(initialResponse);
            });
            // Queue the request for processing after pool loads
            const queuedReq = Object.assign(Object.assign({}, request), { resolveFunction: (result) => {
                    // Remove from pending resolutions
                    delete this.pendingResolutions[`${request.text}-${request.fingerprint || 'common'}`];
                    // Resolve the promise for all listeners
                    queuedReq.resolveFunction(result);
                }, rejectFunction: (error) => {
                    delete this.pendingResolutions[`${request.text}-${request.fingerprint || 'common'}`];
                    queuedReq.rejectFunction(error);
                } });
            this.queuedRequests.push(queuedReq);
            // Store reference to allow later resolution
            const key = `${request.text}-${request.fingerprint || 'common'}`;
            this.pendingResolutions[key] = {
                resolve: (result) => queuedReq.resolveFunction(result),
                reject: (error) => queuedReq.rejectFunction(error)
            };
            // Return original text immediately
            return promise;
        }
        /**
         * Process all queued translation requests after pool is loaded
         * This should be called when the pool is fully initialized
         * Includes automatic retry mechanism for failed requests
         */
        processQueuedRequests() {
            return __awaiter(this, arguments, void 0, function* (maxRetries = 3, retryDelayMs = 1000) {
                if (this.queuedRequests.length === 0) {
                    return;
                }
                console.log(`[TranslationPool] Processing ${this.queuedRequests.length} queued translation requests...`);
                // Copy queued requests and clear the queue
                const requestsToProcess = [...this.queuedRequests];
                this.queuedRequests = [];
                // Process each request with retry mechanism
                const processWithRetry = (req_1, ...args_1) => __awaiter(this, [req_1, ...args_1], void 0, function* (req, attempt = 0) {
                    try {
                        // Check if translation is now available in pool
                        const lookup = this.lookup(req.text, req.fingerprint);
                        if (lookup.found) {
                            // Translation is now available in pool, use it
                            const translation = yield this.client.translate(req.text, req.toLang, req.fromLang, req.fingerprint);
                            return { text: req.text, translation, success: true };
                        }
                        else {
                            // Not in pool, request from backend
                            const response = yield this.client.translateWithDetails(req.text, req.toLang, req.fromLang, req.fingerprint);
                            return { text: req.text, translation: response.translatedText, success: true };
                        }
                    }
                    catch (error) {
                        console.warn(`[TranslationPool] Request failed (attempt ${attempt + 1}/${maxRetries}):`, error.message);
                        if (attempt < maxRetries - 1) {
                            // Wait before retry
                            yield new Promise(resolve => setTimeout(resolve, retryDelayMs * (attempt + 1)));
                            return processWithRetry(req, attempt + 1);
                        }
                        // All retries failed, return original text as fallback
                        console.error(`[TranslationPool] All retries failed for: "${req.text}", using original text`);
                        return { text: req.text, translation: req.text, success: false };
                    }
                });
                // Process all requests in parallel
                const promises = requestsToProcess.map(req => processWithRetry(req));
                const results = yield Promise.all(promises);
                // Add successful translations to pool
                const successCount = results.filter(r => r.success).length;
                const failCount = results.length - successCount;
                results.forEach(({ text, translation }) => {
                    this.addTranslation(text, translation);
                });
                // Broadcast updates to other tabs
                this.broadcastUpdate();
                console.log(`[TranslationPool] Completed processing ${results.length} queued requests (${successCount} success, ${failCount} failed)`);
                // If there were failures, log them
                if (failCount > 0) {
                    console.warn(`[TranslationPool] ${failCount} requests failed after ${maxRetries} retries`);
                }
            });
        }
        /**
         * Check if there are any pending queued requests
         */
        hasQueuedRequests() {
            return this.queuedRequests.length > 0;
        }
        /**
         * Clear all queued requests (should be called when pool is being cleared)
         */
        clearQueuedRequests() {
            console.log(`Clearing ${this.queuedRequests.length} queued requests`);
            this.queuedRequests = [];
            this.pendingResolutions = {};
        }
        /**
         * Check if currently loading
         */
        isLoading() {
            return this.loading;
        }
        /**
         * Initialize the pool - always loads common first, then loads current fingerprint if set
         * If fingerprint is set, loads special translations; common is always preloaded
         * After loading, processes any queued translation requests
         */
        initialize() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.loading) {
                    return;
                }
                this.loading = true;
                try {
                    console.log('[TranslationPool] Starting pool initialization...');
                    // Always preload common first (required)
                    if (!this.loadedFingerprints.has('common')) {
                        yield this.loadFingerprintTranslations('common', undefined);
                        console.log('[TranslationPool] Common translations loaded');
                    }
                    // Then load current fingerprint if set and not loaded
                    if (this.currentFingerprint && !this.loadedFingerprints.has(this.currentFingerprint)) {
                        yield this.loadFingerprintTranslations(this.currentFingerprint, this.currentFingerprint);
                        console.log(`[TranslationPool] ${this.currentFingerprint} translations loaded`);
                    }
                    // Broadcast to other tabs after full initialization
                    this.broadcastUpdate();
                    console.log('[TranslationPool] Pool initialization completed');
                    // Process queued requests after pool is loaded
                    yield this.processQueuedRequests();
                }
                finally {
                    this.loading = false;
                }
            });
        }
        /**
         * Load translations for a specific fingerprint
         */
        loadFingerprintTranslations(fp, fingerprint) {
            return __awaiter(this, void 0, void 0, function* () {
                // Already loaded
                if (this.loadedFingerprints.has(fp)) {
                    return;
                }
                // Ensure pool exists for this fingerprint
                let pool = this.pools.get(fp);
                if (!pool) {
                    pool = new Map();
                    this.pools.set(fp, pool);
                }
                // Use streaming for batch loading
                yield this.client.translateStream({
                    senseId: this.senseId,
                    fingerprint,
                    batchSize: 500
                }, (response) => {
                    // Add all translations from this batch to the fingerprint's pool
                    // response.translation is a Record<string, string> (key-value map)
                    Object.entries(response.translation).forEach(([text, translate]) => {
                        pool.set(text, translate);
                    });
                    return true; // Continue streaming
                });
                // Mark as loaded
                this.loadedFingerprints.add(fp);
            });
        }
        /**
         * Switch to a different fingerprint, loads its translations if not already loaded
         * Doesn't clear existing cached translations for other fingerprints
         * @param fingerprint The fingerprint to switch to
         */
        switchFingerprint(fingerprint) {
            return __awaiter(this, void 0, void 0, function* () {
                this.currentFingerprint = fingerprint;
                // Ensure pool exists
                if (!this.pools.has(fingerprint)) {
                    this.pools.set(fingerprint, new Map());
                }
                // Load from localStorage first
                this.loadFingerprintFromStorage(fingerprint);
                // Check if we need to load from backend
                if (!this.loadedFingerprints.has(fingerprint)) {
                    yield this.loadFingerprintTranslations(fingerprint, fingerprint);
                }
            });
        }
        /**
         * Clear cached translations for a specific fingerprint to free memory
         * Doesn't affect other fingerprints or common
         * @param fingerprint The fingerprint to clear
         */
        clearFingerprint(fingerprint) {
            this.pools.delete(fingerprint);
            this.loadedFingerprints.delete(fingerprint);
            // Clear localStorage
            if (typeof localStorage !== 'undefined' && this.crossTabOptions.enabled) {
                const storageKey = this.getStorageKey(fingerprint);
                localStorage.removeItem(storageKey);
            }
        }
        /**
         * Check if a fingerprint has been loaded
         * @param fingerprint Fingerprint to check
         */
        isLoaded(fingerprint) {
            return this.loadedFingerprints.has(fingerprint);
        }
        /**
         * Load a fingerprint if not already loaded
         * @param fingerprint Fingerprint to load
         */
        loadFingerprintIfNotLoaded(fingerprint) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.loadedFingerprints.has(fingerprint)) {
                    return;
                }
                // Load from localStorage first
                this.loadFingerprintFromStorage(fingerprint);
                // Check if still not loaded after localStorage
                if (!this.loadedFingerprints.has(fingerprint)) {
                    yield this.loadFingerprintTranslations(fingerprint, fingerprint);
                }
            });
        }
        /**
         * Clear the current fingerprint to free memory (switch back to common)
         * Current fingerprint becomes null, only common remains active
         */
        clearCurrentFingerprint() {
            if (this.currentFingerprint) {
                this.clearFingerprint(this.currentFingerprint);
                this.currentFingerprint = null;
            }
        }
        /**
         * Lookup translation
         * Priority: provided fingerprint (if any) → current fingerprint (if set) → common → not found
         * @param text Original text to lookup
         * @param fingerprint Optional specific fingerprint to lookup (overrides current fingerprint)
         * @returns Lookup result
         */
        lookup(text, fingerprint) {
            // Check provided fingerprint first if given
            if (fingerprint) {
                const targetPool = this.pools.get(fingerprint);
                if (targetPool && targetPool.has(text)) {
                    return {
                        found: true,
                        translation: targetPool.get(text),
                        source: 'special'
                    };
                }
            }
            // Check current fingerprint next if we have one and no specific fingerprint provided
            if (!fingerprint && this.currentFingerprint) {
                const currentPool = this.pools.get(this.currentFingerprint);
                if (currentPool && currentPool.has(text)) {
                    return {
                        found: true,
                        translation: currentPool.get(text),
                        source: 'special'
                    };
                }
            }
            // Fallback to common
            const commonPool = this.pools.get('common');
            if (commonPool && commonPool.has(text)) {
                return {
                    found: true,
                    translation: commonPool.get(text),
                    source: 'common'
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
         * Adds to current fingerprint pool (or common if no fingerprint set)
         * @param text Original text
         * @param translation Translated text
         * @param fingerprint Optional specific fingerprint to add to (overrides current fingerprint)
         */
        addTranslation(text, translation, fingerprint) {
            const fp = fingerprint || this.currentFingerprint || 'common';
            let pool = this.pools.get(fp);
            if (!pool) {
                pool = new Map();
                this.pools.set(fp, pool);
            }
            pool.set(text, translation);
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
        requestTranslation(text, fromLang, toLang) {
            return __awaiter(this, void 0, void 0, function* () {
                const response = yield this.client.llmTranslate({
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
            });
        }
        /**
         * Get all translations for current fingerprint (includes common if needed)
         * @returns Array of {text, translation}
         */
        getAll() {
            const fp = this.currentFingerprint || 'common';
            return this.getAllForFingerprint(fp);
        }
        /**
         * Get all translations for a specific fingerprint
         * @param fp Fingerprint name
         * @returns Array of {text, translation}
         */
        getAllForFingerprint(fp) {
            const result = [];
            const pool = this.pools.get(fp);
            if (pool) {
                pool.forEach((translation, text) => {
                    result.push({ text, translation });
                });
            }
            return result;
        }
        /**
         * Clear all cached data to free memory
         */
        clearAll() {
            // Clear all fingerprints from memory
            this.pools.clear();
            this.loadedFingerprints.clear();
            this.currentFingerprint = null;
            // Re-initialize common pool
            this.pools.set('common', new Map());
            // Clear all localStorage for this sense
            if (typeof localStorage !== 'undefined' && this.crossTabOptions.enabled) {
                // We can't easily iterate all fingerprints, but at least clear common
                const storageKey = this.getStorageKey('common');
                localStorage.removeItem(storageKey);
            }
            // Broadcast clear to other tabs
            if (this.broadcastChannel && this.crossTabOptions.enabled) {
                this.broadcastChannel.postMessage({
                    type: 'cache_clear',
                    senseId: this.senseId,
                    fingerprint: undefined
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
    /**
     * Simple LRU Cache implementation for TranslationClient
     * Uses Map with access order for O(1) get/set operations
     */
    class LRUCache {
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
     * TranslationClient - Main entry point for Laker Translation SDK
     *
     * Features:
     * - Automatic cache lookup: preloaded translations → LRU cache → backend request
     * - Fingerprint-based personalized translations support
     * - Optional cross-browser-tab cache synchronization
     * - Lazy initialization: automatically preloads on first use
     * - Simple single-level API, no complex layering
     */
    class TranslationClient {
        /**
         * Create a new TranslationClient - the only entry point you need
         * @param config Client configuration
         */
        constructor(config) {
            this.currentFingerprint = null;
            this.initialized = false;
            this.initPromise = null;
            // Cross-tab for LLM cache
            this.broadcastChannel = null;
            this.config = config;
            this.token = config.token;
            // Default baseUrl includes the API path prefix /api/v1/translate
            this.baseUrl = (config.baseUrl || 'https://api.hottol.com/laker/api/v1/translate').endsWith('/')
                ? (config.baseUrl || 'https://api.hottol.com/laker/api/v1/translate').slice(0, -1)
                : (config.baseUrl || 'https://api.hottol.com/laker/api/v1/translate');
            this.timeout = config.timeout || 30000;
            // Configure LRU cache for LLM translations
            this.llmCacheEnabled = config.useCache !== false;
            const llmCacheSize = this.llmCacheEnabled ? (config.cacheSize || 1000) : 0;
            this.llmCache = new LRUCache(llmCacheSize);
            // Configure cross-tab options for translation pool
            const crossTabOptions = {
                enabled: config.crossTab === true,
            };
            if (config.crossTabChannelName) {
                crossTabOptions.channelName = config.crossTabChannelName;
            }
            if (config.crossTabStorageKeyPrefix) {
                crossTabOptions.storageKeyPrefix = config.crossTabStorageKeyPrefix;
            }
            // Create translation pool for pre-loaded translations
            this.pool = new TranslationPool(this, config.senseId, crossTabOptions);
            // Set initial fingerprint if provided
            if (config.fingerprint) {
                this.currentFingerprint = config.fingerprint;
                this.pool['currentFingerprint'] = config.fingerprint;
            }
            // Cross-tab for LLM cache
            this.crossTabOptions = Object.assign({}, defaultClientCrossTabOptions);
            this.storageKey = this.crossTabOptions.storageKey;
            // Initialize cross-tab synchronization if enabled
            if (config.crossTab && typeof BroadcastChannel !== 'undefined') {
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
                            this.llmCache.set(message.key, message.data);
                        }
                        break;
                    case 'cache_clear':
                        this.llmCache.clear();
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
                        this.llmCache.set(key, value);
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
            const cacheMap = this.llmCache.cache;
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
         * Enable or disable LLM cache
         * @param enabled Whether to enable cache
         */
        setCacheEnabled(enabled) {
            this.llmCacheEnabled = enabled;
        }
        /**
         * Clear the LLM translation cache (also clears localStorage and broadcasts to other tabs)
         */
        clearCache() {
            this.llmCache.clear();
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
         * Get current LLM cache size
         */
        getCacheSize() {
            return this.llmCache.size;
        }
        /**
         * Check if cross-tab synchronization is enabled
         */
        isCrossTabEnabled() {
            return this.crossTabOptions.enabled;
        }
        /**
      凤   * GetSenseTranslate - One-shot unary request with pagination
         * @param request Request parameters
         */
        getSenseTranslate(request) {
            return __awaiter(this, void 0, void 0, function* () {
                const url = `${this.baseUrl}/TranslationService/GetSenseTranslate`;
                const response = yield this.fetchJson(url, request);
                return response;
            });
        }
        /**
         * TranslateStream - Server streaming, receives multiple batches progressively
         * @param request Request parameters
         * @param onBatch Callback for each batch received. Return false to stop streaming early.
         */
        translateStream(request, onBatch) {
            return __awaiter(this, void 0, void 0, function* () {
                const url = `${this.baseUrl}/TranslationService/TranslateStream`;
                // For gRPC-Web streaming over HTTP, we use POST with streaming response
                const response = yield this.fetchWithTimeout(url, {
                    method: 'POST',
                    body: JSON.stringify(request),
                    headers: this.getHeaders()
                });
                if (!response.ok) {
                    const text = yield response.text();
                    throw new Error(`HTTP ${response.status}: ${text}`);
                }
                if (!response.body) {
                    throw new Error('No response body for streaming request');
                }
                const decoder = new TextDecoder();
                // Handle both browser ReadableStream and Node.js stream from node-fetch
                // Check for Node.js stream first (node-fetch v2 uses Node.js streams)
                if ('on' in response.body && typeof response.body.on === 'function') {
                    // Node.js Stream (for testing)
                    yield new Promise((resolve, reject) => {
                        let buffer = '';
                        response.body.on('data', (chunk) => {
                            buffer += chunk.toString();
                            const lines = buffer.split('\n').filter(line => line.trim().length > 0);
                            // Keep incomplete line in buffer
                            if (!buffer.endsWith('\n')) {
                                buffer = lines.pop() || '';
                            }
                            else {
                                buffer = '';
                            }
                            for (const line of lines) {
                                try {
                                    const data = JSON.parse(line);
                                    const shouldContinue = onBatch(data);
                                    if (shouldContinue === false) {
                                        response.body.destroy();
                                        resolve();
                                        return;
                                    }
                                }
                                catch (e) {
                                    console.warn('Failed to parse streaming chunk:', line, e);
                                }
                            }
                        });
                        response.body.on('end', () => {
                            // Process any remaining data
                            if (buffer.trim().length > 0) {
                                try {
                                    const data = JSON.parse(buffer.trim());
                                    onBatch(data);
                                }
                                catch (e) {
                                    console.warn('Failed to parse final chunk:', buffer, e);
                                }
                            }
                            resolve();
                        });
                        response.body.on('error', (err) => {
                            reject(err);
                        });
                    });
                }
                else if ('getReader' in response.body && typeof response.body.getReader === 'function') {
                    // Browser ReadableStream (whatwg streams)
                    const reader = response.body.getReader();
                    while (true) {
                        const { done, value } = yield reader.read();
                        if (done) {
                            break;
                        }
                        const chunk = decoder.decode(value);
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
                else {
                    throw new Error('Unsupported response body stream type');
                }
            });
        }
        /**
         * Collect all streaming responses into an array
         * @param request Request parameters
         */
        translateStreamCollect(request) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = [];
                yield this.translateStream(request, (response) => {
                    result.push(response);
                    return true;
                });
                return result;
            });
        }
        /**
         * LLMTranslate - One-shot large language model translation
         * Uses LRU cache to avoid repeated requests for the same text
         * With cross-tab enabled, automatically syncs cache across browser tabs
         * @param request Translation request
         * @param skipCache If true, bypass cache and always request from backend
         */
        llmTranslate(request_1) {
            return __awaiter(this, arguments, void 0, function* (request, skipCache = false) {
                const cacheKey = generateCacheKey(request);
                // Check cache first
                if (this.llmCacheEnabled && !skipCache) {
                    const cached = this.llmCache.get(cacheKey);
                    if (cached) {
                        // Return cached response with cached flag set
                        return Object.assign(Object.assign({}, cached), { cached: true });
                    }
                }
                // Request from backend using gRPC-web streaming LLMTranslateStream
                let finalResponse = null;
                yield this.llmTranslateStream(request, (response) => {
                    finalResponse = response;
                    // Continue until finished
                    return !response.finished;
                });
                if (!finalResponse) {
                    throw new Error('No response received from streaming translation');
                }
                // Cache the response
                if (this.llmCacheEnabled && finalResponse.translatedText) {
                    const cachedResponse = Object.assign(Object.assign({}, finalResponse), { cached: true });
                    this.llmCache.set(cacheKey, cachedResponse);
                    // Broadcast to other tabs and save to localStorage
                    this.broadcastCacheUpdate(cacheKey, cachedResponse);
                }
                return Object.assign(Object.assign({}, finalResponse), { cached: false });
            });
        }
        // ========== High-level translation API ==========
        /**
         * Translate text - this is the main method you need
         *
         * Workflow:
         * 1. Check pre-loaded translation pool (provided fingerprint → current fingerprint → common)
         * 2. If found, return immediately from cache
         * 3. If not found, request LLM translation from backend
         * 4. Auto-initialize on first call
         *
         * @param text Text to translate
         * @param toLang Target language
         * @param fromLang Source language (optional, auto-detected if not provided)
         * @param fingerprint Optional specific fingerprint for this translation (overrides client-level fingerprint)
         * @returns Translated text
         */
        translate(text, toLang, fromLang, fingerprint) {
            return __awaiter(this, void 0, void 0, function* () {
                const response = yield this.translateWithDetails(text, toLang, fromLang, fingerprint);
                return response.translatedText;
            });
        }
        /**
         * Translate text with full response details
         * @param text Text to translate
         * @param toLang Target language
         * @param fromLang Source language (optional)
         * @param fingerprint Optional specific fingerprint for this translation (overrides client-level fingerprint)
         * @returns Full translation response
         */
        translateWithDetails(text, toLang, fromLang, fingerprint) {
            return __awaiter(this, void 0, void 0, function* () {
                // Auto-initialize if not initialized yet
                if (!this.initialized && !this.initPromise) {
                    this.initPromise = this.initialize();
                }
                // Check if pool is currently loading
                const isPoolLoading = this.pool.isLoading();
                // If pool is loading, use observer pattern to queue request and return original immediately
                if (isPoolLoading) {
                    console.log(`[TranslationClient] Pool is loading, using fast fallback for: "${text}"`);
                    return this.pool.queueTranslationRequest({ text, toLang, fromLang, fingerprint });
                }
                // Wait for initialization to complete if still in progress
                if (this.initPromise) {
                    yield this.initPromise;
                    this.initPromise = null;
                    this.initialized = true;
                }
                // If specific fingerprint provided and not loaded yet, load it first
                if (fingerprint && !this.pool.isLoaded(fingerprint)) {
                    yield this.pool.loadFingerprintIfNotLoaded(fingerprint);
                }
                // Check pre-loaded translation pool first
                const lookup = this.pool.lookup(text, fingerprint);
                if (lookup.found) {
                    return {
                        originalText: text,
                        translatedText: lookup.translation,
                        provider: 'preloaded',
                        timestamp: Date.now(),
                        finished: true,
                        cached: true,
                        fromLang,
                        toLang
                    };
                }
                // Not found in pool - request from backend via TranslateStream
                // This will automatically call LLM if translation doesn't exist in database
                return new Promise((resolve, reject) => {
                    this.translateStream({
                        senseId: this.config.senseId,
                        fingerprint,
                        text,
                        from_lang: fromLang,
                        to_lang: toLang
                    }, (response) => {
                        // Check if we got a translation
                        if (response.translation && response.translation[text]) {
                            resolve({
                                originalText: text,
                                translatedText: response.translation[text],
                                provider: 'translate-stream',
                                timestamp: response.timestamp,
                                finished: response.finished,
                                cached: false,
                                fromLang,
                                toLang
                            });
                            return false; // Stop streaming
                        }
                        // Check for error
                        if (response.translation && response.translation['error']) {
                            reject(new Error(response.translation['error']));
                            return false;
                        }
                        // Continue if not finished
                        return !response.finished;
                    }).catch(reject);
                });
            });
        }
        /**
         * Translate without using cache (always request from backend)
         * @param text Text to translate
         * @param toLang Target language
         * @param fromLang Source language (optional)
         * @param fingerprint Optional specific fingerprint for this translation
         * @returns Translated text
         */
        translateNoCache(text, toLang, fromLang, fingerprint) {
            return __awaiter(this, void 0, void 0, function* () {
                // Use TranslateStream which will automatically call LLM if needed
                return new Promise((resolve, reject) => {
                    this.translateStream({
                        senseId: this.config.senseId,
                        fingerprint,
                        text,
                        from_lang: fromLang,
                        to_lang: toLang
                    }, (response) => {
                        if (response.translation && response.translation[text]) {
                            resolve(response.translation[text]);
                            return false;
                        }
                        if (response.translation && response.translation['error']) {
                            reject(new Error(response.translation['error']));
                            return false;
                        }
                        return !response.finished;
                    }).catch(reject);
                });
            });
        }
        /**
         * Batch translate multiple texts
         * @param texts Array of texts to translate
         * @param toLang Target language
         * @param fromLang Source language (optional)
         * @param fingerprint Optional specific fingerprint for all translations in this batch
         * @returns Array of translated texts in same order
         */
        translateBatch(texts, toLang, fromLang, fingerprint) {
            return __awaiter(this, void 0, void 0, function* () {
                const results = yield Promise.all(texts.map(text => this.translate(text, toLang, fromLang, fingerprint)));
                return results;
            });
        }
        /**
         * Initialize and preload all translations
         * Call this to warm up cache before translating
         */
        preload() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.initialized && !this.initPromise) {
                    this.initPromise = this.initialize();
                    yield this.initPromise;
                    this.initPromise = null;
                    this.initialized = true;
                }
            });
        }
        /**
         * Internal initialization - preloads translations via streaming
         */
        initialize() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.llmCacheEnabled) {
                    yield this.pool.initialize();
                }
            });
        }
        /**
         * Check if service is initialized
         */
        isInitialized() {
            return this.initialized;
        }
        // ========== Fingerprint management ==========
        /**
         * Set or change the current fingerprint
         * Automatically loads special translations for this fingerprint
         * @param fingerprint The fingerprint to use
         */
        setFingerprint(fingerprint) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.currentFingerprint === fingerprint) {
                    return;
                }
                this.currentFingerprint = fingerprint;
                yield this.pool.switchFingerprint(fingerprint);
            });
        }
        /**
         * Clear the current fingerprint
         * Falls back to common translations
         */
        clearFingerprint() {
            this.currentFingerprint = null;
            this.pool.clearCurrentFingerprint();
        }
        /**
         * Get the current fingerprint
         */
        getFingerprint() {
            return this.currentFingerprint;
        }
        // ========== Cache management ==========
        /**
         * Check if cache is enabled
         * @returns true if cache is enabled
         */
        isCacheEnabled() {
            return this.llmCacheEnabled;
        }
        /**
         * Check if a translation exists in pre-loaded pool
         * @param text Text to check
         * @param fingerprint Optional specific fingerprint to check
         * @returns true if translation exists in cache
         */
        hasTranslation(text, fingerprint) {
            return this.pool.lookup(text, fingerprint).found;
        }
        /**
         * Get translation from pre-loaded cache without requesting from backend
         * @param text Text to look up
         * @param fingerprint Optional specific fingerprint to look up
         * @returns Translation if found, null otherwise
         */
        getCached(text, fingerprint) {
            const result = this.pool.lookup(text, fingerprint);
            return result.found ? result.translation : null;
        }
        /**
         * Add a custom translation to the pre-loaded pool
         * @param text Original text
         * @param translation Translated text
         * @param fingerprint Optional specific fingerprint to add to
         */
        addTranslation(text, translation, fingerprint) {
            if (this.llmCacheEnabled) {
                this.pool.addTranslation(text, translation, fingerprint);
            }
        }
        /**
         * Clear all cached translations
         */
        clearAllCache() {
            this.pool.clearAll();
            this.pool.clearQueuedRequests(); // Clear waiting translation requests too
            this.clearCache(); // Clear LLM cache too
        }
        /**
         * Destroy the instance and free resources
         * Call this when the instance is no longer needed
         */
        destroy() {
            this.pool.destroy();
            if (this.broadcastChannel) {
                this.broadcastChannel.close();
                this.broadcastChannel = null;
            }
        }
        /**
         * LLMTranslateStream - Streaming large language model translation
         * Note: Streaming requests are not cached
         * @param request Translation request
         * @param onResponse Callback for each response chunk
         */
        llmTranslateStream(request, onResponse) {
            return __awaiter(this, void 0, void 0, function* () {
                const url = `${this.baseUrl}/TranslationService/LLMTranslateStream`;
                const response = yield this.fetchWithTimeout(url, {
                    method: 'POST',
                    body: JSON.stringify(request),
                    headers: this.getHeaders()
                });
                if (!response.ok) {
                    const text = yield response.text();
                    throw new Error(`HTTP ${response.status}: ${text}`);
                }
                if (!response.body) {
                    throw new Error('No response body for streaming request');
                }
                const decoder = new TextDecoder();
                // Handle both browser ReadableStream and Node.js stream from node-fetch
                // Check for Node.js stream first (node-fetch v2 uses Node.js streams)
                if ('on' in response.body && typeof response.body.on === 'function') {
                    // Node.js Stream (for testing)
                    yield new Promise((resolve, reject) => {
                        let buffer = '';
                        response.body.on('data', (chunk) => {
                            buffer += chunk.toString();
                            const lines = buffer.split('\n').filter(line => line.trim().length > 0);
                            // Keep incomplete line in buffer
                            if (!buffer.endsWith('\n')) {
                                buffer = lines.pop() || '';
                            }
                            else {
                                buffer = '';
                            }
                            for (const line of lines) {
                                try {
                                    const data = JSON.parse(line);
                                    const shouldContinue = onResponse(data);
                                    if (shouldContinue === false) {
                                        response.body.destroy();
                                        resolve();
                                        return;
                                    }
                                }
                                catch (e) {
                                    console.warn('Failed to parse streaming chunk:', line, e);
                                }
                            }
                        });
                        response.body.on('end', () => {
                            // Process any remaining data
                            if (buffer.trim().length > 0) {
                                try {
                                    const data = JSON.parse(buffer.trim());
                                    onResponse(data);
                                }
                                catch (e) {
                                    console.warn('Failed to parse final chunk:', buffer, e);
                                }
                            }
                            resolve();
                        });
                        response.body.on('error', (err) => {
                            reject(err);
                        });
                    });
                }
                else if ('getReader' in response.body && typeof response.body.getReader === 'function') {
                    // Browser ReadableStream (whatwg streams)
                    const reader = response.body.getReader();
                    while (true) {
                        const { done, value } = yield reader.read();
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
                else {
                    throw new Error('Unsupported response body type');
                }
            });
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
        fetchJson(url, body) {
            return __awaiter(this, void 0, void 0, function* () {
                const response = yield this.fetchWithTimeout(url, {
                    method: 'POST',
                    body: JSON.stringify(body),
                    headers: this.getHeaders()
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return yield response.json();
            });
        }
        fetchWithTimeout(url, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), this.timeout);
                const response = yield fetch(url, Object.assign(Object.assign({}, options), { signal: controller.signal }));
                clearTimeout(id);
                return response;
            });
        }
        /**
         * Get cache statistics for both pre-loaded translations and LLM translations
         * @returns Human-readable cache statistics string
         */
        getStats() {
            let preloadedCount = 0;
            const fingerprintCount = [];
            // Use type assertion to access private pools property
            const pools = this.pool.pools;
            pools.forEach((cache, fp) => {
                const count = cache.size;
                preloadedCount += count;
                fingerprintCount.push(`${fp}: ${count}`);
            });
            const llmCount = this.llmCache.size;
            const llmEnabled = this.llmCacheEnabled;
            return [
                `Pre-loaded translations: ${preloadedCount} total`,
                ...(fingerprintCount.length > 0 ? [`  Breakdown by fingerprint: ${fingerprintCount.join(', ')}`] : []),
                `LLM translation cache: ${llmEnabled ? `${llmCount} entries` : 'disabled'}`
            ].join('\n');
        }
    }
    /**
     * Create a TranslationClient instance with simplified configuration
     * @param token JWT authentication token
     * @param senseId Translation sense ID
     * @param options Additional options
     * @returns TranslationClient instance
     */
    function createTranslation(token, senseId, options) {
        return new TranslationClient(Object.assign({ token,
            senseId }, options));
    }
    // Auto-export to global for browser usage
    if (typeof window !== 'undefined') {
        window.LakerTranslation = {
            TranslationClient,
            createTranslation,
            default: createTranslation
        };
    }

    exports.TranslationClient = TranslationClient;
    exports.createTranslation = createTranslation;
    exports.default = createTranslation;
    exports.extractTemplate = extractTemplate;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
