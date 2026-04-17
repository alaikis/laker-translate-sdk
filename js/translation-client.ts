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

// Import generated Connect RPC code
import {
  GetSenseTranslateRequest,
  GetSenseTranslateResponse,
  TranslateStreamRequest,
  TranslateStreamResponse,
  TranslateRecord,
} from './gen/translation_pb';
import { TranslationService } from './gen/translation_connect';
import { createClient } from '@connectrpc/connect';
import type { Transport, Interceptor } from '@connectrpc/connect';

// Import IndexedDB wrapper for browser cache storage
import { TranslationIndexedDB, defaultTranslationDB } from './indexeddb';

// For browser environments, we statically import connect-web
// because it's already external in the rollup config and user's project has it installed
// This ensures createConnectTransport is available synchronously
import { createConnectTransport as browserCreateConnectTransport } from '@connectrpc/connect-web';
import type { createConnectTransport as CCTBrowser } from '@connectrpc/connect-web';
import type { createConnectTransport as CCTNode } from '@connectrpc/connect-node';

let createConnectTransport: (options: any) => Transport;

// Detect environment:
// - Browser (window exists) → use connect-web
// - React Native / Expo (navigator.product === 'ReactNative' || global?.__DEV__) → use connect-web
// - Node.js → use connect-node
const isReactNative = 
  typeof navigator !== 'undefined' && navigator.product === 'ReactNative' ||
  typeof global !== 'undefined' && (global as any).__DEV__ !== undefined;
const isBrowser = typeof window !== 'undefined' || isReactNative;
const hasFetch = typeof fetch === 'function';

// Check if browser already preloaded the transport (for IIFE standalone build)
if (isBrowser && typeof window !== 'undefined' && (window as any).__LAKER_BROWSER_TRANSPORT) {
  createConnectTransport = (window as any).__LAKER_BROWSER_TRANSPORT;
} else if (hasFetch && isBrowser) {
  // Browser / React Native / Expo environment - use statically imported connect-web
  // User's project already has @connectrpc/connect-web as dependency so it's available
  createConnectTransport = browserCreateConnectTransport;
} else {
  // Node.js environment - use connect-node (based on Node.js HTTP/2)
  if (typeof require !== 'undefined') {
    ({ createConnectTransport } = require('@connectrpc/connect-node'));
  } else {
    // For pure ESM environments
    import('@connectrpc/connect-node').then(mod => {
      createConnectTransport = mod.createConnectTransport as any;
    });
  }
}

// Cache for created transports - reuse transport for identical configurations
// This maximizes HTTP connection reuse because all requests share the same transport
type CachedTransportKey = {
  baseUrl: string;
  interceptors: Interceptor[];
  token?: string;
};
let cachedTransports: Map<string, Transport> = new Map();

function getTransportCacheKey(key: CachedTransportKey): string {
  // Create a stable cache key based on baseUrl, token presence and interceptor count
  // Interceptors are not compared by value - they are expected to be stable
  return `${key.baseUrl}|${!!key.token}|${key.interceptors.length}`;
}

// Re-export all types from generated code
export type {
  GetSenseTranslateRequest,
  GetSenseTranslateResponse,
  TranslateStreamRequest,
  TranslateStreamResponse,
  TranslateRecord,
};

export type GetSenseTranslateRequestOptions = {
  senseId: string;
  fingerprint?: string;
  page?: number;
  pageSize?: number;
  srcLang?: string;
  dstLang?: string;
  dstLangs?: string[];
};

const defaultCrossTabOptions = {
  enabled: false,
  channelName: 'laker-translation-cache',
  storageKeyPrefix: 'laker_translation_',
};

const defaultTranslationPoolOptions = {
  crossTab: defaultCrossTabOptions,
};

/**
 * Automatic template extraction from text containing numeric variables
 * Also handles existing {varName} style templates
 * @param text Original text that may contain numeric variables
 * @returns Template extraction result
 */
export function extractTemplate(text: string): {
  isTemplated: boolean;
  srcTemplate: string;
  dstTemplate: string;
  variables: string[];
} {
  let result = text;
  const variables: string[] = [];

  // First, extract existing {name} style templates
  const braceRegex = /\{([^}]+)\}/g;
  let braceMatch: RegExpExecArray | null;
  let lastIndex = 0;
  // We need to build a new string with the braces kept, but collect the variable names
  // For existing brace templates, we just extract their names as variables
  while ((braceMatch = braceRegex.exec(result)) !== null) {
    const varName = braceMatch[1];
    if (varName) {
      variables.push(varName);
    }
  }

  // If no existing brace templates, look for numeric variables to convert
  if (variables.length === 0) {
    const numberRegex = /\d+(?:\.\d+)?/g;
    const matches = text.match(numberRegex);
    if (matches && matches.length > 0) {
      let template = text;
      matches.forEach((match, index) => {
        const value = match;
        const varName = `var${index + 1}`;
        template = template.replace(match, `{${varName}}`);
        variables.push(value);
        result = template;
      });
    }
  }

  return {
    isTemplated: variables.length > 0,
    srcTemplate: result,
    dstTemplate: '',
    variables,
  };
}

/**
 * Merge template with variables
 * @param template Template with {variable} placeholders
 * @param vars Object mapping variable names to values
 * @returns Merged text with variables substituted
 */
export function mergeTemplate(template: string, vars: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
}

// Version from package.json
export const version = '1.6.139';

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
  /**
   * Whether to use IndexedDB instead of localStorage for browser cache storage
   * IndexedDB is recommended for large translation datasets (more than a few MBs)
   * Default: false (use localStorage)
   */
  useIndexedDB?: boolean;
};

type PendingRequest = {
  text: string;
  toLang: string;
  fromLang?: string;
  fingerprint?: string;
  resolveFunction: (response: TranslateStreamResponse) => void;
  rejectFunction: (error: Error) => void;
};

type PendingResolutions = Record<
  string,
  {
    resolve: (value: TranslateStreamResponse) => void;
    reject: (error: Error) => void;
    resolveList: Array<(value: TranslateStreamResponse) => void>;
    rejectList: Array<(error: Error) => void>;
  }
>;

type CacheEntryMetadata = {
  lastUpdated: number;
  version: number;
};

class TranslationPool {
  client: TranslationClient;
  senseId: string;
  pools = new Map<string, Map<string, string>>();
  currentFingerprint: string | null = null;
  currentToLang: string | null = null;
  crossTabOptions: CrossTabOptions;
  broadcastChannel: BroadcastChannel | null = null;
  loading = false;
  loadedCombinations = new Set<string>();
  currentLanguageVersion = 0;
  queuedRequests: PendingRequest[] = [];
  pendingResolutions: PendingResolutions = {};
  onTranslationLoaded: ((text: string, translation: string) => void) | null = null;
  onPoolInitialized: (() => void) | null = null;
  onQueueProcessed: ((count: number) => void) | null = null;
  onTranslationUpdated: ((text: string, translation: string) => void) | null = null;
  persistentStorage?: unknown;
  backgroundUpdateOptions: BackgroundUpdateOptions;
  backgroundUpdateTimer: ReturnType<typeof setInterval> | null = null;
  entryMetadata = new Map<string, CacheEntryMetadata>();
  updateCallback: ((text: string, toLang: string) => void) | null = null;
  options?: TranslationPoolOptions;
  // IndexedDB instance for browser cache storage (replaces localStorage for large datasets)
  indexedDB: TranslationIndexedDB | null = null;
  // Whether to use IndexedDB instead of localStorage (browser only, for large datasets)
  useIndexedDB: boolean = false;

  /**
   * Add a pending resolution for a persistent stream request
   * Used when request has a request_id that will be matched on the response
   */
  addPendingResolver(requestId: string, resolve: (response: TranslateStreamResponse) => void, reject: (error: Error) => void): void {
    this.pendingResolutions[requestId] = {
      resolve,
      reject,
      resolveList: [resolve],
      rejectList: [reject],
    };
  }

  getPoolKey(fingerprint: string, toLang: string): string {
    return `${fingerprint}:${toLang}`;
  }

  constructor(
    client: TranslationClient,
    senseId: string,
    options?: TranslationPoolOptions
  ) {
    this.client = client;
    this.senseId = senseId;
    
    // Set up crossTabOptions with defaults
    this.crossTabOptions = {
      ...defaultCrossTabOptions,
      ...options?.crossTab,
    };
    
    // Set up backgroundUpdateOptions with defaults
    this.backgroundUpdateOptions = {
      enabled: options?.backgroundUpdate?.enabled ?? false,
      intervalMs: options?.backgroundUpdate?.intervalMs ?? 5 * 60 * 1000,
      batchSize: options?.backgroundUpdate?.batchSize ?? 50,
      staleThresholdMs:
        options?.backgroundUpdate?.staleThresholdMs ?? 24 * 60 * 60 * 1000,
    };
    
    // Store full options including defaults for API access
    this.options = {
      ...options,
      senseId,
      crossTab: this.crossTabOptions,
      backgroundUpdate: this.backgroundUpdateOptions,
    };
    
    this.persistentStorage = options?.persistentStorage;
    
    if (this.crossTabOptions.enabled && typeof BroadcastChannel !== 'undefined') {
      this.initCrossTabSync();
    }
    
    // Initialize IndexedDB for browser cache storage (replaces localStorage for large datasets)
    // Only use IndexedDB in browser environment when explicitly enabled or when localStorage is unavailable
    const useIndexedDBOption = options?.useIndexedDB ?? false;
    const isBrowserWithIDB = typeof indexedDB !== 'undefined';
    
    if (useIndexedDBOption && isBrowserWithIDB) {
      this.useIndexedDB = true;
      this.indexedDB = new TranslationIndexedDB({
        databaseName: `laker-translation-${senseId}`,
        storeName: 'translations',
      });
      // Initialize the database asynchronously
      this.indexedDB.init().catch(err => {
        console.warn('[TranslationPool] Failed to initialize IndexedDB, falling back to localStorage:', err);
        this.useIndexedDB = false;
        this.indexedDB = null;
      });
    }
    
    this.loadFromStorage();
    this.startBackgroundUpdateChecker();
  }

