// Laker Translation Flutter SDK 主类
// 移动端禁用持久流与后台定时器，使用按需请求

import 'connect_client.dart';
import 'translation_pool.dart';
import 'storage/persistent_storage.dart';
import 'storage/shared_prefs_storage.dart';
import 'token_store.dart';

class TranslationClientOptions {
  final String senseId;
  final String? token;
  final String? baseUrl;
  final String? defaultFromLang;
  final PersistentStorage? storage;
  final TokenStore? tokenStore;
  final String? fingerprint;

  const TranslationClientOptions({
    required this.senseId,
    this.token,
    this.baseUrl = 'https://api.hottol.com/laker',
    this.defaultFromLang = 'en',
    this.storage,
    this.tokenStore,
    this.fingerprint,
  });
}

class TranslationClient {
  final TranslationClientOptions options;
  final ConnectClient _connect;
  final TranslationPool _pool;
  final String defaultFromLang;
  final String senseId;
  String? _currentFingerprint;
  String? _currentToLang;

  TranslationClient(TranslationClientOptions options)
      : options = options,
        _connect = ConnectClient(
          baseUrl: options.baseUrl ?? 'https://api.hottol.com/laker',
          token: options.token,
        ),
        _pool = TranslationPool(
          senseId: options.senseId,
          storage: options.storage ?? SharedPreferencesStorage(),
          currentFingerprint: options.fingerprint,
        ),
        defaultFromLang = options.defaultFromLang ?? 'en',
        senseId = options.senseId {
    _currentFingerprint = options.fingerprint;
  }

  /// 简单翻译（自动缓存 + 初始化）
  Future<String> translate(
    String text,
    String toLang, [
    String? fromLang,
    String? fingerprint,
  ]) async {
    final actualFromLang = fromLang ?? defaultFromLang;
    final actualFingerprint = fingerprint ?? _currentFingerprint ?? 'common';

    // 语言变更时自动加载
    if (_currentToLang != toLang) {
      _currentToLang = toLang;
      await _pool.loadLanguage(toLang, fingerprint: actualFingerprint);
    }

    // 查找缓存
    final cached = _pool.lookup(
      text,
      fingerprint: fingerprint ?? _currentFingerprint,
      toLang: toLang,
    );
    if (cached != null) return cached;

    // 请求后端
    final result = await _connect.llmTranslate(
      text: text,
      toLang: toLang,
      fromLang: actualFromLang,
      senseId: senseId,
      fingerprint: fingerprint != 'common' ? fingerprint : null,
    );

    final translated = result['translatedText'] as String? ?? text;
    _pool.addTranslation(text, translated, toLang: toLang);
    return translated;
  }

  /// 批量翻译
  Future<List<String>> translateBatch(
    List<String> texts,
    String toLang, [
    String? fromLang,
    String? fingerprint,
  ]) async {
    final results = <String>[];
    for (final text in texts) {
      results.add(await translate(text, toLang, fromLang, fingerprint));
    }
    return results;
  }

  /// 预加载指定语言的全部翻译
  Future<void> preload({String? fingerprint}) async {
    final toLang = _currentToLang ?? defaultFromLang;
    await _pool.loadLanguage(toLang, fingerprint: fingerprint ?? _currentFingerprint);
  }

  /// 切换 fingerprint
  Future<void> setFingerprint(String fingerprint) async {
    _currentFingerprint = fingerprint;
    await _pool.setFingerprint(fingerprint);
  }

  /// 清除 fingerprint
  void clearFingerprint() {
    _currentFingerprint = null;
    _pool.clearFingerprint();
  }

  /// 检查缓存
  bool hasTranslation(String text) {
    return _pool.lookup(text, toLang: _currentToLang ?? defaultFromLang) != null;
  }

  /// 获取缓存
  String? getCached(String text) {
    return _pool.lookup(text, toLang: _currentToLang ?? defaultFromLang);
  }

  /// 手动添加翻译
  void addTranslation(String text, String translation) {
    _pool.addTranslation(text, translation, toLang: _currentToLang ?? defaultFromLang);
  }

  /// 全量清除
  Future<void> clearAllCache() async {
    await _pool.clearAll();
  }
}

/// 便捷工厂：创建 TranslationClient
TranslationClient createTranslationClient(
  String senseId, {
  String? token,
  String? baseUrl,
  String? defaultFromLang,
  String? fingerprint,
  PersistentStorage? storage,
  TokenStore? tokenStore,
}) {
  return TranslationClient(TranslationClientOptions(
    senseId: senseId,
    token: token,
    baseUrl: baseUrl,
    defaultFromLang: defaultFromLang,
    fingerprint: fingerprint,
    storage: storage,
    tokenStore: tokenStore,
  ));
}
