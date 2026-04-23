// This is a generated file - do not edit.
//
// Generated from translation.proto.

// @dart = 3.3

// ignore_for_file: annotate_overrides, camel_case_types, comment_references
// ignore_for_file: constant_identifier_names
// ignore_for_file: curly_braces_in_flow_control_structures
// ignore_for_file: deprecated_member_use_from_same_package, library_prefixes
// ignore_for_file: non_constant_identifier_names

import 'dart:async' as $async;
import 'dart:core' as $core;

import 'package:grpc/service_api.dart' as $grpc;
import 'package:protobuf/protobuf.dart' as $pb;

import 'translation.pb.dart' as $0;

export 'translation.pb.dart';

/// TranslationService 翻译服务
/// 提供统一的翻译查询接口，支持普通查询和流式推送
@$pb.GrpcServiceName('translation.TranslationService')
class TranslationServiceClient extends $grpc.Client {
  /// The hostname for this service.
  static const $core.String defaultHost = '';

  /// OAuth scopes needed for the client.
  static const $core.List<$core.String> oauthScopes = [
    '',
  ];

  TranslationServiceClient(super.channel, {super.options, super.interceptors});

  /// GetSenseTranslate 查询指定sense的翻译，一次性返回所有结果
  /// 类似现有的REST API端点
  $grpc.ResponseFuture<$0.GetSenseTranslateResponse> getSenseTranslate($0.GetSenseTranslateRequest request, {$grpc.CallOptions? options,}) {
    return $createUnaryCall(_$getSenseTranslate, request, options: options);
  }

  /// TranslateStream 服务器流式推送翻译结果
  /// 客户端发送一个查询请求，服务端逐条推送翻译结果
  /// 适合大数据量实时推送场景
  $grpc.ResponseStream<$0.TranslateStreamResponse> translateStream($0.TranslateStreamRequest request, {$grpc.CallOptions? options,}) {
    return $createStreamingCall(_$translateStream, $async.Stream.fromIterable([request]), options: options);
  }

  /// TranslateBidirectional 双向流式翻译
  /// 客户端可以持续发送多个查询请求，服务端持续推送结果
  /// 适合交互式翻译场景
  $grpc.ResponseStream<$0.TranslateStreamResponse> translateBidirectional($async.Stream<$0.TranslateStreamRequest> request, {$grpc.CallOptions? options,}) {
    return $createStreamingCall(_$translateBidirectional, request, options: options);
  }

  /// LLMTranslate 大模型翻译（一元RPC）
  /// 使用配置的大模型翻译provider进行实时翻译
  $grpc.ResponseFuture<$0.LLMTranslateResponse> lLMTranslate($0.LLMTranslateRequest request, {$grpc.CallOptions? options,}) {
    return $createUnaryCall(_$lLMTranslate, request, options: options);
  }

  /// LLMTranslateStream 大模型流式翻译
  /// 使用配置的大模型翻译provider进行实时翻译，流式推送结果
  $grpc.ResponseStream<$0.LLMTranslateResponse> lLMTranslateStream($0.LLMTranslateRequest request, {$grpc.CallOptions? options,}) {
    return $createStreamingCall(_$lLMTranslateStream, $async.Stream.fromIterable([request]), options: options);
  }

    // method descriptors

  static final _$getSenseTranslate = $grpc.ClientMethod<$0.GetSenseTranslateRequest, $0.GetSenseTranslateResponse>(
      '/translation.TranslationService/GetSenseTranslate',
      ($0.GetSenseTranslateRequest value) => value.writeToBuffer(),
      $0.GetSenseTranslateResponse.fromBuffer);
  static final _$translateStream = $grpc.ClientMethod<$0.TranslateStreamRequest, $0.TranslateStreamResponse>(
      '/translation.TranslationService/TranslateStream',
      ($0.TranslateStreamRequest value) => value.writeToBuffer(),
      $0.TranslateStreamResponse.fromBuffer);
  static final _$translateBidirectional = $grpc.ClientMethod<$0.TranslateStreamRequest, $0.TranslateStreamResponse>(
      '/translation.TranslationService/TranslateBidirectional',
      ($0.TranslateStreamRequest value) => value.writeToBuffer(),
      $0.TranslateStreamResponse.fromBuffer);
  static final _$lLMTranslate = $grpc.ClientMethod<$0.LLMTranslateRequest, $0.LLMTranslateResponse>(
      '/translation.TranslationService/LLMTranslate',
      ($0.LLMTranslateRequest value) => value.writeToBuffer(),
      $0.LLMTranslateResponse.fromBuffer);
  static final _$lLMTranslateStream = $grpc.ClientMethod<$0.LLMTranslateRequest, $0.LLMTranslateResponse>(
      '/translation.TranslationService/LLMTranslateStream',
      ($0.LLMTranslateRequest value) => value.writeToBuffer(),
      $0.LLMTranslateResponse.fromBuffer);
}

