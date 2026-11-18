# Changelog

## 0.1.0 (2026-11-18)

### Added

- 首个 Flutter Dart 包版本
- `TranslationClient` 主类：`translate` / `translateBatch` / `preload` / `setFingerprint` / `clearFingerprint` / `hasTranslation` / `getCached` / `addTranslation` / `clearAllCache`
- `TranslationPool` 多指纹多语言缓存池，查找优先级：fingerprint → common → 未命中
- `PersistentStorage` 抽象 + `MemoryStorage` / `SharedPreferencesStorage` / `HiveStorage`
- `TokenStore`（`flutter_secure_storage` 封装，可选）
- `extractTemplate` / `mergeTemplate` 模板工具
- 移动端禁用持久流与后台定时器
