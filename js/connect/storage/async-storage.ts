// React Native / Expo AsyncStorage 存储适配器
// 惰性接收 AsyncStorage 实例，避免构建时强依赖

import type { CacheEntry, PersistentStorage } from './types';

// AsyncStorage 最小接口（兼容 @react-native-async-storage/async-storage 和 expo 内置版本）
export interface AsyncStorageInstance {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  multiRemove(keys: string[]): Promise<void>;
}

export class AsyncStorageAdapter implements PersistentStorage {
  private storage: AsyncStorageInstance;
  private prefix: string;

  constructor(storage: AsyncStorageInstance, prefix: string = 'laker_translation_') {
    this.storage = storage;
    this.prefix = prefix;
  }

  private key(poolKey: string): string {
    return `${this.prefix}${poolKey}`;
  }

  async load(poolKey: string): Promise<CacheEntry[]> {
    try {
      const raw = await this.storage.getItem(this.key(poolKey));
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
      console.warn('[AsyncStorageAdapter] load failed:', e);
      return [];
    }
  }

  async save(poolKey: string, entries: CacheEntry[]): Promise<void> {
    try {
      await this.storage.setItem(
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
      console.warn('[AsyncStorageAdapter] save failed:', e);
    }
  }

  /**
   * 清除所有缓存（传入空 prefix 表示全量清除）
   * 注意：AsyncStorage 无 key 枚举 API，调用方需在 clear 前收集已知 poolKey 列表
   */
  async clear(prefix: string): Promise<void> {
    console.warn(
      `[AsyncStorageAdapter] clear('${prefix}') is a no-op; ` +
        'use explicit poolKey removal via TranslationPool API'
    );
  }
}
