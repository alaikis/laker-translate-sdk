# Alaikis Translation JS SDK

基于 Connect RPC 的 Alaikis 翻译服务 JavaScript/TypeScript 客户端 SDK。

支持浏览器和 Node.js 双环境，自动选择最佳传输实现。

## 特性

- ✅ 双环境支持：浏览器 (Fetch API) 和 Node.js (HTTP/2)
- ✅ TypeScript 原生支持，完整类型定义
- ✅ 原生流式传输支持，高效加载批量翻译
- ✅ 内置缓存池，支持跨标签页同步
- ✅ 支持后台自动更新过期翻译
- ✅ 模板提取工具，自动处理变量

## 安装

### npm 安装
```bash
npm install @alaikis/translation-sdk
```

### 浏览器直接使用
通过 CDN 或本地文件直接在 HTML 中使用：
```html
<script src="https://your-cdn/translation-client.iife.js"></script>
<script>
  // SDK 会自动导出到 window.LakerTranslation
  const { TranslationClient, extractTemplate } = window.LakerTranslation;
  
  // 创建客户端
  const client = new TranslationClient({
    senseId: 'your-sense-id',
    token: 'your-api-token',
  });
  
  // 使用提取模板
  const result = extractTemplate('Showing 123 results');
  console.log(result);
</script>
```

## 快速开始

### 基础使用

```typescript
import TranslationClient from 'alaikis-translation-sdk';

// 创建客户端
const client = new TranslationClient({
  senseId: 'your-sense-id',
  token: 'your-api-token', // 可选，认证令牌
  defaultFromLang: 'en',   // 可选，默认源语言
  baseUrl: 'https://api.hottol.com', // 可选，自定义 API 地址
});

// 简单翻译
const translated = await client.translate('Hello World', 'zh');
console.log(translated); // 你好，世界
```

### 预加载翻译池

```typescript
import { TranslationClient, TranslationPool } from 'alaikis-translation-sdk';

const client = new TranslationClient({
  senseId: 'your-sense-id',
  token: 'your-api-token',
});

// 创建翻译池
const pool = client.createPool('your-sense-id', {
  crossTab: {
    enabled: true, // 启用跨标签页缓存同步
  },
});

// 初始化目标语言
await pool.initialize('zh');

// 查询缓存
const result = pool.lookup('Hello World');
if (result.found) {
  console.log(result.translation);
}

// 获取缓存大小
console.log(`Cached translations: ${pool.getCacheSize()}`);
```

### 流式加载批量翻译

```typescript
// 流式加载整个 sense 的翻译
const stream = client.translateStream('your-sense-id', 'zh');
for await (const response of stream) {
  for (const [text, translation] of Object.entries(response.translation)) {
    console.log(text, '=>', translation);
  }
}
```

### 模板提取

当文本包含数字变量时，可以提取模板进行翻译：

```typescript
import { extractTemplate } from 'alaikis-translation-sdk';

const result = extractTemplate('There are 123 apples and 45.6 oranges');
console.log(result);
// {
//   isTemplated: true,
//   srcTemplate: "There are {var1} apples and {var2} oranges",
//   variables: ["123", "45.6"]
// }
```

## 配置选项

### TranslationClientOptions

| 选项 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `senseId` | string | ✅ | 语义 ID |
| `baseUrl` | string | ❌ | API 基础 URL，默认 `https://api.hottol.com` |
| `defaultFromLang` | string | ❌ | 默认源语言，默认 `en` |
| `token` | string | ❌ | API 访问令牌 |
| `crossTab` | CrossTabOptions | ❌ | 跨标签页同步选项 |
| `backgroundUpdate` | BackgroundUpdateOptions | ❌ | 后台更新选项 |

### CrossTabOptions

| 选项 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `enabled` | boolean | `false` | 是否启用跨标签同步 |
| `channelName` | string | `'laker-translation-cache'` | BroadcastChannel 名称 |
| `storageKeyPrefix` | string | `'laker_translation_'` | localStorage 键前缀 |

### BackgroundUpdateOptions

| 选项 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `enabled` | boolean | `false` | 是否启用后台更新 |
| `intervalMs` | number | `300000` (5分钟) | 更新检查间隔 |
| `batchSize` | number | `50` | 每次更新批次大小 |
| `staleThresholdMs` | number | `86400000` (24小时) | 过期阈值 |

## API 参考

### TranslationClient

| 方法 | 说明 |
|------|------|
| `constructor(options)` | 创建客户端实例 |
| `translate(text, toLang, fromLang?, fingerprint?)` | 简单翻译，自动处理缓存和初始化 |
| `translateWithDetails(text, toLang, fromLang?, fingerprint?)` | 直接调用 API，返回完整响应 |
| `translateStream(senseId, dstLang, fingerprint?)` | 流式批量获取翻译 |
| `getSenseTranslations(options)` | 分页获取翻译列表 |
| `createPool(senseId, options?)` | 创建翻译池 |
| `getClient()` | 获取底层 Connect RPC 客户端 |
| `getSenseInfo()` | 获取当前 Sense 信息 |

### TranslationPool

| 方法 | 说明 |
|------|------|
| `constructor(client, senseId, options?)` | 创建池实例 |
| `initialize(toLang)` | 初始化目标语言，加载全部翻译 |
| `lookup(text, fingerprint?, toLang?)` | 查找缓存 |
| `addTranslation(text, translation)` | 添加翻译到当前指纹 |
| `addTranslationToFingerprint(text, translation, fingerprint, toLang)` | 添加翻译到指定指纹 |
| `put(text, fingerprint, translation, toLang)` | 别名，便捷添加 |
| `addPreloadedTranslations(preloaded)` | 添加预加载翻译 |
| `getCacheSize(fingerprint?, toLang?)` | 获取缓存大小 |
| `getAllForFingerprint(fingerprint, toLang)` | 获取指定指纹全部翻译 |
| `isLanguageLoaded(fingerprint, toLang?)` | 检查语言是否已加载 |
| `clearFingerprint(fingerprint)` | 清除指定指纹缓存 |
| `clearAll()` | 清除全部缓存 |
| `setCurrentFingerprint(fingerprint, toLang?)` | 设置当前活动指纹，自动加载 |
| `getCurrentFingerprint()` | 获取当前指纹 |
| `queueTranslationRequest(request)` | 排队请求翻译 |
| `processQueuedRequests()` | 处理排队请求 |
| `hasQueuedRequests()` | 检查是否有排队请求 |
| `clearQueuedRequests()` | 清空排队 |
| `isLoading()` | 检查是否正在加载 |

## 环境支持

- **浏览器**: 使用 `@connectrpc/connect-web`，基于 Fetch API
- **Node.js**: 使用 `@connectrpc/connect-node`，基于 HTTP/2

SDK 会自动检测环境并选择合适的传输层，无需手动配置。

## 构建

```bash
# 安装依赖
npm install

# 编译
npm run build

# 检查导出
npm run check
```

## 许可证

MIT