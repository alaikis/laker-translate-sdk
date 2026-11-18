// Connect RPC / HTTP 客户端封装
// 移动端禁用持久流，使用按需请求（每请求独立 HTTP 连接）

import 'dart:convert';
import 'package:http/http.dart' as http;

class ConnectClient {
  final String baseUrl;
  final String? token;

  ConnectClient({required this.baseUrl, this.token});

  /// 调用 LLMTranslate（单次翻译）
  Future<Map<String, dynamic>> llmTranslate({
    required String text,
    required String toLang,
    String? fromLang,
    String? senseId,
    String? fingerprint,
  }) async {
    final url = '$baseUrl/api/v1/rpc/cr/translate/translation.TranslationService/LLMTranslate';
    final body = jsonEncode({
      'text': text,
      'toLang': toLang,
      if (fromLang != null) 'fromLang': fromLang,
      if (senseId != null) 'senseId': senseId,
      if (fingerprint != null) 'fingerprint': fingerprint,
    });

    final resp = await http.post(
      Uri.parse(url),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'api-key-token': token!,
      },
      body: body,
    );

    if (resp.statusCode >= 400) {
      throw Exception('LLMTranslate failed: ${resp.statusCode} ${resp.body}');
    }
    return jsonDecode(resp.body) as Map<String, dynamic>;
  }

  /// 调用 TranslateStream（批量预加载）
  Future<List<Map<String, dynamic>>> translateStream({
    required String senseId,
    required String toLang,
    String? fingerprint,
    int batchSize = 500,
  }) async {
    final url = '$baseUrl/api/v1/rpc/cr/translate/translation.TranslationService/TranslateStream';
    final body = jsonEncode({
      'senseId': senseId,
      'toLang': toLang,
      'dstLang': toLang,
      if (fingerprint != null) 'fingerprint': fingerprint,
      'batchSize': batchSize,
      'persistent': false,
    });

    final resp = await http.post(
      Uri.parse(url),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'api-key-token': token!,
      },
      body: body,
    );

    if (resp.statusCode >= 400) {
      throw Exception('TranslateStream failed: ${resp.statusCode} ${resp.body}');
    }

    // 后端返回 JSON 数组或单个对象
    final decoded = jsonDecode(resp.body);
    if (decoded is List) {
      return decoded.cast<Map<String, dynamic>>();
    }
    return [decoded as Map<String, dynamic>];
  }
}
