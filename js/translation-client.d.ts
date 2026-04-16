/**
 * Translation Service Connect RPC TypeScript/JavaScript Client
 *
 * Auto-generated for api.laker.dev Translation Service
 * Service: TranslationService
 * Source: proto/translation.proto
 *
 * This client uses Connect RPC for native HTTP streaming over HTTP/2
 * Supports true multiplexing on a single connection
 * Supports both web browsers and Node.js
 */
import { GetSenseTranslateRequest, GetSenseTranslateResponse, TranslateStreamRequest, TranslateStreamResponse, TranslateRecord } from './gen/translation_pb';
import type { Transport } from '@connectrpc/connect';
export type { GetSenseTranslateRequest, GetSenseTranslateResponse, TranslateStreamRequest, TranslateStreamResponse, TranslateRecord, };
export type GetSenseTranslateRequestOptions = {
    senseId: string;
    fingerprint?: string;
    page?: number;
    pageSize?: number;
    srcLang?: string;
    dstLang?: string;
    dstLangs?: string[];
};
/**
 * Automatic template extraction from text containing numeric variables
 * Also handles existing {varName} style templates
 * @param text Original text that may contain numeric variables
 * @returns Template extraction result
 */
export declare function extractTemplate(text: string): {
    isTemplated: boolean;
    srcTemplate: string;
    dstTemplate: string;
    variables: string[];
};
/**
 * Merge template with variables
 * @param template Template with {variable} placeholders
 * @param vars Object mapping variable names to values
 * @returns Merged text with variables substituted
 */
