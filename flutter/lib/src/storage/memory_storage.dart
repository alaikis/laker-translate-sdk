// 内存存储实现（无持久化，fallback）

import 'persistent_storage.dart';

class MemoryStorage implements PersistentStorage {
  final Map<String, List<CacheEntry>> _store = {};

  @override
  Future<List<CacheEntry>> load(String poolKey) async {
    return _store[poolKey] ?? [];
  }

  @override
  Future<void> save(String poolKey, List<CacheEntry> entries) async {
    _store[poolKey] = entries;
  }

  @override
  Future<void> clear(String prefix) async {
    _store.removeWhere((key, _) => key.startsWith(prefix));
  }
}