@$pb.GrpcServiceName('translation.TranslationService')
abstract class TranslationServiceBase extends $grpc.Service {
  $core.String get $name => 'translation.TranslationService';

  TranslationServiceBase() {
    $addMethod($grpc.ServiceMethod<$0.GetSenseTranslateRequest, $0.GetSenseTranslateResponse>(
        'GetSenseTranslate',
        getSenseTranslate_Pre,
        false,
        false,
        ($core.List<$core.int> value) => $0.GetSenseTranslateRequest.fromBuffer(value),
        ($0.GetSenseTranslateResponse value) => value.writeToBuffer()));
    $addMethod($grpc.ServiceMethod<$0.TranslateStreamRequest, $0.TranslateStreamResponse>(
        'TranslateStream',
        translateStream_Pre,
        false,
        true,
        ($core.List<$core.int> value) => $0.TranslateStreamRequest.fromBuffer(value),
        ($0.TranslateStreamResponse value) => value.writeToBuffer()));
    $addMethod($grpc.ServiceMethod<$0.TranslateStreamRequest, $0.TranslateStreamResponse>(
        'TranslateBidirectional',
        translateBidirectional,
        true,
        true,
        ($core.List<$core.int> value) => $0.TranslateStreamRequest.fromBuffer(value),
        ($0.TranslateStreamResponse value) => value.writeToBuffer()));
    $addMethod($grpc.ServiceMethod<$0.LLMTranslateRequest, $0.LLMTranslateResponse>(
        'LLMTranslate',
        lLMTranslate_Pre,
        false,
        false,
        ($core.List<$core.int> value) => $0.LLMTranslateRequest.fromBuffer(value),
        ($0.LLMTranslateResponse value) => value.writeToBuffer()));
    $addMethod($grpc.ServiceMethod<$0.LLMTranslateRequest, $0.LLMTranslateResponse>(
        'LLMTranslateStream',
        lLMTranslateStream_Pre,
        false,
        true,
        ($core.List<$core.int> value) => $0.LLMTranslateRequest.fromBuffer(value),
        ($0.LLMTranslateResponse value) => value.writeToBuffer()));
  }

  $async.Future<$0.GetSenseTranslateResponse> getSenseTranslate_Pre($grpc.ServiceCall $call, $async.Future<$0.GetSenseTranslateRequest> $request) async {
    return getSenseTranslate($call, await $request);
  }

  $async.Future<$0.GetSenseTranslateResponse> getSenseTranslate($grpc.ServiceCall call, $0.GetSenseTranslateRequest request);

  $async.Stream<$0.TranslateStreamResponse> translateStream_Pre($grpc.ServiceCall $call, $async.Future<$0.TranslateStreamRequest> $request) async* {
    yield* translateStream($call, await $request);
  }

  $async.Stream<$0.TranslateStreamResponse> translateStream($grpc.ServiceCall call, $0.TranslateStreamRequest request);

  $async.Stream<$0.TranslateStreamResponse> translateBidirectional($grpc.ServiceCall call, $async.Stream<$0.TranslateStreamRequest> request);

  $async.Future<$0.LLMTranslateResponse> lLMTranslate_Pre($grpc.ServiceCall $call, $async.Future<$0.LLMTranslateRequest> $request) async {
    return lLMTranslate($call, await $request);
  }

  $async.Future<$0.LLMTranslateResponse> lLMTranslate($grpc.ServiceCall call, $0.LLMTranslateRequest request);

  $async.Stream<$0.LLMTranslateResponse> lLMTranslateStream_Pre($grpc.ServiceCall $call, $async.Future<$0.LLMTranslateRequest> $request) async* {
    yield* lLMTranslateStream($call, await $request);
  }

  $async.Stream<$0.LLMTranslateResponse> lLMTranslateStream($grpc.ServiceCall call, $0.LLMTranslateRequest request);

}
