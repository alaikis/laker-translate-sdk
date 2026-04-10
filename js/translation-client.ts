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

// Import generated Connect RPC code
import {
  GetSenseTranslateRequestSchema,
  GetSenseTranslateResponseSchema,
  TranslateStreamRequestSchema,
  TranslateStreamResponseSchema,
  LLMTranslateRequestSchema,
  LLMTranslateResponseSchema,
  TranslateRecordSchema,
  create,
} from './gen/translation_pb.js';
import { TranslationService } from './gen/translation_connect.js';
import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';

// Re-export all types from generated code
export type {
  GetSenseTranslateRequest,
  GetSenseTranslateResponse,
  TranslateStreamRequest,
  TranslateStreamResponse,
  LLMTranslateRequest,
  LLMTranslateResponse,
  TranslateRecord,
} from './gen/translation_pb.js';

export type GetSenseTranslateRequestOptions = {
  senseId: string;
  fingerprint?: string;
  page?: number;
  pageSize?: number;
  srcLang?: string;
  dstLang?: string;
  dstLangs?: string[];
};

import type {
  GetSenseTranslateResponse,
  TranslateStreamResponse,
  LLMTranslateResponse,
} from './gen/translation_pb.js';

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
 * @param text Original text that may contain numeric variables
 * @returns Template extraction result
 */
