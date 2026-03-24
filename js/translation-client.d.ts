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
 * Two main usage modes:
 * 1. Direct translation mode: Each request goes directly to backend (simple, no caching)
 * 2. Cached translation mode: Uses two-level cache with automatic loading from backend (recommended for most use cases)
 */
export declare class TranslationService {
    private client;
    private pool;
    private initialized;
    /**
     * Create a new TranslationService instance
     * @param client TranslationClient instance (or base URL string to create one automatically)
     * @param options Translation service options including senseId and optional fingerprint/cross-tab settings
     */
    constructor(client: TranslationClient | string, options: TranslationServiceOptions);
    /**
     * Initialize the translation service - loads all common translations from backend
     * Must be called before using cached translation operations
     * Automatically handles cross-tab synchronization if enabled
     */
    initialize(): Promise<void>;
    /**
     * Check if service has been initialized
     */
    isInitialized(): boolean;
    /**
     * Switch to a different fingerprint (for personalized/custom translations)
     * Automatically loads all special translations for this fingerprint
     * @param fingerprint - The fingerprint to switch to
     */
    switchFingerprint(fingerprint: string): Promise<void>;
    /**
     * Clear the current fingerprint - frees memory
     */
    clearCurrentFingerprint(): void;
    /**
     * Add a custom/special translation to the current fingerprint
     * Requires that a fingerprint is active
     * @param text - Original text
     * @param translation - Translated text
     * @returns true if added successfully, false if no current fingerprint
     */
    addCustomTranslation(text: string, translation: string): boolean;
    /**
     * Lookup translation in cache (cached mode only)
     * @param text - Text to lookup
     * @returns Lookup result with found flag and translation if available
     */
    lookup(text: string): TranslationLookupResult;
    /**
     * Translate text with caching (uses cached mode)
     * 1. First checks cache according to priority rules
     * 2. If not found in cache, requests from backend and caches result automatically
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
 * TranslationClient - Low-level gRPC-Web compatible client for TranslationService
 * Uses JSON over HTTP transport for compatibility
 * Most users should prefer TranslationService which provides automatic caching
 */
export declare class TranslationClient {
    private baseUrl;
    private token;
    private timeout;
    /**
     * Create a new TranslationClient
     * @param baseUrl Base URL of the gRPC-Web endpoint, defaults to https://api.hottol.com/laker/
     * @param token JWT authentication token (optional)
     * @param timeout Request timeout in milliseconds (default: 30000)
     */
    constructor(baseUrl?: string, token?: string, timeout?: number);
    /**
     * Set or update the JWT authentication token
     * @param token JWT token
     */
    setToken(token: string): void;
    /**
     * GetSenseTranslate - One-shot unary request with pagination
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
     * @param request Translation request
     */
    llmTranslate(request: LLMTranslateRequest): Promise<LLMTranslateResponse>;
    /**
     * LLMTranslateStream - Streaming large language model translation
     * @param request Translation request
     * @param onResponse Callback for each response chunk
     */
    llmTranslateStream(request: LLMTranslateRequest, onResponse: (response: LLMTranslateResponse) => boolean | void): Promise<void>;
    private getHeaders;
    private fetchJson;
    private fetchWithTimeout;
}
export default TranslationClient;
