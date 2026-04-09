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
  // 用户输入文本，用于查询单个翻译
  text?: string;
  // 源语言，可选，用于LLM翻译
  from_lang?: string;
  // 目标语言，必填，用于LLM翻译
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
 * Queued translation request during pool loading
 */
interface QueuedTranslationRequest {
  text: string;
  toLang: string;
  fromLang?: string;
  fingerprint?: string;
  resolveFunction: (result: LLMTranslateResponse) => void;
  rejectFunction: (error: any) => void;
}

/**
 * Multiple pending resolution promises for the same key
 */
interface PendingResolutions {
  [key: string]: { resolve: (result: LLMTranslateResponse) => void; reject: (error: any) => void };
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
 * TranslationPool - Multi-fingerprint, multi-language translation cache with automatic common preloading
 *
 * Architecture:
 * - pools: Map of "fingerprint:toLang" -> Map<text, translation> (each fingerprint+language has independent cache)
 * - currentFingerprint: current active fingerprint for special translations
 * - currentToLang: current active target language
 * - common translations are always loaded and cached forever per language, never cleared unless full clear happens
 * - Optional cross-tab synchronization via Broadcast Channel and localStorage
 *
 * Rules:
 * - common:{toLang} translations are always loaded on initialization and cached forever per language
 * - If fingerprint exists, load special translations for that fingerprint+language
 * - Switching languages preserves cached data for other languages
 * - Switching fingerprints doesn't clear cached data for other fingerprints
 * - Lookup priority: current fingerprint+language first, common+language second
 * - All translations are cached independently by fingerprint and language
 */
class TranslationPool {
  private client: TranslationClient;
  private senseId: string;
  // Separate cache for each fingerprint+language: "fingerprint:toLang" -> Map<text, translation>
  private pools: Map<string, Map<string, string>> = new Map();
  private currentFingerprint: string | null = null;
  private currentToLang: string | null = null;
  private crossTabOptions: CrossTabOptions;
  private broadcastChannel: BroadcastChannel | null = null;
  private loading: boolean = false;
  // Track loaded fingerprint+language combinations: "fingerprint:toLang"
  private loadedCombinations: Set<string> = new Set();
  
  // Language version tracking to validate translations during language changes
  private currentLanguageVersion: number = 0;
  
  // Observer pattern for queueing translation requests during load
  private queuedRequests: QueuedTranslationRequest[] = [];
  private pendingResolutions: PendingResolutions = {};
  
  // Callback for translation loaded events (reactive binding)
  private onTranslationLoaded: ((text: string, translation: string) => void) | null = null;
  
  // Callback for pool initialization complete
  private onPoolInitialized: (() => void) | null = null;
  
  // Callback for queue processing complete
  private onQueueProcessed: ((count: number) => void) | null = null;
  
  // Callback for when a queued translation request is updated with actual translation
  // This is called after processQueuedRequests completes, allowing UI to refresh
  private onTranslationUpdated: ((text: string, translation: string) => void) | null = null;
  
  /**
   * Generate pool key from fingerprint and language
   * @param fingerprint Fingerprint (or 'common')
   * @param toLang Target language code
   * @returns Pool key in format "fingerprint:toLang"
   */
  private getPoolKey(fingerprint: string, toLang: string): string {
    return `${fingerprint}:${toLang}`;
  }

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
    
    // Note: Pools are now initialized per-language in initialize() or when language is first used
    // We no longer pre-initialize 'common' here - it's done when toLang is set
    
    if (this.crossTabOptions.enabled && typeof BroadcastChannel !== 'undefined') {
      this.initCrossTabSync();
    }
    
    // Load from localStorage if cross-tab enabled and storage available
    this.loadFromStorage();
  }
  
 // ========== Reactive Binding Callbacks ==========
  
  /**
   * Set callback for when a translation is added to the pool
   * This enables reactive UI updates when translations become available
   * @param callback Function called with (text, translation) when a translation is added
   */
  setTranslationLoadedCallback(callback: (text: string, translation: string) => void): void {
    this.onTranslationLoaded = callback;
  }
  
  /**
   * Set callback for when the pool initialization is complete
   * @param callback Function called when pool is fully initialized
   */
  setPoolInitializedCallback(callback: () => void): void {
    this.onPoolInitialized = callback;
  }
  
  /**
   * Set callback for when queued requests are processed
   * @param callback Function called with the count of processed requests
   */
  setQueueProcessedCallback(callback: (count: number) => void): void {
    this.onQueueProcessed = callback;
  }
  