export function extractTemplate(text: string): {
  isTemplated: boolean;
  srcTemplate: string;
  dstTemplate: string;
  variables: string[];
} {
  const numberRegex = /\d+(?:\.\d+)?/g;
  const matches = text.match(numberRegex);
  if (!matches || matches.length === 0) {
    return {
      isTemplated: false,
      srcTemplate: text,
      dstTemplate: '',
      variables: [],
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
    variables,
  };
}

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

type PendingResolutions = Record<
  string,
  {
    resolve: (value: LLMTranslateResponse) => void;
    reject: (error: Error) => void;
    resolveList: Array<(value: LLMTranslateResponse) => void>;
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
    this.crossTabOptions = {
      ...defaultCrossTabOptions,
      ...options?.crossTab,
    };
    this.persistentStorage = options?.persistentStorage;
    this.backgroundUpdateOptions = {
      enabled: options?.backgroundUpdate?.enabled ?? false,
      intervalMs: options?.backgroundUpdate?.intervalMs ?? 5 * 60 * 1000,
      batchSize: options?.backgroundUpdate?.batchSize ?? 50,
      staleThresholdMs:
        options?.backgroundUpdate?.staleThresholdMs ?? 24 * 60 * 60 * 1000,
    };
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
        pool.set(text, translation);
      });
      this.loadedCombinations.add(poolKey);
    }
    if (message.data?.text && message.data?.translation) {
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
  }): Promise<LLMTranslateResponse> {
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
        if (lookup.found) {
          const response = await this.client.translateWithDetails(
            req.text,
            req.toLang,
            req.fromLang,
            req.fingerprint
          );
          return { text: req.text, translation: response.translatedText, success: true };
        } else {
          const response = await this.client.translateWithDetails(
            req.text,
            req.toLang,
            req.fromLang,
            req.fingerprint
          );
          return { text: req.text, translation: response.translatedText, success: true };
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
        const response = create(LLMTranslateResponseSchema, {
          originalText: text,
          translatedText: translation,
          provider: 'queued_translation',
          timestamp: BigInt(Date.now()),
          finished: true,
          cached: false,
          fromLang: queuedReq.fromLang || '',
          toLang: queuedReq.toLang,
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
      return;
    }
    this.loading = true;
    this.currentToLang = toLang;
    try {
      console.log(`[TranslationPool] Starting pool initialization... (toLang: ${toLang})`);
      const commonPoolKey = this.getPoolKey('common', toLang);
      if (!this.loadedCombinations.has(commonPoolKey)) {
        await this.loadFingerprintTranslations('common', undefined, toLang);
        console.log(`[TranslationPool] Common translations loaded for ${toLang}`);
      }
      if (this.currentFingerprint) {
        const fpPoolKey = this.getPoolKey(this.currentFingerprint, toLang);
        if (!this.loadedCombinations.has(fpPoolKey)) {
          await this.loadFingerprintTranslations(this.currentFingerprint, this.currentFingerprint, toLang);
          console.log(`[TranslationPool] ${this.currentFingerprint} translations loaded for ${toLang}`);
        }
      }
      this.broadcastUpdate();
      console.log(`[TranslationPool] Pool initialization completed for ${toLang}`);
      if (this.onPoolInitialized) {
        this.onPoolInitialized();
      }
      await this.processQueuedRequests();
    } finally {
      this.loading = false;
    }
  }

  async loadFingerprintTranslations(
    fp: string,
    fingerprint: string | undefined,
    toLang: string
  ): Promise<void> {
    const poolKey = this.getPoolKey(fp, toLang);
    this.loadLanguageFromStorage(fp, toLang);
    let pool = this.pools.get(poolKey);
    if (!pool) {
      pool = new Map();
      this.pools.set(poolKey, pool);
    }
    let updatedCount = 0;
    let addedCount = 0;

    const req = create(TranslateStreamRequestSchema, {
      senseId: this.senseId,
      fingerprint,
      dstLang: toLang,
      batchSize: 500,
    });

    if (fingerprint) {
      req.fingerprint = fingerprint;
    }

    for await (const response of this.client.client.translateStream(req)) {
      if (!response.translation) continue;

      Object.entries(response.translation).forEach(([text, translate]) => {
        // Skip empty keys or error placeholder keys
        if (!text || text === 'error') {
          return;
        }
        const existing = pool?.get(text);
        if (existing === undefined) {
          addedCount++;
        } else if (existing !== translate) {
          updatedCount++;
        }
        pool?.set(text, translate);
        const key = `${text}-${fp}`;
        if (this.pendingResolutions[key]) {
          const responseObj = create(LLMTranslateResponseSchema, {
            originalText: text,
            translatedText: translate,
            provider: 'pool-stream',
            timestamp: BigInt(Date.now()),
            finished: true,
            cached: false,
          });
          this.pendingResolutions[key].resolveList.forEach(resolve => resolve(responseObj));
          delete this.pendingResolutions[key];
        }
        if (fp !== 'common') {
          const commonKey = `${text}-common`;
          if (this.pendingResolutions[commonKey]) {
            const responseObj = create(LLMTranslateResponseSchema, {
              originalText: text,
              translatedText: translate,
              provider: 'pool-stream',
              timestamp: BigInt(Date.now()),
              finished: true,
              cached: false,
            });
            this.pendingResolutions[commonKey].resolveList.forEach(resolve => resolve(responseObj));
            delete this.pendingResolutions[commonKey];
          }
        }
        if (this.onTranslationLoaded) {
          this.onTranslationLoaded(text, translate);
        }
      });
    }

    this.saveToStorage(fp, toLang);
    if (updatedCount > 0 || addedCount > 0) {
      console.log(`[TranslationPool] Loaded ${fp}:${toLang} - added ${addedCount}, updated ${updatedCount} from remote`);
    }
    this.loadedCombinations.add(poolKey);
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

  lookup(text: string, fingerprint?: string): { found: boolean; translation?: string } {
    const fp = fingerprint || this.currentFingerprint || 'common';
    const toLang = this.currentToLang || 'en';
    const poolKey = this.getPoolKey(fp, toLang);
    const pool = this.pools.get(poolKey);
    if (pool && pool.has(text)) {
      return { found: true, translation: pool.get(text) };
    }
    if (fp !== 'common') {
      const commonPoolKey = this.getPoolKey('common', toLang);
      const commonPool = this.pools.get(commonPoolKey);
      if (commonPool && commonPool.has(text)) {
        return { found: true, translation: commonPool.get(text) };
      }
    }
    return { found: false };
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
   * @param fingerprint Fingerprint (default 'common')
   * @param toLang Target language (uses current if not specified)
   * @returns Number of cached translations
   */
  getCacheSize(fingerprint = 'common', toLang?: string): number {
    const targetLang = toLang || this.currentToLang || 'en';
    const poolKey = this.getPoolKey(fingerprint, targetLang);
    const pool = this.pools.get(poolKey);
    return pool?.size || 0;
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
   * Set the current active fingerprint
   * Doesn't clear existing cache, just changes lookup priority
   * When a new fingerprint is set and not loaded for current language,
   * it will be loaded automatically during next initialize
   * @param fingerprint New fingerprint to set
   */
  setCurrentFingerprint(fingerprint: string | null): void {
    this.currentFingerprint = fingerprint;
    this.currentLanguageVersion++;
    console.log(`[TranslationPool] Changed current fingerprint to: ${fingerprint}`);
  }

  /**
   * Get current active fingerprint
   * @returns Current fingerprint or null
   */
  getCurrentFingerprint(): string | null {
    return this.currentFingerprint;
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
  baseUrl: string;
  useH2?: boolean;
};

class TranslationClient {
  baseUrl: string;
  client: PromiseClient<typeof TranslationService>;
  transport: ReturnType<typeof createConnectTransport>;

  constructor(options: TranslationClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    const baseUrl = this.baseUrl;
    this.transport = createConnectTransport({
      baseUrl,
      useHttpGet: false,
    });
    this.client = createPromiseClient(TranslationService, this.transport);
  }

  /**
   * Create a translation pool for a specific semantic sense
   * The pool caches translations and enables streaming loading
   * @param senseId The semantic sense ID
   * @param options Pool configuration options
   * @returns TranslationPool instance
   */
  createPool(senseId: string, options?: TranslationPoolOptions): TranslationPool {
    return new TranslationPool(this, senseId, options);
  }

  /**
   * Translate text with full response details
   * @param text Original text to translate
   * @param toLang Target language code
   * @param fromLang Source language code (optional)
   * @param fingerprint Text fingerprint for domain-specific translations
   * @returns Promise with complete translation response
   */
  async translateWithDetails(
    text: string,
    toLang: string,
    fromLang?: string,
    fingerprint?: string
  ): Promise<LLMTranslateResponse> {
    const req = create(LLMTranslateRequestSchema, {
      text,
      toLang,
    });
    if (fromLang) {
      req.fromLang = fromLang;
    }
    if (fingerprint) {
      req.fingerprint = fingerprint;
    }
    return this.client.llmTranslate(req);
  }

  /**
   * Simple translation that just returns the translated text string
   * @param text Original text to translate
   * @param toLang Target language code
   * @param fromLang Source language code (optional)
   * @param fingerprint Text fingerprint for domain-specific translations
   * @returns Promise with translated text
   */
  async translate(
    text: string,
    toLang: string,
    fromLang?: string,
    fingerprint?: string
  ): Promise<string> {
    const response = await this.translateWithDetails(text, toLang, fromLang, fingerprint);
    return response.translatedText;
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
    fingerprint?: string,
    batchSize?: number
  ): AsyncIterable<TranslateStreamResponse> {
    const req = create(TranslateStreamRequestSchema, {
      senseId,
      dstLang,
      batchSize: batchSize || 500,
    });
    if (fingerprint) {
      req.fingerprint = fingerprint;
    }
    return this.client.translateStream(req);
  }

  /**
   * Get paged list of translations for a semantic sense with optional filtering
   * @param options Request options including filtering, pagination
   * @returns Promise with filtered, paged translations
   */
  async getSenseTranslations(
    options: GetSenseTranslateRequestOptions
  ): Promise<GetSenseTranslateResponse> {
    const req = create(GetSenseTranslateRequestSchema, {
      senseId: options.senseId,
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
    if (options.srcLang !== undefined) {
      req.srcLang = options.srcLang;
    }
    if (options.dstLang !== undefined) {
      req.dstLang = options.dstLang;
    }
    if (options.dstLangs !== undefined) {
      req.dstLangs = options.dstLangs;
    }
    return this.client.getSenseTranslate(req);
  }

  /**
   * Get the underlying Connect RPC client for advanced use
   * @returns The promise client instance
   */
  getClient(): PromiseClient<typeof TranslationService> {
    return this.client;
  }
}

export {
  TranslationPool,
  TranslationClient,
};

export default TranslationClient;
