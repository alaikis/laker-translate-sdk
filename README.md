# Laker Translation SDK
[![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/alaikis/laker-translate-sdk)](https://github.com/alaikis/laker-translate-sdk)
[![License](https://img.shields.io/github/license/alaikis/laker-translate-sdk)](https://github.com/alaikis/laker-translate-sdk/blob/main/LICENSE)

Laker Translation Service SDK for multiple programming languages.

## Supported Languages

- [TypeScript/JavaScript](./js/) - Browser and Node.js
- [Go](./go/) - Go language
- [PHP](./php/) - PHP language

## Features

- 🚀 gRPC-Web based streaming support
- 💾 Two-level translation cache (common + fingerprint-specific)
- 🔄 Optional cross-browser-tab cache synchronization (Broadcast Channel API + localStorage persistence)
- 🔍 Automatic template extraction from text with numeric variables
- 🎯 Priority lookup: special → common → backend
- 🔐 JWT authentication support
- 📡 Server streaming for batch loading
- 🎨 Clean high-level API with optional low-level client access

## Usage

### TypeScript/JavaScript
```bash
npm install @laker/translation-sdk
```

#### Basic Usage (Recommended - with automatic caching)
```typescript
import { TranslationService } from '@laker/translation-sdk';

// Create translation service for a specific sense
// Enable cross-tab cache synchronization with crossTab: true
const service = new TranslationService('https://api.hottol.com/laker/', {
  senseId: 'your-sense-id',
  fingerprint: 'fingerprint-123', // Optional: for personalized translations
  crossTab: true, // Optional: enable cross-tab cache sharing
});

// Set your JWT authentication token
// If you create TranslationClient manually: client.setToken('your-jwt-token');

// Simple usage - just call translate(), initialization is automatic (lazy)
const result = await service.translate('Total Items', 'zh', 'en');
console.log(result.translatedText);
console.log('From cache:', result.cached);

// Optional: Explicitly initialize to preload all translations upfront
// This is useful if you want to load everything at app startup
// await service.initialize();

// Lookup translation directly in cache
const lookupResult = service.lookup('Total Items');
if (lookupResult.found) {
  console.log(lookupResult.translation);
}

// Add custom translation to current fingerprint
service.addCustomTranslation('Special Text', '特殊翻译结果');

// Switch to a different fingerprint (for personalized translations)
await service.switchFingerprint('another-fingerprint');

// Direct translation (bypasses cache, always request from backend)
const directResult = await service.translateDirect('One-off translation', 'zh', 'en');

// Clean up when done
service.destroy();
```

> **Note**: `TranslationService` now supports lazy initialization - just call `translate()` and it will automatically initialize on first use. You can still call `initialize()` explicitly if you want to preload all translations at app startup.

#### Low-level Usage (direct gRPC-Web client access)
```typescript
import TranslationClient from '@laker/translation-sdk';

// Uses default endpoint https://api.hottol.com/laker/
// Default LRU cache size is 1000 entries, set to 0 to disable
// Enable cross-tab sync with crossTabOptions
const client = new TranslationClient(
  'https://api.hottol.com/laker/',
  '',  // token (set later)
  30000, // timeout
  1000,  // cache size
  { enabled: true } // enable cross-tab sync (optional)
);
client.setToken('your-jwt-token');

// LLM translation request with automatic LRU caching
// Same request will return cached result on subsequent calls
// With cross-tab enabled, cache is synced across browser tabs
const response = await client.llmTranslate({
  text: 'Hello World',
  fromLang: 'en',
  toLang: 'zh',
  senseId: 'your-sense-id'
});
console.log(response.translatedText);
console.log('From cache:', response.cached); // true if from cache

// Skip cache and force request from backend
const freshResponse = await client.llmTranslate({
  text: 'Hello World',
  fromLang: 'en',
  toLang: 'zh',
  senseId: 'your-sense-id'
}, true); // second parameter skips cache

// Cache management
client.clearCache(); // Clear all cached translations (also clears localStorage and broadcasts to other tabs)
client.setCacheEnabled(false); // Disable cache
console.log('Cache size:', client.getCacheSize());
console.log('Cross-tab enabled:', client.isCrossTabEnabled());

// Clean up when done (closes broadcast channel)
client.destroy();

// Server streaming translation batch load (not cached)
await client.translateStream(
  { senseId: 'your-sense-id', batchSize: 100 },
  (batch) => {
    console.log(`Received batch ${batch.batch}, ${batch.translations.length} translations`);
    return true; // Return false to stop streaming early
  }
);
```

> **Note**: `TranslationClient` now includes LRU cache with optional Broadcast Channel + localStorage synchronization for cross-tab cache sharing. For advanced features like two-level caching (common + fingerprint) with sense/fingerprint management, use `TranslationService`.

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

## License

MIT
