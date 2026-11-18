// 浏览器 localStorage 存储适配器
// 从 translation-client.ts 提取的现有逻辑，行为不变

declare const localStorage: Storage | undefined;

import type { CacheEntry, PersistentStorage } from './types';

export class LocalStorageAdapter implements PersistentStorage {
  private prefix: string;

  constructor(prefix: string = 'laker_translation_') {
    this.prefix = prefix;
  }

  private key(poolKey: string): string {
    return `${this.prefix}${poolKey}`;
  }

  async load(poolKey: string): Promise<CacheEntry[]> {
    try {
      const raw = localStorage?.getItem(this.key(poolKey));
      if (!raw) return [];
      const data = JSON.parse(raw) as Array<{
        text: string;
        translation: string;
        timestamp?: number;
        expiresAt?: number;
      }>;
      return data.map((d) => ({
        text: d.text,
        translation: d.translation,
        timestamp: d.timestamp ?? 0,
        ...(d.expiresAt !== undefined ? { expiresAt: d.expiresAt } : {}),
      }));
    } catch (e) {
      console.warn('[LocalStorageAdapter] load failed:', e);
      return [];
    }
  }

  async save(poolKey: string, entries: CacheEntry[]): Promise<void> {
    try {
      localStorage?.setItem(
        this.key(poolKey),
        JSON.stringify(
          entries.map(({ text, translation, timestamp, expiresAt }) => ({
            text,
            translation,
            timestamp,
            ...(expiresAt !== undefined ? { expiresAt } : {}),
          }))
        )
      );
    } catch (e) {
      console.warn('[LocalStorageAdapter] save failed:', e);
    }
  }

  async clear(prefix: string): Promise<void> {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < (localStorage?.length ?? 0); i++) {
        const k = localStorage?.key(i);
        if (k && k.startsWith(`${this.prefix}${prefix}`)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage?.removeItem(k));
    } catch (e) {
      console.warn('[LocalStorageAdapter] clear failed:', e);
    }
  }
}
