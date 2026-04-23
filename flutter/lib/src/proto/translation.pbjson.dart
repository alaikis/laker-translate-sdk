// This is a generated file - do not edit.
//
// Generated from translation.proto.

// @dart = 3.3

// ignore_for_file: annotate_overrides, camel_case_types, comment_references
// ignore_for_file: constant_identifier_names
// ignore_for_file: curly_braces_in_flow_control_structures
// ignore_for_file: deprecated_member_use_from_same_package, library_prefixes
// ignore_for_file: non_constant_identifier_names, unused_import

import 'dart:convert' as $convert;
import 'dart:core' as $core;
import 'dart:typed_data' as $typed_data;

@$core.Deprecated('Use getSenseTranslateRequestDescriptor instead')
const GetSenseTranslateRequest$json = {
  '1': 'GetSenseTranslateRequest',
  '2': [
    {'1': 'sense_id', '3': 1, '4': 1, '5': 9, '10': 'senseId'},
    {'1': 'fingerprint', '3': 2, '4': 1, '5': 9, '9': 0, '10': 'fingerprint', '17': true},
    {'1': 'page', '3': 3, '4': 1, '5': 5, '10': 'page'},
    {'1': 'page_size', '3': 4, '4': 1, '5': 5, '10': 'pageSize'},
    {'1': 'from_lang', '3': 5, '4': 1, '5': 9, '10': 'fromLang'},
    {'1': 'to_lang', '3': 6, '4': 1, '5': 9, '10': 'toLang'},
  ],
  '8': [
    {'1': '_fingerprint'},
  ],
};

/// Descriptor for `GetSenseTranslateRequest`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List getSenseTranslateRequestDescriptor = $convert.base64Decode(
    'ChhHZXRTZW5zZVRyYW5zbGF0ZVJlcXVlc3QSGQoIc2Vuc2VfaWQYASABKAlSB3NlbnNlSWQSJQ'
    'oLZmluZ2VycHJpbnQYAiABKAlIAFILZmluZ2VycHJpbnSIAQESEgoEcGFnZRgDIAEoBVIEcGFn'
    'ZRIbCglwYWdlX3NpemUYBCABKAVSCHBhZ2VTaXplEhsKCWZyb21fbGFuZxgFIAEoCVIIZnJvbU'
    'xhbmcSFwoHdG9fbGFuZxgGIAEoCVIGdG9MYW5nQg4KDF9maW5nZXJwcmludA==');

@$core.Deprecated('Use translateRecordDescriptor instead')
const TranslateRecord$json = {
  '1': 'TranslateRecord',
  '2': [
    {'1': 'text', '3': 1, '4': 1, '5': 9, '10': 'text'},
    {'1': 'translate', '3': 2, '4': 1, '5': 9, '10': 'translate'},
  ],
};

/// Descriptor for `TranslateRecord`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List translateRecordDescriptor = $convert.base64Decode(
    'Cg9UcmFuc2xhdGVSZWNvcmQSEgoEdGV4dBgBIAEoCVIEdGV4dBIcCgl0cmFuc2xhdGUYAiABKA'
    'lSCXRyYW5zbGF0ZQ==');

@$core.Deprecated('Use getSenseTranslateResponseDescriptor instead')
const GetSenseTranslateResponse$json = {
  '1': 'GetSenseTranslateResponse',
  '2': [
    {'1': 'common', '3': 1, '4': 3, '5': 11, '6': '.translation.GetSenseTranslateResponse.CommonEntry', '10': 'common'},
    {'1': 'special', '3': 2, '4': 3, '5': 11, '6': '.translation.GetSenseTranslateResponse.SpecialEntry', '10': 'special'},
    {'1': 'page', '3': 3, '4': 1, '5': 5, '10': 'page'},
    {'1': 'page_size', '3': 4, '4': 1, '5': 5, '10': 'pageSize'},
    {'1': 'total', '3': 5, '4': 1, '5': 3, '10': 'total'},
    {'1': 'total_pages', '3': 6, '4': 1, '5': 3, '10': 'totalPages'},
    {'1': 'special_total', '3': 7, '4': 1, '5': 3, '10': 'specialTotal'},
  ],
  '3': [GetSenseTranslateResponse_CommonEntry$json, GetSenseTranslateResponse_SpecialEntry$json],
};

