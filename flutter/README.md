# Alaikis Translation Flutter SDK

Flutter plugin for Alaikis Translation Service - provides offline translation pool caching and connects to api.laker.dev translation service.

## Features

- 🚀 **Offline Translation Pool** - Preload translations for offline use, just like JS SDK
- 🎯 **Automatic Template Extraction** - Extract templates from text containing numeric variables to save LLM quota
- 💾 **Persistent Storage** - Uses Hive for fast persistent local storage (alternative to IndexedDB in browsers)
- 🔌 **ConnectRPC/gRPC Support** - Supports server streaming and bidirectional streaming
- 📱 **Cross Platform** - Works on Android, iOS, Web
- 🌐 **Same Architecture as JS SDK** - Same translation pooling logic, same template extraction algorithm

## Installation

Add this to your package's pubspec.yaml file:

```yaml
dependencies:
  alaikis_translation_flutter: ^1.6.148
```

## Usage

### Basic Usage

```dart
import 'package:alaikis_translation_flutter/alaikis_translation_flutter.dart';

// Create client
final client = TranslationClient(
  baseUrl: 'https://api.laker.dev',
);

// Initialize translation pool for a specific sense
final pool = TranslationPool(
  client: client,
  senseId: 'your-sense-id',
  options: TranslationPoolOptions(
    defaultFromLang: 'en',
    usePersistentStorage: true,
  ),
);

// Initialize the pool (loads from local storage)
await pool.initialize();

// Lookup translation
final translation = pool.lookup('Hello World', toLang: 'zh');
if (translation != null) {
  print('Translation: $translation');
} else {
  // Not in cache, will be fetched from server via streaming
}

// Translate via LLM directly
final response = await client.llmTranslate(
  text: 'Hello World',
  fromLang: 'en',
  toLang: 'zh',
  senseId: 'your-sense-id',
);
print('LLM Translation: ${response.translation}');
```

### Template Extraction

The SDK automatically extracts templates from text containing numeric variables:

```dart
final result = extractTemplate('Item $count selected');
if (result.isTemplated) {
  print('Template: ${result.srcTemplate}'); // "Item {var1} selected"
  print('Variables: ${result.variables}'); // ["$count"]
}

// Merge template with variables
final merged = mergeTemplate('Item {var1} selected', {'var1': '5'});
print('Merged: $merged'); // "Item 5 selected"
```

### Streaming Translation

```dart
final stream = client.translateStream(TranslateStreamRequest(
  senseId: 'your-sense-id',
  dstLang: 'zh',
  persistent: true,
));

await for (final response in stream) {
  for (final entry in response.translation.entries) {
    print('${entry.key}: ${entry.value}');
  }
}
```

## Architecture

This Flutter plugin follows the same architecture as the [JS SDK](https://www.npmjs.com/package/alaikis-translation-sdk):

1. **Translation Pool** - In-memory cache with persistent storage backing
2. **Template Extraction** - Automatic template extraction from numeric variables
3. **Streaming** - Server streaming for real-time translation results
4. **Cross-tab Synchronization** - (Planned) BroadcastChannel equivalent for web

## Requirements

- Flutter 3.10.0 or higher
- Dart 3.0.0 or higher

## License

MIT
