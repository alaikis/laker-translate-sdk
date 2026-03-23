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
 * Automatic template extraction from text containing numeric variables
 * @param text Original text that may contain numeric variables
 * @returns Template extraction result
 */
export declare function extractTemplate(text: string): TemplateExtractResult;
/**
 * TranslationPool - Two-level translation cache with priority lookup
 *
 * Architecture:
 * - commonPool: stores general/common translations (automatic from backend)
 * - fingerprintPools: stores special translations for specific fingerprint (requires manual input)
 *
 * Lookup Priority:
 * 1. Current fingerprint special translations
 * 2. Common translations
 * 3. If not found, request from backend
 *
 * Rules:
 * - All new translations from backend are automatically added to commonPool
 * - Special translations must be added manually
 */
export declare class TranslationPool {
    private client;
    private senseId;
    private commonPool;
    private fingerprintPools;
    private currentFingerprint;
    /**
     * Create a new TranslationPool for a specific sense
     * @param client TranslationClient instance
     * @param senseId The semantic sense ID
     */
    constructor(client: TranslationClient, senseId: string);
    /**
     * Initialize the pool - loads all common translations from backend
     */
    initialize(): Promise<void>;
    /**
     * Switch to a different fingerprint, loads its special translations
     * @param fingerprint The fingerprint to switch to
     */
    switchFingerprint(fingerprint: string): Promise<void>;
    /**
     * Clear the current fingerprint to free memory
     */
    clearCurrentFingerprint(): void;
    /**
     * Lookup translation following priority rules:
     * 1. Current fingerprint special translation
     * 2. Common translation
     * 3. Not found
     *
     * @param text Original text to lookup
     * @returns Lookup result
     */
    lookup(text: string): TranslationLookupResult;
    /**
     * Add a special translation to the current fingerprint
     * Requires that a fingerprint is currently active
     *
     * @param text Original text
     * @param translation Translated text
     * @returns true if added successfully, false if no current fingerprint
     */
    addSpecialTranslation(text: string, translation: string): boolean;
    /**
     * Request translation from backend, automatically adds to common pool if found
     *
     * @param text Text to translate
     * @param fromLang Source language
     * @param toLang Target language
     * @returns Translation response
     */
    requestTranslation(text: string, fromLang: string, toLang: string): Promise<LLMTranslateResponse>;
    /**
     * Get all common translations
     * @returns Array of {text, translation}
     */
    getAllCommon(): Array<{
        text: string;
        translation: string;
    }>;
    /**
     * Get all special translations for current fingerprint
     * @returns Array of {text, translation} or empty if no current fingerprint
     */
    getAllCurrentSpecial(): Array<{
        text: string;
        translation: string;
    }>;
    /**
     * Clear all cached data to free memory
     */
    clearAll(): void;
}
/**
 * TranslationClient - gRPC-Web compatible client for TranslationService
 * Uses JSON over HTTP transport for compatibility
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
