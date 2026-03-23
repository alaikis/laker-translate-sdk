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
- 🔍 Automatic template extraction from text with numeric variables
- 🎯 Priority lookup: special → common → backend
- 🔐 JWT authentication support
- 📡 Server streaming for batch loading

## Usage

### TypeScript/JavaScript
```bash
npm install @laker/translation-sdk
```

```typescript
import TranslationClient, { TranslationPool } from '@laker/translation-sdk';

// Uses default endpoint https://api.hottol.com/laker/
const client = new TranslationClient();
client.setToken('your-jwt-token');

// Create translation pool for a specific sense
const pool = new TranslationPool(client, 'your-sense-id');

// Initialize - loads all common translations
await pool.initialize();

// Switch to a specific fingerprint
await pool.switchFingerprint('fingerprint-123');

// Lookup translation (follows priority rules)
const result = pool.lookup('Total Items');
if (result.found) {
  console.log(result.translation);
} else {
  // Request from backend, automatically added to common pool
  const response = await pool.requestTranslation('Total Items', 'en', 'zh');
  console.log(response.translatedText);
}

// Add special translation for current fingerprint
pool.addSpecialTranslation('Special Text', '特殊翻译结果');
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

## License

MIT