  /**
   * Set callback for when a queued translation request is updated with actual translation
   * This is called after processQueuedRequests completes, allowing UI to refresh
   * @param callback Function called with (text, translation) when a queued translation is updated
   */
  setTranslationUpdatedCallback(callback: (text: string, translation: string) => void): void {
    this.onTranslationUpdated = callback;
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
    
    // Load all stored language pools
    // Storage key format: {prefix}{senseId}_{fingerprint}:{toLang}
    const prefix = `${this.crossTabOptions.storageKeyPrefix}${this.senseId}_`;
    
    // Try to find common pools for any language
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix) && key.includes(':')) {
        const afterPrefix = key.substring(prefix.length);
        const colonIndex = afterPrefix.lastIndexOf(':');
        if (colonIndex > 0) {
          const fingerprint = afterPrefix.substring(0, colonIndex);
          const toLang = afterPrefix.substring(colonIndex + 1);
          
          if (fingerprint === 'common') {
            this.loadLanguageFromStorage(fingerprint, toLang);
          }
        }
      }
    }
  }
  
  /**
   * Load a specific fingerprint+language's cache from localStorage
   * @param fingerprint Fingerprint (or 'common')
   * @param toLang Target language code
   */
  private loadLanguageFromStorage(fingerprint: string, toLang: string): void {
    const poolKey = this.getPoolKey(fingerprint, toLang);
    const storageKey = this.getStorageKey(fingerprint, toLang);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored) as Array<{ text: string; translation: string }>;
        let pool = this.pools.get(poolKey);
        if (!pool) {
          pool = new Map();
          this.pools.set(poolKey, pool);
        }
        data.forEach(({ text, translation }) => {
          pool.set(text, translation);
        });
        this.loadedCombinations.add(poolKey);
      }
    } catch (e) {
      console.warn('Failed to load translation cache from localStorage:', e);
    }
  }
  
  /**
   * Get storage key for a specific fingerprint and language
   * @param fingerprint Fingerprint (or 'common')
   * @param toLang Target language code
   */
  private getStorageKey(fingerprint: string, toLang: string): string {
    return `${this.crossTabOptions.storageKeyPrefix}${this.senseId}_${fingerprint}:${toLang}`;
  }
  
  /**
   * Save cache to localStorage
   * @param fingerprint Fingerprint (or 'common')
   * @param toLang Target language code
   */
  private saveToStorage(fingerprint: string, toLang: string): void {
    if (typeof localStorage === 'undefined' || !this.crossTabOptions.enabled) {
      return;
    }
    
    const poolKey = this.getPoolKey(fingerprint, toLang);
    const storageKey = this.getStorageKey(fingerprint, toLang);
    try {
      const pool = this.pools.get(poolKey);
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
    const toLang = this.currentToLang || 'en';
    const message: CrossTabMessage = {
      type: 'cache_update',
      senseId: this.senseId,
      fingerprint: this.currentFingerprint || undefined,
      data: {
        result: this.getAllForFingerprint(fp, toLang),
        ...(text && translation && { text, translation })
      }
    };
    
    this.broadcastChannel.postMessage(message);
    this.saveToStorage(fp, toLang);
  }
  
  /**
   * Handle incoming cache update from another tab
   */
  private handleCacheUpdate(message: CrossTabMessage): void {
    const fp = message.fingerprint || 'common';
    // Get toLang from the message or use current
    const toLang = this.currentToLang || 'en';
    const poolKey = this.getPoolKey(fp, toLang);
    
    if (message.data?.result) {
      // Update full cache for this fingerprint+language
      let pool = this.pools.get(poolKey);
      if (!pool) {
        pool = new Map();
        this.pools.set(poolKey, pool);
      }
      pool.clear();
      message.data.result.forEach(({ text, translation }) => {
        pool.set(text, translation);
      });
      this.loadedCombinations.add(poolKey);
    }
    
    // Update specific entry
    if (message.data?.text && message.data?.translation) {
      const pool = this.pools.get(poolKey) || new Map();
      pool.set(message.data.text, message.data.translation);
      this.pools.set(poolKey, pool);
      this.saveToStorage(fp, toLang);
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
   * Queue a translation request and return original text immediately
   * This is used during pool loading when translations are not yet available
   * @param request Translation request to queue
   * @returns Original text as the initial response
   */
  queueTranslationRequest(request: {
    text: string;
    toLang: string;
    fromLang?: string;
    fingerprint?: string;
  }): Promise<LLMTranslateResponse> {
    // Create a pending promise that will be resolved after pool loads
    const promise = new Promise<LLMTranslateResponse>((resolve, reject) => {
      // Queue the request for processing after pool loads
      const queuedReq: QueuedTranslationRequest = {
        ...request,
        resolveFunction: resolve,
        rejectFunction: reject
      };
      
      this.queuedRequests.push(queuedReq);
      
      // Store reference to allow later resolution
      const key = `${request.text}-${request.fingerprint || 'common'}`;
      this.pendingResolutions[key] = {
        resolve: resolve,
        reject: reject
      };
    });
    
    // Return pending promise - will be resolved when processQueuedRequests completes
    return promise;
  }
  
  /**
   * Process all queued translation requests after pool is loaded
   * This should be called when the pool is fully initialized
   * Includes automatic retry mechanism for failed requests
   */
  async processQueuedRequests(maxRetries: number = 3, retryDelayMs: number = 1000): Promise<void> {
    if (this.queuedRequests.length === 0) {
      return;
    }
    
    console.log(`[TranslationPool] Processing ${this.queuedRequests.length} queued translation requests...`);
    
    // Copy queued requests and clear the queue
    const requestsToProcess = [...this.queuedRequests];
    this.queuedRequests = [];
    
    // Process each request with retry mechanism
    const processWithRetry = async (
      req: QueuedTranslationRequest,
      attempt: number = 0
    ): Promise<{ text: string; translation: string; success: boolean }> => {
      try {
        // Check if translation is now available in pool
        const lookup = this.lookup(req.text, req.fingerprint);
        if (lookup.found) {
          // Translation is now available in pool, use it
          const translation = await this.client.translate(
            req.text,
            req.toLang,
            req.fromLang,
            req.fingerprint
          );
          
          return { text: req.text, translation, success: true };
        } else {
          // Not in pool, request from backend
          const response = await this.client.translateWithDetails(
            req.text,
            req.toLang,
            req.fromLang,
            req.fingerprint
          );
          
          return { text: req.text, translation: response.translatedText, success: true };
        }
      } catch (error) {
        console.warn(`[TranslationPool] Request failed (attempt ${attempt + 1}/${maxRetries}):`, error.message);
        
        if (attempt < maxRetries - 1) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelayMs * (attempt + 1)));
          return processWithRetry(req, attempt + 1);
        }
        
        // All retries failed, return original text as fallback
        console.error(`[TranslationPool] All retries failed for: "${req.text}", using original text`);
        return { text: req.text, translation: req.text, success: false };
      }
    };
    
    // Process all requests in parallel
    const promises = requestsToProcess.map(req => processWithRetry(req));
    const results = await Promise.all(promises);
    
    // Add successful translations to pool and resolve promises
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    
    results.forEach(({ text, translation }, index) => {
      // Add translation to pool
      this.addTranslation(text, translation);
      
      // Resolve the promise for the queued request with the actual translation
      const queuedReq = requestsToProcess[index];
      if (queuedReq && queuedReq.resolveFunction) {
        const response: LLMTranslateResponse = {
          originalText: text,
          translatedText: translation,
          provider: 'queued_translation',
          timestamp: Date.now(),
          finished: true,
          cached: false,
          fromLang: queuedReq.fromLang,
          toLang: queuedReq.toLang
        };
        queuedReq.resolveFunction(response);
        
        // Remove from pending resolutions
        const key = `${text}-${queuedReq.fingerprint || 'common'}`;
        delete this.pendingResolutions[key];
        
        // Trigger onTranslationUpdated callback to notify UI
        if (this.onTranslationUpdated) {
          this.onTranslationUpdated(text, translation);
        }
      }
    });
    
    // Handle failed requests - reject their promises
    requestsToProcess.forEach((queuedReq, index) => {
      if (!results[index].success && queuedReq.rejectFunction) {
        const error = new Error(`Translation failed for: ${queuedReq.text}`);
        queuedReq.rejectFunction(error);
        
        // Remove from pending resolutions
        const key = `${queuedReq.text}-${queuedReq.fingerprint || 'common'}`;
        delete this.pendingResolutions[key];
      }
    });
    
    // Broadcast updates to other tabs
    this.broadcastUpdate();
    
    console.log(`[TranslationPool] Completed processing ${results.length} queued requests (${successCount} success, ${failCount} failed)`);
    
    // Trigger queue processed callback for reactive UI updates
    if (this.onQueueProcessed) {
      this.onQueueProcessed(results.length);
    }
    
    // If there were failures, log them
    if (failCount > 0) {
      console.warn(`[TranslationPool] ${failCount} requests failed after ${maxRetries} retries`);
    }
  }
  
  /**
   * Check if there are any pending queued requests
   */
  hasQueuedRequests(): boolean {
    return this.queuedRequests.length > 0;
  }
  
  /**
   * Clear all queued requests (should be called when pool is being cleared)
   */
  clearQueuedRequests(): void {
    console.log(`Clearing ${this.queuedRequests.length} queued requests`);
    this.queuedRequests = [];
    this.pendingResolutions = {};
  }
  
  /**
   * Check if currently loading
   */
  isLoading(): boolean {
    return this.loading;
  }
  
  /**
   * Check if a specific fingerprint+language combination is loaded
   * Or check if any combination for this language is loaded
   * @param fingerprint Fingerprint (or 'common') OR toLang when checking whole language
   * @param toLang Target language code (required when fingerprint is provided)
   * @returns boolean indicating if loaded
   */
  isLanguageLoaded(fingerprint: string, toLang?: string): boolean {
    if (toLang === undefined) {
      // Single parameter mode - check if any combination for this language
      const checkedToLang = fingerprint;
      for (const key of this.loadedCombinations) {
        if (key.endsWith(`:${checkedToLang}`)) {
          return true;
        }
      }
      return false;
    }
    // Two parameter mode - check specific combination
    const poolKey = this.getPoolKey(fingerprint, toLang);
    return this.loadedCombinations.has(poolKey);
  }

  /**
   * Initialize the pool for a specific language - always loads common first, then loads current fingerprint if set
   * If fingerprint is set, loads special translations; common is always preloaded
   * After loading, processes any queued translation requests
   * @param toLang Target language for translations (required for language-specific caching)
   */
  async initialize(toLang: string): Promise<void> {
    if (this.loading) {
      return;
    }
    
    this.loading = true;
    this.currentToLang = toLang;
    
    try {
      console.log(`[TranslationPool] Starting pool initialization... (toLang: ${toLang})`);
      
      const commonPoolKey = this.getPoolKey('common', toLang);
      
      // Always preload common first for this language (required)
      if (!this.loadedCombinations.has(commonPoolKey)) {
        await this.loadFingerprintTranslations('common', undefined, toLang);
        console.log(`[TranslationPool] Common translations loaded for ${toLang}`);
      }
      
      // Then load current fingerprint if set and not loaded for this language
      if (this.currentFingerprint) {
        const fpPoolKey = this.getPoolKey(this.currentFingerprint, toLang);
        if (!this.loadedCombinations.has(fpPoolKey)) {
          await this.loadFingerprintTranslations(this.currentFingerprint, this.currentFingerprint, toLang);
          console.log(`[TranslationPool] ${this.currentFingerprint} translations loaded for ${toLang}`);
        }
      }
      
      // Broadcast to other tabs after full initialization
      this.broadcastUpdate();
      
      console.log(`[TranslationPool] Pool initialization completed for ${toLang}`);
      
      // Trigger pool initialized callback for reactive UI updates
      if (this.onPoolInitialized) {
        this.onPoolInitialized();
      }
      
      // Process queued requests after pool is loaded
      await this.processQueuedRequests();
    } finally {
      this.loading = false;
    }
  }
  
  /**
   * Load translations for a specific fingerprint and language
   * @param fp Pool key fingerprint (or 'common')
   * @param fingerprint Actual fingerprint for API request (undefined for common)
   * @param toLang Target language code
   */
  private async loadFingerprintTranslations(fp: string, fingerprint: string | undefined, toLang: string): Promise<void> {
    const poolKey = this.getPoolKey(fp, toLang);
    
    // Already loaded
    if (this.loadedCombinations.has(poolKey)) {
      return;
    }
    
    // Ensure pool exists for this fingerprint+language
    let pool = this.pools.get(poolKey);
    if (!pool) {
      pool = new Map();
      this.pools.set(poolKey, pool);
    }
    
    // Use streaming for batch loading
    await this.client.translateStream(
      {
        senseId: this.senseId,
        fingerprint,
        to_lang: toLang,
        batchSize: 500
      },
      (response) => {
        // Add all translations from this batch to the fingerprint's pool
        // response.translation is a Record<string, string> (key-value map)
        Object.entries(response.translation).forEach(([text, translate]) => {
          pool!.set(text, translate);
        });
        return true; // Continue streaming
      }
    );
    
    // Mark as loaded
    this.loadedCombinations.add(poolKey);
  }
  
  /**
   * Switch to a different fingerprint, loads its translations if not already loaded for current language
   * Doesn't clear existing cached translations for other fingerprints or languages
   * @param fingerprint The fingerprint to switch to
   */
  async switchFingerprint(fingerprint: string): Promise<void> {
    this.currentFingerprint = fingerprint;
    
    // Ensure pool exists for current language
    const toLang = this.currentToLang || 'en';
    const poolKey = this.getPoolKey(fingerprint, toLang);
    if (!this.pools.has(poolKey)) {
      this.pools.set(poolKey, new Map());
    }
    
    // Load from localStorage first
    this.loadLanguageFromStorage(fingerprint, toLang);
    
    // Check if we need to load from backend
    const fpPoolKey = this.getPoolKey(fingerprint, toLang);
    if (!this.loadedCombinations.has(fpPoolKey)) {
      await this.loadFingerprintTranslations(fingerprint, fingerprint, toLang);
    }
  }
  
  /**
   * Clear cached translations for a specific fingerprint and language to free memory
   * Doesn't affect other fingerprints or languages
   * @param fingerprint The fingerprint to clear
   * @param toLang Optional target language (uses currentToLang if not provided)
   */
  clearFingerprint(fingerprint: string, toLang?: string): void {
    const lang = toLang || this.currentToLang || 'en';
    const poolKey = this.getPoolKey(fingerprint, lang);
    this.pools.delete(poolKey);
    this.loadedCombinations.delete(poolKey);
    
    // Clear localStorage
    if (typeof localStorage !== 'undefined' && this.crossTabOptions.enabled) {
      const storageKey = this.getStorageKey(fingerprint, lang);
      localStorage.removeItem(storageKey);
    }
  }
  
  /**
   * Check if a fingerprint has been loaded for a specific language
   * @param fingerprint Fingerprint to check
   * @param toLang Target language (uses currentToLang if not provided)
   */
  isLoaded(fingerprint: string, toLang?: string): boolean {
    const lang = toLang || this.currentToLang || 'en';
    const poolKey = this.getPoolKey(fingerprint, lang);
    return this.loadedCombinations.has(poolKey);
  }
  
  /**
   * Load a fingerprint if not already loaded for the specified language
   * @param fingerprint Fingerprint to load
   * @param toLang Target language (uses currentToLang if not provided)
   */
  async loadFingerprintIfNotLoaded(fingerprint: string, toLang?: string): Promise<void> {
    const lang = toLang || this.currentToLang || 'en';
    const poolKey = this.getPoolKey(fingerprint, lang);
    
    if (this.loadedCombinations.has(poolKey)) {
      return;
    }
    
    // Load from localStorage first
    this.loadLanguageFromStorage(fingerprint, lang);
    
    // Check if still not loaded after localStorage
    if (!this.loadedCombinations.has(poolKey)) {
      await this.loadFingerprintTranslations(fingerprint, fingerprint, lang);
    }
  }
  
  /**
   * Clear the current fingerprint to free memory (switch back to common)
   * Current fingerprint becomes null, only common remains active for current language
   */
  clearCurrentFingerprint(): void {
    if (this.currentFingerprint) {
      this.clearFingerprint(this.currentFingerprint);
      this.currentFingerprint = null;
    }
  }
  
  /**
   * Lookup translation for a specific language
   * Priority: provided fingerprint (if any) → current fingerprint (if set) → common → not found
   * @param text Original text to lookup
   * @param fingerprint Optional specific fingerprint to lookup (overrides current fingerprint)
   * @param toLang Target language (uses currentToLang if not provided)
   * @returns Lookup result
   */
  lookup(text: string, fingerprint?: string, toLang?: string): TranslationLookupResult {
    const lang = toLang || this.currentToLang || 'en';
    
    // Check provided fingerprint first if given
    if (fingerprint) {
      const poolKey = this.getPoolKey(fingerprint, lang);
      const targetPool = this.pools.get(poolKey);
      if (targetPool && targetPool.has(text)) {
        return {
          found: true,
          translation: targetPool.get(text)!,
          source: 'special'
        };
      }
    }
    
    // Check current fingerprint next if we have one and no specific fingerprint provided
    if (!fingerprint && this.currentFingerprint) {
      const poolKey = this.getPoolKey(this.currentFingerprint, lang);
      const currentPool = this.pools.get(poolKey);
      if (currentPool && currentPool.has(text)) {
        return {
          found: true,
          translation: currentPool.get(text)!,
          source: 'special'
        };
      }
    }
    
    // Fallback to common for this language
    const commonPoolKey = this.getPoolKey('common', lang);
    const commonPool = this.pools.get(commonPoolKey);
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
   * Add a translation to the pool for a specific language
   * Adds to current fingerprint pool (or common if no fingerprint set)
   * @param text Original text
   * @param translation Translated text
   * @param fingerprint Optional specific fingerprint to add to (overrides current fingerprint)
   * @param languageVersion Optional language version to validate (if provided, must match current version)
   * @param toLang Optional target language (uses currentToLang if not provided)
   */
  addTranslation(text: string, translation: string, fingerprint?: string, languageVersion?: number, toLang?: string): void {
    const lang = toLang || this.currentToLang || 'en';
    
    // Validate language version if provided - reject stale translations from previous language
    if (languageVersion !== undefined && languageVersion !== this.currentLanguageVersion) {
      console.log(`[TranslationPool] Discarding stale translation for "${text}" (version ${languageVersion} vs current ${this.currentLanguageVersion})`);
      return;
    }
    
    // Validate toLang if provided - reject translations for wrong target language
    if (toLang !== undefined && this.currentToLang && toLang !== this.currentToLang) {
      console.log(`[TranslationPool] Discarding translation for wrong language for "${text}" (toLang ${toLang} vs current ${this.currentToLang})`);
      return;
    }
    
    const fp = fingerprint || this.currentFingerprint || 'common';
    const poolKey = this.getPoolKey(fp, lang);
    let pool = this.pools.get(poolKey);
    if (!pool) {
      pool = new Map();
      this.pools.set(poolKey, pool);
    }
    pool.set(text, translation);
    this.broadcastUpdate(text, translation);
    
    // Trigger reactive callback for UI updates
    if (this.onTranslationLoaded) {
      this.onTranslationLoaded(text, translation);
    }
  }
  
  /**
   * Update the language version (called when language changes)
   * This invalidates all pending translations from the previous language
   * @param version New language version
   */
  setLanguageVersion(version: number): void {
    this.currentLanguageVersion = version;
  }
  
  /**
   * Set the current target language (called when language changes)
   * This is used to validate translations before adding to pool
   * @param toLang Target language
   */
  setToLang(toLang: string): void {
    this.currentToLang = toLang;
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
    // Use translateStream API - backend will automatically call LLM if translation not found in database
    return new Promise((resolve, reject) => {
      this.client.translateStream(
        {
          senseId: this.senseId,
          text,
          from_lang: fromLang,
          to_lang: toLang
        },
        (response) => {
          // Check if we got a translation
          if (response.translation && response.translation[text]) {
            const translatedText = response.translation[text];
            // Add to pool automatically
            this.addTranslation(text, translatedText);
            resolve({
              originalText: text,
              translatedText: translatedText,
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
        }
      ).catch(reject);
    });
  }
  
  /**
   * Get all translations for current fingerprint and language
   * @returns Array of {text, translation}
   */
  getAll(): Array<{ text: string; translation: string }> {
    const fp = this.currentFingerprint || 'common';
    const toLang = this.currentToLang || 'en';
    return this.getAllForFingerprint(fp, toLang);
  }
  
  /**
   * Get all translations for a specific fingerprint and language
   * @param fp Fingerprint name
   * @param toLang Target language code
   * @returns Array of {text, translation}
   */
  getAllForFingerprint(fp: string, toLang: string): Array<{ text: string; translation: string }> {
    const result: Array<{ text: string; translation: string }> = [];
    const poolKey = this.getPoolKey(fp, toLang);
    const pool = this.pools.get(poolKey);
    if (pool) {
      pool.forEach((translation, text) => {
        result.push({ text, translation });
      });
    }
    return result;
  }
  
  /**
   * Clear all cached data for all languages to free memory
   */
  clearAll(): void {
    // Clear all fingerprint+language combinations from memory
    this.pools.clear();
    this.loadedCombinations.clear();
    this.currentFingerprint = null;
    this.currentToLang = null;
    
    // Clear all localStorage for this sense
    if (typeof localStorage !== 'undefined' && this.crossTabOptions.enabled) {
      const prefix = `${this.crossTabOptions.storageKeyPrefix}${this.senseId}_`;
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
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
   * Clear cached data for a specific language only
   * Preserves caches for other languages
   * @param toLang Target language to clear
   */
  clearLanguage(toLang: string): void {
    // Find and remove all pools for this language
    const keysToRemove: string[] = [];
    
    this.pools.forEach((_, key) => {
      if (key.endsWith(`:${toLang}`)) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => {
      this.pools.delete(key);
      this.loadedCombinations.delete(key);
    });
    
    // Clear localStorage for this language
    if (typeof localStorage !== 'undefined' && this.crossTabOptions.enabled) {
      const prefix = `${this.crossTabOptions.storageKeyPrefix}${this.senseId}_`;
      const suffix = `:${toLang}`;
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix) && key.endsWith(suffix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    console.log(`[TranslationPool] Cleared cache for language: ${toLang}`);
  }
  
  /**
   * Get all loaded languages
   * @returns Array of loaded language codes
   */
  getLoadedLanguages(): string[] {
    const languages = new Set<string>();
    for (const key of this.loadedCombinations) {
      const colonIndex = key.lastIndexOf(':');
      if (colonIndex > 0) {
        languages.add(key.substring(colonIndex + 1));
      }
    }
    return Array.from(languages);
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
export class TranslationClient {
  private baseUrl: string;
  private token: string;
  private timeout: number;
  private config: TranslationClientConfig;
  
  // LRU cache for LLM translations
  private llmCacheEnabled: boolean;
  private llmCache: LRUCache<string, LLMTranslateResponse>;
  
  // Translation pool for pre-loaded translations (fingerprint support)
  private pool: TranslationPool;
  private currentFingerprint: string | null = null;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private currentToLang: string | null = null;

  // Language version token to detect and handle language changes during concurrent requests
  private languageVersion: number = 0;
  // AbortController to cancel in-flight requests when language changes
  private currentAbortController: AbortController | null = null;

  // Cross-tab for LLM cache
  private broadcastChannel: BroadcastChannel | null = null;
  private crossTabOptions: ClientCrossTabOptions;
  private storageKey: string;

  // ========== Persistent gRPC-Web Connection ==========
  // Single persistent EventSource connection for all streaming requests
  private persistentConnection: EventSource | null = null;
  // Connection state
  private connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  // Pending request callbacks mapped by request ID
  private pendingRequests: Map<string, {
    onMessage: (data: any) => boolean | void;
    onComplete: () => void;
    onError: (error: Error) => void;
  }> = new Map();
  // Next request ID counter
  private nextRequestId: number = 1;
  // Connection connect promise
  private connectPromise: Promise<void> | null = null;
  // Reconnect delay for backoff
  private reconnectDelay: number = 1000;
  // Maximum reconnect delay
  private maxReconnectDelay: number = 30000;
  // Whether we should reconnect on disconnection
  private shouldReconnect: boolean = true;

  // ========== Reactive Binding Event Emitter ==========
  // Simple callback for translation updates (alternative to subscribers)
  public onTranslationUpdated: ((text: string, translation: string) => void) | null = null;
  
  // Simple callback for pool initialization complete
  public onPoolInitialized: (() => void) | null = null;
  
  // Simple callback for queue processed events
  public onQueueProcessed: ((count: number) => void) | null = null;
  
  // Subscribers for translation update events (for UI reactive updates)
  private translationUpdatedSubscribers: Array<(text: string, translation: string) => void> = [];
  
  // Subscribers for pool initialization complete
  private poolInitializedSubscribers: Array<() => void> = [];
  
  // Subscribers for queue processed events
  private queueProcessedSubscribers: Array<(count: number) => void> = [];

  /**
   * Create a new TranslationClient - the only entry point you need
   * @param config Client configuration
   */
  constructor(config: TranslationClientConfig) {
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
    this.llmCache = new LRUCache<string, LLMTranslateResponse>(llmCacheSize);
    
    // Configure cross-tab options for translation pool
    const crossTabOptions: Partial<CrossTabOptions> = {
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
    this.crossTabOptions = { ...defaultClientCrossTabOptions };
    this.storageKey = this.crossTabOptions.storageKey!;

    // Initialize cross-tab synchronization if enabled
    if (config.crossTab && typeof BroadcastChannel !== 'undefined') {
      this.initCrossTabSync();
    }

    // Load from localStorage if cross-tab enabled
    this.loadFromStorage();
    
    // Set up reactive binding callbacks to forward pool events to subscribers
    this.setupReactiveCallbacks();

    // Initialize persistent connection automatically
    this.ensureConnected();
  }
  
  // ========== Reactive Binding Event Methods ==========
  
  /**
   * Set up callbacks to forward TranslationPool events to TranslationClient subscribers
   */
  private setupReactiveCallbacks(): void {
    // Forward translation loaded events
    this.pool.setTranslationLoadedCallback((text: string, translation: string) => {
      this.notifyTranslationUpdated(text, translation);
    });
    
    // Forward pool initialized events
    this.pool.setPoolInitializedCallback(() => {
      this.notifyPoolInitialized();
    });
    
    // Forward queue processed events
    this.pool.setQueueProcessedCallback((count: number) => {
      this.notifyQueueProcessed(count);
    });
  }
  
  /**
   * Subscribe to translation update events
   * Called when a new translation is added to the pool
   * @param callback Function called with (text, translation) when translation is updated
   * @returns Unsubscribe function
   */
  subscribeTranslationUpdated(callback: (text: string, translation: string) => void): () => void {
    this.translationUpdatedSubscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.translationUpdatedSubscribers.indexOf(callback);
      if (index > -1) {
        this.translationUpdatedSubscribers.splice(index, 1);
      }
    };
  }
  
  /**
   * Unsubscribe from translation update events
   * @param callback The callback to remove
   */
  unsubscribeTranslationUpdated(callback: (text: string, translation: string) => void): void {
    const index = this.translationUpdatedSubscribers.indexOf(callback);
    if (index > -1) {
      this.translationUpdatedSubscribers.splice(index, 1);
    }
  }
  
  /**
   * Subscribe to pool initialization complete events
   * @param callback Function called when pool is fully initialized
   * @returns Unsubscribe function
   */
  subscribePoolInitialized(callback: () => void): () => void {
    this.poolInitializedSubscribers.push(callback);
    
    return () => {
      const index = this.poolInitializedSubscribers.indexOf(callback);
      if (index > -1) {
        this.poolInitializedSubscribers.splice(index, 1);
      }
    };
  }
  
  /**
   * Unsubscribe from pool initialization events
   * @param callback The callback to remove
   */
  unsubscribePoolInitialized(callback: () => void): void {
    const index = this.poolInitializedSubscribers.indexOf(callback);
    if (index > -1) {
      this.poolInitializedSubscribers.splice(index, 1);
    }
  }
  
  /**
   * Subscribe to queue processed events
   * Called when queued translation requests are processed
   * @param callback Function called with the count of processed requests
   * @returns Unsubscribe function
   */
  subscribeQueueProcessed(callback: (count: number) => void): () => void {
    this.queueProcessedSubscribers.push(callback);
    
    return () => {
      const index = this.queueProcessedSubscribers.indexOf(callback);
      if (index > -1) {
        this.queueProcessedSubscribers.splice(index, 1);
      }
    };
  }
  
  /**
   * Unsubscribe from queue processed events
   * @param callback The callback to remove
   */
  unsubscribeQueueProcessed(callback: (count: number) => void): void {
    const index = this.queueProcessedSubscribers.indexOf(callback);
    if (index > -1) {
      this.queueProcessedSubscribers.splice(index, 1);
    }
  }
  
  /**
   * Notify all subscribers when a translation is updated
   */
  private notifyTranslationUpdated(text: string, translation: string): void {
    // Call simple callback if set
    if (this.onTranslationUpdated) {
      try {
        this.onTranslationUpdated(text, translation);
      } catch (error) {
        console.error('[TranslationClient] Error in onTranslationUpdated callback:', error);
      }
    }
    
    // Call all subscribers
    this.translationUpdatedSubscribers.forEach(callback => {
      try {
        callback(text, translation);
      } catch (error) {
        console.error('[TranslationClient] Error in translationUpdated subscriber:', error);
      }
    });
  }
  
  /**
   * Notify all subscribers when pool is initialized
   */
  private notifyPoolInitialized(): void {
    // Call simple callback if set
    if (this.onPoolInitialized) {
      try {
        this.onPoolInitialized();
      } catch (error) {
        console.error('[TranslationClient] Error in onPoolInitialized callback:', error);
      }
    }
    
    // Call all subscribers
    this.poolInitializedSubscribers.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[TranslationClient] Error in poolInitialized subscriber:', error);
      }
    });
  }
  
  /**
   * Notify all subscribers when queue is processed
   */
  private notifyQueueProcessed(count: number): void {
    // Call simple callback if set
    if (this.onQueueProcessed) {
      try {
        this.onQueueProcessed(count);
      } catch (error) {
        console.error('[TranslationClient] Error in onQueueProcessed callback:', error);
      }
    }
    
    // Call all subscribers
    this.queueProcessedSubscribers.forEach(callback => {
      try {
        callback(count);
      } catch (error) {
        console.error('[TranslationClient] Error in queueProcessed subscriber:', error);
      }
    });
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
  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined' || !this.crossTabOptions.enabled) {
      return;
    }

     try {
       const stored = localStorage.getItem(this.storageKey);
       if (stored) {
         const data = JSON.parse(stored) as Array<{ key: string; value: LLMTranslateResponse }>;
         data.forEach(({ key, value }) => {
           this.llmCache.set(key, value);
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
    const cacheMap = (this.llmCache as any).cache as Map<string, LLMTranslateResponse>;
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
   * Enable or disable LLM cache
   * @param enabled Whether to enable cache
   */
  setCacheEnabled(enabled: boolean): void {
    this.llmCacheEnabled = enabled;
  }

  /**
   * Clear the LLM translation cache (also clears localStorage and broadcasts to other tabs)
   */
  clearCache(): void {
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
  getCacheSize(): number {
    return this.llmCache.size;
  }

  /**
   * Check if cross-tab synchronization is enabled
   */
  isCrossTabEnabled(): boolean {
    return this.crossTabOptions.enabled;
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
    // Use persistent connection with multiplexing
    await this.sendPersistentRequest(
      'TranslationService/TranslateStream',
      request,
      (data) => onBatch(data as TranslateStreamResponse)
    );
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
    if (this.llmCacheEnabled && !skipCache) {
      const cached = this.llmCache.get(cacheKey);
      if (cached) {
        // Return cached response with cached flag set
        return { ...cached, cached: true };
      }
    }

    // Request from backend using gRPC-web streaming LLMTranslateStream
    let finalResponse: LLMTranslateResponse | null = null;

    await this.llmTranslateStream(request, (response) => {
      finalResponse = response;
      // Continue until finished
      return !response.finished;
    });

    if (!finalResponse) {
      throw new Error('No response received from streaming translation');
    }

    // Cache the response
    if (this.llmCacheEnabled && finalResponse.translatedText) {
      const cachedResponse = { ...finalResponse, cached: true };
      this.llmCache.set(cacheKey, cachedResponse);
      
      // Broadcast to other tabs and save to localStorage
      this.broadcastCacheUpdate(cacheKey, cachedResponse);
    }

    return { ...finalResponse, cached: false };
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
  async translate(text: string, toLang: string, fromLang?: string, fingerprint?: string): Promise<string> {
    const response = await this.translateWithDetails(text, toLang, fromLang, fingerprint);
    return response.translatedText;
  }

  /**
   * Translate text with full response details
   * @param text Text to translate
   * @param toLang Target language
   * @param fromLang Source language (optional)
   * @param fingerprint Optional specific fingerprint for this translation (overrides client-level fingerprint)
   * @returns Full translation response
   */
  async translateWithDetails(
    text: string,
    toLang: string,
    fromLang?: string,
    fingerprint?: string
  ): Promise<LLMTranslateResponse> {
    // Capture the current language version at the start of this request
    // This will be used to validate the response later
    const requestLanguageVersion = this.languageVersion;
    
    // Detect language change - if target language changed
    if (this.currentToLang && this.currentToLang !== toLang) {
      console.log(`[TranslationClient] Language changed from "${this.currentToLang}" to "${toLang}"`);
      
      // Cancel in-flight requests by aborting current controller
      if (this.currentAbortController) {
        this.currentAbortController.abort();
      }
      
      // Increment language version to invalidate all in-flight requests
      this.languageVersion++;
      
      // Sync language version with pool for validation
      this.pool.setLanguageVersion(this.languageVersion);
      
      // Clear queued requests for the old language
      this.pool.clearQueuedRequests();
      
      // Check if target language is already loaded - if so, just switch
      // No need to clear all caches - different languages are cached separately
      const isLanguageLoaded = this.pool.isLanguageLoaded(toLang);
      const isCommonLoaded = this.pool.isLanguageLoaded('common', toLang);
      
      if (!isLanguageLoaded || !isCommonLoaded) {
        // Need to load the new language - will be done below
        console.log(`[TranslationClient] Language "${toLang}" not loaded yet, will load in background`);
      }
      
      this.initialized = false;
      this.initPromise = null;
    }
    this.currentToLang = toLang;
    
    // Sync target language with pool for validation
    this.pool.setToLang(toLang);
    
    // Check if this language is already loaded
    const isLanguageLoaded = this.pool.isLanguageLoaded(fingerprint || this.currentFingerprint || 'common', toLang);
    const isCommonLoaded = this.pool.isLanguageLoaded('common', toLang);
    
    // Auto-initialize if not initialized yet OR if this language is not loaded
    if ((!this.initialized && !this.initPromise) || (!isLanguageLoaded || !isCommonLoaded)) {
      // Check if we already have a pending init for this language
      if (!this.initPromise) {
        this.initPromise = this.initialize(toLang);
      }
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
      await this.initPromise;
      this.initPromise = null;
      this.initialized = true;
    }

    // If specific fingerprint provided and not loaded yet for this language, load it first
    const fp = fingerprint || this.currentFingerprint || 'common';
    if (fp && !this.pool.isLoaded(fp, toLang)) {
      await this.pool.loadFingerprintIfNotLoaded(fp, toLang);
    }

    // Check pre-loaded translation pool first (now includes language)
    const lookup = this.pool.lookup(text, fingerprint, toLang);
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
    // Create a new AbortController for this request
    const abortController = new AbortController();
    this.currentAbortController = abortController;
    
    return new Promise((resolve, reject) => {
      // Check if language has changed since this request started
      if (this.languageVersion !== requestLanguageVersion) {
        console.log(`[TranslationClient] Language changed during request, discarding response for: "${text}"`);
        reject(new Error('Language changed during request'));
        return;
      }
      
      this.translateStream(
        {
          senseId: this.config.senseId,
          fingerprint,
          text,
          from_lang: fromLang,
          to_lang: toLang
        },
        (response) => {
          // Check if request was aborted
          if (abortController.signal.aborted) {
            console.log(`[TranslationClient] Request aborted for: "${text}"`);
            reject(new Error('Request aborted'));
            return false;
          }
          
          // Check if language has changed during streaming
          if (this.languageVersion !== requestLanguageVersion) {
            console.log(`[TranslationClient] Language changed during streaming for: "${text}"`);
            reject(new Error('Language changed during request'));
            return false;
          }
          
          // Check if we got a translation
          if (response.translation && response.translation[text]) {
            const translatedText = response.translation[text];
            
            // Validate language version before adding to pool
            if (this.languageVersion === requestLanguageVersion) {
              // Add to pool with current language version and toLang for validation
              this.pool.addTranslation(text, translatedText, fingerprint, this.languageVersion, toLang);
            }
            
            resolve({
              originalText: text,
              translatedText: translatedText,
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
        }
      ).catch((err) => {
        // Don't reject if aborted
        if (abortController.signal.aborted) {
          console.log(`[TranslationClient] Request aborted for: "${text}"`);
          return;
        }
        reject(err);
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
  async translateNoCache(text: string, toLang: string, fromLang?: string, fingerprint?: string): Promise<string> {
    // Use TranslateStream which will automatically call LLM if needed
    return new Promise((resolve, reject) => {
      this.translateStream(
        {
          senseId: this.config.senseId,
          fingerprint,
          text,
          from_lang: fromLang,
          to_lang: toLang
        },
        (response) => {
          if (response.translation && response.translation[text]) {
            resolve(response.translation[text]);
            return false;
          }
          if (response.translation && response.translation['error']) {
            reject(new Error(response.translation['error']));
            return false;
          }
          return !response.finished;
        }
      ).catch(reject);
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
  async translateBatch(
    texts: string[],
    toLang: string,
    fromLang?: string,
    fingerprint?: string
  ): Promise<string[]> {
    const results = await Promise.all(
      texts.map(text => this.translate(text, toLang, fromLang, fingerprint))
    );
    return results;
  }

  /**
   * Initialize and preload all translations for a given target language
   * Call this to warm up cache before translating
   */
  async preload(toLang: string): Promise<void> {
    if (!this.initialized && !this.initPromise) {
      this.initPromise = this.initialize(toLang);
      await this.initPromise;
      this.initPromise = null;
      this.initialized = true;
    }
  }

  /**
   * Internal initialization - preloads translations via streaming for a specific language
   * @param toLang Target language for initialization (required)
   */
  private async initialize(toLang: string): Promise<void> {
    if (this.llmCacheEnabled) {
      await this.pool.initialize(toLang);
    }
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  // ========== Fingerprint management ==========

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
    await this.pool.switchFingerprint(fingerprint);
  }

  /**
   * Clear the current fingerprint
   * Falls back to common translations
   */
  clearFingerprint(): void {
    this.currentFingerprint = null;
    this.pool.clearCurrentFingerprint();
  }

  /**
   * Get the current fingerprint
   */
  getFingerprint(): string | null {
    return this.currentFingerprint;
  }

  // ========== Cache management ==========

  /**
   * Check if cache is enabled
   * @returns true if cache is enabled
   */
  isCacheEnabled(): boolean {
    return this.llmCacheEnabled;
  }

  /**
   * Check if a translation exists in pre-loaded pool for a specific language
   * @param text Text to check
   * @param fingerprint Optional specific fingerprint to check
   * @param toLang Target language to check (uses currentToLang if not provided)
   * @returns true if translation exists in cache
   */
  hasTranslation(text: string, fingerprint?: string, toLang?: string): boolean {
    const lang = toLang || this.currentToLang || 'en';
    return this.pool.lookup(text, fingerprint, lang).found;
  }
  
  /**
   * Get translation from pre-loaded cache without requesting from backend
   * @param text Text to look up
   * @param fingerprint Optional specific fingerprint to look up
   * @param toLang Target language to look up (uses currentToLang if not provided)
   * @returns Translation if found, null otherwise
   */
  getCached(text: string, fingerprint?: string, toLang?: string): string | null {
    const lang = toLang || this.currentToLang || 'en';
    const result = this.pool.lookup(text, fingerprint, lang);
    return result.found ? result.translation : null;
  }
  
  /**
   * Add a custom translation to the pre-loaded pool for a specific language
   * @param text Original text
   * @param translation Translated text
   * @param fingerprint Optional specific fingerprint to add to
   * @param toLang Target language (uses currentToLang if not provided)
   */
  addTranslation(text: string, translation: string, fingerprint?: string, toLang?: string): void {
    if (this.llmCacheEnabled) {
      const lang = toLang || this.currentToLang || 'en';
      this.pool.addTranslation(text, translation, fingerprint, undefined, lang);
    }
  }

  /**
   * Clear all cached translations
   */
  clearAllCache(): void {
    // Increment language version to invalidate all pending translations
    this.languageVersion++;
    
    // Sync language version with pool
    this.pool.setLanguageVersion(this.languageVersion);
    
    // Reset target language in pool
    this.pool.setToLang('');
    
    this.pool.clearAll();
    this.pool.clearQueuedRequests(); // Clear waiting translation requests too
    this.clearCache(); // Clear LLM cache too
    
    // Reset current toLang
    this.currentToLang = null;
  }
  
  /**
   * Check if a specific language has been loaded
   * @param toLang Target language to check
   * @returns true if the language has been loaded
   */
  isLanguageLoaded(toLang: string): boolean {
    return this.pool.isLanguageLoaded(toLang);
  }
  
  /**
   * Get all loaded languages
   * @returns Array of loaded language codes
   */
  getLoadedLanguages(): string[] {
    return this.pool.getLoadedLanguages();
  }
  
  /**
   * Clear cached data for a specific language only
   * Preserves caches for other languages
   * @param toLang Target language to clear
   */
  clearLanguage(toLang: string): void {
    this.pool.clearLanguage(toLang);
  }
  
  /**
   * Destroy the instance and free resources
   * Call this when the instance is no longer needed
   */
  destroy(): void {
    this.shouldReconnect = false;
    this.closePersistentConnection();
    this.pool.destroy();
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    this.pendingRequests.clear();
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
    // Use persistent connection with multiplexing
    await this.sendPersistentRequest(
      'TranslationService/LLMTranslateStream',
      request,
      (data) => onResponse(data as LLMTranslateResponse)
    );
  }

  // ========== Persistent Connection Management ==========

  /**
   * Ensure the persistent connection is connected and ready
   */
  private ensureConnected(): Promise<void> {
    if (this.connectionState === 'connected') {
      return Promise.resolve();
    }
    if (this.connectionState === 'connecting' && this.connectPromise) {
      return this.connectPromise;
    }

    this.connectionState = 'connecting';
    this.connectPromise = new Promise((resolve, reject) => {
      this.connectPersistentConnection(resolve, reject);
    });
    return this.connectPromise;
  }

  /**
   * Connect the persistent EventSource connection
   */
  private connectPersistentConnection(resolve: () => void, reject: (error: Error) => void): void {
    const eventSourceUrl = new URL(`${this.baseUrl}/stream`);
    // Add auth token as query parameter for EventSource (since EventSource doesn't support headers)
    eventSourceUrl.searchParams.set('token', this.token);

    const eventSource = new EventSource(eventSourceUrl.toString());
    this.persistentConnection = eventSource;

    let connectionResolved = false;

      // Resolve connection immediately when EventSource is created in Node.js environment
      // Node.js eventsource library doesn't trigger onopen on initial connection
      // Use any type to avoid TypeScript errors in different environments
      let isNode = false;
      try {
        // This detection method works everywhere: browser, Node.js, different JS environments
        // Access via globalThis to avoid TypeScript errors about missing 'process'
        const gt: any = globalThis;
        if (gt.process && gt.process.versions && gt.process.versions.node) {
          isNode = true;
        }
      } catch (e) {
        isNode = false;
      }
      
      if (isNode) {
        console.log('[TranslationClient] Persistent connection established (Node.js)');
        this.connectionState = 'connected';
        this.reconnectDelay = 1000;
        connectionResolved = true;
        resolve();
      }

      eventSource.onopen = () => {
        if (connectionResolved) {
          return;
        }
        console.log('[TranslationClient] Persistent connection established');
        this.connectionState = 'connected';
        this.reconnectDelay = 1000; // Reset reconnect delay on successful connection
        connectionResolved = true;
        resolve();
      };

    eventSource.onerror = (error) => {
      console.error('[TranslationClient] Persistent connection error:', error);

      if (!connectionResolved) {
        this.connectionState = 'disconnected';
        this.persistentConnection = null;
        connectionResolved = true;
        reject(new Error('Failed to establish persistent connection'));
        return;
      }

      // Connection dropped - schedule reconnect
      this.handleDisconnection();
    };

    // Handle incoming messages - format: {"id": "req-123", "data": {...}, "finished": true}
    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { id, data, finished, error } = message;

        const pending = this.pendingRequests.get(id);
        if (!pending) {
          return; // No pending request for this ID - ignore
        }

        if (error) {
          pending.onError(new Error(error));
          this.pendingRequests.delete(id);
          return;
        }

        if (data) {
          const shouldContinue = pending.onMessage(data);
          if (shouldContinue === false) {
            // Client requested to stop streaming
            this.pendingRequests.delete(id);
            pending.onComplete();
          }
        }

        if (finished) {
          this.pendingRequests.delete(id);
          pending.onComplete();
        }
      } catch (e) {
        console.warn('[TranslationClient] Failed to parse incoming message:', event.data, e);
      }
    };
  }

  /**
   * Handle connection disconnection and schedule reconnect
   */
  private handleDisconnection(): void {
    this.connectionState = 'disconnected';
    this.persistentConnection = null;

    // Reject all pending requests
    this.pendingRequests.forEach((pending) => {
      pending.onError(new Error('Connection closed'));
    });
    this.pendingRequests.clear();

    // Try to reconnect if we should
    if (this.shouldReconnect) {
      console.log(`[TranslationClient] Reconnecting in ${this.reconnectDelay}ms...`);
      setTimeout(() => {
        if (this.shouldReconnect && this.connectionState === 'disconnected') {
          this.ensureConnected().catch(() => {
            // Reconnect failed - exponential backoff
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
          });
        }
      }, this.reconnectDelay);
    }
 }

 /**
  * Close the persistent connection
  */
 private closePersistentConnection(): void {
   if (this.persistentConnection) {
     this.persistentConnection.close();
     this.persistentConnection = null;
   }
   this.connectionState = 'disconnected';
 }

 /**
  * Send a request over the persistent connection
  * @param method The method name to call
  * @param request The request body
  * @param onMessage Callback for each message received
  * @returns Promise that resolves when streaming is complete
  */
 private sendPersistentRequest(
   method: string,
   request: any,
   onMessage: (data: any) => boolean | void
 ): Promise<void> {
   return new Promise(async (resolve, reject) => {
     try {
       // Ensure we're connected
       await this.ensureConnected();

       // Generate a unique request ID
       const requestId = `req-${this.nextRequestId++}`;

       // Store the callbacks
       this.pendingRequests.set(requestId, {
         onMessage,
         onComplete: resolve,
         onError: reject
       });

       // Send the request over the persistent connection
       // We use a separate fetch POST to send the request to the server
       // Server will route responses back through EventSource connection
       const url = `${this.baseUrl}/${method}`;
       const response = await fetch(url, {
         method: 'POST',
         body: JSON.stringify({
           ...request,
           requestId
         }),
         headers: this.getHeaders()
       });

       if (!response.ok) {
         const text = await response.text();
         throw new Error(`HTTP ${response.status}: ${text}`);
       }

       // Request accepted - response will come back via EventSource
     } catch (error) {
       reject(error);
     }
   });
 }

 private getHeaders(): Record<string, string> {
   const headers: Record<string, string> = {
     'Content-Type': 'application/grpc-web+json',
     'X-Grpc-Web': '1'
   };
   
   if (this.token) {
     // Use api-key-token header for API key authentication
     // (not Bearer token which requires valid JWT)
     headers['api-key-token'] = this.token;
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

  /**
   * Get cache statistics for both pre-loaded translations and LLM translations
   * @returns Human-readable cache statistics string
   */
  getStats(): string {
    let preloadedCount = 0;
    const fingerprintCount: string[] = [];
    // Use type assertion to access private pools property
    const pools = (this.pool as any).pools as Map<string, Map<string, string>>;
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
export function createTranslation(
  token: string, 
  senseId: string, 
  options?: Partial<TranslationClientConfig>
): TranslationClient {
  return new TranslationClient({
    token,
    senseId,
    ...options
  });
}
export default createTranslation;

// Auto-export to global for browser usage
if (typeof window !== 'undefined') {
  (window as any).LakerTranslation = {
    TranslationClient,
    createTranslation,
    default: createTranslation
  };
}
