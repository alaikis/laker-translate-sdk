/**
 * Alaikis Translation Service Flutter SDK
 * Persistent storage using Hive (alternative to IndexedDB in JS SDK)
 * Provides scalable persistent storage for translation cache
 */

import 'package:hive/hive.dart';

/// Cache entry for persistent storage
class TranslationCacheEntry {
  final String id;
  final String poolKey;
  final String text;
  final String translation;
  final String? srcLang;
  final String? dstLang;
  final int timestamp;
  final int? expiresAt;

  TranslationCacheEntry({
    required this.id,
    required this.poolKey,
    required this.text,
    required this.translation,
    this.srcLang,
    this.dstLang,
    required this.timestamp,
    this.expiresAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'poolKey': poolKey,
      'text': text,
      'translation': translation,
      'srcLang': srcLang,
      'dstLang': dstLang,
      'timestamp': timestamp,
      'expiresAt': expiresAt,
    };
  }

  factory TranslationCacheEntry.fromJson(Map<String, dynamic> json) {
    return TranslationCacheEntry(
      id: json['id'] as String,
      poolKey: json['poolKey'] as String,
      text: json['text'] as String,
      translation: json['translation'] as String,
      srcLang: json['srcLang'] as String?,
      dstLang: json['dstLang'] as String?,
      timestamp: json['timestamp'] as int,
      expiresAt: json['expiresAt'] as int?,
    );
  }
}

/// Hive-based persistent translation storage
/// This is the Flutter equivalent of IndexedDB in the JS SDK
class TranslationStorage {
  final String databaseName;
  final String storeName;
  Box? _box;
  bool _initialized = false;

  TranslationStorage({
    this.databaseName = 'laker_translation_cache',
    this.storeName = 'translations',
  });

  /// Check if initialized
  bool get isInitialized => _initialized;

  /// Initialize the storage
  Future<void> init() async {
    if (_initialized) return;
    if (_box != null) return;

    _box = await Hive.openBox(databaseName);
    _initialized = true;
  }

  /// Get a translation by pool key and text
  Future<TranslationCacheEntry?> get(String poolKey, String text) async {
    await init();
    final id = '$poolKey:$text';
    final data = _box!.get(id);
    if (data == null) return null;
    return TranslationCacheEntry.fromJson(Map<String, dynamic>.from(data));
  }

  /// Put a translation into storage
  Future<void> put(
    String poolKey,
    String text,
    String translation, {
    String? srcLang,
    String? dstLang,
    int? expiresAt,
  }) async {
    await init();
    final id = '$poolKey:$text';
    final entry = TranslationCacheEntry(
      id: id,
      poolKey: poolKey,
      text: text,
      translation: translation,
      srcLang: srcLang,
      dstLang: dstLang,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      expiresAt: expiresAt,
    );
    await _box!.put(id, entry.toJson());
  }

  /// Remove a translation from storage
  Future<void> remove(String poolKey, String text) async {
    await init();
    final id = '$poolKey:$text';
    await _box!.delete(id);
  }

  /// Clear all entries for a specific pool
  Future<void> clearPool(String poolKey) async {
    await init();
    final prefix = '$poolKey:';
    final keysToRemove = _box!.keys
        .where((key) => key.toString().startsWith(prefix))
        .toList();
    for (final key in keysToRemove) {
      await _box!.delete(key);
    }
  }

  /// Clear all storage
  Future<void> clearAll() async {
    await init();
    await _box!.clear();
  }

  /// Close the storage
  Future<void> close() async {
    if (_box != null && _box!.isOpen) {
      await _box!.close();
      _initialized = false;
    }
  }
}
