// 持久存储接口定义（Dart 版）
// 所有存储后端（Memory / SharedPreferences / Hive）必须实现此接口

class CacheEntry {
  final String text;
  final String translation;
  final int timestamp;
  final int? expiresAt;

  const CacheEntry({
    required this.text,
    required this.translation,
    required this.timestamp,
    this.expiresAt,
  });

  Map<String, dynamic> toMap() => {
        'text': text,
        'translation': translation,
        'timestamp': timestamp,
        if (expiresAt != null) 'expiresAt': expiresAt,
      };

  factory CacheEntry.fromMap(Map<String, dynamic> map) => CacheEntry(
        text: map['text'] as String? ?? '',
        translation: map['translation'] as String? ?? '',
        timestamp: map['timestamp'] as int? ?? 0,
        expiresAt: map['expiresAt'] as int?,
      );
}

abstract class PersistentStorage {
  /// 加载指定 poolKey 的缓存条目
  Future<List<CacheEntry>> load(String poolKey);

  /// 保存指定 poolKey 的缓存条目（全量覆盖）
  Future<void> save(String poolKey, List<CacheEntry> entries);

  /// 清除所有以 prefix 开头的 poolKey 缓存
  Future<void> clear(String prefix);
}