@$core.Deprecated('Use getSenseTranslateResponseDescriptor instead')
const GetSenseTranslateResponse_CommonEntry$json = {
  '1': 'CommonEntry',
  '2': [
    {'1': 'key', '3': 1, '4': 1, '5': 9, '10': 'key'},
    {'1': 'value', '3': 2, '4': 1, '5': 9, '10': 'value'},
  ],
  '7': {'7': true},
};

@$core.Deprecated('Use getSenseTranslateResponseDescriptor instead')
const GetSenseTranslateResponse_SpecialEntry$json = {
  '1': 'SpecialEntry',
  '2': [
    {'1': 'key', '3': 1, '4': 1, '5': 9, '10': 'key'},
    {'1': 'value', '3': 2, '4': 1, '5': 9, '10': 'value'},
  ],
  '7': {'7': true},
};

/// Descriptor for `GetSenseTranslateResponse`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List getSenseTranslateResponseDescriptor = $convert.base64Decode(
    'ChlHZXRTZW5zZVRyYW5zbGF0ZVJlc3BvbnNlEkoKBmNvbW1vbhgBIAMoCzIyLnRyYW5zbGF0aW'
    '9uLkdldFNlbnNlVHJhbnNsYXRlUmVzcG9uc2UuQ29tbW9uRW50cnlSBmNvbW1vbhJNCgdzcGVj'
    'aWFsGAIgAygLMjMudHJhbnNsYXRpb24uR2V0U2Vuc2VUcmFuc2xhdGVSZXNwb25zZS5TcGVjaW'
    'FsRW50cnlSB3NwZWNpYWwSEgoEcGFnZRgDIAEoBVIEcGFnZRIbCglwYWdlX3NpemUYBCABKAVS'
    'CHBhZ2VTaXplEhQKBXRvdGFsGAUgASgDUgV0b3RhbBIfCgt0b3RhbF9wYWdlcxgGIAEoA1IKdG'
    '90YWxQYWdlcxIjCg1zcGVjaWFsX3RvdGFsGAcgASgDUgxzcGVjaWFsVG90YWwaOQoLQ29tbW9u'
    'RW50cnkSEAoDa2V5GAEgASgJUgNrZXkSFAoFdmFsdWUYAiABKAlSBXZhbHVlOgI4ARo6CgxTcG'
    'VjaWFsRW50cnkSEAoDa2V5GAEgASgJUgNrZXkSFAoFdmFsdWUYAiABKAlSBXZhbHVlOgI4AQ==');

@$core.Deprecated('Use textRequestDescriptor instead')
const TextRequest$json = {
  '1': 'TextRequest',
  '2': [
    {'1': 'text', '3': 1, '4': 1, '5': 9, '10': 'text'},
    {'1': 'from_lang', '3': 2, '4': 1, '5': 9, '9': 0, '10': 'fromLang', '17': true},
  ],
  '8': [
    {'1': '_from_lang'},
  ],
};

/// Descriptor for `TextRequest`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List textRequestDescriptor = $convert.base64Decode(
    'CgtUZXh0UmVxdWVzdBISCgR0ZXh0GAEgASgJUgR0ZXh0EiAKCWZyb21fbGFuZxgCIAEoCUgAUg'
    'hmcm9tTGFuZ4gBAUIMCgpfZnJvbV9sYW5n');

@$core.Deprecated('Use translateStreamRequestDescriptor instead')
const TranslateStreamRequest$json = {
  '1': 'TranslateStreamRequest',
  '2': [
    {'1': 'text', '3': 1, '4': 1, '5': 9, '10': 'text'},
    {'1': 'sense_id', '3': 2, '4': 1, '5': 9, '10': 'senseId'},
    {'1': 'fingerprint', '3': 3, '4': 1, '5': 9, '10': 'fingerprint'},
    {'1': 'from_lang', '3': 4, '4': 1, '5': 9, '10': 'fromLang'},
    {'1': 'to_lang', '3': 5, '4': 1, '5': 9, '10': 'toLang'},
    {'1': 'src_lang', '3': 6, '4': 1, '5': 9, '10': 'srcLang'},
    {'1': 'dst_lang', '3': 7, '4': 1, '5': 9, '10': 'dstLang'},
    {'1': 'request_id', '3': 8, '4': 1, '5': 9, '9': 0, '10': 'requestId', '17': true},
    {'1': 'persistent', '3': 9, '4': 1, '5': 8, '9': 1, '10': 'persistent', '17': true},
    {'1': 'is_correction', '3': 10, '4': 1, '5': 8, '9': 2, '10': 'isCorrection', '17': true},
    {'1': 'corrected_translation', '3': 11, '4': 1, '5': 9, '9': 3, '10': 'correctedTranslation', '17': true},
    {'1': 'texts', '3': 12, '4': 3, '5': 11, '6': '.translation.TextRequest', '10': 'texts'},
  ],
  '8': [
    {'1': '_request_id'},
    {'1': '_persistent'},
    {'1': '_is_correction'},
    {'1': '_corrected_translation'},
  ],
};