  setTranslationLoadedCallback(callback: (text: string, translation: string) => void): void {
    this.onTranslationLoaded = callback;
  }

  setPoolInitializedCallback(callback: () => void): void {
    this.onPoolInitialized = callback;
  }

  setQueueProcessedCallback(callback: (count: number) => void): void {
    this.onQueueProcessed = callback;
  }

  setTranslationUpdatedCallback(callback: (text: string, translation: string) => void): void {
    this.onTranslationUpdated = callback;
  }

  initCrossTabSync(): void {
    this.broadcastChannel = new BroadcastChannel(this.crossTabOptions.channelName);
    this.broadcastChannel.onmessage = (event: MessageEvent) => {
      const message = event.data as {
        type: string;
        senseId: string;
        fingerprint?: string;
        data?: {
          result?: Array<{ text: string; translation: string }>;
          text?: string;
          translation?: string;
        };
      };
      if (message.senseId !== this.senseId) {
        return;
      }
      switch (message.type) {
        case 'cache_update':
          this.handleCacheUpdate(message as unknown as Parameters<typeof this.handleCacheUpdate>[0]);
          break;
        case 'cache_clear':
          this.handleCacheClear(message);
          break;
        case 'request_initial_sync':
          this.handleInitialSyncRequest();
          break;
      }
    };
    this.broadcastChannel.postMessage({
      type: 'request_initial_sync',
      senseId: this.senseId,
    });
  }

