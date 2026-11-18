// 内存存储实现
// 无持久化，用于 AsyncStorage / localStorage 均不可用时的 fallback

import type { CacheEntry, PersistentStorage } from './types';

export class MemoryStorage implements PersistentStorage {
  private store = new Map<string, CacheEntry[]>();

  async load(poolKey: string): Promise<CacheEntry[]> {
    return this.store.get(poolKey) ?? [];
  }

  async save(poolKey: string, entries: CacheEntry[]): Promise<void> {
    this.store.set(poolKey, entries);
  }

  async clear(prefix: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }
}
