// 原生 React Native 专用入口
// 用于非 Expo 的原生 RN 项目（直接安装 @react-native-async-storage/async-storage）
// 运行时行为与 ./expo 入口一致（platform: 'expo'），但文档强调区分

import {
  TranslationClient,
  TranslationPool,
  extractTemplate,
  mergeTemplate,
  version,
} from '../translation-client';
import type { TranslationClientOptions } from '../translation-client';

export {
  TranslationClient,
  TranslationPool,
  extractTemplate,
  mergeTemplate,
  version,
};
export type { TranslationClientOptions };

/**
 * 创建原生 React Native 平台 TranslationClient 实例
 * 自动设置 platform: 'expo'（复用 native 默认行为），适用于非 Expo 的原生 RN 项目。
 *
 * 与 Expo 的差异：
 * - 原生 RN 无 Expo.Constants，detectEnvironment 仅识别 isReactNative
 * - 缓存持久化使用 @react-native-async-storage/async-storage（需手动安装）
 * - Token 持久化可选使用 expo-secure-store 或自定义 SecureStore 实现
 *
 * @example
 * ```typescript
 * import { createTranslationRN } from '@alaikis/translation-sdk/rn';
 *
 * const client = createTranslationRN({
 *   token: 'your-jwt-token',
 *   senseId: 'your-sense-id',
 * });
 *
 * const translated = await client.translate('Hello', 'zh');
 * ```
 */
export function createTranslationRN(
  options: Omit<TranslationClientOptions, 'platform'>
): TranslationClient {
  return new TranslationClient({
    ...options,
    platform: 'expo',
  } as TranslationClientOptions);
}