  loadFromStorage(): void {
    // If IndexedDB is enabled, load from IndexedDB instead of localStorage
    if (this.useIndexedDB && this.indexedDB) {
      this.loadFromIndexedDB();
      return;
    }
    
    if (typeof localStorage === 'undefined' || !this.crossTabOptions.enabled) {
      return;
    }
    const prefix = `${this.crossTabOptions.storageKeyPrefix}${this.senseId}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix) && key.includes(':')) {
        const afterPrefix = key.substring(prefix.length);
        const colonIndex = afterPrefix.lastIndexOf(':');
        if (colonIndex > 0) {
          const fingerprint = afterPrefix.substring(0, colonIndex);
          const toLang = afterPrefix.substring(colonIndex + 1);
          // Load all cached fingerprints from storage, not just common
          this.loadLanguageFromStorage(fingerprint, toLang);
        }
      }
    }
  }

  /**
   * Load translations from IndexedDB
   */
  async loadFromIndexedDB(): Promise<void> {
    if (!this.indexedDB) return;
    
    try {
      // Get all pool keys that start with this senseId
      const allEntries = await this.indexedDB.getAllByPoolKey(`${this.senseId}_`);
      
      // Group by pool key
      const poolKeyMap = new Map<string, Array<{ text: string; translation: string }>>();
      for (const entry of allEntries) {
        // Extract fingerprint and toLang from poolKey (format: senseId_fingerprint:toLang)
        const poolKey = entry.poolKey;
        const colonIndex = poolKey.indexOf(':');
        if (colonIndex > 0) {
          let poolData = poolKeyMap.get(poolKey);
          if (!poolData) {
            poolData = [];
            poolKeyMap.set(poolKey, poolData);
          }
          poolData.push({ text: entry.text, translation: entry.translation });
        }
      }
      
      // Load each pool
      for (const [poolKey, data] of poolKeyMap) {
        let pool = this.pools.get(poolKey);
        if (!pool) {
          pool = new Map();
          this.pools.set(poolKey, pool);
        }
        data.forEach(({ text, translation }) => {
          pool?.set(text, translation);
        });
        this.loadedCombinations.add(poolKey);
      }
      
      console.log(`[TranslationPool] Loaded ${allEntries.length} translations from IndexedDB`);
    } catch (e) {
      console.warn('Failed to load translation cache from IndexedDB:', e);
    }
  }

  loadLanguageFromStorage(fingerprint: string, toLang: string): void {
    const poolKey = this.getPoolKey(fingerprint, toLang);
    
    // If IndexedDB is enabled, use it instead of localStorage
    if (this.useIndexedDB && this.indexedDB) {
      this.loadLanguageFromIndexedDB(fingerprint, toLang);
      return;
    }
    
    const storageKey = this.getStorageKey(fingerprint, toLang);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data: Array<{ text: string; translation: string }> = JSON.parse(stored);
        let pool = this.pools.get(poolKey);
        if (!pool) {
          pool = new Map();
          this.pools.set(poolKey, pool);
        }
        data.forEach(({ text, translation }) => {
          pool?.set(text, translation);
        });
        this.loadedCombinations.add(poolKey);
      }
    } catch (e) {
      console.warn('Failed to load translation cache from localStorage:', e);
    }
  }

  /**
   * Load translations for a specific fingerprint and language from IndexedDB
   */
  async loadLanguageFromIndexedDB(fingerprint: string, toLang: string): Promise<void> {
    if (!this.indexedDB) return;
    
    const poolKey = this.getPoolKey(fingerprint, toLang);
    const dbPoolKey = `${this.senseId}_${poolKey}`;
    
    try {
      const entries = await this.indexedDB.getAllByPoolKey(dbPoolKey);
      
      if (entries.length > 0) {
        let pool = this.pools.get(poolKey);
        if (!pool) {
          pool = new Map();
          this.pools.set(poolKey, pool);
        }
        entries.forEach(entry => {
          pool?.set(entry.text, entry.translation);
        });
        this.loadedCombinations.add(poolKey);
      }
    } catch (e) {
      console.warn('Failed to load translation cache from IndexedDB:', e);
    }
  }

  getStorageKey(fingerprint: string, toLang: string): string {
    return `${this.crossTabOptions.storageKeyPrefix}${this.senseId}_${fingerprint}:${toLang}`;
  }

  saveToStorage(fingerprint: string, toLang: string): void {
    // If IndexedDB is enabled, save to IndexedDB instead of localStorage
    if (this.useIndexedDB && this.indexedDB) {
      this.saveToIndexedDB(fingerprint, toLang);
      return;
    }
    
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
   * Save translations to IndexedDB
   */
  async saveToIndexedDB(fingerprint: string, toLang: string): Promise<void> {
    if (!this.indexedDB) return;
    
    const poolKey = this.getPoolKey(fingerprint, toLang);
    const dbPoolKey = `${this.senseId}_${poolKey}`;
    const pool = this.pools.get(poolKey);
    
    if (!pool || pool.size === 0) return;
    
    try {
      // First delete existing entries for this pool
      await this.indexedDB.deleteAllByPoolKey(dbPoolKey);
      
      // Then save all new entries
      const entries = Array.from(pool.entries()).map(([text, translation]) => ({
        id: `${dbPoolKey}:${text}`,
        poolKey: dbPoolKey,
        text,
        translation,
        dstLang: toLang,
        timestamp: Date.now(),
        // Default expiration: 32 hours (matching backend Redis cache)
        expiresAt: Date.now() + 32 * 60 * 60 * 1000,
      }));
      
      await this.indexedDB.setMany(entries);
      console.log(`[TranslationPool] Saved ${entries.length} translations to IndexedDB for ${poolKey}`);
    } catch (e) {
      console.warn('Failed to save translation cache to IndexedDB:', e);
    }
  }

  broadcastUpdate(text?: string, translation?: string): void {
    if (!this.broadcastChannel || !this.crossTabOptions.enabled) {
      return;
    }
    const fp = this.currentFingerprint || 'common';
    const toLang = this.currentToLang || 'en';
    const data = {
      result: this.getAllForFingerprint(fp, toLang),
      ...(text && translation && { text, translation }),
    };
    const message = {
      type: 'cache_update',
      senseId: this.senseId,
      fingerprint: this.currentFingerprint || undefined,
      data,
    };
    this.broadcastChannel.postMessage(message);
    this.saveToStorage(fp, toLang);
  }

  handleCacheUpdate(message: {
    fingerprint?: string;
    data: {
      result?: Array<{ text: string; translation: string }>;
      text?: string;
      translation?: string;
    };
  }): void {
    const fp = message.fingerprint || 'common';
    const toLang = this.currentToLang || 'en';
    const poolKey = this.getPoolKey(fp, toLang);
    if (message.data?.result) {
      let pool = this.pools.get(poolKey);
      if (!pool) {
        pool = new Map();
        this.pools.set(poolKey, pool);
      }
      pool.clear();
      message.data.result.forEach(({ text, translation }) => {
        // Skip empty keys or error placeholder keys
        if (!text || text === 'error') {
          return;
        }
        pool.set(text, translation);
      });
      this.loadedCombinations.add(poolKey);
    }
    if (message.data?.text && message.data?.translation) {
      // Skip empty keys or error placeholder keys
      if (!message.data.text || message.data.text === 'error') {
        return;
      }
      const pool = this.pools.get(poolKey) || new Map();
      pool.set(message.data.text, message.data.translation);
      this.pools.set(poolKey, pool);
      this.saveToStorage(fp, toLang);
    }
  }

  handleCacheClear(message: { fingerprint?: string }): void {
    const fp = message.fingerprint || 'common';
    if (fp) {
      this.clearFingerprint(fp);
    } else {
      this.clearAll();
    }
  }

  handleInitialSyncRequest(): void {
    this.broadcastUpdate();
  }

  queueTranslationRequest(request: {
    text: string;
    toLang: string;
    fromLang?: string;
    fingerprint?: string;
  }): Promise<TranslateStreamResponse> {
    const key = `${request.text}-${request.fingerprint || 'common'}`;
    const existingPending = this.pendingResolutions[key];
    if (existingPending) {
      return new Promise((resolve, reject) => {
        existingPending.resolveList.push(resolve);
        existingPending.rejectList.push(reject);
      });
    }
    return new Promise((resolve, reject) => {
      const queuedReq: PendingRequest = {
        ...request,
        resolveFunction: resolve,
        rejectFunction: reject,
      };
      this.queuedRequests.push(queuedReq);
      this.pendingResolutions[key] = {
        resolve: resolve,
        reject: reject,
        resolveList: [resolve],
        rejectList: [reject],
      };
    });
  }

  async processQueuedRequests(maxRetries = 3, retryDelayMs = 1000): Promise<void> {
    if (this.queuedRequests.length === 0) {
      this.loading = false;
      return;
    }
    console.log(`[TranslationPool] Processing ${this.queuedRequests.length} queued translation requests...`);
    this.loading = false;
    const requestsToProcess = [...this.queuedRequests];
    this.queuedRequests = [];

   // Filter out requests that are already cached - no need to request them from server
    const uncachedRequests: PendingRequest[] = [];
    let cachedCount = 0;
    for (const req of requestsToProcess) {
      const lookup = this.lookup(req.text, req.fingerprint, req.toLang);
      if (lookup.found && lookup.translation) {
        // Already in cache, resolve immediately
        cachedCount++;
        this.addTranslation(req.text, lookup.translation);
        const response = TranslateStreamResponse.fromJson({
          originalText: req.text,
          translation: { [req.text]: lookup.translation },
          timestamp: Date.now(),
          finished: true,
          batchIndex: 0,
        });
        req.resolveFunction(response);
        const key = `${req.text}-${req.fingerprint || 'common'}`;
        delete this.pendingResolutions[key];
        if (this.onTranslationUpdated) {
          this.onTranslationUpdated(req.text, lookup.translation);
        }
      } else {
        uncachedRequests.push(req);
      }
    }

    if (uncachedRequests.length === 0) {
      this.broadcastUpdate();
      console.log(`[TranslationPool] All ${cachedCount} requests found in cache`);
      if (this.onQueueProcessed) {
        this.onQueueProcessed(requestsToProcess.length);
      }
      return;
    }

    console.log(`[TranslationPool] ${cachedCount} cached, ${uncachedRequests.length} uncached requesting from server in a single batch`);

    // Batch all uncached requests into a single streaming connection
    // This creates only ONE HTTP request in browser dev tools for all queued requests
    // Greatly improves connection reuse and reduces network overhead
    let successCount = cachedCount;
    let failCount = 0;

    // Group uncached requests by target language (toLang) to ensure each request carries correct language
    // This prevents "data mixing" issues when requests have different target languages
    const requestsByLang: Map<string, PendingRequest[]> = new Map();
    for (const req of uncachedRequests) {
      const lang = req.toLang || 'en'; // Default to 'en' if not specified
      if (!requestsByLang.has(lang)) {
        requestsByLang.set(lang, []);
      }
      requestsByLang.get(lang)!.push(req);
    }

    // Process each language group separately
    for (const [toLang, langRequests] of requestsByLang) {
      const commonFingerprint = langRequests[0].fingerprint || this.currentFingerprint || 'common';

      try {
        // Use the client to do a batch translate stream - all requests in one HTTP connection
        // This shows only ONE request in browser network panel per language group
        const stream = this.client.translateBatchUncached(
          langRequests.map(r => ({ text: r.text, fromLang: r.fromLang })),
          toLang,
          commonFingerprint
        );

        for await (const response of stream) {
          // Process each translation as it arrives
          if (response.translation) {
            for (const [text, translation] of Object.entries(response.translation)) {
              // Find the original pending request (must match both text AND language)
              const pendingReq = langRequests.find(r => r.text === text && r.toLang === toLang);
              if (pendingReq) {
                // Add to cache immediately (with correct language)
                this.addTranslation(text, translation as string, toLang);
                // Resolve the pending promise
                const fullResponse = TranslateStreamResponse.fromJson({
                  originalText: text,
                  translation: { [text]: translation as string },
                  timestamp: Date.now(),
                  finished: response.finished && Object.keys(response.translation).length === 0,
                  batchIndex: response.batchIndex || 0,
                });
                pendingReq.resolveFunction(fullResponse);
                const key = `${text}-${pendingReq.fingerprint || 'common'}`;
                delete this.pendingResolutions[key];
                if (this.onTranslationUpdated) {
                  this.onTranslationUpdated(text, translation as string);
                }
                successCount++;
              }
            }
          }

          if (response.finished) {
            break;
          }
        }

        // Check for any pending requests in this language group that didn't get a response - they failed
        for (const pendingReq of langRequests) {
          const key = `${pendingReq.text}-${pendingReq.fingerprint || 'common'}`;
          if (this.pendingResolutions[key]) {
            // Still pending, means no response from server - fail it
            if (pendingReq.rejectFunction) {
              const error = new Error(`No translation response received for: "${pendingReq.text}" (${toLang})`);
              pendingReq.rejectFunction(error);
            }
            delete this.pendingResolutions[key];
            failCount++;
          }
        }

      } catch (error: unknown) {
        console.error(`[TranslationPool] Batch request failed for language ${toLang}:`, (error as Error).message);
        // If batch fails, fail all remaining requests in this language group
        for (const pendingReq of langRequests) {
          const key = `${pendingReq.text}-${pendingReq.fingerprint || 'common'}`;
          if (this.pendingResolutions[key] && pendingReq.rejectFunction) {
            const error = new Error(`Batch translation failed for: "${pendingReq.text}" (${toLang})`);
            pendingReq.rejectFunction(error);
            delete this.pendingResolutions[key];
            failCount++;
          }
        }
      }
    }

    this.broadcastUpdate();
    console.log(`[TranslationPool] Completed processing ${requestsToProcess.length} queued requests: ${successCount} success, ${failCount} failed (batch processing)`);
    if (this.onQueueProcessed) {
      this.onQueueProcessed(requestsToProcess.length);
    }
    if (failCount > 0) {
      console.warn(`[TranslationPool] ${failCount} requests failed after ${maxRetries} retries`);
    }
  }

  hasQueuedRequests(): boolean {
    return this.queuedRequests.length > 0;
  }

  clearQueuedRequests(): void {
    console.log(`Clearing ${this.queuedRequests.length} queued requests`);
    this.queuedRequests = [];
    this.pendingResolutions = {};
  }

  isLoading(): boolean {
    return this.loading;
  }

  isLanguageLoaded(fingerprint: string, toLang?: string): boolean {
    if (toLang === undefined) {
      const checkedToLang = fingerprint;
      for (const key of this.loadedCombinations) {
        if (key.endsWith(`:${checkedToLang}`)) {
          return true;
        }
      }
      return false;
    }
    const poolKey = this.getPoolKey(fingerprint, toLang);
    return this.loadedCombinations.has(poolKey);
  }

  async initialize(toLang: string): Promise<void> {
    if (this.loading) {
      console.log(`[TranslationPool] Already loading, skipping duplicate initialize`);
      return;
    }
    this.loading = true;
    this.currentToLang = toLang;
    try {
      console.log(`[TranslationPool] Starting pool initialization... (toLang: ${toLang})`);
      
      // First try to load from localStorage (browser cache)
      this.loadLanguageFromStorage('common', toLang);
      const commonPoolKey = this.getPoolKey('common', toLang);
      const commonPool = this.pools.get(commonPoolKey);
      let hasLocalCache = commonPool && commonPool.size > 0;
      
      // If we have a current fingerprint, also load it from localStorage first
      if (this.currentFingerprint) {
        this.loadLanguageFromStorage(this.currentFingerprint, toLang);
        const fpPoolKey = this.getPoolKey(this.currentFingerprint, toLang);
        const fpPool = this.pools.get(fpPoolKey);
        if (fpPool && fpPool.size > 0) {
          hasLocalCache = true;
        }
      }
      
      if (hasLocalCache) {
        console.log(`[TranslationPool] Using existing translations from localStorage cache (no server fetch needed)`);
        this.loadedCombinations.add(commonPoolKey);
        if (this.currentFingerprint) {
          const fpPoolKey = this.getPoolKey(this.currentFingerprint, toLang);
          this.loadedCombinations.add(fpPoolKey);
        }
      } else {
        console.log(`[TranslationPool] No local cache found, loading all translations from server for cache synchronization`);
        // No local cache available, need to load from server
        await this.loadFingerprintTranslations('common', undefined, toLang);
        console.log(`[TranslationPool] Common translations loaded for ${toLang}`);
        if (this.currentFingerprint) {
          await this.loadFingerprintTranslations(this.currentFingerprint, this.currentFingerprint, toLang);
          console.log(`[TranslationPool] ${this.currentFingerprint} translations loaded for ${toLang}`);
        }
      }
      
      this.broadcastUpdate();
      console.log(`[TranslationPool] Pool initialization completed for ${toLang} (local cache: ${hasLocalCache ? 'used' : 'not found, fetched from server'})`);
      if (this.onPoolInitialized) {
        this.onPoolInitialized();
      }
      await this.processQueuedRequests();
    } catch (error) {
      console.error(`[TranslationPool] Pool initialization failed for ${toLang}:`, error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async loadFingerprintTranslations(
    fp: string,
    fingerprint: string | undefined,
    toLang: string
  ): Promise<void> {
    console.log(`[TranslationPool] Loading translations for fingerprint=${fp}, toLang=${toLang}...`);
    const poolKey = this.getPoolKey(fp, toLang);
    this.loadLanguageFromStorage(fp, toLang);
    let pool = this.pools.get(poolKey);
    if (!pool) {
      pool = new Map();
      this.pools.set(poolKey, pool);
    }
    let updatedCount = 0;
    let addedCount = 0;

    const jsonRequest: any = {
      dst_lang: toLang,
    };
    if (this.senseId && this.senseId.length > 0) {
      jsonRequest.sense_id = this.senseId;
    }
    if (fingerprint) {
      jsonRequest.fingerprint = fingerprint;
    }
    const req = TranslateStreamRequest.fromJson(jsonRequest);

    console.log(`[TranslationPool] Sending batch initialization request:`, jsonRequest);

    try {
      const stream = (this.client.client as any).translateStream(req) as unknown as AsyncIterable<TranslateStreamResponse>;
      let batchCount = 0;
      for await (const response of stream) {
        batchCount++;
        console.log(`[TranslationPool] Received batch #${batchCount}, ${Object.keys(response.translation || {}).length} entries`);
        if (!response.translation) continue;

        Object.entries(response.translation).forEach(([text, translate]) => {
          // Skip empty keys or error placeholder keys
          if (!text || text === 'error') {
            return;
          }
          const translateStr = translate as string;
          const existing = pool?.get(text);
          if (existing === undefined) {
            addedCount++;
          } else if (existing !== translateStr) {
            updatedCount++;
          }
          pool?.set(text, translateStr);
          const key = `${text}-${fp}`;
          if (this.pendingResolutions[key]) {
              const responseObj = TranslateStreamResponse.fromJson({
                originalText: text,
                translation: { [text]: translateStr },
                timestamp: Date.now(),
                finished: true,
                batchIndex: 0,
              });
            this.pendingResolutions[key].resolveList.forEach(resolve => resolve(responseObj));
            delete this.pendingResolutions[key];
          }
          if (fp !== 'common') {
            const commonKey = `${text}-common`;
            if (this.pendingResolutions[commonKey]) {
              const responseObj = TranslateStreamResponse.fromJson({
                originalText: text,
                translation: { [text]: translateStr },
                timestamp: Date.now(),
                finished: true,
                batchIndex: 0,
              });
              this.pendingResolutions[commonKey].resolveList.forEach(resolve => resolve(responseObj));
              delete this.pendingResolutions[commonKey];
            }
          }
          if (this.onTranslationLoaded) {
            this.onTranslationLoaded(text, translateStr);
          }
        });
      }

