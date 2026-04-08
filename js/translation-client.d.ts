/**
 * Translation Service gRPC-Web TypeScript/JavaScript Client
 *
 * Auto-generated for api.laker.dev Translation Service
 * Service: TranslationService
 * Source: proto/translation.proto
 */
export interface TranslateRecord {
    id: string;
    text: string;
    translate: string;
    isCustom: boolean;
}
export interface GetSenseTranslateRequest {
    senseId: string;
    fingerprint?: string;
    page?: number;
    pageSize?: number;
    src_lang?: string;
    dst_lang?: string;
}
export interface GetSenseTranslateResponse {
    senseId: string;
    total: number;
    page: number;
    pageSize: number;
    result: TranslateRecord[];
}
export interface TranslateStreamRequest {
    senseId: string;
    fingerprint?: string;
    batchSize?: number;
    text?: string;
    from_lang?: string;
    to_lang?: string;
}
export interface TranslateStreamResponse {
    original_text: string;
    translation: Record<string, string>;
    timestamp: number;
    finished: boolean;
    batch_index: number;
}
/**
 * Result of template extraction
 */
export interface TemplateExtractResult {
    isTemplated: boolean;
    srcTemplate: string;
    dstTemplate: string;
    variables: string[];
}
export interface LLMTranslateRequest {
    text: string;
    fromLang?: string;
    toLang: string;
    provider?: string;
    senseId?: string;
    fingerprint?: string;
}
export interface LLMTranslateResponse {
    originalText: string;
    translatedText: string;
    provider: string;
    timestamp: number;
    finished: boolean;
    cached: boolean;
    fromLang?: string;
    toLang?: string;
}
/**
 * Result of translation lookup in TranslationPool
 */
export interface TranslationLookupResult {
    found: boolean;
    translation: string;
    source: 'special' | 'common' | null;
}
/**
 * Cross-tab cache synchronization options
 */
export interface CrossTabOptions {
    enabled: boolean;
    channelName?: string;
    storageKeyPrefix?: string;
}
/**
 * Automatic template extraction from text containing numeric variables
 * @param text Original text that may contain numeric variables
 * @returns Template extraction result
 */
export declare function extractTemplate(text: string): TemplateExtractResult;
/**
 * Translation options
 */
export interface TranslationServiceOptions {
    senseId: string;
    fingerprint?: string;
    fromLang?: string;
    toLang?: string;
    crossTab?: boolean;
    crossTabChannelName?: string;
    crossTabStorageKeyPrefix?: string;
}
/**
 * Cross-tab cache synchronization options for TranslationClient
 */
