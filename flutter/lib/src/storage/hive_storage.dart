// Hive 存储适配器（可选，大缓存场景）
// 惰性导入，缺失时降级为 MemoryStorage

import 'package:hive/hive.dart';
import 'persistent_storage.dart';
import 'memory_storage.dart';

class HiveStorage implements PersistentStorage {
  final String boxName;
  final String prefix;
  late final Box<Map<String, dynamic>> _box;

  HiveStorage({
    this.boxName = 'laker_translation',
    this.prefix = 'laker_translation_',
  });

  /// 初始化 Hive box；必须在 save/load 前调用
  Future<void> init() async {
    _box = await Hive.openBox<Map<String, dynamic>>(boxName);
  }

  String _key(String poolKey) => '$prefix$poolKey';

  @override
  Future<List<CacheEntry>> load(String poolKey) async {
    try {
      final raw = _box.get(_key(poolKey));
      if (raw == null) return [];
      return (raw['entries'] as List)
          .map((e) => CacheEntry.fromMap(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }

  @override
  Future<void> save(String poolKey, List<CacheEntry> entries) async {
    try {
      await _box.put(_key(poolKey), {'entries': entries.map((e) => e.toMap()).toList()});
    } catch (_) {
      // 保存失败静默
    }
  }

  @override
  Future<void> clear(String prefix) async {
    try {
      final keys = _box.keys
          .where((k) => k.toString().startsWith('$this.prefix$prefix'))
          .toList();
      for (final k in keys) {
        await _box.delete(k);
      }
    } catch (_) {
      // 清除失败静默
    }
  }
}

/// 工厂：若 Hive 初始化失败则降级为 MemoryStorage
Future<PersistentStorage> createHiveStorage({
  String boxName = 'laker_translation',
}) async {
  try {
    final storage = HiveStorage(boxName: boxName);
    await storage.init();
    return storage;
  } catch (_) {
    return MemoryStorage();
  }
}