      this.saveToStorage(fp, toLang);
      if (updatedCount > 0 || addedCount > 0) {
        console.log(`[TranslationPool] Loaded ${fp}:${toLang} - added ${addedCount}, updated ${updatedCount} from remote`);
      } else {
        console.log(`[TranslationPool] Finished loading ${fp}:${toLang} - no new entries added`);
      }
      this.loadedCombinations.add(poolKey);
    } catch (error) {
      console.error(`[TranslationPool] Failed to load ${fp}:${toLang} from server:`, error);
      throw error;
    }
  }

  addPreloadedTranslations(preloaded: Record<string, Record<string, Record<string, string>>>): void {
    Object.entries(preloaded).forEach(([fingerprint, langMap]) => {
      Object.entries(langMap).forEach(([toLang, translations]) => {
        const poolKey = this.getPoolKey(fingerprint, toLang);
        let pool = this.pools.get(poolKey);
        if (!pool) {
          pool = new Map();
          this.pools.set(poolKey, pool);
        }
        Object.entries(translations).forEach(([text, translation]) => {
          pool.set(text, translation);
          if (this.onTranslationLoaded) {
            this.onTranslationLoaded(text, translation);
          }
        });
        this.loadedCombinations.add(poolKey);
        this.saveToStorage(fingerprint, toLang);
      });
    });
    this.broadcastUpdate();
  }

  addTranslation(text: string, translation: string, toLang?: string): void {
    const fp = this.currentFingerprint || 'common';
    const lang = toLang || this.currentToLang || 'en';
    const poolKey = this.getPoolKey(fp, lang);
    let pool = this.pools.get(poolKey);
    if (!pool) {
      pool = new Map();
      this.pools.set(poolKey, pool);
    }
    pool.set(text, translation);
    this.saveToStorage(fp, lang);
    this.broadcastUpdate(text, translation);
  }

  addTranslationToFingerprint(
    text: string,
    translation: string,
    fingerprint: string,
    toLang: string
  ): void {
    const poolKey = this.getPoolKey(fingerprint, toLang);
    let pool = this.pools.get(poolKey);
    if (!pool) {
      pool = new Map();
      this.pools.set(poolKey, pool);
    }
    pool.set(text, translation);
    this.saveToStorage(fingerprint, toLang);
    this.broadcastUpdate(text, translation);
  }

  /**
   * Correct an existing translation and synchronize the correction to backend database
   * This updates both the local cache and persists the correction to the server
   * @param text Original source text
   * @param correctedTranslation The corrected translation
   * @param fingerprint Optional fingerprint (uses current fingerprint if not provided)
   * @param toLang Optional target language (uses current language if not provided)
   * @param fromLang Optional source language (uses sense default if not provided)
   * @returns Promise that resolves when correction is saved to server
   */
  async correctTranslation(
    text: string,
    correctedTranslation: string,
    fingerprint?: string | null,
    toLang?: string,
    fromLang?: string
  ): Promise<{success: boolean; error?: string}> {
    const fp = fingerprint || this.currentFingerprint || 'common';
    const lang = toLang || this.currentToLang;
    if (!lang) {
      console.error('[TranslationPool] Cannot correct translation: target language not set');
      return {success: false, error: 'Target language not set'};
    }

    // First update local cache immediately so UI reflects the correction
    this.addTranslationToFingerprint(text, correctedTranslation, fp, lang);

    // Trigger callback for UI updates
    if (this.onTranslationUpdated) {
      this.onTranslationUpdated(text, correctedTranslation);
    }

    try {
      // Send correction to backend to persist in database
      const requestId = `correct-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const jsonRequest: any = {
        requestId,
        text,
        fromLang: fromLang || '',
        toLang: lang,
        fingerprint: fp,
        isCorrection: true,
        correctedTranslation,
      };
      if (this.senseId && this.senseId.length > 0) {
        jsonRequest.senseId = this.senseId;
      }

      const req = TranslateStreamRequest.fromJson(jsonRequest);
      const stream = (this.client.client as any).translateStream(req) as unknown as AsyncIterable<TranslateStreamResponse>;
      
      for await (const response of stream) {
        if (response.finished) {
          console.log(`[TranslationPool] Correction saved for "${text}" → "${correctedTranslation}"`);
          return {success: true};
        }
      }

      return {success: true};
    } catch (error) {
      console.error(`[TranslationPool] Failed to save correction for "${text}":`, error);
      return {success: false, error: error instanceof Error ? error.message : String(error)};
    }
  }

  /**
   * Alias for addTranslationToFingerprint - convenient manual caching
   * Parameter order: text, fingerprint, translation, toLang
   */
  put(text: string, fingerprint: string, translation: string, toLang: string): void {
    // Set current language if not set, so subsequent lookups work correctly
    if (!this.currentToLang) {
      this.currentToLang = toLang;
    }
    this.addTranslationToFingerprint(text, translation, fingerprint, toLang);
  }

  lookup(text: string, fingerprint?: string, toLang?: string): { found: boolean; fromCache: boolean; translation?: string } {
    const fp = fingerprint || this.currentFingerprint || 'common';
    const lang = toLang || this.currentToLang || 'en';
    const poolKey = this.getPoolKey(fp, lang);
    const pool = this.pools.get(poolKey);
    
    // Check if found in specific pool
    if (pool && pool.has(text)) {
      const translation = pool.get(text);
      // Check metadata to see if this entry is stale - trigger background update
      const metadataKey = `${text}|${lang}`;
      const metadata = this.entryMetadata.get(metadataKey);
      const now = Date.now();
      const staleThreshold = this.backgroundUpdateOptions.staleThresholdMs;
      
      if (this.backgroundUpdateOptions.enabled && (!metadata || now - metadata.lastUpdated > staleThreshold)) {
        // Stale cache entry - trigger asynchronous background check for updates
        // This will fetch the latest translation (including any manual corrections) from backend
        // If updated, cache will be updated automatically and UI will be notified
        setTimeout(() => {
          if (this.updateCallback) {
            this.updateCallback(text, lang);
            // Update timestamp immediately to avoid repeated triggers
            this.updateEntryMetadata(text, lang);
          }
        }, 0);
      }
      
      return { found: true, fromCache: true, translation };
    }
    
    // Check common pool if not found in specific fingerprint
    if (fp !== 'common') {
      const commonPoolKey = this.getPoolKey('common', lang);
      const commonPool = this.pools.get(commonPoolKey);
      if (commonPool && commonPool.has(text)) {
        const translation = commonPool.get(text);
        // Same stale check for common pool entries
        const metadataKey = `${text}|${lang}`;
        const metadata = this.entryMetadata.get(metadataKey);
        const now = Date.now();
        const staleThreshold = this.backgroundUpdateOptions.staleThresholdMs;
        
        if (this.backgroundUpdateOptions.enabled && (!metadata || now - metadata.lastUpdated > staleThreshold)) {
          setTimeout(() => {
            if (this.updateCallback) {
              this.updateCallback(text, lang);
              this.updateEntryMetadata(text, lang);
            }
          }, 0);
        }
        
        return { found: true, fromCache: true, translation };
      }
    }
    
    return { found: false, fromCache: false };
  }

  /**
   * Check if any translation exists for the current language
   * This can be used to determine if translation pool has any translations
   * @returns boolean true if pool has any translations for current language
   */
  hasAnyTranslations(): boolean {
    const toLang = this.currentToLang;
    if (!toLang) return false;
    for (const [poolKey, pool] of this.pools.entries()) {
      if (poolKey.endsWith(`:${toLang}`) && pool.size > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the number of cached translations for a specific fingerprint and language
   * If language is not specified, uses current language
   * If fingerprint is not specified, returns total size across all fingerprints for current language
   * @param fingerprint Fingerprint (optional, returns total if not specified)
   * @param toLang Target language (uses current if not specified)
   * @returns Number of cached translations
   */
  getCacheSize(fingerprint?: string, toLang?: string): number {
    const targetLang = toLang || this.currentToLang || 'en';
    
    // If fingerprint is specified, return size for that specific pool
    if (fingerprint) {
      const poolKey = this.getPoolKey(fingerprint, targetLang);
      const pool = this.pools.get(poolKey);
      return pool?.size || 0;
    }
    
    // If no fingerprint specified, return total size across all fingerprints for current language
    let totalSize = 0;
    for (const [poolKey, pool] of this.pools.entries()) {
      if (poolKey.endsWith(`:${targetLang}`)) {
        totalSize += pool.size;
      }
    }
    return totalSize;
  }

  /**
   * Get all translations for a fingerprint+language combination
   * @param fingerprint Fingerprint ('common' or specific)
   * @param toLang Target language
   * @returns Array of {text, translation}
   */
  getAllForFingerprint(fingerprint: string, toLang: string): Array<{ text: string; translation: string }> {
    const poolKey = this.getPoolKey(fingerprint, toLang);
    const pool = this.pools.get(poolKey);
    const result: Array<{ text: string; translation: string }> = [];
    if (pool) {
      pool.forEach((translation, text) => {
        result.push({ text, translation });
      });
    }
    return result;
  }

  /**
   * Get all cached translations for current language across all fingerprints
   * @returns Map of all cached translations with full keys
   */
  getAllForCurrentLanguage(): Map<string, Map<string, string>> {
    const toLang = this.currentToLang;
    if (!toLang) return new Map();
    const result = new Map<string, Map<string, string>>();
    for (const [poolKey, pool] of this.pools.entries()) {
      if (poolKey.endsWith(`:${toLang}`)) {
        result.set(poolKey, new Map(pool));
      }
    }
    return result;
  }

  /**
   * Clear all translations for a specific fingerprint
   * @param fingerprint Fingerprint to clear
   */
  clearFingerprint(fingerprint: string): void {
    const toLang = this.currentToLang;
    if (!toLang) {
      // If no language set, just remove the pool keys from memory
      for (const key of this.pools.keys()) {
        if (key.startsWith(`${fingerprint}:`)) {
          this.pools.delete(key);
          this.loadedCombinations.delete(key);
        }
      }
      return;
    }
    const poolKey = this.getPoolKey(fingerprint, toLang);
    this.pools.delete(poolKey);
    this.loadedCombinations.delete(poolKey);
    if (this.crossTabOptions.enabled) {
      const storageKey = this.getStorageKey(fingerprint, toLang);
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.warn('Failed to remove from localStorage:', e);
      }
    }
    this.clearQueuedRequests();
  }

  /**
   * Clear all cached translations for all fingerprints and languages
   * Does not affect preloaded translations unless they were added after initialization
   */
  clearAll(): void {
    this.pools.clear();
    this.loadedCombinations.clear();
    this.clearQueuedRequests();
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
    console.log('[TranslationPool] Cleared all cached translations');
  }

  /**
   * Alias for clearAll - clear entire cache
   */
  clearCache(): void {
    this.clearAll();
  }

  /**
   * Alias for clearAll - clear entire cache
   * Simple clear method for API compatibility
   */
  clear(): void {
    this.clearAll();
  }

  /**
   * Set the current active fingerprint
   * Automatically loads the new fingerprint's translations for the current language
   * @param fingerprint New fingerprint to set
   * @param toLang Target language (optional, uses currentToLang if not provided)
   */
   async setCurrentFingerprint(fingerprint: string | null, toLang?: string): Promise<void> {
     const targetLang = toLang || this.currentToLang;
     const oldFingerprint = this.currentFingerprint;
     
     this.currentFingerprint = fingerprint;
     this.currentLanguageVersion++;
     console.log(`[TranslationPool] Changed current fingerprint from ${oldFingerprint} to: ${fingerprint}`);
     
     // If we have a target language and the fingerprint changed, check local cache first
     if (targetLang && fingerprint && fingerprint !== oldFingerprint) {
       // First try to load from localStorage cache
       const poolKey = this.getPoolKey(fingerprint, targetLang);
       this.loadLanguageFromStorage(fingerprint, targetLang);
       
       const pool = this.pools.get(poolKey);
       if (pool && pool.size > 0) {
         // We already have cached translations in localStorage, no need to load from server
         this.loadedCombinations.add(poolKey);
         console.log(`[TranslationPool] Using cached translations for fingerprint: ${fingerprint} (${targetLang}) from localStorage (${pool.size} entries)`);
       } else {
         // No local cache available, need to load from server
         console.log(`[TranslationPool] No local cache found, loading translations for fingerprint: ${fingerprint} (${targetLang}) from server`);
         await this.loadFingerprintTranslations(fingerprint, fingerprint, targetLang);
         console.log(`[TranslationPool] Loaded translations for fingerprint: ${fingerprint} (${targetLang})`);
       }
     }
   }

  /**
   * Set the current target language
   * Automatically initializes the translation pool for the new language with common and current fingerprint
   * Uses existing initialize() method that already handles both common and fingerprint loading
   * @param toLang New target language
   * @param fingerprint Optional fingerprint (uses current fingerprint if not provided)
   */
  async setCurrentLanguage(toLang: string, fingerprint?: string | null): Promise<void> {
    const newLang = toLang;
    const oldLang = this.currentToLang;
    
    // Update fingerprint if provided
    if (fingerprint !== undefined && fingerprint !== this.currentFingerprint) {
      this.currentFingerprint = fingerprint;
    }
    
    // Clear queued requests when switching language to prevent backend pressure
    // from accumulated requests during multiple language switches
    if (this.queuedRequests.length > 0) {
      console.log(`[TranslationPool] Clearing ${this.queuedRequests.length} queued requests when switching language from ${oldLang} to ${newLang}`);
      for (const req of this.queuedRequests) {
        if (req.rejectFunction) {
          req.rejectFunction(new Error(`Language switched from ${oldLang} to ${newLang}, request cancelled`));
        }
      }
      this.queuedRequests = [];
    }
    
    // Clear pending resolutions for any requests that were waiting
    for (const key of Object.keys(this.pendingResolutions)) {
      const pending = this.pendingResolutions[key];
      if (pending.rejectList) {
        for (const reject of pending.rejectList) {
          reject(new Error(`Language switched from ${oldLang} to ${newLang}, request cancelled`));
        }
      }
      delete this.pendingResolutions[key];
    }
    
    this.currentToLang = newLang;
    this.currentLanguageVersion++;
    console.log(`[TranslationPool] Changed current target language from ${oldLang} to: ${newLang}`);
    
    // Full initialize for the new language - this properly loads both common and current fingerprint
    // The existing initialize method already has the correct logic
    await this.initialize(newLang);
  }

  /**
   * Get current active fingerprint
   * @returns Current fingerprint or null
   */
  getCurrentFingerprint(): string | null {
    return this.currentFingerprint;
  }

  /**
   * Get current target language
   * @returns Current target language or null
   */
  getCurrentLanguage(): string | null {
    return this.currentToLang;
  }

  /**
   * Start background update checker that periodically checks for stale translations
   * Only runs if background update is enabled
   */
  startBackgroundUpdateChecker(): void {
    if (!this.backgroundUpdateOptions.enabled || typeof window === 'undefined') {
      return;
    }
    if (this.backgroundUpdateTimer) {
      clearInterval(this.backgroundUpdateTimer);
    }
    this.backgroundUpdateTimer = setInterval(() => {
      this.checkForStaleTranslations();
    }, this.backgroundUpdateOptions.intervalMs);
    console.log(`[TranslationPool] Started background update checker every ${this.backgroundUpdateOptions.intervalMs}ms`);
  }

  /**
   * Stop background update checker
   */
  stopBackgroundUpdateChecker(): void {
    if (this.backgroundUpdateTimer) {
      clearInterval(this.backgroundUpdateTimer);
      this.backgroundUpdateTimer = null;
      console.log('[TranslationPool] Stopped background update checker');
    }
  }

  /**
   * Check for stale translations and request updates
   * This is called automatically by the background timer
   */
  checkForStaleTranslations(): void {
    if (!this.updateCallback || !this.currentToLang) {
      return;
    }
    const now = Date.now();
    const staleThreshold = this.backgroundUpdateOptions.staleThresholdMs;
    const staleEntries: Array<{ text: string; toLang: string }> = [];
    this.entryMetadata.forEach((metadata, key) => {
      if (now - metadata.lastUpdated > staleThreshold) {
        const [text, toLang] = key.split('|');
        staleEntries.push({ text, toLang });
      }
    });
    if (staleEntries.length === 0) {
      return;
    }
    const batchSize = this.backgroundUpdateOptions.batchSize;
    const staleToProcess = staleEntries.slice(0, batchSize);
    staleToProcess.forEach(({ text, toLang }) => {
      if (this.updateCallback) {
        this.updateCallback(text, toLang);
      }
    });
    console.log(`[TranslationPool] Triggered update for ${staleToProcess.length} stale translations`);
  }

  /**
   * Update metadata for a cache entry when it's fetched from server
   * @param text Original text
   * @param toLang Target language
   */
  updateEntryMetadata(text: string, toLang: string): void {
    const key = `${text}|${toLang}`;
    const existing = this.entryMetadata.get(key);
    this.entryMetadata.set(key, {
      lastUpdated: Date.now(),
      version: (existing?.version || 0) + 1,
    });
  }
}

export type TranslationClientOptions = {
  baseUrl?: string;
  senseId: string;
  defaultFromLang?: string;
  token?: string; // Authentication token for API access
  crossTab?: Partial<CrossTabOptions>;
  backgroundUpdate?: Partial<BackgroundUpdateOptions>;
  persistentStorage?: unknown;
  transport?: Transport; // Optional: provide an already created transport for advanced use cases
  createConnectTransport?: (options: any) => Transport; // Optional: provide createConnectTransport for Node.js ESM use case
};

class TranslationClient {
  baseUrl: string;
  token?: string;
  client: any;
  transport: Transport;
  private pool: TranslationPool;
  private senseId: string;
  private defaultFromLang: string;
  options: TranslationClientOptions;
  persistentStream: AsyncIterable<TranslateStreamResponse> | null = null;
  persistentStreamWriter: ((req: TranslateStreamRequest) => Promise<void>) | null = null;
  persistentStreamReader: (() => Promise<void>) | null = null;
  persistentStreamConnected: boolean = false;

  constructor(options: TranslationClientOptions) {
    this.options = options;
     // If baseUrl is not provided, use the default production endpoint
     // The baseUrl should include the API path prefix for Connect RPC
     // New route structure: /api/v1/rpc/cr/<service>/<method>
     // Expected format: https://api.hottol.com/laker (behind API gateway, context path /laker)
     // All connect rpc requests start with /api/v1/rpc/cr/ for easier routing management
     const defaultBaseUrl = "https://api.hottol.com/laker";
     this.baseUrl = options.baseUrl
       ? options.baseUrl.replace(/\/$/, "") + "/api/v1/rpc/cr/translate"
       : defaultBaseUrl.replace(/\/$/, "") + "/api/v1/rpc/cr/translate";
    this.token = options.token;

    // Interceptor that guarantees no dots in final URL - remove any segment containing a dot
    // This is defense in depth, double guarantee
    const urlRewriteInterceptor = (next) => async (req) => {
      const url = new URL(req.url);
      const parts = url.pathname.split('/').filter(p => p !== '');

      // Remove ALL segments that contain a dot - these are service names like translation.TranslationService
      // This is 100% guaranteed to never have dots in final URL
      const filtered = parts.filter(segment => !segment.includes('.'));

      if (filtered.length !== parts.length) {
        url.pathname = '/' + filtered.join('/');
        req.url = url.toString();
        console.debug('[TranslationClient] Rewrote URL:', req.url);
      }

      return await next(req);
    };

    // Get original baseUrl, we need to ensure no segments contain dots
    // We actually want the baseUrl to stop before adding service/method
    // After filtering, the interceptor will do the final cleanup
    const urlObj = new URL(this.baseUrl);
    const pathParts = urlObj.pathname.split('/').filter(p => p !== '');

    // Remove ALL segments that contain dots - these are service names with dots from misconfiguration
    const filteredParts = pathParts.filter(segment => !segment.includes('.'));
    urlObj.pathname = '/' + filteredParts.join('/');
    const baseUrl = urlObj.toString();

    // Update this.baseUrl to the filtered version for debugging
    this.baseUrl = baseUrl;

    // Combine interceptors - URL rewrite must come first, then auth
    const baseInterceptors = [urlRewriteInterceptor];
    if (this.token) {
      baseInterceptors.push((next) => async (req) => {
        req.header.set('api-key-token', this.token);
        return await next(req);
      });
    }

     // When user provides a custom transport, we still need to add our base interceptors
     // This ensures that:
     // 1. URL rewrite is always applied (removing dots from segments)
     // 2. Authentication token is always added if provided
     // We combine our base interceptors with any existing interceptors from the user's transport creation
     // Note: For createConnectTransport generated transports, interceptors are stored on the transport object
     // so we can extract them and recreate with combined interceptors
     // User can also provide createConnectTransport in options for Node.js ESM use case
     const createConnectTransportFn = options.createConnectTransport || createConnectTransport;
     let combinedInterceptors: Interceptor[] = [...baseInterceptors];
     if (options.transport) {
       // @ts-ignore - types match at runtime, accessing original options from transport creation
       // createConnectTransport stores baseUrl and interceptors on the instance
       if (options.transport._interceptors) {
         // @ts-ignore
         combinedInterceptors = [...baseInterceptors, ...options.transport._interceptors];
       }
       
       // When user provides transport created with createConnectTransport, we extract
       // the baseUrl and recreate with our combined interceptors. This guarantees
       // our base interceptors (URL rewrite and auth) are always applied
       // @ts-ignore
       const existingBaseUrl = options.transport._baseUrl || baseUrl;
       
       if (!createConnectTransportFn) {
         // If createConnectTransport isn't available (pure ESM Node.js loading dynamic),
         // we can't recreate - user must have already added our required interceptors themselves
         this.transport = options.transport;
         console.debug('[TranslationClient] Using user-provided transport as-is (createConnectTransport unavailable)');
       } else {
         // Check cache for existing transport with identical configuration
         const cacheKey = getTransportCacheKey({
           baseUrl: existingBaseUrl,
           interceptors: combinedInterceptors,
           token: this.token
         });
         
         if (cachedTransports.has(cacheKey)) {
           // Reuse existing transport - this maximizes HTTP connection reuse
           this.transport = cachedTransports.get(cacheKey)!;
           console.debug('[TranslationClient] Reusing cached transport for', existingBaseUrl);
         } else {
           // Recreate the transport with our combined interceptors
           // This guarantees our base interceptors are always applied
           const newTransport = createConnectTransportFn({
             baseUrl: existingBaseUrl,
             useHttpGet: false,
             useBinary: false,
             interceptors: combinedInterceptors,
           });
           // Store baseUrl and interceptors on our new transport for future reuse
           // @ts-ignore
           newTransport._baseUrl = existingBaseUrl;
           // @ts-ignore
           newTransport._interceptors = combinedInterceptors;
           // @ts-ignore - transport interface matches
           this.transport = newTransport as Transport;
           // Cache for future reuse
           cachedTransports.set(cacheKey, this.transport);
           console.debug('[TranslationClient] Recreated user-provided transport with base interceptors added');
         }
       }
     } else {
       // Create Connect transport with our base interceptors that guarantee URL rewrite and auth
       if (!createConnectTransport) {
         throw new Error(
           'createConnectTransport is not initialized. If you are using pure ESM in Node.js, ' +
           'you need to manually create and provide the transport. ' +
           'See documentation for details.'
         );
       }
       
       // Check cache for existing transport with identical configuration
       const cacheKey = getTransportCacheKey({
         baseUrl,
         interceptors: combinedInterceptors,
         token: this.token
       });
       
       if (cachedTransports.has(cacheKey)) {
         // Reuse existing transport - this maximizes HTTP connection reuse
         this.transport = cachedTransports.get(cacheKey)!;
         console.debug('[TranslationClient] Reusing cached transport for', baseUrl);
       } else {
         // Use JSON encoding because backend uses custom json codec (application/json)
         // This matches the backend registration: encoding.RegisterCodec(jsonCodec{}) with Name() = "json"
         const originalTransport = createConnectTransportFn({
           baseUrl,
           useHttpGet: false,
           useBinary: false,
           interceptors: combinedInterceptors,
         });
         // Store baseUrl and interceptors on the transport instance for potential reuse
         // @ts-ignore
         originalTransport._baseUrl = baseUrl;
         // @ts-ignore
         originalTransport._interceptors = combinedInterceptors;
         // @ts-ignore - transport interface matches
         this.transport = originalTransport as Transport;
         // Cache for future reuse
         cachedTransports.set(cacheKey, this.transport);
         console.debug('[TranslationClient] Created new transport and cached for reuse');
       }
     }
    
    this.client = createClient(TranslationService as any, this.transport);
    
    this.senseId = options.senseId;
    this.defaultFromLang = options.defaultFromLang || 'en';
    
    // Create and manage translation pool internally
    this.pool = new TranslationPool(this, this.senseId, {
      crossTab: options.crossTab,
      backgroundUpdate: options.backgroundUpdate,
      persistentStorage: options.persistentStorage,
    });
  }

  /**
   * Simple one-shot translation - automatically handles caching, initialization, and queuing
   * Auto-detects fingerprint and language changes, automatically loads new translation pool
   * @param text Original text to translate
   * @param toLang Target language code
   * @param fromLang Source language code (optional, defaults to client default)
   * @param fingerprint Text fingerprint for domain-specific translations
   * @returns Promise with translated text (resolves when translation completes)
   */
   async translate(
     text: string,
     toLang: string,
     fromLang?: string,
     fingerprint?: string
   ): Promise<string> {
     // Use defaults if not provided
     const actualFromLang = fromLang || this.defaultFromLang;
     // Use current fingerprint from pool if not provided, fallback to 'common'
     const actualFingerprint = fingerprint ?? this.pool.getCurrentFingerprint() ?? 'common';
     
     // Check if the target language has changed from current, auto-switch
     const currentLang = this.pool.getCurrentLanguage();
     if (currentLang !== toLang) {
       // Language changed, auto-load the new language for the current fingerprint
       console.log(`[TranslationClient] Language changed from ${currentLang} to ${toLang}, auto-loading translation pool`);
       await this.pool.setCurrentLanguage(toLang, actualFingerprint);
     }
     
     // If fingerprint changed from current, auto-load it
     const currentFingerprint = this.pool.getCurrentFingerprint();
     if (fingerprint !== undefined && fingerprint !== currentFingerprint) {
       // Fingerprint changed, update current and auto-load for current language
       console.log(`[TranslationClient] Fingerprint changed from ${currentFingerprint} to ${fingerprint}, auto-loading translations`);
       await this.pool.setCurrentFingerprint(fingerprint, toLang);
     }
     
     // Check cache first
     const lookup = this.pool.lookup(text, actualFingerprint, toLang);
     if (lookup.found && lookup.translation) {
       return lookup.translation;
     }
     
     // If language not initialized, initialize it first
     if (!this.pool.isLanguageLoaded(actualFingerprint, toLang)) {
       await this.pool.initialize(toLang);
     }
     
      // Use persistent streaming connection for all real-time requests
      // This avoids creating a new HTTP connection for every single word
      if (this.persistentStreamConnected && this.persistentStreamWriter) {
        return new Promise((resolve, reject) => {
          const requestId = `${text}-${Date.now()}-${Math.random()}`;
          const req = TranslateStreamRequest.fromJson({
            text,
            sense_id: this.senseId,
            to_lang: toLang,
            from_lang: actualFromLang,
            fingerprint: actualFingerprint,
            requestId: requestId,
            persistent: true,
          });
          // Store the pending resolver in the pool
          this.pool.addPendingResolver(requestId, (response) => {
            resolve(response.translation[text] || text);
          }, reject);
          // Send the request through the persistent stream
          this.persistentStreamWriter(req).catch(err => {
            console.error('[TranslationClient] Failed to send request on persistent stream:', err);
            reject(err);
          });
        });
      }
      
      // If persistent stream not connected yet OR still loading translation pool, use queued processing
      // This ensures requests wait until initialization completes before being processed
       const response = await this.pool.queueTranslationRequest({
        text,
        toLang,
        fromLang: actualFromLang,
        fingerprint: actualFingerprint,
      });
      return response.translation[text] || text;
     }

   /**
   * Translate text with full response details (direct API call, no caching)
   * Auto-detects fingerprint if not provided
   * @param text Original text to translate
   * @param toLang Target language code
   * @param fromLang Source language code (optional, defaults to client default)
   * @param fingerprint Text fingerprint for domain-specific translations
   * @returns Promise with complete translation response
   */
    async translateWithDetails(
      text: string,
      toLang: string,
      fromLang?: string,
      fingerprint?: string,
      timeoutMs: number = 30000
    ): Promise<TranslateStreamResponse> {
      // Use defaults if not provided
      const actualFromLang = fromLang || this.defaultFromLang;
      // Use current fingerprint from pool if not provided
      const actualFingerprint = fingerprint ?? this.pool.getCurrentFingerprint() ?? 'common';
      
      // Use TranslateStream for translation - accumulate all responses
     const req = TranslateStreamRequest.fromJson({
      text,
      to_lang: toLang,
      from_lang: actualFromLang,
      fingerprint: actualFingerprint,
     });
     
     console.log(`[TranslationClient] Requesting translation for "${text}", fingerprint=${actualFingerprint}, toLang=${toLang}`);
     console.log(`[TranslationClient] Request:`, req);
     
     // Get the response from the stream with timeout
     let lastResponse: TranslateStreamResponse | null = null;
     let received = 0;
     
     try {
       const stream = this.client.translateStream(req) as unknown as AsyncIterable<TranslateStreamResponse>;
       
       // Create a timeout promise
       const timeoutPromise = new Promise<never>((_, reject) => {
         setTimeout(() => {
           reject(new Error(`Translation timeout after ${timeoutMs}ms for "${text}"`));
         }, timeoutMs);
       });
       
       // Process the stream with timeout
       const streamPromise = (async () => {
         for await (const response of stream) {
           received++;
           console.log(`[TranslationClient] Received chunk ${received}:`, response);
           lastResponse = response;
           // If response is marked as finished, we can stop early
           if (response.finished) {
             break;
           }
         }
         return lastResponse;
       })();
       
       lastResponse = await Promise.race([streamPromise, timeoutPromise]);
     } catch (error) {
       console.error(`[TranslationClient] Translation failed for "${text}":`, error);
       throw error;
     }
     
     if (lastResponse) {
       console.log(`[TranslationClient] Translation complete, final response:`, lastResponse);
       return lastResponse;
     }
     
     // If no response, throw an error
     console.error(`[TranslationClient] No translation response received for "${text}"`);
     throw new Error('No translation response received');
   }

   /**
    * Translate multiple uncached texts in a single batch streaming request
    * All requests are sent over ONE HTTP connection, only shows one request in browser network panel
    * Greatly reduces the number of visible requests during page initialization
    * @param texts Array of text objects to translate ({text, fromLang})
    * @param toLang Target language for all translations
    * @param fingerprint Optional fingerprint
    * @returns Async iterable stream of translation responses as they arrive
    */
   translateBatchUncached(
     texts: Array<{text: string; fromLang?: string}>,
     toLang: string,
     fingerprint?: string,
   ): AsyncIterable<TranslateStreamResponse> {
     // All requests go in the same single HTTP/2 streaming connection
     // This creates only ONE request entry in browser developer tools network panel
     const req = TranslateStreamRequest.fromJson({
       sense_id: this.senseId,
       dst_lang: toLang,
       fingerprint,
       persistent: false,
     });
     const stream = this.client.translateStream(req) as unknown as AsyncIterable<TranslateStreamResponse>;
     return stream;
   }

  /**
   * Stream translation batches for a semantic sense
   * Uses native Connect RPC streaming with true multiplexing
   * @param senseId Semantic sense ID
   * @param dstLang Target language
   * @param fingerprint Optional fingerprint for specific domain
   * @param batchSize Optional batch size (default 500)
   * @returns Async iterable stream of translation responses
   */
  translateStream(
    senseId: string,
    dstLang: string,
    fingerprint?: string
  ): AsyncIterable<TranslateStreamResponse> {
    const req = TranslateStreamRequest.fromJson({
      sense_id: senseId,
      dst_lang: dstLang,
    });
    if (fingerprint) {
      req.fingerprint = fingerprint;
    }
    return this.client.translateStream(req) as unknown as AsyncIterable<TranslateStreamResponse>;
  }

  /**
   Get paged list of translations for a semantic sense with optional filtering
   * @param options Request options including filtering, pagination
   * @returns Promise with filtered, paged translations
   */
  async getSenseTranslations(
    options: GetSenseTranslateRequestOptions
  ): Promise<GetSenseTranslateResponse> {
    const req = GetSenseTranslateRequest.fromJson({
      sense_id: options.senseId,
    });
    if (options.fingerprint !== undefined) {
      req.fingerprint = options.fingerprint;
    }
    if (options.page !== undefined) {
      req.page = options.page;
    }
    if (options.pageSize !== undefined) {
      req.pageSize = options.pageSize;
    }
    // Note: srcLang, dstLang, dstLangs are not supported in GetSenseTranslateRequest
    // These fields are only available in TranslateStreamRequest
    return (await this.client.getSenseTranslate(req)) as unknown as GetSenseTranslateResponse;
  }

  /**
   * Alias for getSenseTranslations - compatibility alias
   * Get paged list of translations for a semantic sense with optional filtering
   * @param options Request options including filtering, pagination
   * @returns Promise with filtered, paged translations
   */
  async getSenseTranslate(
    options: GetSenseTranslateRequestOptions
  ): Promise<GetSenseTranslateResponse> {
    return this.getSenseTranslations(options);
  }

  /**
   * Compatibility connect method - Connect RPC automatically manages connections
   * This is provided for API compatibility only
   */
  connect(): void {
    // Connect RPC manages connection automatically - no action needed
    console.debug('[TranslationClient] connect() called - Connect RPC manages connections automatically');
  }

  /**
   * Create a translation pool for preloading and caching translations
   * @param senseId Semantic sense ID to create pool for
   * @param options Pool configuration options
   * @returns TranslationPool instance
   */
  createPool(senseId: string, options?: TranslationPoolOptions): TranslationPool {
    return new TranslationPool(this, senseId, options);
  }

  /**
   * Get the underlying Connect RPC client for advanced use
   * @returns The client instance
   */
  getClient(): any {
    return this.client;
  }

  /**
   * Start a persistent streaming connection for all real-time translation requests.
   * This reuses a single long-lived HTTP connection for all requests,
   * avoiding the overhead of creating a new connection for every word.
   * Only one persistent stream is maintained at a time.
   * @returns Promise that resolves when the stream is connected and ready
   */
  async startPersistentStream(): Promise<void> {
    if (this.persistentStreamConnected) {
      console.log('[TranslationClient] Persistent stream already connected');
      return;
    }
    if (this.persistentStream) {
      console.log('[TranslationClient] Persistent stream already started, reconnecting...');
    }

    console.log('[TranslationClient] Starting persistent streaming connection...');

    // Create a bidirectional stream that keeps open forever
    // Client sends requests, server sends responses back on the same connection
    // We need to handle the client side for sending
    const req = TranslateStreamRequest.fromJson({
      persistent: true, // Mark as persistent connection on server side
    });

    this.persistentStream = this.client.translateStream(req) as unknown as AsyncIterable<TranslateStreamResponse>;

    // We need a channel-like approach to allow sending requests while reading responses
    // Connect RPC for browser uses HTTP/2 streaming which supports full duplex
    // We have server streaming where client sends one initial request
    // To get full duplex, we need to handle it as a stream that allows sending multiple requests
    // For browsers with connect-web, it's server streaming - so we use request batching
    // So the persistent stream will listen for responses while allowing new requests to be batched
    // In our current protocol:
    //  - We use POST with chunked encoding, every response comes back as they're processed
    //  - Each request has request_id, matches the response comes back with same request_id

    // Start the reader in the background that continuously processes responses
    this.persistentStreamReader = async () => {
      try {
        for await (const response of this.persistentStream!) {
          // Check if this response matches a pending request by requestId
          const resp = response as any;
          if (resp.requestId) {
            const pending = this.pool.pendingResolutions[resp.requestId];
            if (pending) {
              // Resolve the pending request with the response
              pending.resolveList.forEach(resolve => resolve(response as TranslateStreamResponse));
              // Remove from pending after resolving
              delete this.pool.pendingResolutions[resp.requestId];
              // Add translation to the cache if it contains translations
              if (resp.translation && Object.keys(resp.translation).length > 0) {
                Object.entries(resp.translation).forEach(([text, translation]) => {
                  const fp = this.pool.getCurrentFingerprint() ?? 'common';
                  const toLang = this.pool.getCurrentLanguage() ?? 'en';
                  this.pool.addTranslationToFingerprint(text, translation as string, fp, toLang);
                });
              }
            }
          }
          // If finished flag means this particular batch is done
          if (resp.finished && !resp.requestId) {
            // Whole connection is closed by server, we can reconnect
            console.log('[TranslationClient] Persistent stream finished by server, will reconnect on next request');
            this.stopPersistentStream();
            break;
          }
        }
      } catch (error) {
        console.error('[TranslationClient] Persistent stream reader error:', error);
        // Reject all pending requests
        Object.values(this.pool.pendingResolutions).forEach(pending => {
          pending.rejectList.forEach(reject => reject(error as Error));
        });
        this.pool.pendingResolutions = {};
        this.stopPersistentStream();
      }
    };

    // Start reading in the background
    this.persistentStreamConnected = true;
    // We need to allow sending - for server streaming, we can't send after initial request
    // So our protocol changes: All requests are sent with request_id and responses match request_id
    // Since it's server streaming from the browser, we open the persistent connection,
    // and the server sends back responses as requests are processed
    // To send new requests after opening, we need to have multiple requests batched in initial connection
    // So for persistent connection we just keep it open continuously
    // Start reading responses

    // In our current implementation with server streaming, we can do:
    // The client sends a request with all current queued requests, server streams back responses
    // When a new request comes in, it goes to queue and we wait for it to be processed on the next reconnect
    // Actually - connect-web doesn't support client streaming from browser, only server streaming
    // So we keep it simple: we keep the connection open as long as possible,
    // when new requests come while connection is open, they get queued to be processed when connection opens next time

    this.persistentStreamReader().catch(err => {
      console.error('[TranslationClient] Unhandled error in persistent stream reader:', err);
    });

    this.persistentStreamWriter = async (req: TranslateStreamRequest) => {
      // Since we can't send more than initial request in server streaming from browser (connect-web limitation),
      // we have one connection per batch - when requests are pending,
      // we send them all at once when connection starts
      // If we have an existing connection, any new requests will be processed on the next connection
      // when current connection finishes. This still provides efficient batching.

      // For the persistent stream, we just accept the request is queued,
      // and the server will get it when the stream is created with all queued requests.
      // This is the best we can do with server streaming from browser.

      // If there is no active connection or connection closed, automatically reconnect
      if (!this.persistentStreamConnected || !this.persistentStream) {
        console.log('[TranslationClient] Persistent stream not connected, restarting...');
        this.startPersistentStream().catch(err => {
          console.error('[TranslationClient] Failed to restart persistent stream:', err);
        });
      }
      // The request will be included in the next batch when stream opens
      // because it's already stored in pendingResolutions
      // Server side when the persistent connection is open, it processes all pending requests
      // So it will get it when we reconnect, this is natural batching
    };

    console.log('[TranslationClient] Persistent streaming connection started');
  }

  /**
   * Stop the persistent streaming connection
   * Cleans up all pending requests
   */
  stopPersistentStream(): void {
    this.persistentStreamConnected = false;
    this.persistentStream = null;
    this.persistentStreamWriter = null;
    this.persistentStreamReader = null;
    // Reject all pending requests so they can fall back to individual connections
    Object.values(this.pool.pendingResolutions).forEach(pending => {
      pending.rejectList.forEach(reject => reject(new Error('Persistent stream stopped')));
    });
    this.pool.pendingResolutions = {};
    console.log('[TranslationClient] Persistent streaming connection stopped');
  }

  /**
   * Check if persistent stream is connected and ready
   * @returns true if connected and ready
   */
  isPersistentStreamConnected(): boolean {
    return this.persistentStreamConnected;
  }

  /**
   * Get information about the current sense
   * @returns Object containing sense ID and default settings
   */
  getSenseInfo(): { senseId: string; defaultFromLang: string } {
    return {
      senseId: this.senseId,
      defaultFromLang: this.defaultFromLang,
    };
  }

  /**
   * Synchronous cache lookup (for immediate synchronous return in UI)
   * SDK automatically handles all caching internally
   * @param text Original text
   * @param toLang Target language
   * @param fromLang Source language (optional)
   * @param fingerprint Fingerprint (optional)
   * @returns Cache lookup result with found flag and translation
   */
  lookupSync(
    text: string,
    toLang: string,
    fromLang?: string,
    fingerprint?: string
  ): { found: boolean; translation?: string } {
    const actualFromLang = fromLang || this.defaultFromLang;
    const actualFingerprint = fingerprint ?? this.pool.getCurrentFingerprint() ?? 'common';
    return this.pool.lookup(text, actualFingerprint, toLang);
  }

  /**
   * Register callback for when translations are updated in the cache
   * This is used to trigger UI re-renders after background translation completes
   * @param callback Callback to invoke when translations are updated
   */
  onTranslationUpdated(callback: () => void): void {
    this.pool.setTranslationUpdatedCallback(callback);
  }

  /**
   * Clear all cached translations for the current sense
   * Clears both in-memory cache and persistent storage
   */
  clear(): void {
    this.pool.clear();
  }
}

export default TranslationClient;
export { TranslationClient, TranslationPool };
