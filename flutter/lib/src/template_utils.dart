// 模板提取与合并工具（Dart 版）

class TemplateExtractResult {
  final bool isTemplated;
  final String srcTemplate;
  final String dstTemplate;
  final List<String> variables;

  const TemplateExtractResult({
    required this.isTemplated,
    required this.srcTemplate,
    this.dstTemplate = '',
    this.variables = const [],
  });
}

/// 提取文本中的数字变量为模板占位符
TemplateExtractResult extractTemplate(String text) {
  final numberRegex = RegExp(r'\d+(?:\.\d+)?');
  final matches = numberRegex.allMatches(text).toList();

  if (matches.isEmpty) {
    return TemplateExtractResult(isTemplated: false, srcTemplate: text);
  }

  var template = text;
  final variables = <String>[];
  for (var i = 0; i < matches.length; i++) {
    final match = matches[i];
    final varName = 'var${i + 1}';
    template = template.replaceFirst(
      match.group(0)!,
      '{$varName}',
    );
    variables.add(match.group(0)!);
  }

  return TemplateExtractResult(
    isTemplated: true,
    srcTemplate: template,
    variables: variables,
  );
}

/// 将变量值合并回模板
String mergeTemplate(String template, Map<String, String> vars) {
  var result = template;
  vars.forEach((key, value) {
    result = result.replaceAll('{$key}', value);
  });
  return result;
}
