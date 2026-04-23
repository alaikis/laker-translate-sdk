/**
 * Alaikis Translation Service Flutter SDK
 * Template extraction and merging utilities
 * Extracts templates from text containing numeric variables to save LLM quota
 */

/// Result of template extraction
class TemplateExtractResult {
  final bool isTemplated;
  final String srcTemplate;
  final String dstTemplate;
  final List<String> variables;

  TemplateExtractResult({
    required this.isTemplated,
    required this.srcTemplate,
    required this.dstTemplate,
    required this.variables,
  });
}

/// Automatic template extraction from text containing numeric variables
/// Also handles existing {varName} style templates
/// [text] Original text that may contain numeric variables
/// Returns Template extraction result
TemplateExtractResult extractTemplate(String text) {
  String result = text;
  final List<String> variables = [];

  // First, extract existing {name} style templates
  final braceRegex = RegExp(r'\{([^}]+)\}');
  final braceMatches = braceRegex.allMatches(text);
  // For existing brace templates, we just collect the variable names
  for (final match in braceMatches) {
    final varName = match.group(1);
    if (varName != null && varName.isNotEmpty) {
      variables.add(varName);
    }
  }

  // If no existing brace templates, look for numeric variables to convert
  if (variables.isEmpty) {
    final numberRegex = RegExp(r'\d+(?:\.\d+)?');
    final matches = numberRegex.allMatches(text);
    if (matches.isNotEmpty) {
      String template = text;
      int index = 0;
      for (final match in matches) {
        final value = match.group(0);
        if (value != null) {
          final varName = 'var${index + 1}';
          template = template.replaceFirst(value, '{$varName}');
          variables.add(value);
          result = template;
          index++;
        }
      }
    }
  }

  return TemplateExtractResult(
    isTemplated: variables.isNotEmpty,
    srcTemplate: result,
    dstTemplate: '',
    variables: variables,
  );
}

/// Merge template with variables
/// [template] Template with {variable} placeholders
/// [vars] Object mapping variable names to values
/// Returns Merged text with variables substituted
String mergeTemplate(String template, Map<String, String> vars) {
  String result = template;
  vars.forEach((key, value) {
    result = result.replaceAll(RegExp('\\{$key\\}'), value);
  });
  return result;
}

/// Version of the SDK
const version = '1.6.148';
