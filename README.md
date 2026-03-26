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

## Usage

### TypeScript/JavaScript
```bash
npm install @laker/translation-sdk
```

#### App-Level API (Recommended - Single Entry Point)
```typescript
import { AppTranslation, createTranslation } from '@laker/translation-sdk';

// Simple creation with minimal config
// Cache is enabled by default
const appTranslate = createTranslation(
  'your-jwt-token',
  'your-sense-id',
  { baseUrl: 'https://api.hottol.com/laker/' }
);

// Or use full config
const appTranslate = new AppTranslation({
  token: 'your-jwt-token',
  senseId: 'your-sense-id',
  baseUrl: 'https://api.hottol.com/laker/',
  fingerprint: 'user-123',  // Optional: for personalized translations
  crossTab: true,          // Optional: enable cross-tab cache sharing
  cacheSize: 1000,         // Optional: LRU cache size (default: 1000)
  useCache: true           // Optional: enable cache (default: true, set false to disable)
});

// Simple translation - auto-initializes, auto-caches
const result = await appTranslate.translate('Total Items', 'zh');
console.log(result);

// Translate without cache (always request from backend)
const freshResult = await appTranslate.translateNoCache('Total Items', 'zh');

// Switch fingerprint - auto-loads special translations
await appTranslate.setFingerprint('another-user');
const specialResult = await appTranslate.translate('Total Items', 'zh');

// Check if cache is enabled
if (appTranslate.isCacheEnabled()) {
  // Check cache
  if (appTranslate.hasTranslation('Hello')) {
    console.log(appTranslate.getCached('Hello'));
  }
  
  // Add custom translation
  appTranslate.addTranslation('Custom Text', '自定义文本');
}

// Preload all translations (optional, for warm-up)
await appTranslate.preload();

// Clean up when done
appTranslate.destroy();
```

#### Advanced Usage (TranslationService)
```typescript
import { TranslationService } from '@laker/translation-sdk';

// Create translation service for a specific sense
const service = new TranslationService('https://api.hottol.com/laker/', {
  senseId: 'your-sense-id',
  fingerprint: 'fingerprint-123', // Optional: for personalized translations
  crossTab: true, // Optional: enable cross-tab cache sharing
});

// Simple usage - just call translate(), initialization is automatic (lazy)
const result = await service.translate('Total Items', 'zh', 'en');
console.log(result.translatedText);
console.log('From cache:', result.cached);

// Optional: Explicitly initialize to preload all translations upfront
// await service.initialize();

// Lookup translation directly in cache
const lookupResult = service.lookup('Total Items');
if (lookupResult.found) {
  console.log(lookupResult.translation);
}

// Add custom translation
service.addCustomTranslation('Special Text', '特殊翻译结果');

// Switch to a different fingerprint (for personalized translations)
await service.switchFingerprint('another-fingerprint');

// Direct translation (bypasses cache, always request from backend)
const directResult = await service.translateDirect('One-off translation', 'zh', 'en');

// Clean up when done
service.destroy();
```

> **Note**: `TranslationService` supports lazy initialization - just call `translate()` and it will automatically initialize on first use. Streaming batch loading is used for efficient initialization.

#### Low-level Usage (direct gRPC-Web client access)
```typescript
import TranslationClient from '@laker/translation-sdk';

// Uses default endpoint https://api.hottol.com/laker/
// Default LRU cache size is 1000 entries, set to 0 to disable
const client = new TranslationClient(
  'https://api.hottol.com/laker/',
  '',  // token (set later)
  30000, // timeout
  1000,  // cache size
  { enabled: true } // enable cross-tab sync (optional)
);
client.setToken('your-jwt-token');

// LLM translation request with automatic LRU caching
const response = await client.llmTranslate({
  text: 'Hello World',
  fromLang: 'en',
  toLang: 'zh',
  senseId: 'your-sense-id'
});
console.log(response.translatedText);
console.log('From cache:', response.cached);

// Server streaming translation batch load
await client.translateStream(
  { senseId: 'your-sense-id', batchSize: 100 },
  (batch) => {
    console.log(`Received batch ${batch.batch}, ${batch.translations.length} translations`);
    return true; // Return false to stop streaming early
  }
);

// Clean up when done
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

### AppTranslation (Recommended)

The simplest way to use the SDK. Single entry point with automatic initialization and intelligent caching.

**Cache Behavior:**
- Cache is **enabled by default**
- Set `useCache: false` in config to disable all caching
- When cache is disabled, all operations bypass cache and always request from backend

| Method | Description |
|--------|-------------|
| `translate(text, toLang, fromLang?)` | Translate text with automatic caching |
| `translateWithDetails(text, toLang, fromLang?)` | Translate with full response details |
| `translateNoCache(text, toLang, fromLang?)` | Translate without using cache |
| `translateBatch(texts[], toLang, fromLang?)` | Batch translate multiple texts |
| `setFingerprint(fingerprint)` | Switch fingerprint, auto-loads special translations |
| `clearFingerprint()` | Clear fingerprint, fall back to common translations |
| `isCacheEnabled()` | Check if cache is enabled |
| `hasTranslation(text)` | Check if translation exists in cache |
| `getCached(text)` | Get translation from cache without backend request |
| `addTranslation(text, translation)` | Add custom translation to cache |
| `preload()` | Preload all translations for current context |
| `isInitialized()` | Check if service is initialized |
| `clearCache()` | Clear all cached translations |
| `destroy()` | Destroy instance and free resources |

## License

MIT
