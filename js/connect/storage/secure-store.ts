// Expo SecureStore token 持久化适配器
// 惰性接收 expo-secure-store 实例，避免构建时强依赖

// expo-secure-store 最小接口
export interface SecureStoreInstance {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

export class ExpoSecureStoreToken {
  private store: SecureStoreInstance;
  private key: string;

  constructor(store: SecureStoreInstance, key: string = 'laker_translation_token') {
    this.store = store;
    this.key = key;
  }

  /**
   * 加载已持久化的 token；未存储或加载失败时返回 null
   */
  async load(): Promise<string | null> {
    try {
      return await this.store.getItemAsync(this.key);
    } catch (e) {
      console.warn('[ExpoSecureStoreToken] load failed:', e);
      return null;
    }
  }

  /**
   * 持久化 token
   */
  async save(token: string): Promise<void> {
    try {
      await this.store.setItemAsync(this.key, token);
    } catch (e) {
      console.warn('[ExpoSecureStoreToken] save failed:', e);
    }
  }

  /**
   * 清除持久化的 token
   */
  async clear(): Promise<void> {
    try {
      await this.store.deleteItemAsync(this.key);
    } catch (e) {
      console.warn('[ExpoSecureStoreToken] clear failed:', e);
    }
  }
}
