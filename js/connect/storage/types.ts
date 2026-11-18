// 持久存储接口定义
// 所有存储后端（Memory / LocalStorage / AsyncStorage / SecureStore）必须实现此接口

export interface CacheEntry {
  text: string;
  translation: string;
  timestamp: number;
  expiresAt?: number;
}

export interface PersistentStorage {
  /**
   * 加载指定 poolKey 的缓存条目
   * @param poolKey 池键，格式 "fingerprint:toLang"
   * @returns 缓存条目数组；无缓存时返回空数组
   */
  load(poolKey: string): Promise<CacheEntry[]>;

  /**
   * 保存指定 poolKey 的缓存条目
   * @param poolKey 池键
   * @param entries 缓存条目数组（全量覆盖）
   */
  save(poolKey: string, entries: CacheEntry[]): Promise<void>;

  /**
   * 清除所有以 prefix 开头的 poolKey 缓存
   * @param prefix 键前缀（如 senseId_）
   */
  clear(prefix: string): Promise<void>;
}
