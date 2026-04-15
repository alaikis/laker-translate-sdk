/**
 * TranslationService 翻译服务
 * 提供统一的翻译查询接口，支持普通查询和流式推送
 *
 * @generated from service translation.TranslationService
 */
export declare const TranslationService: {
    readonly typeName: "translation.TranslationService";
    readonly methods: {
        /**
         * GetSenseTranslate 查询指定sense的翻译，一次性返回所有结果
         * 类似现有的REST API端点
         *
         * @generated from rpc translation.TranslationService.GetSenseTranslate
         */
        readonly getSenseTranslate: {
            readonly name: "GetSenseTranslate";
            readonly I: import("@bufbuild/protobuf/codegenv2").GenMessage<import("./translation_pb.js").GetSenseTranslateRequest>;
            readonly O: import("@bufbuild/protobuf/codegenv2").GenMessage<import("./translation_pb.js").GetSenseTranslateResponse>;
            readonly kind: any;
        };
        /**
         * TranslateStream 服务器流式推送翻译结果
         * 客户端发送一个查询请求，服务端逐条推送翻译结果
         * 适合大数据量实时推送场景
         *
         * @generated from rpc translation.TranslationService.TranslateStream
         */
        readonly translateStream: {
            readonly name: "TranslateStream";
            readonly I: import("@bufbuild/protobuf/codegenv2").GenMessage<import("./translation_pb.js").TranslateStreamRequest>;
            readonly O: import("@bufbuild/protobuf/codegenv2").GenMessage<import("./translation_pb.js").TranslateStreamResponse>;
            readonly kind: any;
        };
    };
};