export interface ClientCrossTabOptions {
    enabled: boolean;
    channelName?: string;
    storageKey?: string;
}
export interface TranslationClientConfig {
    /** JWT authentication token */
    token: string;
    /** Translation sense ID */
    senseId: string;
    /** API base URL (optional, defaults to https://api.hottol.com/laker/) */
    baseUrl?: string;
    /** Request timeout in milliseconds (optional, defaults to 30000) */
    timeout?: number;
    /** LRU cache size (optional, defaults to 1000, set to 0 to disable cache) */
    cacheSize?: number;
    /** Initial fingerprint for personalized translations (optional) */
    fingerprint?: string;
    /** Enable cross-tab cache synchronization (optional, default: false) */
    crossTab?: boolean;
    /** Custom cross-tab channel name (optional) */
    crossTabChannelName?: string;
    /** Custom cross-tab storage key prefix (optional) */
    crossTabStorageKeyPrefix?: string;
    /** Enable cache (optional, default: true, set false to disable all caching) */
    useCache?: boolean;
}
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
export declare class TranslationClient {
    private baseUrl;
    private token;
    private timeout;
    private config;
    private llmCacheEnabled;
    private llmCache;
    private pool;
    private currentFingerprint;
    private initialized;
    private initPromise;
    private currentToLang;
    private languageVersion;
    private currentAbortController;
    private broadcastChannel;
    private crossTabOptions;
    private storageKey;
    private persistentConnection;
    private connectionState;
    private pendingRequests;
    private nextRequestId;
    private connectPromise;
    private reconnectDelay;
    private maxReconnectDelay;
    private shouldReconnect;
    onTranslationUpdated: ((text: string, translation: string) => void) | null;
    onPoolInitialized: (() => void) | null;
    onQueueProcessed: ((count: number) => void) | null;
    private translationUpdatedSubscribers;
    private poolInitializedSubscribers;
    private queueProcessedSubscribers;
    /**
     * Create a new TranslationClient - the only entry point you need
     * @param config Client configuration
     */
    constructor(config: TranslationClientConfig);
    /**
     * Set up callbacks to forward TranslationPool events to TranslationClient subscribers
     */
    private setupReactiveCallbacks;
    /**
     * Subscribe to translation update events
     * Called when a new translation is added to the pool
     * @param callback Function called with (text, translation) when translation is updated
     * @returns Unsubscribe function
     */
    subscribeTranslationUpdated(callback: (text: string, translation: string) => void): () => void;
    /**
     * Unsubscribe from translation update events
     * @param callback The callback to remove
     */
    unsubscribeTranslationUpdated(callback: (text: string, translation: string) => void): void;
    /**
     * Subscribe to pool initialization complete events
     * @param callback Function called when pool is fully initialized
     * @returns Unsubscribe function
     */
    subscribePoolInitialized(callback: () => void): () => void;
    /**
     * Unsubscribe from pool initialization events
     * @param callback The callback to remove
     */
    unsubscribePoolInitialized(callback: () => void): void;
    /**
     * Subscribe to queue processed events
     * Called when queued translation requests are processed
     * @param callback Function called with the count of processed requests
     * @returns Unsubscribe function
     */
    subscribeQueueProcessed(callback: (count: number) => void): () => void;
    /**
     * Unsubscribe from queue processed events
     * @param callback The callback to remove
     */
    unsubscribeQueueProcessed(callback: (count: number) => void): void;
    /**
     * Notify all subscribers when a translation is updated
     */
    private notifyTranslationUpdated;
    /**
     * Notify all subscribers when pool is initialized
     */
    private notifyPoolInitialized;
    /**
     * Notify all subscribers when queue is processed
     */
    private notifyQueueProcessed;
    /**
     * Initialize cross-tab synchronization via Broadcast Channel
     */
    private initCrossTabSync;
    /**
     * Load cache from localStorage
     */
    private loadFromStorage;
    /**
     * Save cache to localStorage
     */
    private saveToStorage;
    /**
     * Get all cache entries for storage/broadcast
     */
    private getAllCacheEntries;
    /**
     * Broadcast full cache to other tabs
     */
    private broadcastFullCache;
    /**
     * Broadcast a single cache update to other tabs
     */
    private broadcastCacheUpdate;
    /**
     * Set or update the JWT authentication token
     * @param token JWT token
     */
    setToken(token: string): void;
    /**
     * Enable or disable LLM cache
     * @param enabled Whether to enable cache
     */
    setCacheEnabled(enabled: boolean): void;
    /**
     * Clear the LLM translation cache (also clears localStorage and broadcasts to other tabs)
     */
    clearCache(): void;
    /**
     * Get current LLM cache size
     */
    getCacheSize(): number;
    /**
     * Check if cross-tab synchronization is enabled
     */
    isCrossTabEnabled(): boolean;
    /**
  凤   * GetSenseTranslate - One-shot unary request with pagination
     * @param request Request parameters
     */
    getSenseTranslate(request: GetSenseTranslateRequest): Promise<GetSenseTranslateResponse>;
    /**
     * TranslateStream - Server streaming, receives multiple batches progressively
     * @param request Request parameters
     * @param onBatch Callback for each batch received. Return false to stop streaming early.
     */
    translateStream(request: TranslateStreamRequest, onBatch: (response: TranslateStreamResponse) => boolean | void): Promise<void>;
    /**
     * Collect all streaming responses into an array
     * @param request Request parameters
     */
    translateStreamCollect(request: TranslateStreamRequest): Promise<TranslateStreamResponse[]>;
    /**
     * LLMTranslate - One-shot large language model translation
     * Uses LRU cache to avoid repeated requests for the same text
     * With cross-tab enabled, automatically syncs cache across browser tabs
     * @param request Translation request
     * @param skipCache If true, bypass cache and always request from backend
     */
    llmTranslate(request: LLMTranslateRequest, skipCache?: boolean): Promise<LLMTranslateResponse>;
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
    translate(text: string, toLang: string, fromLang?: string, fingerprint?: string): Promise<string>;
    /**
     * Translate text with full response details
     * @param text Text to translate
     * @param toLang Target language
     * @param fromLang Source language (optional)
     * @param fingerprint Optional specific fingerprint for this translation (overrides client-level fingerprint)
     * @returns Full translation response
     */
    translateWithDetails(text: string, toLang: string, fromLang?: string, fingerprint?: string): Promise<LLMTranslateResponse>;
    /**
     * Translate without using cache (always request from backend)
     * @param text Text to translate
     * @param toLang Target language
     * @param fromLang Source language (optional)
     * @param fingerprint Optional specific fingerprint for this translation
     * @returns Translated text
     */
    translateNoCache(text: string, toLang: string, fromLang?: string, fingerprint?: string): Promise<string>;
    /**
     * Batch translate multiple texts
     * @param texts Array of texts to translate
     * @param toLang Target language
     * @param fromLang Source language (optional)
     * @param fingerprint Optional specific fingerprint for all translations in this batch
     * @returns Array of translated texts in same order
     */
    translateBatch(texts: string[], toLang: string, fromLang?: string, fingerprint?: string): Promise<string[]>;
    /**
     * Initialize and preload all translations for a given target language
     * Call this to warm up cache before translating
     */
    preload(toLang: string): Promise<void>;
    /**
     * Internal initialization - preloads translations via streaming for a specific language
     * @param toLang Target language for initialization (required)
     */
    private initialize;
    /**
     * Check if service is initialized
     */
    isInitialized(): boolean;
    /**
     * Set or change the current fingerprint
     * Automatically loads special translations for this fingerprint
     * @param fingerprint The fingerprint to use
     */
    setFingerprint(fingerprint: string): Promise<void>;
    /**
     * Clear the current fingerprint
     * Falls back to common translations
     */
    clearFingerprint(): void;
    /**
     * Get the current fingerprint
     */
    getFingerprint(): string | null;
    /**
     * Check if cache is enabled
     * @returns true if cache is enabled
     */
    isCacheEnabled(): boolean;
    /**
     * Check if a translation exists in pre-loaded pool for a specific language
     * @param text Text to check
     * @param fingerprint Optional specific fingerprint to check
     * @param toLang Target language to check (uses currentToLang if not provided)
     * @returns true if translation exists in cache
     */
    hasTranslation(text: string, fingerprint?: string, toLang?: string): boolean;
    /**
     * Get translation from pre-loaded cache without requesting from backend
     * @param text Text to look up
     * @param fingerprint Optional specific fingerprint to look up
     * @param toLang Target language to look up (uses currentToLang if not provided)
     * @returns Translation if found, null otherwise
     */
    getCached(text: string, fingerprint?: string, toLang?: string): string | null;
    /**
     * Add a custom translation to the pre-loaded pool for a specific language
     * @param text Original text
     * @param translation Translated text
     * @param fingerprint Optional specific fingerprint to add to
     * @param toLang Target language (uses currentToLang if not provided)
     */
    addTranslation(text: string, translation: string, fingerprint?: string, toLang?: string): void;
    /**
     * Clear all cached translations
     */
    clearAllCache(): void;
    /**
     * Check if a specific language has been loaded
     * @param toLang Target language to check
     * @returns true if the language has been loaded
     */
    isLanguageLoaded(toLang: string): boolean;
    /**
     * Get all loaded languages
     * @returns Array of loaded language codes
     */
    getLoadedLanguages(): string[];
    /**
     * Clear cached data for a specific language only
     * Preserves caches for other languages
     * @param toLang Target language to clear
     */
    clearLanguage(toLang: string): void;
    /**
     * Destroy the instance and free resources
     * Call this when the instance is no longer needed
     */
    destroy(): void;
    /**
     * LLMTranslateStream - Streaming large language model translation
     * Note: Streaming requests are not cached
     * @param request Translation request
     * @param onResponse Callback for each response chunk
     */
    llmTranslateStream(request: LLMTranslateRequest, onResponse: (response: LLMTranslateResponse) => boolean | void): Promise<void>;
    /**
     * Ensure the persistent connection is connected and ready
     */
    private ensureConnected;
    /**
     * Connect the persistent EventSource connection
     */
    private connectPersistentConnection;
    /**
     * Handle connection disconnection and schedule reconnect
     */
    private handleDisconnection;
    /**
     * Close the persistent connection
     */
    private closePersistentConnection;
    /**
     * Send a request over the persistent connection
     * @param method The method name to call
     * @param request The request body
     * @param onMessage Callback for each message received
     * @returns Promise that resolves when streaming is complete
     */
    private sendPersistentRequest;
    private getHeaders;
    private fetchJson;
    private fetchWithTimeout;
    /**
     * Get cache statistics for both pre-loaded translations and LLM translations
     * @returns Human-readable cache statistics string
     */
    getStats(): string;
}
/**
 * Create a TranslationClient instance with simplified configuration
 * @param token JWT authentication token
 * @param senseId Translation sense ID
 * @param options Additional options
 * @returns TranslationClient instance
 */
export declare function createTranslation(token: string, senseId: string, options?: Partial<TranslationClientConfig>): TranslationClient;
export default createTranslation;
