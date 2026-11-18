// 基础单测：内存缓存 + 查找优先级 + fingerprint 切换

import 'package:flutter_test/flutter_test.dart';
import 'package:laker_translation/laker_translation.dart';

void main() {
  group('TranslationPool', () {
    late MemoryStorage storage;
    late TranslationPool pool;

    setUp(() {
      storage = MemoryStorage();
      pool = TranslationPool(
        senseId: 'test-sense',
        storage: storage,
      );
    });

    test('查找优先级：fingerprint 优先于 common', () async {
      // 添加 common 翻译
      pool.addTranslation('Hello', '你好', toLang: 'zh');
      // 添加 fingerprint 翻译
      pool.addTranslation('Hello', '你好呀', fingerprint: 'user1', toLang: 'zh');

      // 无 fingerprint 查询 → common
      expect(pool.lookup('Hello', toLang: 'zh'), '你好');
      // 指定 fingerprint 查询 → user1
      expect(pool.lookup('Hello', fingerprint: 'user1', toLang: 'zh'), '你好呀');
    });

    test('setFingerprint 切换后 lookup 使用新 fingerprint', () async {
      pool.addTranslation('Hi', '嗨', toLang: 'zh');
      pool.addTranslation('Hi', '嘿', fingerprint: 'user2', toLang: 'zh');

      await pool.setFingerprint('user2');
      expect(pool.lookup('Hi', toLang: 'zh'), '嘿');
    });

    test('clearFingerprint 回退到 common', () async {
      pool.addTranslation('Hi', '嗨', toLang: 'zh');
      pool.addTranslation('Hi', '嘿', fingerprint: 'user2', toLang: 'zh');

      await pool.setFingerprint('user2');
      pool.clearFingerprint();

      expect(pool.lookup('Hi', toLang: 'zh'), '嗨');
    });

    test('未命中返回 null', () {
      expect(pool.lookup('NotExist', toLang: 'zh'), isNull);
    });
  });

  group('TemplateUtils', () {
    test('extractTemplate 提取数字变量', () {
      final result = extractTemplate('There are 123 apples and 45.6 oranges');
      expect(result.isTemplated, true);
      expect(result.srcTemplate, 'There are {var1} apples and {var2} oranges');
      expect(result.variables, ['123', '45.6']);
    });

    test('无数字文本 isTemplated 为 false', () {
      final result = extractTemplate('Hello World');
      expect(result.isTemplated, false);
      expect(result.srcTemplate, 'Hello World');
    });

    test('mergeTemplate 合并变量值', () {
      final merged = mergeTemplate('Hello {name}', {'name': 'World'});
      expect(merged, 'Hello World');
    });
  });
}
