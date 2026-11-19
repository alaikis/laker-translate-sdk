# Changelog

## 1.7.1 (2026-11-18)

### Patch
- 重新发布：1.7.0 因 npm 2FA 未完成未能发布，此版本为 1.7.0 的补丁发布
- 包含 1.7.0 全部内容（Expo + 原生 RN + Flutter 全平台兼容）

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
