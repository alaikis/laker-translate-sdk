// Expo / React Native 专用入口
// 默认启用 native 行为：SecureStore + AsyncStorage + 禁用持久流/backgroundUpdate
// 导入此入口时自动设置 platform: 'expo'

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
 * 创建 Expo 平台 TranslationClient 实例
 * 自动设置 platform: 'expo'，启用 native 默认行为：
 * - SecureStore token 持久化（可选依赖）
 * - AsyncStorage 缓存持久化（可选依赖）
 * - 禁用持久流连接（移动端后台挂起后长连接无意义）
 * - 禁用 backgroundUpdate 定时器
 *
 * @example
 * ```typescript
 * import { createTranslation } from '@alaikis/translation-sdk/expo';
 *
 * const client = createTranslation({
 *   token: 'your-jwt-token',
 *   senseId: 'your-sense-id',
 * });
 *
 * const translated = await client.translate('Hello', 'zh');
 * ```
 */
export function createTranslation(
  options: Omit<TranslationClientOptions, 'platform'>
): TranslationClient {
  return new TranslationClient({
    ...options,
    platform: 'expo',
  } as TranslationClientOptions);
}

/**
 * 创建 Expo 平台 TranslationClient（显式配置版）
 * 允许用户覆盖 native 默认行为
 */
export function createTranslationNative(
  options: TranslationClientOptions & { platform: 'expo' }
): TranslationClient {
  return new TranslationClient(options);
}
