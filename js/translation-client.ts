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
import type { Transport } from '@connectrpc/connect';

// For browser environments, we statically import connect-web
// because it's already external in the rollup config and user's project has it installed
// This ensures createConnectTransport is available synchronously
import { createConnectTransport as browserCreateConnectTransport } from '@connectrpc/connect-web';
import type { createConnectTransport as CCTBrowser } from '@connectrpc/connect-web';
import type { createConnectTransport as CCTNode } from '@connectrpc/connect-node';

let createConnectTransport: (options: any) => Transport;

// Check if browser already preloaded the transport (for IIFE standalone build)
if (typeof window !== 'undefined' && (window as any).__LAKER_BROWSER_TRANSPORT) {
  createConnectTransport = (window as any).__LAKER_BROWSER_TRANSPORT;
} else if (typeof fetch === 'function' && typeof window !== 'undefined') {
  // Browser environment (Vite/Webpack ESM or CJS build) - use statically imported version
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
export const version = '1.6.133';

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
          if (fingerprint === 'common') {
            this.loadLanguageFromStorage(fingerprint, toLang);
          }
        }
      }
    }
  }

  loadLanguageFromStorage(fingerprint: string, toLang: string): void {
    const poolKey = this.getPoolKey(fingerprint, toLang);
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

  getStorageKey(fingerprint: string, toLang: string): string {
    return `${this.crossTabOptions.storageKeyPrefix}${this.senseId}_${fingerprint}:${toLang}`;
  }

  saveToStorage(fingerprint: string, toLang: string): void {
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

    const processWithRetry = async (
      req: PendingRequest,
      attempt = 0
    ): Promise<{ text: string; translation: string; success: boolean }> => {
      try {
         const lookup = this.lookup(req.text, req.fingerprint);
         if (lookup.found && lookup.translation) {
           // Already in cache, use cached value directly - no need to request
           return { text: req.text, translation: lookup.translation, success: true };
         } else {
           // Not in cache, need to request from server
           const response = await this.client.translateWithDetails(
             req.text,
             req.toLang,
             req.fromLang,
             req.fingerprint
           );
           return { text: req.text, translation: response.translation[req.text] || req.text, success: true };
         }
      } catch (error: unknown) {
        console.warn(
          `[TranslationPool] Request failed (attempt ${attempt + 1}/${maxRetries}):`,
          (error as Error).message
        );
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelayMs * (attempt + 1)));
          return processWithRetry(req, attempt + 1);
        }
        console.error(`[TranslationPool] All retries failed for: "${req.text}", using original text`);
        return { text: req.text, translation: req.text, success: false };
      }
    };

    const promises = requestsToProcess.map(req => processWithRetry(req));
    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    results.forEach(({ text, translation }, index) => {
      this.addTranslation(text, translation);
       const queuedReq = requestsToProcess[index];
       if (queuedReq && queuedReq.resolveFunction) {
         const response = TranslateStreamResponse.fromJson({
           originalText: text,
           translation: { [text]: translation },
           timestamp: Date.now(),
           finished: true,
           batchIndex: 0,
         });
         queuedReq.resolveFunction(response);
         const key = `${text}-${queuedReq.fingerprint || 'common'}`;
        delete this.pendingResolutions[key];
        if (this.onTranslationUpdated) {
          this.onTranslationUpdated(text, translation);
        }
      }
    });

    requestsToProcess.forEach((queuedReq, index) => {
      if (!results[index].success && queuedReq.rejectFunction) {
        const error = new Error(`Translation failed for: ${queuedReq.text}`);
        queuedReq.rejectFunction(error);
        const key = `${queuedReq.text}-${queuedReq.fingerprint || 'common'}`;
        delete this.pendingResolutions[key];
      }
    });

    this.broadcastUpdate();
    console.log(`[TranslationPool] Completed processing ${results.length} queued requests (${successCount} success, ${failCount} failed)`);
    if (this.onQueueProcessed) {
      this.onQueueProcessed(results.length);
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
      console.log(`[TranslationPool] Force reloading all translations from server for cache synchronization`);
      // Always load from server regardless of local cache to ensure cache synchronization
      await this.loadFingerprintTranslations('common', undefined, toLang);
      console.log(`[TranslationPool] Common translations loaded for ${toLang}`);
      if (this.currentFingerprint) {
        await this.loadFingerprintTranslations(this.currentFingerprint, this.currentFingerprint, toLang);
        console.log(`[TranslationPool] ${this.currentFingerprint} translations loaded for ${toLang}`);
      }
      this.broadcastUpdate();
      console.log(`[TranslationPool] Pool initialization completed for ${toLang}`);
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
      sense_id: this.senseId,
      dst_lang: toLang,
    };
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

  addTranslation(text: string, translation: string): void {
    const fp = this.currentFingerprint || 'common';
    const toLang = this.currentToLang || 'en';
    const poolKey = this.getPoolKey(fp, toLang);
    let pool = this.pools.get(poolKey);
    if (!pool) {
      pool = new Map();
      this.pools.set(poolKey, pool);
    }
    pool.set(text, translation);
    this.saveToStorage(fp, toLang);
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
    if (pool && pool.has(text)) {
      return { found: true, fromCache: true, translation: pool.get(text) };
    }
    if (fp !== 'common') {
      const commonPoolKey = this.getPoolKey('common', lang);
      const commonPool = this.pools.get(commonPoolKey);
      if (commonPool && commonPool.has(text)) {
        return { found: true, fromCache: true, translation: commonPool.get(text) };
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
     
     // If we have a target language and the fingerprint changed, always load from server
     // to ensure cache synchronization
     if (targetLang && fingerprint && fingerprint !== oldFingerprint) {
       console.log(`[TranslationPool] Force loading translations for fingerprint: ${fingerprint} (${targetLang}) from server`);
       await this.loadFingerprintTranslations(fingerprint, fingerprint, targetLang);
       console.log(`[TranslationPool] Loaded translations for fingerprint: ${fingerprint} (${targetLang})`);
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
    
    // Use provided transport if available
    if (options.transport) {
      this.transport = options.transport;
    } else {
      // Create Connect transport with api-key-token header if token provided
      if (!createConnectTransport) {
        throw new Error(
          'createConnectTransport is not initialized. If you are using pure ESM in Node.js, ' +
          'you need to manually create and provide the transport. ' +
          'See documentation for details.'
        );
      }
      // Use JSON encoding because backend uses custom json codec (application/json)
      // This matches the backend registration: encoding.RegisterCodec(jsonCodec{}) with Name() = "json"
      //
      // THOROUGH FIX - SOURCE LEVEL:
      // We never want `translation.TranslationService` in URL because it contains dots
      // which causes Nginx 404 (Nginx treats dots as location matches.
      //
      // Our routing structure:
      //   Final correct URL: .../api/v1/rpc/cr/translate/TranslateStream
      //   - translate = service name, TranslateStream = method name
      //   - No dots!
      //
      // Connect always builds: baseUrl + '/' + serviceName + '/' + methodName
      //   serviceName = "translation.TranslationService" (fixed by protobuf)
      //
      // To get correct URL, we must TRUNCATE baseUrl to remove the service name part
      // so that when Connect adds serviceName + methodName, we get exactly what we want:
      //
      // Example:
      //   User provides: baseUrl = "https://api.hottol.com/laker/api/v1/rpc/cr/translate
      //   We truncate to:  "https://api.hottol.com/laker/api/v1/rpc/cr
      //   Connect adds:  + "/translation.TranslationService/TranslateStream"
      //   Then interceptor removes "/translation.TranslationService"
      //   Final: https://api.hottol.com/laker/api/v1/rpc/cr/translate/TranslateStream ✓
      //
      // But actually simpler: regardless of what user provided, we just ensure we remove
      // any segment that contains a dot, because that's the service name with dots.
      // This is 100% guaranteed to never have dots in final URL.

       // Get original baseUrl, we only need to filter out segments that contain dots
       // The this.baseUrl already ends with /translate which we want to keep as the service name (no dots)
       // When Connect RPC adds serviceName/methodName → serviceName = translation.TranslationService (with dot)
       // Then the interceptor will remove the serviceName segment containing the dot, resulting in:
       // final URL = .../translate/methodName which is exactly what we need for routing
       const urlObj = new URL(this.baseUrl);
       const pathParts = urlObj.pathname.split('/').filter(p => p !== '');
       
       // Remove ALL segments that contain dots - these are only from user-provided baseUrl if any
       // Our this.baseUrl constructed here has no dots in segments already
       const filteredParts = pathParts.filter(segment => !segment.includes('.'));
       urlObj.pathname = '/' + filteredParts.join('/');
       const baseUrl = urlObj.toString();
      
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

      const interceptors = this.token
        ? [urlRewriteInterceptor, (next) => async (req) => {
            req.header.set('api-key-token', this.token);
            return await next(req);
          }]
        : [urlRewriteInterceptor];

      const originalTransport = createConnectTransport({
        baseUrl,
        useHttpGet: false,
        useBinary: false,
        interceptors,
      });

      // @ts-ignore - transport interface matches
      this.transport = originalTransport as Transport;
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
    
    // Queue the request and wait for completion
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