/// Descriptor for `TranslateStreamRequest`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List translateStreamRequestDescriptor = $convert.base64Decode(
    'ChZUcmFuc2xhdGVTdHJlYW1SZXF1ZXN0EhIKBHRleHQYASABKAlSBHRleHQSGQoIc2Vuc2VfaW'
    'QYAiABKAlSB3NlbnNlSWQSIAoLZmluZ2VycHJpbnQYAyABKAlSC2ZpbmdlcnByaW50EhsKCWZy'
    'b21fbGFuZxgEIAEoCVIIZnJvbUxhbmcSFwoHdG9fbGFuZxgFIAEoCVIGdG9MYW5nEhkKCHNyY1'
    '9sYW5nGAYgASgJUgdzcmNMYW5nEhkKCGRzdF9sYW5nGAcgASgJUgdkc3RMYW5nEiIKCnJlcXVl'
    'c3RfaWQYCCABKAlIAFIJcmVxdWVzdElkiAEBEiMKCnBlcnNpc3RlbnQYCSABKAhIAVIKcGVyc2'
    'lzdGVudIgBARIoCg1pc19jb3JyZWN0aW9uGAogASgISAJSDGlzQ29ycmVjdGlvbogBARI4ChVj'
    'b3JyZWN0ZWRfdHJhbnNsYXRpb24YCyABKAlIA1IUY29ycmVjdGVkVHJhbnNsYXRpb26IAQESLg'
    'oFdGV4dHMYDCADKAsyGC50cmFuc2xhdGlvbi5UZXh0UmVxdWVzdFIFdGV4dHNCDQoLX3JlcXVl'
    'c3RfaWRCDQoLX3BlcnNpc3RlbnRCEAoOX2lzX2NvcnJlY3Rpb25CGAoWX2NvcnJlY3RlZF90cm'
    'Fuc2xhdGlvbg==');

@$core.Deprecated('Use translateStreamResponseDescriptor instead')
const TranslateStreamResponse$json = {
  '1': 'TranslateStreamResponse',
  '2': [
    {'1': 'original_text', '3': 1, '4': 1, '5': 9, '10': 'originalText'},
    {'1': 'translation', '3': 2, '4': 3, '5': 11, '6': '.translation.TranslateStreamResponse.TranslationEntry', '10': 'translation'},
    {'1': 'timestamp', '3': 3, '4': 1, '5': 3, '10': 'timestamp'},
    {'1': 'finished', '3': 4, '4': 1, '5': 8, '10': 'finished'},
    {'1': 'batch_index', '3': 5, '4': 1, '5': 5, '10': 'batchIndex'},
    {'1': 'request_id', '3': 6, '4': 1, '5': 9, '9': 0, '10': 'requestId', '17': true},
    {'1': 'src_lang', '3': 7, '4': 1, '5': 9, '9': 1, '10': 'srcLang', '17': true},
    {'1': 'dst_lang', '3': 8, '4': 1, '5': 9, '9': 2, '10': 'dstLang', '17': true},
  ],
  '3': [TranslateStreamResponse_TranslationEntry$json],
  '8': [
    {'1': '_request_id'},
    {'1': '_src_lang'},
    {'1': '_dst_lang'},
  ],
};

