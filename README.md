# Laker Translation SDK
[![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/alaikis/laker-translate-sdk)](https://github.com/alaikis/laker-translate-sdk)
[![License](https://img.shields.io/github/license/alaikis/laker-translate-sdk)](https://github.com/alaikis/laker-translate-sdk/blob/main/LICENSE)

Laker Translation Service SDK for multiple programming languages.

## Supported Languages

- [TypeScript/JavaScript](./js/) - Browser and Node.js
- [Go](./go/) - Go language
- [PHP](./php/) - PHP language
- [Python](./python/) - Python language
- [Java](./java/) - Java language

## Features

- 🚀 gRPC-Web based streaming support
- 💾 Unified translation cache with fingerprint support
- 🔄 Optional cross-browser-tab cache synchronization (Broadcast Channel API + localStorage persistence)
- 🔍 Automatic template extraction from text with numeric variables
- 🎯 Smart lookup: fingerprint translations → common translations → backend
- 🔐 JWT authentication support
- 📡 Server streaming for batch loading
- 🎨 Clean high-level API with single entry point
- 🔍 **New:** Optional source language and target language filtering for `GetSenseTranslate`
- 📦 **Updated:** Unified response format - single `result` field for all translation requests

## Usage

 ### TypeScript/JavaScript
```bash
npm install @alaikis/translation-sdk
```

#### Simple Usage (Recommended - Single Entry Point)
```typescript
import { createTranslation, TranslationClient } from '@alaikis/translation-sdk';

// 👍 推荐: 最简单用法，省略 baseUrl 使用默认官方地址
// 自动启用缓存，自动预加载已存在翻译
const client = createTranslation(
  'your-jwt-token',
  'your-sense-id'
);

// 或者带自定义选项
const client = createTranslation(
  'your-jwt-token',
  'your-sense-id',
  { 
    fingerprint: 'user-123',    // Optional: 个性化翻译指纹
    crossTab: true,             // Optional: 启用跨标签页缓存同步
    cacheSize: 1000,            // Optional: LRU 缓存大小 (默认: 1000)
    useCache: true              // Optional: 启用缓存 (默认: true)
  }
);

// 或者完整配置方式
const client = new TranslationClient({
  token: 'your-jwt-token',
  senseId: 'your-sense-id',
  baseUrl: 'https://api.hottol.com/laker/', // Optional: 自定义地址，默认使用官方地址可省略
  fingerprint: 'user-123',  // Optional: 个性化翻译指纹
  crossTab: true,          // Optional: 启用跨标签页缓存同步
  cacheSize: 1000,         // Optional: LRU 缓存大小 (默认: 1000)
  llmCacheSize: 500,       // Optional: LLM 翻译缓存大小 (默认: 500)
  timeout: 30000           // Optional: 请求超时毫秒数 (默认: 30000)
});

// 简单翻译 - 自动初始化，自动缓存
// 查找优先级: 已有缓存翻译 → 后端请求
const result = await client.translate('Total Items', 'zh');
console.log(result); // "总共项数"

// 带详细信息的翻译
const detailResult = await client.translateWithDetails('Total Items', 'zh');
console.log(detailResult);
// { translatedText: "总共项数", cached: true, senseId: "..." }

// 不使用缓存翻译（总是从后端请求）
const freshResult = await client.translateNoCache('Total Items', 'zh');

// 批量翻译多个文本
const batchResult = await client.translateBatch(
  ['Total Items', 'Price', 'Name'], 
  'zh'
);
console.log(batchResult); // ["总共项数", "价格", "名称"]

// 切换指纹 - 自动加载对应个性化翻译
await client.setFingerprint('another-user');
const specialResult = await client.translate('Total Items', 'zh');

// 清除指纹，回到通用翻译
client.clearFingerprint();
const commonResult = await client.translate('Total Items', 'zh');

// 检查翻译是否已在缓存
if (client.hasTranslation('Hello')) {
  console.log(client.getCached('Hello'));
}

// 添加自定义翻译到缓存
client.addTranslation('Custom Text', '自定义文本');

// 预加载所有已有翻译（可选，用于预热）
await client.preload();

// 清除所有缓存
client.clearAllCache();

// 清理资源，不再使用时调用
client.destroy();
```

### Go
```go
package main

import (
    "github.com/alaikis/laker-translate-sdk/go"
)

func main() {
    client := translation.NewClient()
    client.SetToken("your-jwt-token")
    
    // ... use client
}
```

### PHP
```php
require 'vendor/autoload.php';

use Laker\Translation\Client;

$client = new Client();
$client->setToken("your-jwt-token");

// ... use client
```

## API Reference

### TranslationClient (Recommended)

**The only entry point.** All features included - translation caching, fingerprint support, cross-tab synchronization, streaming preloading.

**Design Principle:**
Laker is a translation platform. Frontend only needs a simple translate interface. If translation already exists in our platform, use it directly. If not, request backend LLM to translate it. No complex layering needed.

**Cache Behavior:**
- Cache is **enabled by default**
- Preloads all existing translations automatically
- Smart lookup: cached translations → existing platform translations → backend LLM

**Configuration:**

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `token` | string | Yes | JWT authentication token |
| `senseId` | string | Yes | Semantic sense ID |
| `baseUrl` | string | No | Custom API base URL, default: `https://api.hottol.com/laker/` |
| `fingerprint` | string | No | User fingerprint for personalized translations |
| `crossTab` | boolean | No | Enable cross-tab cache synchronization, default: `false` |
| `cacheSize` | number | No | Translation pool LRU cache size, default: `1000` |
| `llmCacheSize` | number | No | LLM translation LRU cache size, default: `500` |
| `timeout` | number | No | Request timeout in milliseconds, default: `30000` |

**Methods:**

| Method | Description |
|--------|-------------|
| `translate(text, toLang, fromLang?)` | Translate text with automatic caching, returns translated text string |
| `translateWithDetails(text, toLang, fromLang?)` | Translate with full response details, returns `{translatedText, cached}` |
| `translateNoCache(text, toLang, fromLang?)` | Translate without using cache, always request from backend |
| `translateBatch(texts[], toLang, fromLang?)` | Batch translate multiple texts |
| `setFingerprint(fingerprint)` | Switch fingerprint, reloads personalized translations |
| `clearFingerprint()` | Clear fingerprint, use common translations only |
| `hasTranslation(text)` | Check if translation exists in cache |
| `getCached(text)` | Get translation from cache without backend request |
| `addTranslation(text, translation)` | Add custom translation to cache |
| `preload()` | Preload all existing translations for current context (lazy init on first translate if not called) |
| `clearAllCache()` | Clear all cached translations |
| `destroy()` | Destroy instance, close broadcast channel and free resources |

**Low-level raw API methods (for advanced usage):**
- `getSenseTranslate(request)` - Direct GetSenseTranslate API call
- `llmTranslate(request)` - Direct LLMTranslate API call
- `llmTranslateStream(request, callback)` - Streaming LLM translation
- `translateStream(request, callback)` - Streaming batch translation preload
- `templateExtract(request)` - Template extraction API

### GetSenseTranslate (Raw API)

Direct API to get translations for a specific semantic sense.

**GetSenseTranslateRequest parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `senseId` | string | Yes | Semantic sense ID |
| `fingerprint` | string | No | If provided, returns only personalized translations for this fingerprint; if not provided, returns common translations |
| `page` | number | No | Page number for pagination (default: 1) |
| `pageSize` | number | No | Number of results per page (default: 50) |
| `src_lang` | string | No | **New in v1.1.0** - Filter results by source language |
| `dst_lang` | string | No | **New in v1.1.0** - Filter results by target language |

**GetSenseTranslateResponse format (v1.1.0+):**
| Field | Type | Description |
|-------|------|-------------|
| `senseId` | string | Semantic sense ID |
| `total` | number | Total number of matching translations |
| `page` | number | Current page number |
| `pageSize` | number | Current page size |
| `result` | TranslateRecord[] | Unified translation results - **no longer separates special/common results** |

> **Breaking Change Note (v1.1.0):** The response format has been unified. Previous versions returned `{special: [...], common: [...]}`, now all results are returned in the single `result` field based on whether a fingerprint was provided:
> - If fingerprint is provided: `result` contains personalized translations for that fingerprint
> - If no fingerprint: `result` contains common translations

## License

MIT
