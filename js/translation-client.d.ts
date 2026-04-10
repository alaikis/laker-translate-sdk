/**
 * Translation Service Connect RPC TypeScript/JavaScript Client
 *
 * Auto-generated for api.laker.dev Translation Service
 * Service: TranslationService
 * Source: proto/translation.proto
 *
 * This client uses Connect RPC for native HTTP streaming over HTTP/2
 * Supports true multiplexing on a single connection
 */
import { TranslationService } from './gen/translation_connect.js';
import { createConnectTransport } from '@connectrpc/connect-web';
export type { GetSenseTranslateRequest, GetSenseTranslateResponse, TranslateStreamRequest, TranslateStreamResponse, LLMTranslateRequest, LLMTranslateResponse, TranslateRecord, } from './gen/translation_pb.js';
export type GetSenseTranslateRequestOptions = {
    senseId: string;
    fingerprint?: string;
    page?: number;
    pageSize?: number;
    srcLang?: string;
    dstLang?: string;
    dstLangs?: string[];
};
import type { PromiseClient } from '@connectrpc/connect';
/**
 * Automatic template extraction from text containing numeric variables
 * @param text Original text that may contain numeric variables
 * @returns Template extraction result
 */
export declare function extractTemplate(text: string): {
    isTemplated: boolean;
    srcTemplate: string;
    dstTemplate: string;
    variables: string[];
};
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
};
type PendingRequest = {
    text: string;
    toLang: string;
    fromLang?: string;
    fingerprint?: string;
    resolveFunction: (response: LLMTranslateResponse) => void;
    rejectFunction: (error: Error) => void;
};
type PendingResolutions = Record<string, {
    resolve: (value: LLMTranslateResponse) => void;
    reject: (error: Error) => void;
    resolveList: Array<(value: LLMTranslateResponse) => void>;
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
    }): Promise<LLMTranslateResponse>;
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
    lookup(text: string, fingerprint?: string): {
        found: boolean;
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
     * @param fingerprint Fingerprint (default 'common')
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
     * Set the current active fingerprint
     * Doesn't clear existing cache, just changes lookup priority
     * When a new fingerprint is set and not loaded for current language,
     * it will be loaded automatically during next initialize
     * @param fingerprint New fingerprint to set
     */
    setCurrentFingerprint(fingerprint: string | null): void;
    /**
     * Get current active fingerprint
     * @returns Current fingerprint or null
     */
    getCurrentFingerprint(): string | null;
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
    baseUrl: string;
    useH2?: boolean;
};
declare class TranslationClient {
    baseUrl: string;
    client: PromiseClient<typeof TranslationService>;
    transport: ReturnType<typeof createConnectTransport>;
    constructor(options: TranslationClientOptions);
    /**
     * Create a translation pool for a specific semantic sense
     * The pool caches translations and enables streaming loading
     * @param senseId The semantic sense ID
     * @param options Pool configuration options
     * @returns TranslationPool instance
     */
    createPool(senseId: string, options?: TranslationPoolOptions): TranslationPool;
    /**
     * Translate text with full response details
     * @param text Original text to translate
     * @param toLang Target language code
     * @param fromLang Source language code (optional)
     * @param fingerprint Text fingerprint for domain-specific translations
     * @returns Promise with complete translation response
     */
    translateWithDetails(text: string, toLang: string, fromLang?: string, fingerprint?: string): Promise<LLMTranslateResponse>;
    /**
     * Simple translation that just returns the translated text string
     * @param text Original text to translate
     * @param toLang Target language code
     * @param fromLang Source language code (optional)
     * @param fingerprint Text fingerprint for domain-specific translations
     * @returns Promise with translated text
     */
    translate(text: string, toLang: string, fromLang?: string, fingerprint?: string): Promise<string>;
    /**
     * Stream translation batches for a semantic sense
     * Uses native Connect RPC streaming with true multiplexing
     * @param senseId Semantic sense ID
     * @param dstLang Target language
     * @param fingerprint Optional fingerprint for specific domain
     * @param batchSize Optional batch size (default 500)
     * @returns Async iterable stream of translation responses
     */
    translateStream(senseId: string, dstLang: string, fingerprint?: string, batchSize?: number): AsyncIterable<TranslateStreamResponse>;
    /**
     * Get paged list of translations for a semantic sense with optional filtering
     * @param options Request options including filtering, pagination
     * @returns Promise with filtered, paged translations
     */
    getSenseTranslations(options: GetSenseTranslateRequestOptions): Promise<GetSenseTranslateResponse>;
    /**
     * Get the underlying Connect RPC client for advanced use
     * @returns The promise client instance
     */
    getClient(): PromiseClient<typeof TranslationService>;
}
export { TranslationPool, TranslationClient, };
export default TranslationClient;
