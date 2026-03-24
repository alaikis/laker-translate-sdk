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
 * Broadcast Channel message types for cross-tab communication
 */
type CrossTabMessageType = 'cache_update' | 'cache_clear' | 'request_initial_sync';

interface CrossTabMessage {
  type: CrossTabMessageType;
  senseId: string;
  fingerprint?: string;
  data?: {
    common?: Array<{ text: string; translation: string }>;
    special?: Array<{ text: string; translation: string }>;
    text?: string;
    translation?: string;
  };
}

/**
 * Cross-tab cache synchronization options
 */
export interface CrossTabOptions {
  enabled: boolean;
  channelName?: string;
  storageKeyPrefix?: string;
}

const defaultCrossTabOptions: CrossTabOptions = {
  enabled: false,
  channelName: 'laker-translation-cache',
  storageKeyPrefix: 'laker_translation_'
};

/**
 * Automatic template extraction from text containing numeric variables
 * @param text Original text that may contain numeric variables
 * @returns Template extraction result
 */
export function extractTemplate(text: string): TemplateExtractResult {
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
  const variables: string[] = [];
  
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
 * TranslationPool - Two-level translation cache with priority lookup (internal)
 *
 * Architecture:
 * - commonPool: stores general/common translations (automatic from backend)
 * - fingerprintPools: stores special translations for specific fingerprint (requires manual input)
 * - Optional cross-tab synchronization via Broadcast Channel and localStorage
 *
 * Lookup Priority:
 * 1. Current fingerprint special translations
 * 2. Common translations
 * 3. If not found, request from backend
 *
 * Rules:
 * - All new translations from backend are automatically added to commonPool
 * - Special translations must be added manually
 * - With cross-tab enabled, all changes are broadcast to other tabs
 */
class TranslationPool {
  private client: TranslationClient;
  private senseId: string;
  private commonPool: Map<string, string> = new Map();
  private fingerprintPools: Map<string, Map<string, string>> = new Map();
  private currentFingerprint: string | null = null;
  private crossTabOptions: CrossTabOptions;
  private broadcastChannel: BroadcastChannel | null = null;
  
  /**
   * Create a new TranslationPool for a specific sense
   * @param client TranslationClient instance
   * @param senseId The semantic sense ID
   * @param crossTabOptions Cross-tab synchronization options
   */
  constructor(client: TranslationClient, senseId: string, crossTabOptions?: Partial<CrossTabOptions>) {
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
  private initCrossTabSync(): void {
    this.broadcastChannel = new BroadcastChannel(this.crossTabOptions.channelName!);
    
    this.broadcastChannel.onmessage = (event: MessageEvent<CrossTabMessage>) => {
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
  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined' || !this.crossTabOptions.enabled) {
      return;
    }
    
    const storageKey = `${this.crossTabOptions.storageKeyPrefix}${this.senseId}_common`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored) as Array<{ text: string; translation: string }>;
        data.forEach(({ text, translation }) => {
          this.commonPool.set(text, translation);
        });
      }
      
      // Load fingerprint data if we have current fingerprint
      if (this.currentFingerprint) {
        const fpStorageKey = `${this.crossTabOptions.storageKeyPrefix}${this.senseId}_${this.currentFingerprint}`;
        const fpStored = localStorage.getItem(fpStorageKey);
        if (fpStored) {
          const data = JSON.parse(fpStored) as Array<{ text: string; translation: string }>;
          let pool = this.fingerprintPools.get(this.currentFingerprint);
          if (!pool) {
            pool = new Map();
            this.fingerprintPools.set(this.currentFingerprint, pool);
          }
          data.forEach(({ text, translation }) => {
            pool!.set(text, translation);
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load translation cache from localStorage:', e);
    }
  }
  
  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    if (typeof localStorage === 'undefined' || !this.crossTabOptions.enabled) {
      return;
    }
    
    const storageKey = `${this.crossTabOptions.storageKeyPrefix}${this.senseId}_common`;
    try {
      const data = this.getAllCommon();
      localStorage.setItem(storageKey, JSON.stringify(data));
      
      // Save current fingerprint if active
      if (this.currentFingerprint) {
        const fpStorageKey = `${this.crossTabOptions.storageKeyPrefix}${this.senseId}_${this.currentFingerprint}`;
        const fpData = this.getAllCurrentSpecial();
        localStorage.setItem(fpStorageKey, JSON.stringify(fpData));
      }
    } catch (e) {
      console.warn('Failed to save translation cache to localStorage:', e);
    }
  }
  
  /**
   * Broadcast cache update to all other tabs
   */
  private broadcastUpdate(text?: string, translation?: string): void {
    if (!this.broadcastChannel || !this.crossTabOptions.enabled) {
      return;
    }
    
    const message: CrossTabMessage = {
      type: 'cache_update',
      senseId: this.senseId,
      fingerprint: this.currentFingerprint || undefined,
      data: {
        common: this.getAllCommon(),
        ...(text && translation && { text, translation })
      }
    };
    
    this.broadcastChannel.postMessage(message);
    this.saveToStorage();
  }
  
  /**
   * Handle incoming cache update from another tab
   */
  private handleCacheUpdate(message: CrossTabMessage): void {
    if (message.data?.common) {
      // Update full common cache
      this.commonPool.clear();
      message.data.common.forEach(({ text, translation }) => {
        this.commonPool.set(text, translation);
      });
    }
    
    // Update specific entry
    if (message.data?.text && message.data?.translation && message.fingerprint) {
      let pool = this.fingerprintPools.get(message.fingerprint);
      if (!pool) {
        pool = new Map();
        this.fingerprintPools.set(message.fingerprint, pool);
      }
      pool.set(message.data.text, message.data.translation);
      this.saveToStorage();
    }
  }
  
  /**
   * Handle incoming cache clear from another tab
   */
  private handleCacheClear(message: CrossTabMessage): void {
    this.clearAll();
  }
  
  /**
   * Handle initial sync request from a new tab
   */
  private handleInitialSyncRequest(): void {
    // Send our current cache to the new tab
    this.broadcastUpdate();
  }
  
  /**
   * Initialize the pool - loads all common translations from backend
   * If cross-tab is enabled and cache exists in localStorage, uses that first
   */
  async initialize(): Promise<void> {
    // If cross-tab enabled and we already have data from localStorage/storage,
    // we still sync with backend to get latest updates
    if (this.commonPool.size === 0) {
      let page = 1;
      const pageSize = 5000;
      
      // Stream all common translations
      const response = await this.client.getSenseTranslate({
        senseId: this.senseId,
        page,
        pageSize
      });
      
      // Add all common translations to pool
      response.translations.forEach(record => {
        if (record.isCustom) {
          // Custom translations go to common
          this.commonPool.set(record.text, record.translate);
        }
      });
      
      // If there are more pages, continue loading
      while (response.page * response.pageSize < response.total) {
        page++;
        const nextResponse = await this.client.getSenseTranslate({
          senseId: this.senseId,
          page,
          pageSize
        });
        nextResponse.translations.forEach(record => {
          if (record.isCustom) {
            this.commonPool.set(record.text, record.translate);
          }
        });
      }
      
      // Broadcast to other tabs after full initialization
      this.broadcastUpdate();
    }
  }
  
  /**
   * Switch to a different fingerprint, loads its special translations
   * @param fingerprint The fingerprint to switch to
   */
  async switchFingerprint(fingerprint: string): Promise<void> {
    // Clear current fingerprint to free memory
    this.currentFingerprint = null;
    
    // Check if we already have this fingerprint cached
    if (!this.fingerprintPools.has(fingerprint)) {
      this.fingerprintPools.set(fingerprint, new Map());
      
      // Load special translations for this fingerprint
      let page = 1;
      const pageSize = 1000;
      
      const response = await this.client.getSenseTranslate({
        senseId: this.senseId,
        fingerprint,
        page,
        pageSize
      });
      
      const pool = this.fingerprintPools.get(fingerprint)!;
      response.translations.forEach(record => {
        if (record.isCustom) {
          pool.set(record.text, record.translate);
        }
      });
      
      // Load more pages if needed
      while (response.page * response.pageSize < response.total) {
        page++;
        const nextResponse = await this.client.getSenseTranslate({
          senseId: this.senseId,
          fingerprint,
          page,
          pageSize
        });
        nextResponse.translations.forEach(record => {
          if (record.isCustom) {
            pool.set(record.text, record.translate);
          }
        });
      }
    }
    
    this.currentFingerprint = fingerprint;
  }
  
  /**
   * Clear the current fingerprint to free memory
   */
  clearCurrentFingerprint(): void {
    this.currentFingerprint = null;
  }
  
  /**
   * Lookup translation following priority rules:
   * 1. Current fingerprint special translation
   * 2. Common translation
   * 3. Not found
   * 
   * @param text Original text to lookup
   * @returns Lookup result
   */
  lookup(text: string): TranslationLookupResult {
    // Check current fingerprint first
    if (this.currentFingerprint) {
      const specialPool = this.fingerprintPools.get(this.currentFingerprint);
      if (specialPool && specialPool.has(text)) {
        return {
          found: true,
          translation: specialPool.get(text)!,
          source: 'special'
        };
      }
    }
    
    // Check common pool
    if (this.commonPool.has(text)) {
      return {
        found: true,
        translation: this.commonPool.get(text)!,
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
   * Add a special translation to the current fingerprint
   * Requires that a fingerprint is currently active
   *
   * @param text Original text
   * @param translation Translated text
   * @returns true if added successfully, false if no current fingerprint
   */
  addSpecialTranslation(text: string, translation: string): boolean {
    if (!this.currentFingerprint) {
      return false;
    }
    
    const specialPool = this.fingerprintPools.get(this.currentFingerprint);
    if (!specialPool) {
      return false;
    }
    
    specialPool.set(text, translation);
    
    // Broadcast to other tabs
    this.broadcastUpdate(text, translation);
    
    return true;
  }
  
  /**
   * Request translation from backend, automatically adds to common pool if found
   *
   * @param text Text to translate
   * @param fromLang Source language
   * @param toLang Target language
   * @returns Translation response
   */
  async requestTranslation(
    text: string,
    fromLang: string,
    toLang: string
  ): Promise<LLMTranslateResponse> {
    const response = await this.client.llmTranslate({
      text,
      fromLang,
      toLang,
      senseId: this.senseId
    });
    
    // Add to common pool automatically
    if (response.translatedText) {
      this.commonPool.set(text, response.translatedText);
      // Broadcast to other tabs
      this.broadcastUpdate();
    }
    
    return response;
  }
  
  /**
   * Get all common translations
   * @returns Array of {text, translation}
   */
  getAllCommon(): Array<{ text: string; translation: string }> {
    const result: Array<{ text: string; translation: string }> = [];
    this.commonPool.forEach((translation, text) => {
      result.push({ text, translation });
    });
    return result;
  }
  
  /**
   * Get all special translations for current fingerprint
   * @returns Array of {text, translation} or empty if no current fingerprint
   */
  getAllCurrentSpecial(): Array<{ text: string; translation: string }> {
    if (!this.currentFingerprint) {
      return [];
    }
    const specialPool = this.fingerprintPools.get(this.currentFingerprint);
    if (!specialPool) {
      return [];
    }
    const result: Array<{ text: string; translation: string }> = [];
    specialPool.forEach((translation, text) => {
      result.push({ text, translation });
    });
    return result;
  }
  
  /**
   * Clear all cached data to free memory
   */
  clearAll(): void {
    this.commonPool.clear();
    this.fingerprintPools.clear();
    this.currentFingerprint = null;
    
    // Clear localStorage
    if (typeof localStorage !== 'undefined' && this.crossTabOptions.enabled) {
      const storageKey = `${this.crossTabOptions.storageKeyPrefix}${this.senseId}_common`;
      localStorage.removeItem(storageKey);
      if (this.currentFingerprint) {
        const fpStorageKey = `${this.crossTabOptions.storageKeyPrefix}${this.senseId}_${this.currentFingerprint}`;
        localStorage.removeItem(fpStorageKey);
      }
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
  destroy(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
  }
  
  /**
   * Check if cross-tab synchronization is enabled
   */
  isCrossTabEnabled(): boolean {
    return this.crossTabOptions.enabled;
  }
}

/**
 * TranslationService - Main entry point for translation operations
 * Provides a clean API with automatic caching and cross-tab synchronization
 * 
 * Two main usage modes:
 * 1. Direct translation mode: Each request goes directly to backend (simple, no caching)
 * 2. Cached translation mode: Uses two-level cache with automatic loading from backend (recommended for most use cases)
 */
export class TranslationService {
  private client: TranslationClient;
  private pool: TranslationPool;
  private initialized: boolean = false;

  /**
   * Create a new TranslationService instance
   * @param client TranslationClient instance (or base URL string to create one automatically)
   * @param options Translation service options including senseId and optional fingerprint/cross-tab settings
   */
  constructor(client: TranslationClient | string, options: TranslationServiceOptions) {
    if (typeof client === 'string') {
      this.client = new TranslationClient(client);
    } else {
      this.client = client;
    }

    // Configure cross-tab options
    const crossTabOptions: Partial<CrossTabOptions> = {
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
    
    // If fingerprint provided, switch to it automatically
    if (options.fingerprint) {
      this.pool.switchFingerprint(options.fingerprint).catch(e => {
        console.warn('Failed to switch to initial fingerprint:', e);
      });
    }
  }

  /**
   * Initialize the translation service - loads all common translations from backend
   * Must be called before using cached translation operations
   * Automatically handles cross-tab synchronization if enabled
   */
  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.pool.initialize();
      this.initialized = true;
    }
  }

  /**
   * Check if service has been initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Switch to a different fingerprint (for personalized/custom translations)
   * Automatically loads all special translations for this fingerprint
   * @param fingerprint - The fingerprint to switch to
   */
  async switchFingerprint(fingerprint: string): Promise<void> {
    await this.pool.switchFingerprint(fingerprint);
  }

  /**
   * Clear the current fingerprint - frees memory
   */
  clearCurrentFingerprint(): void {
    this.pool.clearCurrentFingerprint();
  }

  /**
   * Add a custom/special translation to the current fingerprint
   * Requires that a fingerprint is active
   * @param text - Original text
   * @param translation - Translated text
   * @returns true if added successfully, false if no current fingerprint
   */
  addCustomTranslation(text: string, translation: string): boolean {
    return this.pool.addSpecialTranslation(text, translation);
  }

  /**
   * Lookup translation in cache (cached mode only)
   * @param text - Text to lookup
   * @returns Lookup result with found flag and translation if available
   */
  lookup(text: string): TranslationLookupResult {
    return this.pool.lookup(text);
  }

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
  async translate(
    text: string,
    toLang: string,
    fromLang?: string,
    provider?: string
  ): Promise<LLMTranslateResponse> {
    // Check cache first if we're initialized
    if (this.initialized) {
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
    }

    // Not in cache or not initialized, request from backend
    const senseId = this.getSenseId();
    const response = await this.client.llmTranslate({
      text,
      toLang,
      fromLang,
      provider,
      senseId,
    });

    // Add to cache if we're initialized
    if (this.initialized && response.translatedText) {
      // Add to common pool automatically
      // Users can add custom translations via addCustomTranslation
      const commonPool = this.pool as any;
      commonPool.commonPool?.set(text, response.translatedText);
      (this.pool as any).broadcastUpdate?.();
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
  async translateDirect(
    text: string,
    toLang: string,
    fromLang?: string,
    provider?: string
  ): Promise<LLMTranslateResponse> {
    const senseId = this.pool['senseId'] as string;
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
  async streamTranslate(
    request: TranslateStreamRequest,
    onBatch: (response: TranslateStreamResponse) => boolean | void
  ): Promise<void> {
    await this.client.translateStream(request, onBatch);
  }

  /**
   * Get the sense ID this service is connected to
   */
  getSenseId(): string {
    return (this.pool as any).senseId;
  }

  /**
   * Clear all cached data to free memory
   */
  clearAll(): void {
    this.pool.clearAll();
  }

  /**
   * Destroy the service, close connections and free resources
   * Should be called when the service is no longer needed
   */
  destroy(): void {
    this.pool.destroy();
    this.initialized = false;
  }
}

/**
 * TranslationClient - Low-level gRPC-Web compatible client for TranslationService
 * Uses JSON over HTTP transport for compatibility
 * Most users should prefer TranslationService which provides automatic caching
 */
export class TranslationClient {
  private baseUrl: string;
  private token: string;
  private timeout: number;

  /**
   * Create a new TranslationClient
   * @param baseUrl Base URL of the gRPC-Web endpoint, defaults to https://api.hottol.com/laker/
   * @param token JWT authentication token (optional)
   * @param timeout Request timeout in milliseconds (default: 30000)
   */
  constructor(baseUrl: string = 'https://api.hottol.com/laker/', token: string = '', timeout: number = 30000) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.token = token;
    this.timeout = timeout;
  }

  /**
   * Set or update the JWT authentication token
   * @param token JWT token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * GetSenseTranslate - One-shot unary request with pagination
   * @param request Request parameters
   */
  async getSenseTranslate(request: GetSenseTranslateRequest): Promise<GetSenseTranslateResponse> {
    const url = `${this.baseUrl}/TranslationService/GetSenseTranslate`;

    const response = await this.fetchJson(url, request);
    return response as GetSenseTranslateResponse;
  }

  /**
   * TranslateStream - Server streaming, receives multiple batches progressively
   * @param request Request parameters
   * @param onBatch Callback for each batch received. Return false to stop streaming early.
   */
  async translateStream(
    request: TranslateStreamRequest,
    onBatch: (response: TranslateStreamResponse) => boolean | void
  ): Promise<void> {
    const url = `${this.baseUrl}/TranslationService/TranslateStream`;
    
    // For gRPC-Web streaming over HTTP, we use GET with SSE-style streaming
    // This implementation works with the improbabe-eng/grpc-web Go handler
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
          const shouldContinue = onBatch(data as TranslateStreamResponse);
          if (shouldContinue === false) {
            reader.cancel();
            return;
          }
        } catch (e) {
          console.warn('Failed to parse streaming chunk:', line, e);
        }
      }
    }
  }

  /**
   * Collect all streaming responses into an array
   * @param request Request parameters
   */
  async translateStreamCollect(request: TranslateStreamRequest): Promise<TranslateStreamResponse[]> {
    const result: TranslateStreamResponse[] = [];
    await this.translateStream(request, (response) => {
      result.push(response);
      return true;
    });
    return result;
  }

  /**
   * LLMTranslate - One-shot large language model translation
   * @param request Translation request
   */
  async llmTranslate(request: LLMTranslateRequest): Promise<LLMTranslateResponse> {
    const url = `${this.baseUrl}/TranslationService/LLMTranslate`;

    const response = await this.fetchJson(url, request);
    return response as LLMTranslateResponse;
  }

  /**
   * LLMTranslateStream - Streaming large language model translation
   * @param request Translation request
   * @param onResponse Callback for each response chunk
   */
  async llmTranslateStream(
    request: LLMTranslateRequest,
    onResponse: (response: LLMTranslateResponse) => boolean | void
  ): Promise<void> {
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
          const shouldContinue = onResponse(data as LLMTranslateResponse);
          if (shouldContinue === false) {
            reader.cancel();
            return;
          }
        } catch (e) {
          console.warn('Failed to parse streaming chunk:', line, e);
        }
      }
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/grpc-web+json',
      'X-Grpc-Web': '1'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  private async fetchJson(url: string, body: any): Promise<any> {
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

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
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

export default TranslationClient;
