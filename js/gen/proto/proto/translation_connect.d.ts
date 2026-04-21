import { MethodKind } from "@bufbuild/protobuf";
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
            readonly I: any;
            readonly O: any;
            readonly kind: MethodKind.Unary;
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
            readonly I: any;
            readonly O: any;
            readonly kind: MethodKind.ServerStreaming;
        };
        /**
         * TranslateBidirectional 双向流式翻译
         * 客户端可以持续发送多个查询请求，服务端持续推送结果
         * 适合交互式翻译场景
         *
         * @generated from rpc translation.TranslationService.TranslateBidirectional
         */
        readonly translateBidirectional: {
            readonly name: "TranslateBidirectional";
            readonly I: any;
            readonly O: any;
            readonly kind: MethodKind.BiDiStreaming;
        };
        /**
         * LLMTranslate 大模型翻译（一元RPC）
         * 使用配置的大模型翻译provider进行实时翻译
         *
         * @generated from rpc translation.TranslationService.LLMTranslate
         */
        readonly lLMTranslate: {
            readonly name: "LLMTranslate";
            readonly I: any;
            readonly O: any;
            readonly kind: MethodKind.Unary;
        };
        /**
         * LLMTranslateStream 大模型流式翻译
         * 使用配置的大模型翻译provider进行实时翻译，流式推送结果
         *
         * @generated from rpc translation.TranslationService.LLMTranslateStream
         */
        readonly lLMTranslateStream: {
            readonly name: "LLMTranslateStream";
            readonly I: any;
            readonly O: any;
            readonly kind: MethodKind.ServerStreaming;
        };
    };
};
