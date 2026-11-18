// SharedPreferences 存储适配器（默认轻量持久化）

import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'persistent_storage.dart';

class SharedPreferencesStorage implements PersistentStorage {
  final String prefix;
  SharedPreferencesStorage({this.prefix = 'laker_translation_'});

  String _key(String poolKey) => '$prefix$poolKey';

  @override
  Future<List<CacheEntry>> load(String poolKey) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_key(poolKey));
      if (raw == null) return [];
      final data = (jsonDecode(raw) as List).cast<Map<String, dynamic>>();
      return data.map(CacheEntry.fromMap).toList();
    } catch (e) {
      // 加载失败不阻塞，返回空
      return [];
    }
  }

  @override
  Future<void> save(String poolKey, List<CacheEntry> entries) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        _key(poolKey),
        jsonEncode(entries.map((e) => e.toMap()).toList()),
      );
    } catch (_) {
      // 保存失败静默
    }
  }

  @override
  Future<void> clear(String prefix) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final allKeys = prefs.getKeys();
      // SharedPreferences 无原生 removeWhere，手动遍历清除
      for (final key in allKeys) {
        if (key.startsWith('$this.prefix$prefix')) {
          await prefs.remove(key);
        }
      }
    } catch (_) {
      // 清除失败静默
    }
  }
}
