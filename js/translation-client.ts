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
    result?: Array<{ text: string; translation: string }>;
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
  fromLang?: string;
  toLang?: string;
  crossTab?: boolean;
  crossTabChannelName?: string;
  crossTabStorageKeyPrefix?: string;
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
  private client: TranslationClient;
  private senseId: string;
  // Separate cache for each fingerprint: fingerprint -> Map<text, translation>
  private pools: Map<string, Map<string, string>> = new Map();
  private currentFingerprint: string | null = null;
  private crossTabOptions: CrossTabOptions;
  private broadcastChannel: BroadcastChannel | null = null;
  private loading: boolean = false;
  private loadedFingerprints: Set<string> = new Set();
  
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
  private loadFingerprintFromStorage(fp: string): void {
    const storageKey = this.getStorageKey(fp);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored) as Array<{ text: string; translation: string }>;
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
    } catch (e) {
      console.warn('Failed to load translation cache from localStorage:', e);
    }
  }
  
  /**
   * Get storage key for a specific fingerprint
   */
  private getStorageKey(fp: string): string {
    return `${this.crossTabOptions.storageKeyPrefix}${this.senseId}_${fp}`;
  }
  
  /**
   * Save cache to localStorage
   */
  private saveToStorage(fp: string): void {
    if (typeof localStorage === 'undefined' || !this.crossTabOptions.enabled) {
      return;
    }
    
    const storageKey = this.getStorageKey(fp);
    try {
      const pool = this.pools.get(fp);
      const data: Array<{ text: string; translation: string }> = [];
      if (pool) {
        pool.forEach((translation, text) => {
          data.push({ text, translation });
        });
      }
      localStorage.setItem(storageKey, JSON.stringify(data));
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
    
    const fp = this.currentFingerprint || 'common';
    const message: CrossTabMessage = {
      type: 'cache_update',
      senseId: this.senseId,
      fingerprint: this.currentFingerprint || undefined,
      data: {
        result: this.getAllForFingerprint(fp),
        ...(text && translation && { text, translation })
      }
    };
    
    this.broadcastChannel.postMessage(message);
    this.saveToStorage(fp);
  }
  
  /**
   * Handle incoming cache update from another tab
   */
  private handleCacheUpdate(message: CrossTabMessage): void {
    const fp = message.fingerprint || 'common';
    if (message.data?.result) {
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
    if (message.data?.text && message.data?.translation) {
      const pool = this.pools.get(fp) || new Map();
      pool.set(message.data.text, message.data.translation);
      this.pools.set(fp, pool);
      this.saveToStorage(fp);
    }
  }
  
  /**
   * Handle incoming cache clear from another tab
   */
  private handleCacheClear(message: CrossTabMessage): void {
    const fp = message.fingerprint || 'common';
    if (fp) {
      this.clearFingerprint(fp);
    } else {
      this.clearAll();
    }
  }
  
  /**
   * Handle initial sync request from a new tab
   */
  private handleInitialSyncRequest(): void {
    // Send our current cache to the new tab
    this.broadcastUpdate();
  }
  
  /**
   * Check if currently loading
   */
  isLoading(): boolean {
    return this.loading;
  }
  
  /**
   * Initialize the pool - always loads common first, then loads current fingerprint if set
   * If fingerprint is set, loads special translations; common is always preloaded
   */
  async initialize(): Promise<void> {
    if (this.loading) {
      return;
    }
    
    this.loading = true;
    
    try {
      // Always preload common first (required)
      if (!this.loadedFingerprints.has('common')) {
        await this.loadFingerprintTranslations('common', undefined);
      }
      
      // Then load current fingerprint if set and not loaded
      if (this.currentFingerprint && !this.loadedFingerprints.has(this.currentFingerprint)) {
        await this.loadFingerprintTranslations(this.currentFingerprint, this.currentFingerprint);
      }
      
      // Broadcast to other tabs after full initialization
      this.broadcastUpdate();
    } finally {
      this.loading = false;
    }
  }
  
  /**
   * Load translations for a specific fingerprint
   */
  private async loadFingerprintTranslations(fp: string, fingerprint: string | undefined): Promise<void> {
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
    await this.client.translateStream(
      {
        senseId: this.senseId,
        fingerprint,
        batchSize: 500
      },
      (response) => {
        // Add all translations from this batch to the fingerprint's pool
        response.translations.forEach(record => {
          pool!.set(record.text, record.translate);
        });
        return true; // Continue streaming
      }
    );
    
    // Mark as loaded
    this.loadedFingerprints.add(fp);
  }
  
  /**
   * Switch to a different fingerprint, loads its translations if not already loaded
   * Doesn't clear existing cached translations for other fingerprints
   * @param fingerprint The fingerprint to switch to
   */
  async switchFingerprint(fingerprint: string): Promise<void> {
    this.currentFingerprint = fingerprint;
    
    // Ensure pool exists
    if (!this.pools.has(fingerprint)) {
      this.pools.set(fingerprint, new Map());
    }
    
    // Load from localStorage first
    this.loadFingerprintFromStorage(fingerprint);
    
    // Check if we need to load from backend
    if (!this.loadedFingerprints.has(fingerprint)) {
      await this.loadFingerprintTranslations(fingerprint, fingerprint);
    }
  }
  
  /**
   * Clear cached translations for a specific fingerprint to free memory
   * Doesn't affect other fingerprints or common
   * @param fingerprint The fingerprint to clear
   */
  clearFingerprint(fingerprint: string): void {
    this.pools.delete(fingerprint);
    this.loadedFingerprints.delete(fingerprint);
    
    // Clear localStorage
    if (typeof localStorage !== 'undefined' && this.crossTabOptions.enabled) {
      const storageKey = this.getStorageKey(fingerprint);
      localStorage.removeItem(storageKey);
    }
  }
  
  /**
   * Clear the current fingerprint to free memory (switch back to common)
   * Current fingerprint becomes null, only common remains active
   */
  clearCurrentFingerprint(): void {
    if (this.currentFingerprint) {
      this.clearFingerprint(this.currentFingerprint);
      this.currentFingerprint = null;
    }
  }
  
  /**
   * Lookup translation
   * Priority: current fingerprint (if set) → common → not found
   * @param text Original text to lookup
   * @returns Lookup result
   */
  lookup(text: string): TranslationLookupResult {
    // Check current fingerprint first if we have one
    if (this.currentFingerprint) {
      const currentPool = this.pools.get(this.currentFingerprint);
      if (currentPool && currentPool.has(text)) {
        return {
          found: true,
          translation: currentPool.get(text)!,
          source: 'special'
        };
      }
    }
    
    // Fallback to common
    const commonPool = this.pools.get('common');
    if (commonPool && commonPool.has(text)) {
      return {
        found: true,
        translation: commonPool.get(text)!,
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
   */
  addTranslation(text: string, translation: string): void {
    const fp = this.currentFingerprint || 'common';
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
    
    // Add to pool automatically
    if (response.translatedText) {
      this.addTranslation(text, response.translatedText);
    }
    
    return response;
  }
  
  /**
   * Get all translations for current fingerprint (includes common if needed)
   * @returns Array of {text, translation}
   */
  getAll(): Array<{ text: string; translation: string }> {
    const fp = this.currentFingerprint || 'common';
    return this.getAllForFingerprint(fp);
  }
  
  /**
   * Get all translations for a specific fingerprint
   * @param fp Fingerprint name
   * @returns Array of {text, translation}
   */
  getAllForFingerprint(fp: string): Array<{ text: string; translation: string }> {
    const result: Array<{ text: string; translation: string }> = [];
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
  clearAll(): void {
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
  private client: TranslationClient;
  private pool: TranslationPool;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private options: TranslationServiceOptions;

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

    this.options = options;

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
    
    // Set initial fingerprint if provided
    if (options.fingerprint) {
      this.pool['currentFingerprint'] = options.fingerprint;
    }
  }

  /**
   * Ensure the service is initialized (lazy initialization)
   * Called automatically by translate() if needed
   */
  private async ensureInitialized(): Promise<void> {
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
  private async doInitialize(): Promise<void> {
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
  async initialize(): Promise<void> {
    await this.ensureInitialized();
  }

  /**
   * Check if service has been initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Switch to a different fingerprint (for personalized/custom translations)
   * Automatically loads all translations for this fingerprint
   * @param fingerprint - The fingerprint to switch to
   */
  async switchFingerprint(fingerprint: string): Promise<void> {
    // Reset initialization state
    this.initialized = false;
    this.initPromise = null;
    
    await this.pool.switchFingerprint(fingerprint);
    this.initialized = true;
  }

  /**
   * Clear the current fingerprint - frees memory
   */
  clearCurrentFingerprint(): void {
    this.pool.clearCurrentFingerprint();
  }

  /**
   * Get all available translations for a semantic sense
   * @param senseId - Semantic sense ID
   * @param fingerprint - Optional special fingerprint for personalized translations
   * If not provided, uses the fingerprint configured at service initialization
   * @returns Promise resolving to list of available translation strings
   */
  async getSenseTranslations(senseId: string, fingerprint?: string): Promise<string[]> {
    const response = await this.client.getSenseTranslate({
      senseId,
      fingerprint,
      page: 1,
      pageSize: 1000
    });
    
    const translations: string[] = [];
    response.result.forEach(record => {
      if (record.translate && record.translate.trim()) {
        translations.push(record.translate);
      }
    });
    
    return translations;
  }

  /**
   * Add a custom translation to the current pool
   * @param text - Original text
   * @param translation - Translated text
   */
  addCustomTranslation(text: string, translation: string): void {
    this.pool.addTranslation(text, translation);
  }

  /**
   * Lookup translation in cache
   * Note: If not initialized, will return not found
   * @param text - Text to lookup
   * @returns Lookup result with found flag and translation if available
   */
  lookup(text: string): TranslationLookupResult {
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
  async translate(
    text: string,
    toLang?: string,
    fromLang?: string,
    provider?: string
  ): Promise<LLMTranslateResponse> {
    // Lazy initialization - ensure initialized before checking cache
    await this.ensureInitialized();

    // Use configured languages from options if not provided as arguments
    const finalToLang = toLang ?? this.options.toLang;
    const finalFromLang = fromLang ?? this.options.fromLang;

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
        fromLang: finalFromLang,
        toLang: finalToLang,
      };
    }

    // Not in cache, request from backend
    const senseId = this.getSenseId();
    const response = await this.client.llmTranslate({
      text,
      toLang: finalToLang!,
      fromLang: finalFromLang,
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
  async translateDirect(
    text: string,
    toLang?: string,
    fromLang?: string,
    provider?: string
  ): Promise<LLMTranslateResponse> {
    const senseId = this.getSenseId();
    // Use configured languages from options if not provided as arguments
    const finalToLang = toLang ?? this.options.toLang;
    const finalFromLang = fromLang ?? this.options.fromLang;
    return this.client.llmTranslate({
      text,
      toLang: finalToLang!,
      fromLang: finalFromLang,
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
    this.client.destroy();
    this.initialized = false;
    this.initPromise = null;
  }
}

/**
 * Simple LRU Cache implementation for TranslationClient
 * Uses Map with access order for O(1) get/set operations
 */
class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity: number = 1000) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  /**
   * Get value from cache, moves to end (most recently used)
   */
  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * Set value in cache, evicts oldest if over capacity
   */
  set(key: K, value: V): void {
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
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete key from cache
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get current cache size
   */
  get size(): number {
    return this.cache.size;
  }
}

/**
 * Cache key generator for translation requests
 */
function generateCacheKey(request: LLMTranslateRequest): string {
  const parts = [
    request.text,
    request.toLang || '',
    request.fromLang || '',
    request.senseId || '',
    request.provider || ''
  ];
  return parts.join('|');
}

/**
 * Cross-tab cache synchronization options for TranslationClient
 */
export interface ClientCrossTabOptions {
  enabled: boolean;
  channelName?: string;
  storageKey?: string;
}

const defaultClientCrossTabOptions: ClientCrossTabOptions = {
  enabled: false,
  channelName: 'laker-translation-client-cache',
  storageKey: 'laker_translation_client_cache'
};

/**
 * Broadcast Channel message types for TranslationClient cross-tab communication
 */
type ClientCrossTabMessageType = 'cache_update' | 'cache_clear' | 'request_sync';

interface ClientCrossTabMessage {
  type: ClientCrossTabMessageType;
  key?: string;
  data?: LLMTranslateResponse;
}

/**
 * TranslationClient - Low-level gRPC-Web compatible client for TranslationService
 * Uses JSON over HTTP transport for compatibility
 * Includes LRU cache with optional Broadcast Channel + localStorage synchronization
 */
export class TranslationClient {
  private baseUrl: string;
  private token: string;
  private timeout: number;
  private cache: LRUCache<string, LLMTranslateResponse>;
  private cacheEnabled: boolean;
  private crossTabOptions: ClientCrossTabOptions;
  private broadcastChannel: BroadcastChannel | null = null;
  private storageKey: string;

  /**
   * Create a new TranslationClient
   * @param baseUrl Base URL of the gRPC-Web endpoint, defaults to https://api.hottol.com/laker/
   * @param token JWT authentication token (optional)
   * @param timeout Request timeout in milliseconds (default: 30000)
   * @param cacheSize LRU cache size (default: 1000, set to 0 to disable cache)
   * @param crossTabOptions Cross-tab synchronization options (default: disabled)
   */
  constructor(
    baseUrl: string = 'https://api.hottol.com/laker/',
    token: string = '',
    timeout: number = 30000,
    cacheSize: number = 1000,
    crossTabOptions?: Partial<ClientCrossTabOptions>
  ) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.token = token;
    this.timeout = timeout;
    this.cacheEnabled = cacheSize > 0;
    this.cache = new LRUCache<string, LLMTranslateResponse>(cacheSize);
    this.crossTabOptions = { ...defaultClientCrossTabOptions, ...crossTabOptions };
    this.storageKey = this.crossTabOptions.storageKey!;

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
  private initCrossTabSync(): void {
    this.broadcastChannel = new BroadcastChannel(this.crossTabOptions.channelName!);

    this.broadcastChannel.onmessage = (event: MessageEvent<ClientCrossTabMessage>) => {
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
  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined' || !this.crossTabOptions.enabled) {
      return;
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored) as Array<{ key: string; value: LLMTranslateResponse }>;
        data.forEach(({ key, value }) => {
          this.cache.set(key, value);
        });
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

    try {
      const data = this.getAllCacheEntries();
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save translation cache to localStorage:', e);
    }
  }

  /**
   * Get all cache entries for storage/broadcast
   */
  private getAllCacheEntries(): Array<{ key: string; value: LLMTranslateResponse }> {
    const result: Array<{ key: string; value: LLMTranslateResponse }> = [];
    // Access internal cache map for iteration
    const cacheMap = (this.cache as any).cache as Map<string, LLMTranslateResponse>;
    cacheMap.forEach((value, key) => {
      result.push({ key, value });
    });
    return result;
  }

  /**
   * Broadcast full cache to other tabs
   */
  private broadcastFullCache(): void {
    if (!this.broadcastChannel || !this.crossTabOptions.enabled) {
      return;
    }

    const entries = this.getAllCacheEntries();
    entries.forEach(({ key, value }) => {
      this.broadcastChannel!.postMessage({
        type: 'cache_update',
        key,
        data: value
      });
    });
  }

  /**
   * Broadcast a single cache update to other tabs
   */
  private broadcastCacheUpdate(key: string, value: LLMTranslateResponse): void {
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
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Enable or disable cache
   * @param enabled Whether to enable cache
   */
  setCacheEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
  }

  /**
   * Clear the translation cache (also clears localStorage and broadcasts to other tabs)
   */
  clearCache(): void {
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
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Check if cross-tab synchronization is enabled
   */
  isCrossTabEnabled(): boolean {
    return this.crossTabOptions.enabled;
  }

  /**
   * Destroy the client, close broadcast channel and free resources
   */
  destroy(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
  }

  /**
凤   * GetSenseTranslate - One-shot unary request with pagination
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
   * Uses LRU cache to avoid repeated requests for the same text
   * With cross-tab enabled, automatically syncs cache across browser tabs
   * @param request Translation request
   * @param skipCache If true, bypass cache and always request from backend
   */
  async llmTranslate(request: LLMTranslateRequest, skipCache: boolean = false): Promise<LLMTranslateResponse> {
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
    const response = await this.fetchJson(url, request) as LLMTranslateResponse;

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
  private client: TranslationClient;
  private service: TranslationService;
  private config: AppTranslationConfig;
  private currentFingerprint: string | null = null;
  private useCache: boolean;

  /**
   * Create a new AppTranslation instance
   * @param config Configuration options
   */
  constructor(config: AppTranslationConfig) {
    this.config = config;
    // Default to using cache unless explicitly disabled
    this.useCache = config.useCache !== false;
    
    // If cache is disabled, set cacheSize to 0
    const cacheSize = this.useCache ? (config.cacheSize || 1000) : 0;
    
    this.client = new TranslationClient(
      config.baseUrl || 'https://api.hottol.com/laker/',
      config.token,
      config.timeout || 30000,
      cacheSize,
      { enabled: config.crossTab ?? false }
    );
    
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
  setToken(token: string): void {
    this.client.setToken(token);
  }

  /**
   * Set or change the current fingerprint
   * Automatically loads special translations for this fingerprint
   * @param fingerprint The fingerprint to use
   */
  async setFingerprint(fingerprint: string): Promise<void> {
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
  clearFingerprint(): void {
    this.currentFingerprint = null;
    this.service.clearCurrentFingerprint();
  }

  /**
   * Get the current fingerprint
   */
  getFingerprint(): string | null {
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
  async translate(text: string, toLang: string, fromLang?: string): Promise<string> {
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
  async translateWithDetails(
    text: string, 
    toLang: string, 
    fromLang?: string
  ): Promise<LLMTranslateResponse> {
    return this.service.translate(text, toLang, fromLang);
  }

  /**
   * Translate text without using cache (always request from backend)
   * @param text Text to translate
   * @param toLang Target language code
   * @param fromLang Optional source language code
   * @returns Translation result
   */
  async translateNoCache(text: string, toLang: string, fromLang?: string): Promise<string> {
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
  async translateBatch(
    texts: string[], 
    toLang: string, 
    fromLang?: string
  ): Promise<string[]> {
    const results = await Promise.all(
      texts.map(text => this.translate(text, toLang, fromLang))
    );
    return results;
  }

  /**
   * Check if cache is enabled
   * @returns true if cache is enabled
   */
  isCacheEnabled(): boolean {
    return this.useCache;
  }

  /**
   * Check if a translation exists in cache
   * @param text Text to check
   * @returns true if translation exists in cache
   */
  hasTranslation(text: string): boolean {
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
  getCached(text: string): string | null {
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
  addTranslation(text: string, translation: string): void {
    if (this.useCache) {
      this.service.addCustomTranslation(text, translation);
    }
  }

  /**
   * Preload all translations for current context
   * Call this to warm up the cache before translating
   */
  async preload(): Promise<void> {
    if (this.useCache) {
      await this.service.initialize();
    }
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return this.service.isInitialized();
  }

  /**
   * Clear all cached translations
   */
  clearCache(): void {
    this.service.clearAll();
    this.client.clearCache();
  }

  /**
   * Destroy the instance and free resources
   * Call this when the instance is no longer needed
   */
  destroy(): void {
    this.service.destroy();
  }
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
export function createTranslation(
  token: string, 
  senseId: string, 
  options?: Partial<AppTranslationConfig>
): AppTranslation {
  return new AppTranslation({
    token,
    senseId,
    ...options
  });
}export default createTranslation;
