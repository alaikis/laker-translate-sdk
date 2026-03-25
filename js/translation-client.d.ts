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
}
export interface GetSenseTranslateResponse {
    senseId: string;
    total: number;
    page: number;
    pageSize: number;
    translations: TranslateRecord[];
}
export interface TranslateStreamRequest {
    senseId: string;
    fingerprint?: string;
    batchSize?: number;
}
export interface TranslateStreamResponse {
    batch: number;
    hasMore: boolean;
    total: number;
    translations: TranslateRecord[];
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
    crossTab?: boolean;
    crossTabChannelName?: string;
    crossTabStorageKeyPrefix?: string;
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
export declare class TranslationService {
    private client;
    private pool;
    private initialized;
    private initPromise;
    private options;
    /**
     * Create a new TranslationService instance
     * @param client TranslationClient instance (or base URL string to create one automatically)
     * @param options Translation service options including senseId and optional fingerprint/cross-tab settings
     */
    constructor(client: TranslationClient | string, options: TranslationServiceOptions);
    /**
     * Ensure the service is initialized (lazy initialization)
     * Called automatically by translate() if needed
     */
    private ensureInitialized;
    /**
     * Actual initialization logic
     */
    private doInitialize;
    /**
     * Initialize the translation service - loads all translations from backend
     *
     * This is optional - translate() will automatically initialize if needed.
     * Call this explicitly if you want to preload all translations upfront.
     *
     * Automatically handles cross-tab synchronization if enabled.
     */
    initialize(): Promise<void>;
    /**
     * Check if service has been initialized
     */
    isInitialized(): boolean;
    /**
     * Switch to a different fingerprint (for personalized/custom translations)
     * Automatically loads all translations for this fingerprint
     * @param fingerprint - The fingerprint to switch to
     */
    switchFingerprint(fingerprint: string): Promise<void>;
    /**
     * Clear the current fingerprint - frees memory
     */
    clearCurrentFingerprint(): void;
    /**
     * Add a custom translation to the current pool
     * @param text - Original text
     * @param translation - Translated text
     */
    addCustomTranslation(text: string, translation: string): void;
    /**
     * Lookup translation in cache
     * Note: If not initialized, will return not found
     * @param text - Text to lookup
     * @returns Lookup result with found flag and translation if available
     */
    lookup(text: string): TranslationLookupResult;
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
    translate(text: string, toLang: string, fromLang?: string, provider?: string): Promise<LLMTranslateResponse>;
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
    translateDirect(text: string, toLang: string, fromLang?: string, provider?: string): Promise<LLMTranslateResponse>;
    /**
     * Stream translations from backend in batches
     * Used for bulk loading all translations in a sense
     *
     * @param request - Stream request parameters
     * @param onBatch - Callback for each batch received
     */
    streamTranslate(request: TranslateStreamRequest, onBatch: (response: TranslateStreamResponse) => boolean | void): Promise<void>;
    /**
     * Get the sense ID this service is connected to
     */
    getSenseId(): string;
    /**
     * Clear all cached data to free memory
     */
    clearAll(): void;
    /**
     * Destroy the service, close connections and free resources
     * Should be called when the service is no longer needed
     */
    destroy(): void;
}
/**
 * Cross-tab cache synchronization options for TranslationClient
 */
export interface ClientCrossTabOptions {
    enabled: boolean;
    channelName?: string;
    storageKey?: string;
}
/**
 * TranslationClient - Low-level gRPC-Web compatible client for TranslationService
 * Uses JSON over HTTP transport for compatibility
 * Includes LRU cache with optional Broadcast Channel + localStorage synchronization
 */
export declare class TranslationClient {
    private baseUrl;
    private token;
    private timeout;
    private cache;
    private cacheEnabled;
    private crossTabOptions;
    private broadcastChannel;
    private storageKey;
    /**
     * Create a new TranslationClient
     * @param baseUrl Base URL of the gRPC-Web endpoint, defaults to https://api.hottol.com/laker/
     * @param token JWT authentication token (optional)
     * @param timeout Request timeout in milliseconds (default: 30000)
     * @param cacheSize LRU cache size (default: 1000, set to 0 to disable cache)
     * @param crossTabOptions Cross-tab synchronization options (default: disabled)
     */
    constructor(baseUrl?: string, token?: string, timeout?: number, cacheSize?: number, crossTabOptions?: Partial<ClientCrossTabOptions>);
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
     * Enable or disable cache
     * @param enabled Whether to enable cache
     */
    setCacheEnabled(enabled: boolean): void;
    /**
     * Clear the translation cache (also clears localStorage and broadcasts to other tabs)
     */
    clearCache(): void;
    /**
     * Get current cache size
     */
    getCacheSize(): number;
    /**
     * Check if cross-tab synchronization is enabled
     */
    isCrossTabEnabled(): boolean;
    /**
     * Destroy the client, close broadcast channel and free resources
     */
    destroy(): void;
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
     * LLMTranslateStream - Streaming large language model translation
     * Note: Streaming requests are not cached
     * @param request Translation request
     * @param onResponse Callback for each response chunk
     */
    llmTranslateStream(request: LLMTranslateRequest, onResponse: (response: LLMTranslateResponse) => boolean | void): Promise<void>;
    private getHeaders;
    private fetchJson;
    private fetchWithTimeout;
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
export declare class AppTranslation {
    private client;
    private service;
    private config;
    private currentFingerprint;
    private useCache;
    /**
     * Create a new AppTranslation instance
     * @param config Configuration options
     */
    constructor(config: AppTranslationConfig);
    /**
     * Update the authentication token
     * @param token New JWT token
     */
    setToken(token: string): void;
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
    translate(text: string, toLang: string, fromLang?: string): Promise<string>;
    /**
     * Translate text with full response details
     * @param text Text to translate
     * @param toLang Target language code
     * @param fromLang Optional source language code
     * @returns Full translation response
     */
    translateWithDetails(text: string, toLang: string, fromLang?: string): Promise<LLMTranslateResponse>;
    /**
     * Translate text without using cache (always request from backend)
     * @param text Text to translate
     * @param toLang Target language code
     * @param fromLang Optional source language code
     * @returns Translation result
     */
    translateNoCache(text: string, toLang: string, fromLang?: string): Promise<string>;
    /**
     * Batch translate multiple texts
     * @param texts Array of texts to translate
     * @param toLang Target language code
     * @param fromLang Optional source language code
     * @returns Array of translated texts in same order
     */
    translateBatch(texts: string[], toLang: string, fromLang?: string): Promise<string[]>;
    /**
     * Check if cache is enabled
     * @returns true if cache is enabled
     */
    isCacheEnabled(): boolean;
    /**
     * Check if a translation exists in cache
     * @param text Text to check
     * @returns true if translation exists in cache
     */
    hasTranslation(text: string): boolean;
    /**
     * Get translation from cache without requesting from backend
     * @param text Text to look up
     * @returns Translation if found, null otherwise
     */
    getCached(text: string): string | null;
    /**
     * Add a custom translation to the cache
     * @param text Original text
     * @param translation Translated text
     */
    addTranslation(text: string, translation: string): void;
    /**
     * Preload all translations for current context
     * Call this to warm up the cache before translating
     */
    preload(): Promise<void>;
    /**
     * Check if the service is initialized
     */
    isInitialized(): boolean;
    /**
     * Clear all cached translations
     */
    clearCache(): void;
    /**
     * Destroy the instance and free resources
     * Call this when the instance is no longer needed
     */
    destroy(): void;
}
/**
 * Configuration for AppTranslation
 */
export interface AppTranslationConfig {
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
    /** Initial fingerprint (optional) */
    fingerprint?: string;
    /** Enable cross-tab synchronization (optional, defaults to false) */
    crossTab?: boolean;
    /** Enable cache (optional, defaults to true. Set to false to disable all caching) */
    useCache?: boolean;
}
/**
 * Create an AppTranslation instance with simplified configuration
 * @param token JWT authentication token
 * @param senseId Translation sense ID
 * @param options Additional options
 * @returns AppTranslation instance
 */
export declare function createTranslation(token: string, senseId: string, options?: Partial<AppTranslationConfig>): AppTranslation;
export default TranslationClient;
