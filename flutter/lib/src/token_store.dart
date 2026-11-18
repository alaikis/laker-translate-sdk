// Token 持久化（可选 flutter_secure_storage）

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStore {
  final FlutterSecureStorage _storage;
  final String key;

  TokenStore({
    FlutterSecureStorage? storage,
    this.key = 'laker_translation_token',
  }) : _storage = storage ?? const FlutterSecureStorage();

  Future<String?> load() async {
    try {
      return await _storage.read(key: key);
    } catch (_) {
      return null;
    }
  }

  Future<void> save(String token) async {
    try {
      await _storage.write(key: key, value: token);
    } catch (_) {
      // 保存失败静默
    }
  }

  Future<void> clear() async {
    try {
      await _storage.delete(key: key);
    } catch (_) {
      // 清除失败静默
    }
  }
}
