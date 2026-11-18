# Changelog

## 1.7.0

### Added

- 新增 `./expo` 子路径导出（`native/index.ts`），支持 `import { createTranslation } from '@alaikis/translation-sdk/expo'`
- 新增 `./rn` 子路径导出（`rn/index.ts`），支持原生 React Native 项目 `import { createTranslationRN } from '@alaikis/translation-sdk/rn'`
- 新增 `platform: 'expo'` 配置选项，启用 native 默认行为（SecureStore + AsyncStorage + 禁用持久流/backgroundUpdate）
- 新增 `PersistentStorage` 抽象（`MemoryStorage` / `LocalStorageAdapter` / `AsyncStorageAdapter` / `ExpoSecureStoreToken`）
- 新增 `env.ts` 统一运行时探测模块（`detectEnvironment()`）
- 可选依赖：`expo-secure-store`（token 持久化）、`@react-native-async-storage/async-storage`（缓存持久化），均为 `optionalDependencies`

### Changed

- 移动端（RN/Expo）自动禁用持久流连接与 `backgroundUpdate` 定时器
- `BroadcastChannel` 缺失时跨标签同步静默关闭
- 版本号 1.6.150 → 1.7.0

## 1.6.150

- Fix: `global` and `require` type declarations in `translation-client.ts` — the React Native / Node.js environment-detection block now compiles under a consumer's strict TypeScript config (no more "Cannot find name 'global'" / "Cannot find name 'require'" errors when the SDK's `.ts` source is type-checked).
- Fix: `TranslateStreamResponse.fromJson` / `TranslateStreamRequest.fromJson` argument type assertions — partial object literals now cast through `unknown` to satisfy the generated-code `JsonValue` parameter type.
- Fix: `urlRewriteInterceptor` now typed as `Interceptor` (previously implicit `any` parameters).
- Fix: `persistentStreamWriter` null-invocation now uses the non-null assertion (`!`) to reflect the established post-guard invariant.

## 1.6.149

- (baseline published to npm registry)
