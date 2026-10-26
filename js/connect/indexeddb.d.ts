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
    id: string;
    poolKey: string;
    text: string;
    translation: string;
    srcLang?: string;
    dstLang?: string;
    timestamp: number;
    expiresAt?: number;
}
export declare class TranslationIndexedDB {
    private db;
    private dbName;
    private dbVersion;
    private storeName;
    private initPromise;
    constructor(options?: IndexedDBOptions);
    /**
     * Initialize the IndexedDB database
     */
    init(): Promise<void>;
    /**
     * Get a translation by pool key and text
     */
    get(poolKey: string, text: string): Promise<TranslationCacheEntry | null>;
    /**
     * Get all translations for a pool key
     */
    getAllByPoolKey(poolKey: string): Promise<TranslationCacheEntry[]>;
    /**
     * Set a translation entry
     */
    set(entry: TranslationCacheEntry): Promise<void>;
    /**
     * Set multiple translation entries at once
     */
    setMany(entries: TranslationCacheEntry[]): Promise<void>;
    /**
     * Delete a translation entry
     */
    delete(poolKey: string, text: string): Promise<void>;
    /**
     * Delete multiple translation entries
     */
    deleteMany(ids: string[]): Promise<void>;
    /**
     * Delete all translations for a pool key
     */
    deleteAllByPoolKey(poolKey: string): Promise<void>;
    /**
     * Clear all translations from the database
     */
    clear(): Promise<void>;
    /**
     * Get the count of all entries
     */
    count(): Promise<number>;
    /**
     * Clean up expired entries
     */
    cleanupExpired(): Promise<number>;
    /**
     * Close the database connection
     */
    close(): void;
}
export declare const defaultTranslationDB: TranslationIndexedDB;
