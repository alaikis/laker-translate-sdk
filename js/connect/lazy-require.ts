// 惰性加载可选模块工具
// 用于 Expo SecureStore / AsyncStorage 等 optional 依赖
// 缺失时返回 null 并 warn 一次，调用方降级为内存实现

declare const require: ((id: string) => any) | undefined;

const warnedModules = new Set<string>();

/**
 * 惰性加载可选模块；模块不可用时返回 null 并 warn 一次
 * @param moduleName 模块名（如 '@react-native-async-storage/async-storage'）
 * @param label 用于 warn 日志的简短标签
 * @returns 模块实例；不可用时 null
 */
export function tryLazyRequire<T = unknown>(
  moduleName: string,
  label?: string
): T | null {
  const tag = label ?? moduleName;
  try {
    if (typeof require === 'function') {
      return require(moduleName) as T;
    }
    throw new Error(`require is not available in ESM context for '${moduleName}'`);
  } catch (e) {
    if (!warnedModules.has(tag)) {
      warnedModules.add(tag);
      console.warn(
        `[SDK] 可选模块 '${tag}' 不可用，降级为内存存储。` +
          ` 安装方式：npx expo install ${moduleName}`
      );
    }
    return null;
  }
}
