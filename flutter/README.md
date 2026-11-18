# Laker Translation Flutter SDK

基于 Connect RPC 的 Laker 翻译服务 Flutter/Dart 客户端 SDK。

## 特性

- ✅ 与 JS SDK 对齐的 API（`translate` / `translateBatch` / `preload` / `setFingerprint`）
- ✅ 多指纹多语言缓存池
- ✅ 可选持久化：`shared_preferences`（默认）/ `hive`（大缓存）
- ✅ Token 安全持久化：`flutter_secure_storage`（可选）
- ✅ 移动端平台条件：禁用持久流与后台定时器
- ✅ 模板提取工具（`extractTemplate` / `mergeTemplate`）

## 安装

```yaml
# pubspec.yaml
dependencies:
  laker_translation:
    path: ../flutter  # 或发布后的 pub.dev 包
```

可选依赖（按需安装）：

```yaml
  hive: ^2.2.3                  # 大缓存场景
  flutter_secure_storage: ^9.0.0  # Token 安全持久化
```

## 使用

```dart
import 'package:laker_translation/laker_translation.dart';

void main() async {
  final client = createTranslationClient(
    'your-sense-id',
    token: 'your-jwt-token',
    defaultFromLang: 'en',
  );

  final translated = await client.translate('Hello World', 'zh');
  print(translated); // 你好，世界

  // 批量翻译
  final batch = await client.translateBatch(['Price', 'Name'], 'zh');
  print(batch); // [价格, 名称]

  // 切换指纹
  await client.setFingerprint('user-123');
  final special = await client.translate('Hello World', 'zh');
  print(special);
}
```

## 缓存持久化

默认使用 `shared_preferences` 持久化翻译缓存。大缓存场景（>1MB）建议改用 `hive`：

```dart
import 'package:laker_translation/laker_translation.dart';

final storage = await createHiveStorage();
final client = createTranslationClient(
  'your-sense-id',
  token: 'your-jwt-token',
  storage: storage,
);
```

## Token 持久化

使用 `flutter_secure_storage` 安全持久化 token：

```dart
final tokenStore = TokenStore();
await tokenStore.save('your-jwt-token');
final token = await tokenStore.load();
```

## 离线限制

移动端应用进入后台后系统挂起所有 Dart 任务。SDK 默认禁用：
- 持久流连接（后台挂起后长连接无意义）
- 后台更新定时器

重新进入前台后调用 `client.preload()` 刷新缓存。

## 最低版本要求

- Flutter >= 3.10
- Dart >= 3.0

## 许可证

MIT
