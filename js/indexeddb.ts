/**
 * IndexedDB Storage Wrapper for Translation Cache
 * Provides a more scalable storage solution than localStorage for large translation datasets
 * 
 * Features:
 * - Supports storing large amounts of translation data (up to hundreds of MBs)
 * - Asynchronous operations don't block the main thread
 * - Supports indexes for fast lookups
 * - Automatic data expiration support
 */

export interface IndexedDBOptions {
  databaseName?: string;
  databaseVersion?: number;
  storeName?: string;
}

export interface TranslationCacheEntry {
  id: string;  // poolKey:text format
  poolKey: string;
  text: string;
  translation: string;
  srcLang?: string;
  dstLang?: string;
  timestamp: number;
  expiresAt?: number;
}

export class TranslationIndexedDB {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private dbVersion: number;
  private storeName: string;
  private initPromise: Promise<void> | null = null;

  constructor(options: IndexedDBOptions = {}) {
    this.dbName = options.databaseName || 'laker-translation-cache';
    this.dbVersion = options.databaseVersion || 1;
    this.storeName = options.storeName || 'translations';
  }

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not available in this environment'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('[TranslationIndexedDB] Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[TranslationIndexedDB] Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store with keyPath
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          
          // Create indexes for fast lookups
          store.createIndex('poolKey', 'poolKey', { unique: false });
          store.createIndex('text', 'text', { unique: false });
          store.createIndex('dstLang', 'dstLang', { unique: false });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
          
          console.log('[TranslationIndexedDB] Object store created with indexes');
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Get a translation by pool key and text
   */
  async get(poolKey: string, text: string): Promise<TranslationCacheEntry | null> {
    await this.init();
    if (!this.db) return null;

    const id = `${poolKey}:${text}`;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onerror = () => {
        console.error('[TranslationIndexedDB] Failed to get translation:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const entry = request.result as TranslationCacheEntry | undefined;
        
        // Check if entry has expired
        if (entry && entry.expiresAt && entry.expiresAt < Date.now()) {
          // Auto-delete expired entry
          this.delete(poolKey, text).catch(console.error);
          resolve(null);
        } else {
          resolve(entry || null);
        }
      };
    });
  }

  /**
   * Get all translations for a pool key
   */
  async getAllByPoolKey(poolKey: string): Promise<TranslationCacheEntry[]> {
    await this.init();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('poolKey');
      const request = index.getAll(poolKey);

      request.onerror = () => {
        console.error('[TranslationIndexedDB] Failed to get translations by pool key:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const entries = request.result as TranslationCacheEntry[];
        const now = Date.now();
        
        // Filter out expired entries and delete them
        const validEntries: TranslationCacheEntry[] = [];
        const expiredIds: string[] = [];
        
        for (const entry of entries) {
          if (entry.expiresAt && entry.expiresAt < now) {
            expiredIds.push(entry.id);
          } else {
            validEntries.push(entry);
          }
        }
        
        // Delete expired entries in background
        if (expiredIds.length > 0) {
          this.deleteMany(expiredIds).catch(console.error);
        }
        
        resolve(validEntries);
      };
    });
  }

  /**
   * Set a translation entry
   */
  async set(entry: TranslationCacheEntry): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry);

      request.onerror = () => {
        console.error('[TranslationIndexedDB] Failed to set translation:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Set multiple translation entries at once
   */
  async setMany(entries: TranslationCacheEntry[]): Promise<void> {
    await this.init();
    if (!this.db || entries.length === 0) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      for (const entry of entries) {
        store.put(entry);
      }

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        console.error('[TranslationIndexedDB] Failed to set many translations:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  /**
   * Delete a translation entry
   */
  async delete(poolKey: string, text: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    const id = `${poolKey}:${text}`;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onerror = () => {
        console.error('[TranslationIndexedDB] Failed to delete translation:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Delete multiple translation entries
   */
  async deleteMany(ids: string[]): Promise<void> {
    await this.init();
    if (!this.db || ids.length === 0) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      for (const id of ids) {
        store.delete(id);
      }

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        console.error('[TranslationIndexedDB] Failed to delete many translations:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  /**
   * Delete all translations for a pool key
   */
  async deleteAllByPoolKey(poolKey: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('poolKey');
      const request = index.openCursor(IDBKeyRange.only(poolKey));

      request.onerror = () => {
        console.error('[TranslationIndexedDB] Failed to delete translations by pool key:', request.error);
        reject(request.error);
      };

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  /**
   * Clear all translations from the database
   */
  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => {
        console.error('[TranslationIndexedDB] Failed to clear translations:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Get the count of all entries
   */
  async count(): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.count();

      request.onerror = () => {
        console.error('[TranslationIndexedDB] Failed to count translations:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }

  /**
   * Clean up expired entries
   */
  async cleanupExpired(): Promise<number> {
    await this.init();
    if (!this.db) return 0;

    const now = Date.now();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('expiresAt');
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);
      
      let deletedCount = 0;

      request.onerror = () => {
        console.error('[TranslationIndexedDB] Failed to cleanup expired translations:', request.error);
        reject(request.error);
      };

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };
    });
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

// Default instance for use across the SDK
export const defaultTranslationDB = new TranslationIndexedDB();