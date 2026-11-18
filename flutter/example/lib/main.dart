// Laker Translation Flutter SDK 使用示例

import 'package:flutter/material.dart';
import 'package:laker_translation/laker_translation.dart';

void main() => runApp(const MyApp());

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final _client = createTranslationClient(
    'your-sense-id',
    token: 'your-jwt-token',
  );
  String _result = '';

  @override
  void initState() {
    super.initState();
    _translate();
  }

  Future<void> _translate() async {
    try {
      final translated = await _client.translate('Hello World', 'zh');
      setState(() => _result = translated);
    } catch (e) {
      setState(() => _result = 'Error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('Laker Translation Demo')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Result: $_result', style: const TextStyle(fontSize: 24)),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _translate,
                child: const Text('Translate'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
