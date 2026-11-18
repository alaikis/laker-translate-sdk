// Laker Translation Flutter SDK - 公共 API 入口
//
// 用法示例：
// ```dart
// import 'package:laker_translation/laker_translation.dart';
//
// const client = createTranslationClient(
//   'your-sense-id',
//   token: 'your-jwt-token',
// );
// final translated = await client.translate('Hello', 'zh');
// ```

export 'src/translation_client.dart'
    show
        TranslationClient,
        TranslationClientOptions,
        createTranslationClient;
export 'src/translation_pool.dart' show TranslationPool;
export 'src/template_utils.dart'
    show
        extractTemplate,
        mergeTemplate,
        TemplateExtractResult;
export 'src/storage/persistent_storage.dart'
    show
        PersistentStorage,
        CacheEntry;
export 'src/storage/memory_storage.dart' show MemoryStorage;
export 'src/storage/shared_prefs_storage.dart' show SharedPreferencesStorage;
export 'src/storage/hive_storage.dart' show HiveStorage, createHiveStorage;
export 'src/token_store.dart' show TokenStore;
