// 多指纹多语言翻译缓存池（Dart 版）
// 查找优先级：指定 fingerprint → 当前 fingerprint → common → 未命中

import 'storage/persistent_storage.dart';

class TranslationPool {
  final String senseId;
  String? currentFingerprint;
  String? currentToLang;
  final PersistentStorage storage;

  /// poolKey: "fingerprint:toLang" → Map<text, translation>
  final Map<String, Map<String, String>> _pools = {};
  final Set<String> _loadedCombinations = {};

  TranslationPool({
    required this.senseId,
    required this.storage,
    this.currentFingerprint,
  });

  String _poolKey(String fingerprint, String toLang) => '$fingerprint:$toLang';

  /// 加载指定语言池（从 storage 或后端）
  Future<void> loadLanguage(String toLang, {String? fingerprint}) async {
    currentToLang = toLang;

    // 先加载 common
    if (!_loadedCombinations.contains(_poolKey('common', toLang))) {
      final commonPool = await _loadFromStorage('common', toLang);
      _pools[_poolKey('common', toLang)] = commonPool;
      _loadedCombinations.add(_poolKey('common', toLang));
    }

    // 再加载指定 fingerprint（若有）
    final fp = fingerprint ?? currentFingerprint;
    if (fp != null && fp.isNotEmpty) {
      if (!_loadedCombinations.contains(_poolKey(fp, toLang))) {
        final fpPool = await _loadFromStorage(fp, toLang);
        _pools[_poolKey(fp, toLang)] = fpPool;
        _loadedCombinations.add(_poolKey(fp, toLang));
      }
    }
  }

  Future<Map<String, String>> _loadFromStorage(String fingerprint, String toLang) async {
    final poolKey = _poolKey(fingerprint, toLang);
    final entries = await storage.load(poolKey);
    final pool = <String, String>{};
    for (final e in entries) {
      pool[e.text] = e.translation;
    }
    return pool;
  }

  /// 查找翻译（按优先级）
  String? lookup(String text, {String? fingerprint, String? toLang}) {
    final lang = toLang ?? currentToLang ?? 'en';

    // 1. 指定 fingerprint
    if (fingerprint != null && fingerprint.isNotEmpty) {
      final pool = _pools[_poolKey(fingerprint, lang)];
      final result = pool?[text];
      if (result != null) return result;
    }

    // 2. 当前 fingerprint
    if (fingerprint == null && currentFingerprint != null) {
      final pool = _pools[_poolKey(currentFingerprint!, lang)];
      final result = pool?[text];
      if (result != null) return result;
    }

    // 3. common
    final commonPool = _pools[_poolKey('common', lang)];
    return commonPool?[text];
  }

  /// 添加翻译到池
  void addTranslation(String text, String translation, {String? fingerprint, String? toLang}) {
    final lang = toLang ?? currentToLang ?? 'en';
    final fp = fingerprint ?? currentFingerprint ?? 'common';
    final poolKey = _poolKey(fp, lang);

    var pool = _pools[poolKey];
    if (pool == null) {
      pool = {};
      _pools[poolKey] = pool;
    }
    pool[text] = translation;

    // 持久化
    final entries = pool.entries
        .map((e) => CacheEntry(
              text: e.key,
              translation: e.value,
              timestamp: DateTime.now().millisecondsSinceEpoch,
            ))
        .toList();
    storage.save(poolKey, entries);
  }

  /// 切换 fingerprint
  Future<void> setFingerprint(String fingerprint) async {
    currentFingerprint = fingerprint;
    final lang = currentToLang ?? 'en';
    if (!_loadedCombinations.contains(_poolKey(fingerprint, lang))) {
      final fpPool = await _loadFromStorage(fingerprint, lang);
      _pools[_poolKey(fingerprint, lang)] = fpPool;
      _loadedCombinations.add(_poolKey(fingerprint, lang));
    }
  }

  /// 清除 fingerprint
  void clearFingerprint() {
    if (currentFingerprint != null) {
      final lang = currentToLang ?? 'en';
      final poolKey = _poolKey(currentFingerprint!, lang);
      _pools.remove(poolKey);
      _loadedCombinations.remove(poolKey);
      currentFingerprint = null;
    }
  }

  /// 全量清除
  Future<void> clearAll() async {
    _pools.clear();
    _loadedCombinations.clear();
    currentFingerprint = null;
    currentToLang = null;
    await storage.clear(senseId);
  }
}
