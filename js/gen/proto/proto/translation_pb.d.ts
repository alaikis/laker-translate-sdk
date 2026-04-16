import type { GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv2";
import type { Message } from "@bufbuild/protobuf";
/**
 * Describes the file proto/translation.proto.
 */
export declare const file_proto_translation: GenFile;
/**
 * GetSenseTranslateRequest 查询指定sense的翻译请求
 *
 * @generated from message translation.GetSenseTranslateRequest
 */
export type GetSenseTranslateRequest = Message<"translation.GetSenseTranslateRequest"> & {
    /**
     * 语义sense ID，必填
     *
     * @generated from field: string sense_id = 1;
     */
    senseId: string;
    /**
     * 用户指纹，用于查询个性化翻译，可选
     *
     * @generated from field: optional string fingerprint = 2;
     */
    fingerprint?: string;
    /**
     * 页码，默认1
     *
     * @generated from field: int32 page = 3;
     */
    page: number;
    /**
     * 每页大小，默认1000，最大5000
     *
     * @generated from field: int32 page_size = 4;
     */
    pageSize: number;
};
/**
 * Describes the message translation.GetSenseTranslateRequest.
 * Use `create(GetSenseTranslateRequestSchema)` to create a new message.
 */
export declare const GetSenseTranslateRequestSchema: GenMessage<GetSenseTranslateRequest>;
/**
 * TranslateRecord 单条翻译记录
 *
 * @generated from message translation.TranslateRecord
 */
export type TranslateRecord = Message<"translation.TranslateRecord"> & {
    /**
     * 原文
     *
     * @generated from field: string text = 1;
     */
    text: string;
    /**
     * 译文
     *
     * @generated from field: string translate = 2;
     */
    translate: string;
};
/**
 * Describes the message translation.TranslateRecord.
 * Use `create(TranslateRecordSchema)` to create a new message.
 */
export declare const TranslateRecordSchema: GenMessage<TranslateRecord>;
/**
 * GetSenseTranslateResponse 翻译查询响应
 *
 * @generated from message translation.GetSenseTranslateResponse
 */
export type GetSenseTranslateResponse = Message<"translation.GetSenseTranslateResponse"> & {
    /**
     * 通用翻译，key是原文，value是译文
     *
     * @generated from field: map<string, string> common = 1;
     */
    common: {
        [key: string]: string;
    };
    /**
     * 个性化翻译，key是原文，value是译文，只有提供fingerprint时才有
     *
     * @generated from field: map<string, string> special = 2;
     */
    special: {
        [key: string]: string;
    };
    /**
     * 当前页码
     *
     * @generated from field: int32 page = 3;
     */
    page: number;
    /**
     * 每页大小
     *
     * @generated from field: int32 page_size = 4;
     */
    pageSize: number;
    /**
     * 总记录数
     *
     * @generated from field: int64 total = 5;
     */
    total: bigint;
    /**
     * 总页数
     *
     * @generated from field: int64 total_pages = 6;
     */
    totalPages: bigint;
    /**
     * 个性化翻译总记录数，只有提供fingerprint时才有
     *
     * @generated from field: int64 special_total = 7;
     */
    specialTotal: bigint;
};
/**
 * Describes the message translation.GetSenseTranslateResponse.
 * Use `create(GetSenseTranslateResponseSchema)` to create a new message.
 */
export declare const GetSenseTranslateResponseSchema: GenMessage<GetSenseTranslateResponse>;
/**
 * TranslateStreamRequest 流式翻译请求
 *
 * @generated from message translation.TranslateStreamRequest
 */
export type TranslateStreamRequest = Message<"translation.TranslateStreamRequest"> & {
    /**
     * 用户输入文本（可选，用于上下文）
     *
     * @generated from field: string text = 1;
     */
    text: string;
    /**
     * 要查询的sense ID
     *
     * @generated from field: string sense_id = 2;
     */
    senseId: string;
    /**
     * 用户指纹，可选
     *
     * @generated from field: string fingerprint = 3;
     */
    fingerprint: string;
    /**
     * 源语言，可选，用于翻译
     *
     * @generated from field: string from_lang = 4;
     */
    fromLang: string;
    /**
     * 目标语言，必填，用于翻译
     *
     * @generated from field: string to_lang = 5;
     */
    toLang: string;
    /**
     * 源语言过滤，可选，只返回指定源语言的翻译
     *
     * @generated from field: string src_lang = 6;
     */
    srcLang: string;
    /**
     * 目标语言过滤，可选，只返回指定目标语言的翻译（预加载翻译池必填）
     *
     * @generated from field: string dst_lang = 7;
     */
    dstLang: string;
    /**
     * 请求唯一ID，用于匹配持久流式连接的响应
     * 每个请求通过 request_id 匹配对应响应
     *
     * @generated from field: optional string request_id = 8;
     */
    requestId?: string;
    /**
     * 是否保持持久连接
     * 如果为 true，服务器会持续处理所有 pending 请求并不主动关闭连接
     *
     * @generated from field: optional bool persistent = 9;
     */
    persistent?: boolean;
};
/**
 * Describes the message translation.TranslateStreamRequest.
 * Use `create(TranslateStreamRequestSchema)` to create a new message.
 */
export declare const TranslateStreamRequestSchema: GenMessage<TranslateStreamRequest>;
/**
 * TranslateStreamResponse 流式翻译响应
 *
 * @generated from message translation.TranslateStreamResponse
 */
export type TranslateStreamResponse = Message<"translation.TranslateStreamResponse"> & {
    /**
     * 原始请求文本
     *
     * @generated from field: string original_text = 1;
     */
    originalText: string;
    /**
     * 翻译结果，key是原文，value是译文
     *
     * @generated from field: map<string, string> translation = 2;
     */
    translation: {
        [key: string]: string;
    };
    /**
     * 时间戳
     *
     * @generated from field: int64 timestamp = 3;
     */
    timestamp: bigint;
    /**
     * 是否是最后一条消息，完成标识
     *
     * @generated from field: bool finished = 4;
     */
    finished: boolean;
    /**
     * 当前批次序号，从0开始
     *
     * @generated from field: int32 batch_index = 5;
     */
    batchIndex: number;
    /**
     * 请求唯一ID，匹配请求的 request_id
     * 如果是持久流式连接，必须携带 request_id
     *
     * @generated from field: optional string request_id = 6;
     */
    requestId?: string;
};
/**
 * Describes the message translation.TranslateStreamResponse.
 * Use `create(TranslateStreamResponseSchema)` to create a new message.
 */
export declare const TranslateStreamResponseSchema: GenMessage<TranslateStreamResponse>;
/**
 * TranslationService 翻译服务
 * 提供统一的翻译查询接口，支持普通查询和流式推送
 *
 * @generated from service translation.TranslationService
 */
export declare const TranslationService: GenService<{
    /**
     * GetSenseTranslate 查询指定sense的翻译，一次性返回所有结果
     * 类似现有的REST API端点
     *
     * @generated from rpc translation.TranslationService.GetSenseTranslate
     */
    getSenseTranslate: {
        methodKind: "unary";
        input: typeof GetSenseTranslateRequestSchema;
        output: typeof GetSenseTranslateResponseSchema;
    };
    /**
     * TranslateStream 服务器流式推送翻译结果
     * 客户端发送一个查询请求，服务端逐条推送翻译结果
     * 适合大数据量实时推送场景
     *
     * @generated from rpc translation.TranslationService.TranslateStream
     */
    translateStream: {
        methodKind: "server_streaming";
        input: typeof TranslateStreamRequestSchema;
        output: typeof TranslateStreamResponseSchema;
    };
}>;
