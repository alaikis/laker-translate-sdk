// 统一运行时环境探测模块
// 所有平台特性分支的唯一依据，支持测试注入

// Node.js 全局对象类型声明（浏览器环境无 @types/node）
declare const process: any;

export interface RuntimeEnv {
  isBrowser: boolean;
  isReactNative: boolean;
  isExpo: boolean;
  isNode: boolean;
  hasFetch: boolean;
  hasLocalStorage: boolean;
  hasIndexedDB: boolean;
  hasBroadcastChannel: boolean;
}

let cachedEnv: RuntimeEnv | null = null;

/**
 * 检测当前运行时环境
 * @param overrides 测试用覆盖字段，提供时不写入缓存
 */
export function detectEnvironment(overrides?: Partial<RuntimeEnv>): RuntimeEnv {
  if (cachedEnv && !overrides) return cachedEnv;

  const g: any = typeof globalThis !== 'undefined' ? globalThis : {};

  const isNode =
    typeof process !== 'undefined' && process.versions?.node !== undefined;
  const isReactNative =
    (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') ||
    g.__native !== undefined;
  const isExpo = isReactNative && g.__expo !== undefined;
  const isBrowser = typeof window !== 'undefined' && !isReactNative;

  const env: RuntimeEnv = {
    isBrowser,
    isReactNative,
    isExpo,
    isNode,
    hasFetch: typeof fetch === 'function',
    hasLocalStorage: typeof localStorage !== 'undefined',
    hasIndexedDB: typeof indexedDB !== 'undefined',
    hasBroadcastChannel: typeof BroadcastChannel !== 'undefined',
  };

  const result = { ...env, ...overrides };
  if (!overrides) cachedEnv = result;
  return result;
}

/**
 * 重置缓存（测试用）
 */
export function resetEnvCache(): void {
  cachedEnv = null;
}
