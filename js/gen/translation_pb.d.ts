import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";
/**
 * GetSenseTranslateRequest 查询指定sense的翻译请求
 *
 * @generated from message translation.GetSenseTranslateRequest
 */
export declare class GetSenseTranslateRequest extends Message<GetSenseTranslateRequest> {
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
    constructor(data?: PartialMessage<GetSenseTranslateRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "translation.GetSenseTranslateRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GetSenseTranslateRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GetSenseTranslateRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GetSenseTranslateRequest;
    static equals(a: GetSenseTranslateRequest | PlainMessage<GetSenseTranslateRequest> | undefined, b: GetSenseTranslateRequest | PlainMessage<GetSenseTranslateRequest> | undefined): boolean;
}
/**
 * TranslateRecord 单条翻译记录
 *
 * @generated from message translation.TranslateRecord
 */
export declare class TranslateRecord extends Message<TranslateRecord> {
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
    constructor(data?: PartialMessage<TranslateRecord>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "translation.TranslateRecord";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): TranslateRecord;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): TranslateRecord;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): TranslateRecord;
    static equals(a: TranslateRecord | PlainMessage<TranslateRecord> | undefined, b: TranslateRecord | PlainMessage<TranslateRecord> | undefined): boolean;
}
/**
 * GetSenseTranslateResponse 翻译查询响应
 *
 * @generated from message translation.GetSenseTranslateResponse
 */
export declare class GetSenseTranslateResponse extends Message<GetSenseTranslateResponse> {
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
    constructor(data?: PartialMessage<GetSenseTranslateResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "translation.GetSenseTranslateResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GetSenseTranslateResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GetSenseTranslateResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GetSenseTranslateResponse;
    static equals(a: GetSenseTranslateResponse | PlainMessage<GetSenseTranslateResponse> | undefined, b: GetSenseTranslateResponse | PlainMessage<GetSenseTranslateResponse> | undefined): boolean;
}
/**
 * TranslateStreamRequest 流式翻译请求
 *
 * @generated from message translation.TranslateStreamRequest
 */
export declare class TranslateStreamRequest extends Message<TranslateStreamRequest> {
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
    constructor(data?: PartialMessage<TranslateStreamRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "translation.TranslateStreamRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): TranslateStreamRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): TranslateStreamRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): TranslateStreamRequest;
    static equals(a: TranslateStreamRequest | PlainMessage<TranslateStreamRequest> | undefined, b: TranslateStreamRequest | PlainMessage<TranslateStreamRequest> | undefined): boolean;
}
/**
 * TranslateStreamResponse 流式翻译响应
 *
 * @generated from message translation.TranslateStreamResponse
 */
export declare class TranslateStreamResponse extends Message<TranslateStreamResponse> {
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
    /**
     * 源语言代码
     * JS SDK可以根据返回的src_lang决定缓存键
     *
     * @generated from field: optional string src_lang = 7;
     */
    srcLang?: string;
    /**
     * 目标语言代码
     * JS SDK可以根据返回的dst_lang决定缓存键
     *
     * @generated from field: optional string dst_lang = 8;
     */
    dstLang?: string;
    constructor(data?: PartialMessage<TranslateStreamResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "translation.TranslateStreamResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): TranslateStreamResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): TranslateStreamResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): TranslateStreamResponse;
    static equals(a: TranslateStreamResponse | PlainMessage<TranslateStreamResponse> | undefined, b: TranslateStreamResponse | PlainMessage<TranslateStreamResponse> | undefined): boolean;
}
