/**
 * Alaikis Translation Service Flutter SDK
 * Translation Client - gRPC client for connecting to api.laker.dev backend
 * Provides translation services with local translation pool caching
 */

import 'dart:async';
import 'package:grpc/grpc.dart';
import './proto/translation.pbgrpc.dart';
import 'pool.dart';
import 'storage.dart';
import 'template.dart';

/// Client configuration options
class TranslationClientOptions {
  final String serverUrl;
  final int port;
  final bool useTls;
  final String subscriptionId;
  final String scenarioId;
  final String defaultFromLang;
  final String defaultToLang;
  final int maxCacheSize;
  final bool enablePersistence;

  TranslationClientOptions({
    required this.serverUrl,
    this.port = 443,
    this.useTls = true,
    required this.subscriptionId,
    required this.scenarioId,
    required this.defaultFromLang,
    required this.defaultToLang,
    this.maxCacheSize = 10000,
    this.enablePersistence = true,
  });
}

/// Translation result
class TranslationResult {
  final String text;
  final String translation;
  final bool fromCache;
  final bool fromTemplate;

  TranslationResult({
    required this.text,
    required this.translation,
    this.fromCache = false,
    this.fromTemplate = false,
  });
}

/// Alaikis Translation Service Client
/// Combines gRPC backend calls with local translation pool caching
class TranslationClient {
  final TranslationClientOptions options;
  final TranslationStorage? _storage;
  final TranslationPool _pool;
  ClientChannel? _channel;
  TranslationServiceClient? _stub;
  bool _initialized = false;

  TranslationClient(this.options)
      : _storage = options.enablePersistence ? TranslationStorage() : null,
        _pool = TranslationPool(
          TranslationPoolOptions(
            subscriptionId: options.subscriptionId,
            scenarioId: options.scenarioId,
            defaultFromLang: options.defaultFromLang,
            defaultToLang: options.defaultToLang,
            maxCacheSize: options.maxCacheSize,
            enablePersistence: options.enablePersistence,
          ),
          options.enablePersistence ? TranslationStorage() : null,
        );

  /// Check if client is initialized
  bool get isInitialized => _initialized;

  /// Get the translation pool
  TranslationPool get pool => _pool;

  /// Initialize the client
  Future<void> init() async {
    if (_initialized) return;

    // Create gRPC channel
    _channel = ClientChannel(
      options.serverUrl,
      port: options.port,
      options: ChannelOptions(
        credentials: options.useTls
            ? const ChannelCredentials.secure()
            : const ChannelCredentials.insecure(),
      ),
    );
    _stub = TranslationServiceClient(_channel!);

    // Initialize storage and pool
    if (_storage != null) {
      await _storage!.init();
    }
    await _pool.init();

    _initialized = true;
  }

  /// Shutdown the client
  Future<void> shutdown() async {
    if (_channel != null) {
      await _channel!.shutdown();
    }
    if (_storage != null) {
      await _storage!.close();
    }
    _initialized = false;
  }

  /// Synchronous lookup from local cache only
  /// Returns null if not found in cache
  String? lookupSync(String text) {
    return _pool.translate(text.trim());
  }

  /// Translate a single text using LLM unary RPC
  /// Checks local cache first, then falls back to backend
  Future<TranslationResult> translate(String text,
      {String? fromLang, String? toLang}) async {
    await init();
    final normalizedText = text.trim();
    final from = fromLang ?? options.defaultFromLang;
    final to = toLang ?? options.defaultToLang;

    // Check local cache/pool first
    final cached = _pool.translate(normalizedText);
    if (cached != null) {
      return TranslationResult(
        text: normalizedText,
        translation: cached,
        fromCache: true,
      );
    }

    // Request from backend using LLMTranslate
    final request = LLMTranslateRequest()
      ..text = normalizedText
      ..fromLang = from
      ..toLang = to;

    final response = await _stub!.lLMTranslate(request);

    final translation = response.translation;

    // Save to local pool
    await _pool.put(normalizedText, translation);

    // Check if this is a template match on the fly
    final extract = extractTemplate(normalizedText);
    final isTemplate = extract.isTemplated &&
        _pool.lookupSync(extract.srcTemplate) != null;

    return TranslationResult(
      text: normalizedText,
      translation: translation,
      fromCache: false,
      fromTemplate: isTemplate,
    );
  }

  /// Stream translated text (server streaming)
  /// Used for progressive translation output and bulk translation
  /// Automatically saves results to local cache
  Stream<TranslationResult> translateStream(
    List<String> texts, {
    String? fromLang,
    String? toLang,
    bool persistent = false,
  }) {
    final from = fromLang ?? options.defaultFromLang;
    final to = toLang ?? options.defaultToLang;

    // Check cache first and collect misses
    final Map<String, String?> cachedResults = {};
    final List<String> misses = [];

    for (final text in texts) {
      final normalizedText = text.trim();
      final cached = _pool.translate(normalizedText);
      cachedResults[normalizedText] = cached;
      if (cached == null) {
        misses.add(normalizedText);
      }
    }

    // If all cached, return immediately
    if (misses.isEmpty) {
      return Stream.fromIterable(cachedResults.entries.map((entry) =>
          TranslationResult(
            text: entry.key,
            translation: entry.value!,
            fromCache: true,
          )));
    }

    // Create streaming request with all misses
    final request = TranslateStreamRequest()
      ..text = misses.first // for backward compatibility, send first text
      ..srcLang = from
      ..dstLang = to
      ..persistent = persistent
      ..texts.addAll(misses.map((t) => TextRequest()..text = t));

    final stream = _stub!.translateStream(request);

    // Save translations to cache as they come in
    return stream.map((response) {
      final String text = response.originalText;
      final String translation = response.translation.values.first;
      // Save to cache asynchronously - don't wait
      _pool.put(text, translation);
      return TranslationResult(
        text: text,
        translation: translation,
        fromCache: false,
      );
    });
  }

  /// Get a single translation via streaming (convenience method)
  Future<TranslationResult> translateSingleStream(String text,
      {String? fromLang, String? toLang}) async {
    return await translateStream([text], fromLang: fromLang, toLang: toLang)
        .first;
  }

  /// Preload bulk translations into the cache
  void preload(List<Map<String, String>> entries) {
    _pool.preload(entries);
  }

  /// Clear all cached translations
  Future<void> clearCache() async {
    await _pool.clear();
  }

  /// Get cache statistics
  Map<String, int> getCacheStats() {
    return _pool.getStats();
  }
}