export declare function mergeTemplate(template: string, vars: Record<string, string | number>): string;
export declare const version = "1.6.137";
type CrossTabOptions = {
    enabled: boolean;
    channelName: string;
    storageKeyPrefix: string;
};
type BackgroundUpdateOptions = {
    enabled: boolean;
    intervalMs: number;
    batchSize: number;
    staleThresholdMs: number;
};
type TranslationPoolOptions = {
    crossTab?: Partial<CrossTabOptions>;
    persistentStorage?: unknown;
    backgroundUpdate?: Partial<BackgroundUpdateOptions>;
    senseId?: string;
    defaultFromLang?: string;
};
type PendingRequest = {
    text: string;
    toLang: string;
    fromLang?: string;
    fingerprint?: string;
    resolveFunction: (response: TranslateStreamResponse) => void;
    rejectFunction: (error: Error) => void;
};
type PendingResolutions = Record<string, {
    resolve: (value: TranslateStreamResponse) => void;
    reject: (error: Error) => void;
    resolveList: Array<(value: TranslateStreamResponse) => void>;
    rejectList: Array<(error: Error) => void>;
}>;
type CacheEntryMetadata = {
    lastUpdated: number;
    version: number;
};
declare class TranslationPool {
    client: TranslationClient;
    senseId: string;
    pools: Map<string, Map<string, string>>;
    currentFingerprint: string | null;
    currentToLang: string | null;
    crossTabOptions: CrossTabOptions;
    broadcastChannel: BroadcastChannel | null;
    loading: boolean;
    loadedCombinations: Set<string>;
    currentLanguageVersion: number;
    queuedRequests: PendingRequest[];
    pendingResolutions: PendingResolutions;
    onTranslationLoaded: ((text: string, translation: string) => void) | null;
    onPoolInitialized: (() => void) | null;
    onQueueProcessed: ((count: number) => void) | null;
    onTranslationUpdated: ((text: string, translation: string) => void) | null;
    persistentStorage?: unknown;
    backgroundUpdateOptions: BackgroundUpdateOptions;
    backgroundUpdateTimer: ReturnType<typeof setInterval> | null;
    entryMetadata: Map<string, CacheEntryMetadata>;
    updateCallback: ((text: string, toLang: string) => void) | null;
    options?: TranslationPoolOptions;
    /**
     * Add a pending resolution for a persistent stream request
     * Used when request has a request_id that will be matched on the response
     */
    addPendingResolver(requestId: string, resolve: (response: TranslateStreamResponse) => void, reject: (error: Error) => void): void;
    getPoolKey(fingerprint: string, toLang: string): string;
    constructor(client: TranslationClient, senseId: string, options?: TranslationPoolOptions);
    setTranslationLoadedCallback(callback: (text: string, translation: string) => void): void;
    setPoolInitializedCallback(callback: () => void): void;
    setQueueProcessedCallback(callback: (count: number) => void): void;
    setTranslationUpdatedCallback(callback: (text: string, translation: string) => void): void;
    initCrossTabSync(): void;
    loadFromStorage(): void;
    loadLanguageFromStorage(fingerprint: string, toLang: string): void;
    getStorageKey(fingerprint: string, toLang: string): string;
    saveToStorage(fingerprint: string, toLang: string): void;
    broadcastUpdate(text?: string, translation?: string): void;
    handleCacheUpdate(message: {
        fingerprint?: string;
        data: {
            result?: Array<{
                text: string;
                translation: string;
            }>;
            text?: string;
            translation?: string;
        };
    }): void;
    handleCacheClear(message: {
        fingerprint?: string;
    }): void;
    handleInitialSyncRequest(): void;
    queueTranslationRequest(request: {
        text: string;
        toLang: string;
        fromLang?: string;
        fingerprint?: string;
    }): Promise<TranslateStreamResponse>;
    processQueuedRequests(maxRetries?: number, retryDelayMs?: number): Promise<void>;
    hasQueuedRequests(): boolean;
    clearQueuedRequests(): void;
    isLoading(): boolean;
    isLanguageLoaded(fingerprint: string, toLang?: string): boolean;
    initialize(toLang: string): Promise<void>;
    loadFingerprintTranslations(fp: string, fingerprint: string | undefined, toLang: string): Promise<void>;
    addPreloadedTranslations(preloaded: Record<string, Record<string, Record<string, string>>>): void;
    addTranslation(text: string, translation: string): void;
    addTranslationToFingerprint(text: string, translation: string, fingerprint: string, toLang: string): void;
    /**
     * Alias for addTranslationToFingerprint - convenient manual caching
     * Parameter order: text, fingerprint, translation, toLang
     */
    put(text: string, fingerprint: string, translation: string, toLang: string): void;
    lookup(text: string, fingerprint?: string, toLang?: string): {
        found: boolean;
        fromCache: boolean;
        translation?: string;
    };
    /**
     * Check if any translation exists for the current language
     * This can be used to determine if translation pool has any translations
     * @returns boolean true if pool has any translations for current language
     */
    hasAnyTranslations(): boolean;
    /**
     * Get the number of cached translations for a specific fingerprint and language
     * If language is not specified, uses current language
     * If fingerprint is not specified, returns total size across all fingerprints for current language
     * @param fingerprint Fingerprint (optional, returns total if not specified)
     * @param toLang Target language (uses current if not specified)
     * @returns Number of cached translations
     */
    getCacheSize(fingerprint?: string, toLang?: string): number;
    /**
     * Get all translations for a fingerprint+language combination
     * @param fingerprint Fingerprint ('common' or specific)
     * @param toLang Target language
     * @returns Array of {text, translation}
     */
    getAllForFingerprint(fingerprint: string, toLang: string): Array<{
        text: string;
        translation: string;
    }>;
    /**
     * Get all cached translations for current language across all fingerprints
     * @returns Map of all cached translations with full keys
     */
    getAllForCurrentLanguage(): Map<string, Map<string, string>>;
    /**
     * Clear all translations for a specific fingerprint
     * @param fingerprint Fingerprint to clear
     */
    clearFingerprint(fingerprint: string): void;
    /**
     * Clear all cached translations for all fingerprints and languages
     * Does not affect preloaded translations unless they were added after initialization
     */
    clearAll(): void;
    /**
     * Alias for clearAll - clear entire cache
     */
    clearCache(): void;
    /**
     * Alias for clearAll - clear entire cache
     * Simple clear method for API compatibility
     */
    clear(): void;
    /**
     * Set the current active fingerprint
     * Automatically loads the new fingerprint's translations for the current language
     * @param fingerprint New fingerprint to set
     * @param toLang Target language (optional, uses currentToLang if not provided)
     */
    setCurrentFingerprint(fingerprint: string | null, toLang?: string): Promise<void>;
    /**
     * Set the current target language
     * Automatically initializes the translation pool for the new language with common and current fingerprint
     * Uses existing initialize() method that already handles both common and fingerprint loading
     * @param toLang New target language
     * @param fingerprint Optional fingerprint (uses current fingerprint if not provided)
     */
    setCurrentLanguage(toLang: string, fingerprint?: string | null): Promise<void>;
    /**
     * Get current active fingerprint
     * @returns Current fingerprint or null
     */
    getCurrentFingerprint(): string | null;
    /**
     * Get current target language
     * @returns Current target language or null
     */
    getCurrentLanguage(): string | null;
    /**
     * Start background update checker that periodically checks for stale translations
     * Only runs if background update is enabled
     */
    startBackgroundUpdateChecker(): void;
    /**
     * Stop background update checker
     */
    stopBackgroundUpdateChecker(): void;
    /**
     * Check for stale translations and request updates
     * This is called automatically by the background timer
     */
    checkForStaleTranslations(): void;
    /**
     * Update metadata for a cache entry when it's fetched from server
     * @param text Original text
     * @param toLang Target language
     */
    updateEntryMetadata(text: string, toLang: string): void;
}
export type TranslationClientOptions = {
    baseUrl?: string;
    senseId: string;
    defaultFromLang?: string;
    token?: string;
    crossTab?: Partial<CrossTabOptions>;
    backgroundUpdate?: Partial<BackgroundUpdateOptions>;
    persistentStorage?: unknown;
    transport?: Transport;
    createConnectTransport?: (options: any) => Transport;
};
declare class TranslationClient {
    baseUrl: string;
    token?: string;
    client: any;
    transport: Transport;
    private pool;
    private senseId;
    private defaultFromLang;
    options: TranslationClientOptions;
    persistentStream: AsyncIterable<TranslateStreamResponse> | null;
    persistentStreamWriter: ((req: TranslateStreamRequest) => Promise<void>) | null;
    persistentStreamReader: (() => Promise<void>) | null;
    persistentStreamConnected: boolean;
    constructor(options: TranslationClientOptions);
    /**
     * Simple one-shot translation - automatically handles caching, initialization, and queuing
     * Auto-detects fingerprint and language changes, automatically loads new translation pool
     * @param text Original text to translate
     * @param toLang Target language code
     * @param fromLang Source language code (optional, defaults to client default)
     * @param fingerprint Text fingerprint for domain-specific translations
     * @returns Promise with translated text (resolves when translation completes)
     */
    translate(text: string, toLang: string, fromLang?: string, fingerprint?: string): Promise<string>;
    /**
    * Translate text with full response details (direct API call, no caching)
    * Auto-detects fingerprint if not provided
    * @param text Original text to translate
    * @param toLang Target language code
    * @param fromLang Source language code (optional, defaults to client default)
    * @param fingerprint Text fingerprint for domain-specific translations
    * @returns Promise with complete translation response
    */
    translateWithDetails(text: string, toLang: string, fromLang?: string, fingerprint?: string, timeoutMs?: number): Promise<TranslateStreamResponse>;
    /**
     * Stream translation batches for a semantic sense
     * Uses native Connect RPC streaming with true multiplexing
     * @param senseId Semantic sense ID
     * @param dstLang Target language
     * @param fingerprint Optional fingerprint for specific domain
     * @param batchSize Optional batch size (default 500)
     * @returns Async iterable stream of translation responses
     */
    translateStream(senseId: string, dstLang: string, fingerprint?: string): AsyncIterable<TranslateStreamResponse>;
    /**
     Get paged list of translations for a semantic sense with optional filtering
     * @param options Request options including filtering, pagination
     * @returns Promise with filtered, paged translations
     */
    getSenseTranslations(options: GetSenseTranslateRequestOptions): Promise<GetSenseTranslateResponse>;
    /**
     * Alias for getSenseTranslations - compatibility alias
     * Get paged list of translations for a semantic sense with optional filtering
     * @param options Request options including filtering, pagination
     * @returns Promise with filtered, paged translations
     */
    getSenseTranslate(options: GetSenseTranslateRequestOptions): Promise<GetSenseTranslateResponse>;
    /**
     * Compatibility connect method - Connect RPC automatically manages connections
     * This is provided for API compatibility only
     */
    connect(): void;
    /**
     * Create a translation pool for preloading and caching translations
     * @param senseId Semantic sense ID to create pool for
     * @param options Pool configuration options
     * @returns TranslationPool instance
     */
    createPool(senseId: string, options?: TranslationPoolOptions): TranslationPool;
    /**
     * Get the underlying Connect RPC client for advanced use
     * @returns The client instance
     */
    getClient(): any;
    /**
     * Start a persistent streaming connection for all real-time translation requests.
     * This reuses a single long-lived HTTP connection for all requests,
     * avoiding the overhead of creating a new connection for every word.
     * Only one persistent stream is maintained at a time.
     * @returns Promise that resolves when the stream is connected and ready
     */
    startPersistentStream(): Promise<void>;
    /**
     * Stop the persistent streaming connection
     * Cleans up all pending requests
     */
    stopPersistentStream(): void;
    /**
     * Check if persistent stream is connected and ready
     * @returns true if connected and ready
     */
    isPersistentStreamConnected(): boolean;
    /**
     * Get information about the current sense
     * @returns Object containing sense ID and default settings
     */
    getSenseInfo(): {
        senseId: string;
        defaultFromLang: string;
    };
    /**
     * Synchronous cache lookup (for immediate synchronous return in UI)
     * SDK automatically handles all caching internally
     * @param text Original text
     * @param toLang Target language
     * @param fromLang Source language (optional)
     * @param fingerprint Fingerprint (optional)
     * @returns Cache lookup result with found flag and translation
     */
    lookupSync(text: string, toLang: string, fromLang?: string, fingerprint?: string): {
        found: boolean;
        translation?: string;
    };
    /**
     * Register callback for when translations are updated in the cache
     * This is used to trigger UI re-renders after background translation completes
     * @param callback Callback to invoke when translations are updated
     */
    onTranslationUpdated(callback: () => void): void;
    /**
     * Clear all cached translations for the current sense
     * Clears both in-memory cache and persistent storage
     */
    clear(): void;
}
export default TranslationClient;
export { TranslationClient, TranslationPool };
