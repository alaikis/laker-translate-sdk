// This is a generated file - do not edit.
//
// Generated from translation.proto.

// @dart = 3.3

// ignore_for_file: annotate_overrides, camel_case_types, comment_references
// ignore_for_file: constant_identifier_names
// ignore_for_file: curly_braces_in_flow_control_structures
// ignore_for_file: deprecated_member_use_from_same_package, library_prefixes
// ignore_for_file: non_constant_identifier_names

import 'dart:core' as $core;

import 'package:fixnum/fixnum.dart' as $fixnum;
import 'package:protobuf/protobuf.dart' as $pb;

export 'package:protobuf/protobuf.dart' show GeneratedMessageGenericExtensions;

/// GetSenseTranslateRequest 查询指定sense的翻译请求
class GetSenseTranslateRequest extends $pb.GeneratedMessage {
  factory GetSenseTranslateRequest({
    $core.String? senseId,
    $core.String? fingerprint,
    $core.int? page,
    $core.int? pageSize,
    $core.String? fromLang,
    $core.String? toLang,
  }) {
    final result = create();
    if (senseId != null) result.senseId = senseId;
    if (fingerprint != null) result.fingerprint = fingerprint;
    if (page != null) result.page = page;
    if (pageSize != null) result.pageSize = pageSize;
    if (fromLang != null) result.fromLang = fromLang;
    if (toLang != null) result.toLang = toLang;
    return result;
  }

  GetSenseTranslateRequest._();