@$core.Deprecated('Use translateStreamResponseDescriptor instead')
const TranslateStreamResponse_TranslationEntry$json = {
  '1': 'TranslationEntry',
  '2': [
    {'1': 'key', '3': 1, '4': 1, '5': 9, '10': 'key'},
    {'1': 'value', '3': 2, '4': 1, '5': 9, '10': 'value'},
  ],
  '7': {'7': true},
};

/// Descriptor for `TranslateStreamResponse`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List translateStreamResponseDescriptor = $convert.base64Decode(
    'ChdUcmFuc2xhdGVTdHJlYW1SZXNwb25zZRIjCg1vcmlnaW5hbF90ZXh0GAEgASgJUgxvcmlnaW'
    '5hbFRleHQSVwoLdHJhbnNsYXRpb24YAiADKAsyNS50cmFuc2xhdGlvbi5UcmFuc2xhdGVTdHJl'
    'YW1SZXNwb25zZS5UcmFuc2xhdGlvbkVudHJ5Ugt0cmFuc2xhdGlvbhIcCgl0aW1lc3RhbXAYAy'
    'ABKANSCXRpbWVzdGFtcBIaCghmaW5pc2hlZBgEIAEoCFIIZmluaXNoZWQSHwoLYmF0Y2hfaW5k'
    'ZXgYBSABKAVSCmJhdGNoSW5kZXgSIgoKcmVxdWVzdF9pZBgGIAEoCUgAUglyZXF1ZXN0SWSIAQ'
    'ESHgoIc3JjX2xhbmcYByABKAlIAVIHc3JjTGFuZ4gBARIeCghkc3RfbGFuZxgIIAEoCUgCUgdk'
    'c3RMYW5niAEBGj4KEFRyYW5zbGF0aW9uRW50cnkSEAoDa2V5GAEgASgJUgNrZXkSFAoFdmFsdW'
    'UYAiABKAlSBXZhbHVlOgI4AUINCgtfcmVxdWVzdF9pZEILCglfc3JjX2xhbmdCCwoJX2RzdF9s'
    'YW5n');

@$core.Deprecated('Use lLMTranslateRequestDescriptor instead')
const LLMTranslateRequest$json = {
  '1': 'LLMTranslateRequest',
  '2': [
    {'1': 'text', '3': 1, '4': 1, '5': 9, '10': 'text'},
    {'1': 'from_lang', '3': 2, '4': 1, '5': 9, '10': 'fromLang'},
    {'1': 'to_lang', '3': 3, '4': 1, '5': 9, '10': 'toLang'},
    {'1': 'sense_id', '3': 4, '4': 1, '5': 9, '10': 'senseId'},
    {'1': 'fingerprint', '3': 5, '4': 1, '5': 9, '10': 'fingerprint'},
  ],
};

/// Descriptor for `LLMTranslateRequest`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List lLMTranslateRequestDescriptor = $convert.base64Decode(
    'ChNMTE1UcmFuc2xhdGVSZXF1ZXN0EhIKBHRleHQYASABKAlSBHRleHQSGwoJZnJvbV9sYW5nGA'
    'IgASgJUghmcm9tTGFuZxIXCgd0b19sYW5nGAMgASgJUgZ0b0xhbmcSGQoIc2Vuc2VfaWQYBCAB'
    'KAlSB3NlbnNlSWQSIAoLZmluZ2VycHJpbnQYBSABKAlSC2ZpbmdlcnByaW50');

@$core.Deprecated('Use lLMTranslateResponseDescriptor instead')
const LLMTranslateResponse$json = {
  '1': 'LLMTranslateResponse',
  '2': [
    {'1': 'translation', '3': 1, '4': 1, '5': 9, '10': 'translation'},
    {'1': 'from_lang', '3': 2, '4': 1, '5': 9, '10': 'fromLang'},
    {'1': 'to_lang', '3': 3, '4': 1, '5': 9, '10': 'toLang'},
  ],
};

/// Descriptor for `LLMTranslateResponse`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List lLMTranslateResponseDescriptor = $convert.base64Decode(
    'ChRMTE1UcmFuc2xhdGVSZXNwb25zZRIgCgt0cmFuc2xhdGlvbhgBIAEoCVILdHJhbnNsYXRpb2'
    '4SGwoJZnJvbV9sYW5nGAIgASgJUghmcm9tTGFuZxIXCgd0b19sYW5nGAMgASgJUgZ0b0xhbmc=');

