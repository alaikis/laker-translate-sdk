/**
 * Alaikis Translation Service Flutter SDK
 * Translation Pool - memory cache with persistent storage backing
 * Provides efficient cache lookup and preloading for offline usage
 */

import 'dart:collection';
import 'template.dart';
import 'storage.dart';

/// Translation pool entry
class TranslationEntry {
  final String text;
  final String translation;
  final bool isTemplate;
  final String? templateSrc;
  final String? templateDst;
  final List<String>? variables;
  final int timestamp;

  TranslationEntry({
    required this.text,
    required this.translation,
    this.isTemplate = false,
    this.templateSrc,
    this.templateDst,
    this.variables,
    required this.timestamp,
  });
}

/// Options for configuring TranslationPool
class TranslationPoolOptions {
  final String subscriptionId;
  final String scenarioId;
  final String defaultFromLang;
  final String defaultToLang;
  final int maxCacheSize;
  final bool enablePersistence;

  TranslationPoolOptions({
    required this.subscriptionId,
    required this.scenarioId,
    required this.defaultFromLang,
    required this.defaultToLang,
    this.maxCacheSize = 10000,
    this.enablePersistence = true,
  });

  /// Get the pool key for storage
  String get poolKey => '${subscriptionId}:${scenarioId}:${defaultFromLang}:${defaultToLang}';
}

/// TranslationPool manages in-memory cache with persistent storage backing
/// Similar to the JS SDK's TranslationPool
class TranslationPool {
  final TranslationPoolOptions options;
  final TranslationStorage? _storage;
  final LinkedHashMap<String, TranslationEntry> _cache = LinkedHashMap();
  bool _initialized = false;
  int _hits = 0;
  int _misses = 0;

  TranslationPool(this.options, [TranslationStorage? storage])
      : _storage = storage;

  /// Check if pool is initialized
  bool get isInitialized => _initialized;

  /// Get cache statistics
  Map<String, int> getStats() {
    return {
      'size': _cache.length,
      'maxSize': options.maxCacheSize,
      'hits': _hits,
      'misses': _misses,
    };
  }

  /// Get the cache key from text
  String _getPoolKey(String text) {
    return '${options.poolKey}:${text.trim()}';
  }

  /// Initialize the pool
  Future<void> init() async {
    if (_initialized) return;

    // Load from persistent storage if enabled
    if (options.enablePersistence && _storage != null) {
      // Storage is already initialized when needed
    }

    _initialized = true;
  }

  /// Lookup a translation synchronously from in-memory cache
  /// Returns null if not found in cache
  TranslationEntry? lookupSync(String text) {
    final key = _getPoolKey(text);
    final entry = _cache[key];
    if (entry != null) {
      _hits++;
      // Move to end (LRU)
      _cache.remove(key);
      _cache[key] = entry;
      return entry;
    }
    _misses++;
    return null;
  }

  /// Lookup a translation, checking memory then persistent storage
  Future<TranslationEntry?> lookup(String text) async {
    // Check memory cache first
    final syncResult = lookupSync(text);
    if (syncResult != null) {
      return syncResult;
    }

    // Check persistent storage
    if (options.enablePersistence && _storage != null) {
      final stored = await _storage!.get(options.poolKey, text);
      if (stored != null) {
        final entry = TranslationEntry(
          text: text,
          translation: stored.translation,
          timestamp: stored.timestamp,
        );
        _putToCache(_getPoolKey(text), entry);
        return entry;
      }
    }

    return null;
  }

  /// Put entry to in-memory cache with LRU eviction
  void _putToCache(String key, TranslationEntry entry) {
    if (_cache.length >= options.maxCacheSize) {
      // Remove first entry (LRU - least recently used)
      final oldestKey = _cache.keys.first;
      _cache.remove(oldestKey);
    }
    _cache[key] = entry;
  }

  /// Insert a translation into the pool
  Future<void> put(String text, String translation) async {
    final key = _getPoolKey(text);
    final extractResult = extractTemplate(text);
    final entry = TranslationEntry(
      text: text,
      translation: translation,
      isTemplate: extractResult.isTemplated,
      templateSrc: extractResult.isTemplated ? extractResult.srcTemplate : null,
      timestamp: DateTime.now().millisecondsSinceEpoch,
    );

    _putToCache(key, entry);

    // Persist to storage if enabled
    if (options.enablePersistence && _storage != null) {
      await _storage!.put(
        options.poolKey,
        text,
        translation,
        srcLang: options.defaultFromLang,
        dstLang: options.defaultToLang,
      );
    }
  }

  /// Remove entry from pool
  Future<void> remove(String text) async {
    final key = _getPoolKey(text);
    _cache.remove(key);

    if (options.enablePersistence && _storage != null) {
      await _storage!.remove(options.poolKey, text);
    }
  }

  /// Clear all entries
  Future<void> clear() async {
    _cache.clear();

    if (options.enablePersistence && _storage != null) {
      await _storage!.clearPool(options.poolKey);
    }
  }

  /// Preload translations from backend into cache
  /// Not implemented on client - backend preloads via bulk download
  void preload(List<Map<String, String>> entries) {
    for (final entry in entries) {
      final text = entry['text'];
      final translation = entry['translation'];
      if (text != null && translation != null) {
        final key = _getPoolKey(text);
        final cacheEntry = TranslationEntry(
          text: text,
          translation: translation,
          timestamp: DateTime.now().millisecondsSinceEpoch,
        );
        _putToCache(key, cacheEntry);
      }
    }
  }

  /// Translate with template merging if template matches
  /// Returns null if no translation found
  String? translate(String text) {
    final normalizedText = text.trim();

    // Check exact match first
    final exactEntry = lookupSync(normalizedText);
    if (exactEntry != null) {
      return exactEntry.translation;
    }

    // Check template match
    final extract = extractTemplate(normalizedText);
    if (extract.isTemplated) {
      // Lookup the template
      final templateEntry = lookupSync(extract.srcTemplate);
      if (templateEntry != null && templateEntry.isTemplate && templateEntry.templateDst != null) {
        // Create variable map from the original text's variables
        final Map<String, String> vars = {};
        for (var i = 0; i < extract.variables.length; i++) {
          vars['var${i + 1}'] = extract.variables[i];
        }
        // Merge the template
        return mergeTemplate(templateEntry.templateDst!, vars);
      }
    }

    return null;
  }

  /// Get current cache size
  int get size => _cache.length;
}