  factory GetSenseTranslateRequest.fromBuffer($core.List<$core.int> data, [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromBuffer(data, registry);
  factory GetSenseTranslateRequest.fromJson($core.String json, [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(_omitMessageNames ? '' : 'GetSenseTranslateRequest', package: const $pb.PackageName(_omitMessageNames ? '' : 'translation'), createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'senseId')
    ..aOS(2, _omitFieldNames ? '' : 'fingerprint')
    ..a<$core.int>(3, _omitFieldNames ? '' : 'page', $pb.PbFieldType.O3)
    ..a<$core.int>(4, _omitFieldNames ? '' : 'pageSize', $pb.PbFieldType.O3)
    ..aOS(5, _omitFieldNames ? '' : 'fromLang')
    ..aOS(6, _omitFieldNames ? '' : 'toLang')
    ..hasRequiredFields = false
  ;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  GetSenseTranslateRequest clone() => GetSenseTranslateRequest()..mergeFromMessage(this);
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  GetSenseTranslateRequest copyWith(void Function(GetSenseTranslateRequest) updates) => super.copyWith((message) => updates(message as GetSenseTranslateRequest)) as GetSenseTranslateRequest;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static GetSenseTranslateRequest create() => GetSenseTranslateRequest._();
  @$core.override
  GetSenseTranslateRequest createEmptyInstance() => create();
  static $pb.PbList<GetSenseTranslateRequest> createRepeated() => $pb.PbList<GetSenseTranslateRequest>();
  @$core.pragma('dart2js:noInline')
  static GetSenseTranslateRequest getDefault() => _defaultInstance ??= $pb.GeneratedMessage.$_defaultFor<GetSenseTranslateRequest>(create);
  static GetSenseTranslateRequest? _defaultInstance;

  /// 语义sense ID，必填
  @$pb.TagNumber(1)
  $core.String get senseId => $_getSZ(0);
  @$pb.TagNumber(1)
  set senseId($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasSenseId() => $_has(0);
  @$pb.TagNumber(1)
  void clearSenseId() => $_clearField(1);

  /// 用户指纹，用于查询个性化翻译，可选
  @$pb.TagNumber(2)
  $core.String get fingerprint => $_getSZ(1);
  @$pb.TagNumber(2)
  set fingerprint($core.String value) => $_setString(1, value);
  @$pb.TagNumber(2)
  $core.bool hasFingerprint() => $_has(1);
  @$pb.TagNumber(2)
  void clearFingerprint() => $_clearField(2);

  /// 页码，默认1
  @$pb.TagNumber(3)
  $core.int get page => $_getIZ(2);
  @$pb.TagNumber(3)
  set page($core.int value) => $_setSignedInt32(2, value);
  @$pb.TagNumber(3)
  $core.bool hasPage() => $_has(2);
  @$pb.TagNumber(3)
  void clearPage() => $_clearField(3);

  /// 每页大小，默认1000，最大5000
  @$pb.TagNumber(4)
  $core.int get pageSize => $_getIZ(3);
  @$pb.TagNumber(4)
  set pageSize($core.int value) => $_setSignedInt32(3, value);
  @$pb.TagNumber(4)
  $core.bool hasPageSize() => $_has(3);
  @$pb.TagNumber(4)
  void clearPageSize() => $_clearField(4);

  /// 源语言过滤，可选，只返回指定源语言的翻译
  @$pb.TagNumber(5)
  $core.String get fromLang => $_getSZ(4);
  @$pb.TagNumber(5)
  set fromLang($core.String value) => $_setString(4, value);
  @$pb.TagNumber(5)
  $core.bool hasFromLang() => $_has(4);
  @$pb.TagNumber(5)
  void clearFromLang() => $_clearField(5);

  /// 目标语言过滤，可选，只返回指定目标语言的翻译
  @$pb.TagNumber(6)
  $core.String get toLang => $_getSZ(5);
  @$pb.TagNumber(6)
  set toLang($core.String value) => $_setString(5, value);
  @$pb.TagNumber(6)
  $core.bool hasToLang() => $_has(5);
  @$pb.TagNumber(6)
  void clearToLang() => $_clearField(6);
}

/// TranslateRecord 单条翻译记录
class TranslateRecord extends $pb.GeneratedMessage {
  factory TranslateRecord({
    $core.String? text,
    $core.String? translate,
  }) {
    final result = create();
    if (text != null) result.text = text;
    if (translate != null) result.translate = translate;
    return result;
  }

  TranslateRecord._();

  factory TranslateRecord.fromBuffer($core.List<$core.int> data, [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromBuffer(data, registry);
  factory TranslateRecord.fromJson($core.String json, [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(_omitMessageNames ? '' : 'TranslateRecord', package: const $pb.PackageName(_omitMessageNames ? '' : 'translation'), createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'text')
    ..aOS(2, _omitFieldNames ? '' : 'translate')
    ..hasRequiredFields = false
  ;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  TranslateRecord clone() => TranslateRecord()..mergeFromMessage(this);
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  TranslateRecord copyWith(void Function(TranslateRecord) updates) => super.copyWith((message) => updates(message as TranslateRecord)) as TranslateRecord;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static TranslateRecord create() => TranslateRecord._();
  @$core.override
  TranslateRecord createEmptyInstance() => create();
  static $pb.PbList<TranslateRecord> createRepeated() => $pb.PbList<TranslateRecord>();
  @$core.pragma('dart2js:noInline')
  static TranslateRecord getDefault() => _defaultInstance ??= $pb.GeneratedMessage.$_defaultFor<TranslateRecord>(create);
  static TranslateRecord? _defaultInstance;

  /// 原文
  @$pb.TagNumber(1)
  $core.String get text => $_getSZ(0);
  @$pb.TagNumber(1)
  set text($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasText() => $_has(0);
  @$pb.TagNumber(1)
  void clearText() => $_clearField(1);

  /// 译文
  @$pb.TagNumber(2)
  $core.String get translate => $_getSZ(1);
  @$pb.TagNumber(2)
  set translate($core.String value) => $_setString(1, value);
  @$pb.TagNumber(2)
  $core.bool hasTranslate() => $_has(1);
  @$pb.TagNumber(2)
  void clearTranslate() => $_clearField(2);
}

/// GetSenseTranslateResponse 翻译查询响应
class GetSenseTranslateResponse extends $pb.GeneratedMessage {
  factory GetSenseTranslateResponse({
    $core.Iterable<$core.MapEntry<$core.String, $core.String>>? common,
    $core.Iterable<$core.MapEntry<$core.String, $core.String>>? special,
    $core.int? page,
    $core.int? pageSize,
    $fixnum.Int64? total,
    $fixnum.Int64? totalPages,
    $fixnum.Int64? specialTotal,
  }) {
    final result = create();
    if (common != null) result.common.addEntries(common);
    if (special != null) result.special.addEntries(special);
    if (page != null) result.page = page;
    if (pageSize != null) result.pageSize = pageSize;
    if (total != null) result.total = total;
    if (totalPages != null) result.totalPages = totalPages;
    if (specialTotal != null) result.specialTotal = specialTotal;
    return result;
  }

  GetSenseTranslateResponse._();

  factory GetSenseTranslateResponse.fromBuffer($core.List<$core.int> data, [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromBuffer(data, registry);
  factory GetSenseTranslateResponse.fromJson($core.String json, [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(_omitMessageNames ? '' : 'GetSenseTranslateResponse', package: const $pb.PackageName(_omitMessageNames ? '' : 'translation'), createEmptyInstance: create)
    ..m<$core.String, $core.String>(1, _omitFieldNames ? '' : 'common', entryClassName: 'GetSenseTranslateResponse.CommonEntry', keyFieldType: $pb.PbFieldType.OS, valueFieldType: $pb.PbFieldType.OS, packageName: const $pb.PackageName('translation'))
    ..m<$core.String, $core.String>(2, _omitFieldNames ? '' : 'special', entryClassName: 'GetSenseTranslateResponse.SpecialEntry', keyFieldType: $pb.PbFieldType.OS, valueFieldType: $pb.PbFieldType.OS, packageName: const $pb.PackageName('translation'))
    ..a<$core.int>(3, _omitFieldNames ? '' : 'page', $pb.PbFieldType.O3)
    ..a<$core.int>(4, _omitFieldNames ? '' : 'pageSize', $pb.PbFieldType.O3)
    ..aInt64(5, _omitFieldNames ? '' : 'total')
    ..aInt64(6, _omitFieldNames ? '' : 'totalPages')
    ..aInt64(7, _omitFieldNames ? '' : 'specialTotal')
    ..hasRequiredFields = false
  ;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  GetSenseTranslateResponse clone() => GetSenseTranslateResponse()..mergeFromMessage(this);
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  GetSenseTranslateResponse copyWith(void Function(GetSenseTranslateResponse) updates) => super.copyWith((message) => updates(message as GetSenseTranslateResponse)) as GetSenseTranslateResponse;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static GetSenseTranslateResponse create() => GetSenseTranslateResponse._();
  @$core.override
  GetSenseTranslateResponse createEmptyInstance() => create();
  static $pb.PbList<GetSenseTranslateResponse> createRepeated() => $pb.PbList<GetSenseTranslateResponse>();
  @$core.pragma('dart2js:noInline')
  static GetSenseTranslateResponse getDefault() => _defaultInstance ??= $pb.GeneratedMessage.$_defaultFor<GetSenseTranslateResponse>(create);
  static GetSenseTranslateResponse? _defaultInstance;

  /// 通用翻译，key是原文，value是译文
  @$pb.TagNumber(1)
  $pb.PbMap<$core.String, $core.String> get common => $_getMap(0);

  /// 个性化翻译，key是原文，value是译文，只有提供fingerprint时才有
  @$pb.TagNumber(2)
  $pb.PbMap<$core.String, $core.String> get special => $_getMap(1);

  /// 当前页码
  @$pb.TagNumber(3)
  $core.int get page => $_getIZ(2);
  @$pb.TagNumber(3)
  set page($core.int value) => $_setSignedInt32(2, value);
  @$pb.TagNumber(3)
  $core.bool hasPage() => $_has(2);
  @$pb.TagNumber(3)
  void clearPage() => $_clearField(3);

  /// 每页大小
  @$pb.TagNumber(4)
  $core.int get pageSize => $_getIZ(3);
  @$pb.TagNumber(4)
  set pageSize($core.int value) => $_setSignedInt32(3, value);
  @$pb.TagNumber(4)
  $core.bool hasPageSize() => $_has(3);
  @$pb.TagNumber(4)
  void clearPageSize() => $_clearField(4);

  /// 总记录数
  @$pb.TagNumber(5)
  $fixnum.Int64 get total => $_getI64(4);
  @$pb.TagNumber(5)
  set total($fixnum.Int64 value) => $_setInt64(4, value);
  @$pb.TagNumber(5)
  $core.bool hasTotal() => $_has(4);
  @$pb.TagNumber(5)
  void clearTotal() => $_clearField(5);

  /// 总页数
  @$pb.TagNumber(6)
  $fixnum.Int64 get totalPages => $_getI64(5);
  @$pb.TagNumber(6)
  set totalPages($fixnum.Int64 value) => $_setInt64(5, value);
  @$pb.TagNumber(6)
  $core.bool hasTotalPages() => $_has(5);
  @$pb.TagNumber(6)
  void clearTotalPages() => $_clearField(6);

  /// 个性化翻译总记录数，只有提供fingerprint时才有
  @$pb.TagNumber(7)
  $fixnum.Int64 get specialTotal => $_getI64(6);
  @$pb.TagNumber(7)
  set specialTotal($fixnum.Int64 value) => $_setInt64(6, value);
  @$pb.TagNumber(7)
  $core.bool hasSpecialTotal() => $_has(6);
  @$pb.TagNumber(7)
  void clearSpecialTotal() => $_clearField(7);
}

/// TextRequest 单个文本翻译请求
/// 用于批量翻译未缓存文本场景
class TextRequest extends $pb.GeneratedMessage {
  factory TextRequest({
    $core.String? text,
    $core.String? fromLang,
  }) {
    final result = create();
    if (text != null) result.text = text;
    if (fromLang != null) result.fromLang = fromLang;
    return result;
  }

  TextRequest._();

  factory TextRequest.fromBuffer($core.List<$core.int> data, [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromBuffer(data, registry);
  factory TextRequest.fromJson($core.String json, [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(_omitMessageNames ? '' : 'TextRequest', package: const $pb.PackageName(_omitMessageNames ? '' : 'translation'), createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'text')
    ..aOS(2, _omitFieldNames ? '' : 'fromLang')
    ..hasRequiredFields = false
  ;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  TextRequest clone() => TextRequest()..mergeFromMessage(this);
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  TextRequest copyWith(void Function(TextRequest) updates) => super.copyWith((message) => updates(message as TextRequest)) as TextRequest;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static TextRequest create() => TextRequest._();
  @$core.override
  TextRequest createEmptyInstance() => create();
  static $pb.PbList<TextRequest> createRepeated() => $pb.PbList<TextRequest>();
  @$core.pragma('dart2js:noInline')
  static TextRequest getDefault() => _defaultInstance ??= $pb.GeneratedMessage.$_defaultFor<TextRequest>(create);
  static TextRequest? _defaultInstance;

  /// 要翻译的原文
  @$pb.TagNumber(1)
  $core.String get text => $_getSZ(0);
  @$pb.TagNumber(1)
  set text($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasText() => $_has(0);
  @$pb.TagNumber(1)
  void clearText() => $_clearField(1);

  /// 源语言，可选，如果未提供使用默认
  @$pb.TagNumber(2)
  $core.String get fromLang => $_getSZ(1);
  @$pb.TagNumber(2)
  set fromLang($core.String value) => $_setString(1, value);
  @$pb.TagNumber(2)
  $core.bool hasFromLang() => $_has(1);
  @$pb.TagNumber(2)
  void clearFromLang() => $_clearField(2);
}

/// TranslateStreamRequest 流式翻译请求
class TranslateStreamRequest extends $pb.GeneratedMessage {
  factory TranslateStreamRequest({
    $core.String? text,
    $core.String? senseId,
    $core.String? fingerprint,
    $core.String? fromLang,
    $core.String? toLang,
    $core.String? srcLang,
    $core.String? dstLang,
    $core.String? requestId,
    $core.bool? persistent,
    $core.bool? isCorrection,
    $core.String? correctedTranslation,
    $core.Iterable<TextRequest>? texts,
  }) {
    final result = create();
    if (text != null) result.text = text;
    if (senseId != null) result.senseId = senseId;
    if (fingerprint != null) result.fingerprint = fingerprint;
    if (fromLang != null) result.fromLang = fromLang;
    if (toLang != null) result.toLang = toLang;
    if (srcLang != null) result.srcLang = srcLang;
    if (dstLang != null) result.dstLang = dstLang;
    if (requestId != null) result.requestId = requestId;
    if (persistent != null) result.persistent = persistent;
    if (isCorrection != null) result.isCorrection = isCorrection;
    if (correctedTranslation != null) result.correctedTranslation = correctedTranslation;
    if (texts != null) result.texts.addAll(texts);
    return result;
  }

  TranslateStreamRequest._();

  factory TranslateStreamRequest.fromBuffer($core.List<$core.int> data, [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromBuffer(data, registry);
  factory TranslateStreamRequest.fromJson($core.String json, [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(_omitMessageNames ? '' : 'TranslateStreamRequest', package: const $pb.PackageName(_omitMessageNames ? '' : 'translation'), createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'text')
    ..aOS(2, _omitFieldNames ? '' : 'senseId')
    ..aOS(3, _omitFieldNames ? '' : 'fingerprint')
    ..aOS(4, _omitFieldNames ? '' : 'fromLang')
    ..aOS(5, _omitFieldNames ? '' : 'toLang')
    ..aOS(6, _omitFieldNames ? '' : 'srcLang')
    ..aOS(7, _omitFieldNames ? '' : 'dstLang')
    ..aOS(8, _omitFieldNames ? '' : 'requestId')
    ..aOB(9, _omitFieldNames ? '' : 'persistent')
    ..aOB(10, _omitFieldNames ? '' : 'isCorrection')
    ..aOS(11, _omitFieldNames ? '' : 'correctedTranslation')
    ..pc<TextRequest>(12, _omitFieldNames ? '' : 'texts', $pb.PbFieldType.PM, subBuilder: TextRequest.create)
    ..hasRequiredFields = false
  ;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  TranslateStreamRequest clone() => TranslateStreamRequest()..mergeFromMessage(this);
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  TranslateStreamRequest copyWith(void Function(TranslateStreamRequest) updates) => super.copyWith((message) => updates(message as TranslateStreamRequest)) as TranslateStreamRequest;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static TranslateStreamRequest create() => TranslateStreamRequest._();
  @$core.override
  TranslateStreamRequest createEmptyInstance() => create();
  static $pb.PbList<TranslateStreamRequest> createRepeated() => $pb.PbList<TranslateStreamRequest>();
  @$core.pragma('dart2js:noInline')
  static TranslateStreamRequest getDefault() => _defaultInstance ??= $pb.GeneratedMessage.$_defaultFor<TranslateStreamRequest>(create);
  static TranslateStreamRequest? _defaultInstance;

  /// 用户输入文本（可选，用于上下文）
  @$pb.TagNumber(1)
  $core.String get text => $_getSZ(0);
  @$pb.TagNumber(1)
  set text($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasText() => $_has(0);
  @$pb.TagNumber(1)
  void clearText() => $_clearField(1);

  /// 要查询的sense ID
  @$pb.TagNumber(2)
  $core.String get senseId => $_getSZ(1);
  @$pb.TagNumber(2)
  set senseId($core.String value) => $_setString(1, value);
  @$pb.TagNumber(2)
  $core.bool hasSenseId() => $_has(1);
  @$pb.TagNumber(2)
  void clearSenseId() => $_clearField(2);

  /// 用户指纹，可选
  @$pb.TagNumber(3)
  $core.String get fingerprint => $_getSZ(2);
  @$pb.TagNumber(3)
  set fingerprint($core.String value) => $_setString(2, value);
  @$pb.TagNumber(3)
  $core.bool hasFingerprint() => $_has(2);
  @$pb.TagNumber(3)
  void clearFingerprint() => $_clearField(3);

  /// 源语言，可选，用于翻译
  @$pb.TagNumber(4)
  $core.String get fromLang => $_getSZ(3);
  @$pb.TagNumber(4)
  set fromLang($core.String value) => $_setString(3, value);
  @$pb.TagNumber(4)
  $core.bool hasFromLang() => $_has(3);
  @$pb.TagNumber(4)
  void clearFromLang() => $_clearField(4);

  /// 目标语言，必填，用于翻译
  @$pb.TagNumber(5)
  $core.String get toLang => $_getSZ(4);
  @$pb.TagNumber(5)
  set toLang($core.String value) => $_setString(4, value);
  @$pb.TagNumber(5)
  $core.bool hasToLang() => $_has(4);
  @$pb.TagNumber(5)
  void clearToLang() => $_clearField(5);

  /// 源语言过滤，可选，只返回指定源语言的翻译
  @$pb.TagNumber(6)
  $core.String get srcLang => $_getSZ(5);
  @$pb.TagNumber(6)
  set srcLang($core.String value) => $_setString(5, value);
  @$pb.TagNumber(6)
  $core.bool hasSrcLang() => $_has(5);
  @$pb.TagNumber(6)
  void clearSrcLang() => $_clearField(6);

  /// 目标语言过滤，可选，只返回指定目标语言的翻译（预加载翻译池必填）
  @$pb.TagNumber(7)
  $core.String get dstLang => $_getSZ(6);
  @$pb.TagNumber(7)
  set dstLang($core.String value) => $_setString(6, value);
  @$pb.TagNumber(7)
  $core.bool hasDstLang() => $_has(6);
  @$pb.TagNumber(7)
  void clearDstLang() => $_clearField(7);

  /// 请求唯一ID，用于匹配持久流式连接的响应
  /// 每个请求通过 request_id 匹配对应响应
  @$pb.TagNumber(8)
  $core.String get requestId => $_getSZ(7);
  @$pb.TagNumber(8)
  set requestId($core.String value) => $_setString(7, value);
  @$pb.TagNumber(8)
  $core.bool hasRequestId() => $_has(7);
  @$pb.TagNumber(8)
  void clearRequestId() => $_clearField(8);

  /// 是否保持持久连接
  /// 如果为 true，服务器会持续处理所有 pending 请求并不主动关闭连接
  @$pb.TagNumber(9)
  $core.bool get persistent => $_getBF(8);
  @$pb.TagNumber(9)
  set persistent($core.bool value) => $_setBool(8, value);
  @$pb.TagNumber(9)
  $core.bool hasPersistent() => $_has(8);
  @$pb.TagNumber(9)
  void clearPersistent() => $_clearField(9);

  /// 是否是人工翻译纠正请求
  /// 当用户人工纠正翻译后，设置为 true，同时提供 corrected_translation
  @$pb.TagNumber(10)
  $core.bool get isCorrection => $_getBF(9);
  @$pb.TagNumber(10)
  set isCorrection($core.bool value) => $_setBool(9, value);
  @$pb.TagNumber(10)
  $core.bool hasIsCorrection() => $_has(9);
  @$pb.TagNumber(10)
  void clearIsCorrection() => $_clearField(10);

  /// 人工纠正后的翻译结果
  /// 配合 is_correction=true 使用
  @$pb.TagNumber(11)
  $core.String get correctedTranslation => $_getSZ(10);
  @$pb.TagNumber(11)
  set correctedTranslation($core.String value) => $_setString(10, value);
  @$pb.TagNumber(11)
  $core.bool hasCorrectedTranslation() => $_has(10);
  @$pb.TagNumber(11)
  void clearCorrectedTranslation() => $_clearField(11);

  /// 批量翻译未缓存文本列表
  /// JS SDK 批量翻译未命中缓存的文本时使用
  @$pb.TagNumber(12)
  $pb.PbList<TextRequest> get texts => $_getList(11);
}

/// TranslateStreamResponse 流式翻译响应
class TranslateStreamResponse extends $pb.GeneratedMessage {
  factory TranslateStreamResponse({
    $core.String? originalText,
    $core.Iterable<$core.MapEntry<$core.String, $core.String>>? translation,
    $fixnum.Int64? timestamp,
    $core.bool? finished,
    $core.int? batchIndex,
    $core.String? requestId,
    $core.String? srcLang,
    $core.String? dstLang,
  }) {
    final result = create();
    if (originalText != null) result.originalText = originalText;
    if (translation != null) result.translation.addEntries(translation);
    if (timestamp != null) result.timestamp = timestamp;
    if (finished != null) result.finished = finished;
    if (batchIndex != null) result.batchIndex = batchIndex;
    if (requestId != null) result.requestId = requestId;
    if (srcLang != null) result.srcLang = srcLang;
    if (dstLang != null) result.dstLang = dstLang;
    return result;
  }

  TranslateStreamResponse._();

  factory TranslateStreamResponse.fromBuffer($core.List<$core.int> data, [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromBuffer(data, registry);
  factory TranslateStreamResponse.fromJson($core.String json, [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(_omitMessageNames ? '' : 'TranslateStreamResponse', package: const $pb.PackageName(_omitMessageNames ? '' : 'translation'), createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'originalText')
    ..m<$core.String, $core.String>(2, _omitFieldNames ? '' : 'translation', entryClassName: 'TranslateStreamResponse.TranslationEntry', keyFieldType: $pb.PbFieldType.OS, valueFieldType: $pb.PbFieldType.OS, packageName: const $pb.PackageName('translation'))
    ..aInt64(3, _omitFieldNames ? '' : 'timestamp')
    ..aOB(4, _omitFieldNames ? '' : 'finished')
    ..a<$core.int>(5, _omitFieldNames ? '' : 'batchIndex', $pb.PbFieldType.O3)
    ..aOS(6, _omitFieldNames ? '' : 'requestId')
    ..aOS(7, _omitFieldNames ? '' : 'srcLang')
    ..aOS(8, _omitFieldNames ? '' : 'dstLang')
    ..hasRequiredFields = false
  ;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  TranslateStreamResponse clone() => TranslateStreamResponse()..mergeFromMessage(this);
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  TranslateStreamResponse copyWith(void Function(TranslateStreamResponse) updates) => super.copyWith((message) => updates(message as TranslateStreamResponse)) as TranslateStreamResponse;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static TranslateStreamResponse create() => TranslateStreamResponse._();
  @$core.override
  TranslateStreamResponse createEmptyInstance() => create();
  static $pb.PbList<TranslateStreamResponse> createRepeated() => $pb.PbList<TranslateStreamResponse>();
  @$core.pragma('dart2js:noInline')
  static TranslateStreamResponse getDefault() => _defaultInstance ??= $pb.GeneratedMessage.$_defaultFor<TranslateStreamResponse>(create);
  static TranslateStreamResponse? _defaultInstance;

  /// 原始请求文本
  @$pb.TagNumber(1)
  $core.String get originalText => $_getSZ(0);
  @$pb.TagNumber(1)
  set originalText($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasOriginalText() => $_has(0);
  @$pb.TagNumber(1)
  void clearOriginalText() => $_clearField(1);

  /// 翻译结果，key是原文，value是译文
  @$pb.TagNumber(2)
  $pb.PbMap<$core.String, $core.String> get translation => $_getMap(1);

  /// 时间戳
  @$pb.TagNumber(3)
  $fixnum.Int64 get timestamp => $_getI64(2);
  @$pb.TagNumber(3)
  set timestamp($fixnum.Int64 value) => $_setInt64(2, value);
  @$pb.TagNumber(3)
  $core.bool hasTimestamp() => $_has(2);
  @$pb.TagNumber(3)
  void clearTimestamp() => $_clearField(3);

  /// 是否是最后一条消息，完成标识
  @$pb.TagNumber(4)
  $core.bool get finished => $_getBF(3);
  @$pb.TagNumber(4)
  set finished($core.bool value) => $_setBool(3, value);
  @$pb.TagNumber(4)
  $core.bool hasFinished() => $_has(3);
  @$pb.TagNumber(4)
  void clearFinished() => $_clearField(4);

  /// 当前批次序号，从0开始
  @$pb.TagNumber(5)
  $core.int get batchIndex => $_getIZ(4);
  @$pb.TagNumber(5)
  set batchIndex($core.int value) => $_setSignedInt32(4, value);
  @$pb.TagNumber(5)
  $core.bool hasBatchIndex() => $_has(4);
  @$pb.TagNumber(5)
  void clearBatchIndex() => $_clearField(5);

  /// 请求唯一ID，匹配请求的 request_id
  /// 如果是持久流式连接，必须携带 request_id
  @$pb.TagNumber(6)
  $core.String get requestId => $_getSZ(5);
  @$pb.TagNumber(6)
  set requestId($core.String value) => $_setString(5, value);
  @$pb.TagNumber(6)
  $core.bool hasRequestId() => $_has(5);
  @$pb.TagNumber(6)
  void clearRequestId() => $_clearField(6);

  /// 源语言代码
  /// JS SDK可以根据返回的src_lang决定缓存键
  @$pb.TagNumber(7)
  $core.String get srcLang => $_getSZ(6);
  @$pb.TagNumber(7)
  set srcLang($core.String value) => $_setString(6, value);
  @$pb.TagNumber(7)
  $core.bool hasSrcLang() => $_has(6);
  @$pb.TagNumber(7)
  void clearSrcLang() => $_clearField(7);

  /// 目标语言代码
  /// JS SDK可以根据返回的dst_lang决定缓存键
  @$pb.TagNumber(8)
  $core.String get dstLang => $_getSZ(7);
  @$pb.TagNumber(8)
  set dstLang($core.String value) => $_setString(7, value);
  @$pb.TagNumber(8)
  $core.bool hasDstLang() => $_has(7);
  @$pb.TagNumber(8)
  void clearDstLang() => $_clearField(8);
}

/// LLMTranslateRequest 大模型翻译请求
class LLMTranslateRequest extends $pb.GeneratedMessage {
  factory LLMTranslateRequest({
    $core.String? text,
    $core.String? fromLang,
    $core.String? toLang,
    $core.String? senseId,
    $core.String? fingerprint,
  }) {
    final result = create();
    if (text != null) result.text = text;
    if (fromLang != null) result.fromLang = fromLang;
    if (toLang != null) result.toLang = toLang;
    if (senseId != null) result.senseId = senseId;
    if (fingerprint != null) result.fingerprint = fingerprint;
    return result;
  }

  LLMTranslateRequest._();

  factory LLMTranslateRequest.fromBuffer($core.List<$core.int> data, [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromBuffer(data, registry);
  factory LLMTranslateRequest.fromJson($core.String json, [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(_omitMessageNames ? '' : 'LLMTranslateRequest', package: const $pb.PackageName(_omitMessageNames ? '' : 'translation'), createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'text')
    ..aOS(2, _omitFieldNames ? '' : 'fromLang')
    ..aOS(3, _omitFieldNames ? '' : 'toLang')
    ..aOS(4, _omitFieldNames ? '' : 'senseId')
    ..aOS(5, _omitFieldNames ? '' : 'fingerprint')
    ..hasRequiredFields = false
  ;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  LLMTranslateRequest clone() => LLMTranslateRequest()..mergeFromMessage(this);
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  LLMTranslateRequest copyWith(void Function(LLMTranslateRequest) updates) => super.copyWith((message) => updates(message as LLMTranslateRequest)) as LLMTranslateRequest;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static LLMTranslateRequest create() => LLMTranslateRequest._();
  @$core.override
  LLMTranslateRequest createEmptyInstance() => create();
  static $pb.PbList<LLMTranslateRequest> createRepeated() => $pb.PbList<LLMTranslateRequest>();
  @$core.pragma('dart2js:noInline')
  static LLMTranslateRequest getDefault() => _defaultInstance ??= $pb.GeneratedMessage.$_defaultFor<LLMTranslateRequest>(create);
  static LLMTranslateRequest? _defaultInstance;

  /// 要翻译的原文
  @$pb.TagNumber(1)
  $core.String get text => $_getSZ(0);
  @$pb.TagNumber(1)
  set text($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasText() => $_has(0);
  @$pb.TagNumber(1)
  void clearText() => $_clearField(1);

  /// 源语言
  @$pb.TagNumber(2)
  $core.String get fromLang => $_getSZ(1);
  @$pb.TagNumber(2)
  set fromLang($core.String value) => $_setString(1, value);
  @$pb.TagNumber(2)
  $core.bool hasFromLang() => $_has(1);
  @$pb.TagNumber(2)
  void clearFromLang() => $_clearField(2);

  /// 目标语言
  @$pb.TagNumber(3)
  $core.String get toLang => $_getSZ(2);
  @$pb.TagNumber(3)
  set toLang($core.String value) => $_setString(2, value);
  @$pb.TagNumber(3)
  $core.bool hasToLang() => $_has(2);
  @$pb.TagNumber(3)
  void clearToLang() => $_clearField(3);

  /// 语义sense ID，可选
  @$pb.TagNumber(4)
  $core.String get senseId => $_getSZ(3);
  @$pb.TagNumber(4)
  set senseId($core.String value) => $_setString(3, value);
  @$pb.TagNumber(4)
  $core.bool hasSenseId() => $_has(3);
  @$pb.TagNumber(4)
  void clearSenseId() => $_clearField(4);

  /// 用户指纹，可选
  @$pb.TagNumber(5)
  $core.String get fingerprint => $_getSZ(4);
  @$pb.TagNumber(5)
  set fingerprint($core.String value) => $_setString(4, value);
  @$pb.TagNumber(5)
  $core.bool hasFingerprint() => $_has(4);
  @$pb.TagNumber(5)
  void clearFingerprint() => $_clearField(5);
}

/// LLMTranslateResponse 大模型翻译响应
class LLMTranslateResponse extends $pb.GeneratedMessage {
  factory LLMTranslateResponse({
    $core.String? translation,
    $core.String? fromLang,
    $core.String? toLang,
  }) {
    final result = create();
    if (translation != null) result.translation = translation;
    if (fromLang != null) result.fromLang = fromLang;
    if (toLang != null) result.toLang = toLang;
    return result;
  }

  LLMTranslateResponse._();

  factory LLMTranslateResponse.fromBuffer($core.List<$core.int> data, [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromBuffer(data, registry);
  factory LLMTranslateResponse.fromJson($core.String json, [$pb.ExtensionRegistry registry = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromJson(json, registry);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(_omitMessageNames ? '' : 'LLMTranslateResponse', package: const $pb.PackageName(_omitMessageNames ? '' : 'translation'), createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'translation')
    ..aOS(2, _omitFieldNames ? '' : 'fromLang')
    ..aOS(3, _omitFieldNames ? '' : 'toLang')
    ..hasRequiredFields = false
  ;

  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  LLMTranslateResponse clone() => LLMTranslateResponse()..mergeFromMessage(this);
  @$core.Deprecated('See https://github.com/google/protobuf.dart/issues/998.')
  LLMTranslateResponse copyWith(void Function(LLMTranslateResponse) updates) => super.copyWith((message) => updates(message as LLMTranslateResponse)) as LLMTranslateResponse;

  @$core.override
  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static LLMTranslateResponse create() => LLMTranslateResponse._();
  @$core.override
  LLMTranslateResponse createEmptyInstance() => create();
  static $pb.PbList<LLMTranslateResponse> createRepeated() => $pb.PbList<LLMTranslateResponse>();
  @$core.pragma('dart2js:noInline')
  static LLMTranslateResponse getDefault() => _defaultInstance ??= $pb.GeneratedMessage.$_defaultFor<LLMTranslateResponse>(create);
  static LLMTranslateResponse? _defaultInstance;

  /// 翻译结果
  @$pb.TagNumber(1)
  $core.String get translation => $_getSZ(0);
  @$pb.TagNumber(1)
  set translation($core.String value) => $_setString(0, value);
  @$pb.TagNumber(1)
  $core.bool hasTranslation() => $_has(0);
  @$pb.TagNumber(1)
  void clearTranslation() => $_clearField(1);

  /// 源语言
  @$pb.TagNumber(2)
  $core.String get fromLang => $_getSZ(1);
  @$pb.TagNumber(2)
  set fromLang($core.String value) => $_setString(1, value);
  @$pb.TagNumber(2)
  $core.bool hasFromLang() => $_has(1);
  @$pb.TagNumber(2)
  void clearFromLang() => $_clearField(2);

  /// 目标语言
  @$pb.TagNumber(3)
  $core.String get toLang => $_getSZ(2);
  @$pb.TagNumber(3)
  set toLang($core.String value) => $_setString(2, value);
  @$pb.TagNumber(3)
  $core.bool hasToLang() => $_has(2);
  @$pb.TagNumber(3)
  void clearToLang() => $_clearField(3);
}


const $core.bool _omitFieldNames = $core.bool.fromEnvironment('protobuf.omit_field_names');
const $core.bool _omitMessageNames = $core.bool.fromEnvironment('protobuf.omit_message_names');
