'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var protobuf = require('@bufbuild/protobuf');
var connect = require('@connectrpc/connect');
var connectWeb = require('@connectrpc/connect-web');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

// @generated by protoc-gen-es v1.10.0 with parameter "target=ts,import_extension=.js"
// @generated from file proto/translation.proto (package translation, syntax proto3)
/* eslint-disable */
// @ts-nocheck
/**
 * GetSenseTranslateRequest 查询指定sense的翻译请求
 *
 * @generated from message translation.GetSenseTranslateRequest
 */
var GetSenseTranslateRequest = /** @class */ (function (_super) {
    __extends(GetSenseTranslateRequest, _super);
    function GetSenseTranslateRequest(data) {
        var _this = _super.call(this) || this;
        /**
         * 语义sense ID，必填
         *
         * @generated from field: string sense_id = 1;
         */
        _this.senseId = "";
        /**
         * 页码，默认1
         *
         * @generated from field: int32 page = 3;
         */
        _this.page = 0;
        /**
         * 每页大小，默认1000，最大5000
         *
         * @generated from field: int32 page_size = 4;
         */
        _this.pageSize = 0;
        /**
         * 源语言过滤，可选，只返回指定源语言的翻译
         *
         * @generated from field: string from_lang = 5;
         */
        _this.fromLang = "";
        /**
         * 目标语言过滤，可选，只返回指定目标语言的翻译
         *
         * @generated from field: string to_lang = 6;
         */
        _this.toLang = "";
        protobuf.proto3.util.initPartial(data, _this);
        return _this;
    }
    GetSenseTranslateRequest.fromBinary = function (bytes, options) {
        return new GetSenseTranslateRequest().fromBinary(bytes, options);
    };
    GetSenseTranslateRequest.fromJson = function (jsonValue, options) {
        return new GetSenseTranslateRequest().fromJson(jsonValue, options);
    };
    GetSenseTranslateRequest.fromJsonString = function (jsonString, options) {
        return new GetSenseTranslateRequest().fromJsonString(jsonString, options);
    };
    GetSenseTranslateRequest.equals = function (a, b) {
        return protobuf.proto3.util.equals(GetSenseTranslateRequest, a, b);
    };
    GetSenseTranslateRequest.runtime = protobuf.proto3;
    GetSenseTranslateRequest.typeName = "translation.GetSenseTranslateRequest";
    GetSenseTranslateRequest.fields = protobuf.proto3.util.newFieldList(function () { return [
        { no: 1, name: "sense_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 2, name: "fingerprint", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
        { no: 3, name: "page", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
        { no: 4, name: "page_size", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
        { no: 5, name: "from_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 6, name: "to_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    ]; });
    return GetSenseTranslateRequest;
}(protobuf.Message));
/**
 * TranslateRecord 单条翻译记录
 *
 * @generated from message translation.TranslateRecord
 */
/** @class */ ((function (_super) {
    __extends(TranslateRecord, _super);
    function TranslateRecord(data) {
        var _this = _super.call(this) || this;
        /**
         * 原文
         *
         * @generated from field: string text = 1;
         */
        _this.text = "";
        /**
         * 译文
         *
         * @generated from field: string translate = 2;
         */
        _this.translate = "";
        protobuf.proto3.util.initPartial(data, _this);
        return _this;
    }
    TranslateRecord.fromBinary = function (bytes, options) {
        return new TranslateRecord().fromBinary(bytes, options);
    };
    TranslateRecord.fromJson = function (jsonValue, options) {
        return new TranslateRecord().fromJson(jsonValue, options);
    };
    TranslateRecord.fromJsonString = function (jsonString, options) {
        return new TranslateRecord().fromJsonString(jsonString, options);
    };
    TranslateRecord.equals = function (a, b) {
        return protobuf.proto3.util.equals(TranslateRecord, a, b);
    };
    TranslateRecord.runtime = protobuf.proto3;
    TranslateRecord.typeName = "translation.TranslateRecord";
    TranslateRecord.fields = protobuf.proto3.util.newFieldList(function () { return [
        { no: 1, name: "text", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 2, name: "translate", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    ]; });
    return TranslateRecord;
})(protobuf.Message));
/**
 * GetSenseTranslateResponse 翻译查询响应
 *
 * @generated from message translation.GetSenseTranslateResponse
 */
var GetSenseTranslateResponse = /** @class */ (function (_super) {
    __extends(GetSenseTranslateResponse, _super);
    function GetSenseTranslateResponse(data) {
        var _this = _super.call(this) || this;
        /**
         * 通用翻译，key是原文，value是译文
         *
         * @generated from field: map<string, string> common = 1;
         */
        _this.common = {};
        /**
         * 个性化翻译，key是原文，value是译文，只有提供fingerprint时才有
         *
         * @generated from field: map<string, string> special = 2;
         */
        _this.special = {};
        /**
         * 当前页码
         *
         * @generated from field: int32 page = 3;
         */
        _this.page = 0;
        /**
         * 每页大小
         *
         * @generated from field: int32 page_size = 4;
         */
        _this.pageSize = 0;
        /**
         * 总记录数
         *
         * @generated from field: int64 total = 5;
         */
        _this.total = protobuf.protoInt64.zero;
        /**
         * 总页数
         *
         * @generated from field: int64 total_pages = 6;
         */
        _this.totalPages = protobuf.protoInt64.zero;
        /**
         * 个性化翻译总记录数，只有提供fingerprint时才有
         *
         * @generated from field: int64 special_total = 7;
         */
        _this.specialTotal = protobuf.protoInt64.zero;
        protobuf.proto3.util.initPartial(data, _this);
        return _this;
    }
    GetSenseTranslateResponse.fromBinary = function (bytes, options) {
        return new GetSenseTranslateResponse().fromBinary(bytes, options);
    };
    GetSenseTranslateResponse.fromJson = function (jsonValue, options) {
        return new GetSenseTranslateResponse().fromJson(jsonValue, options);
    };
    GetSenseTranslateResponse.fromJsonString = function (jsonString, options) {
        return new GetSenseTranslateResponse().fromJsonString(jsonString, options);
    };
    GetSenseTranslateResponse.equals = function (a, b) {
        return protobuf.proto3.util.equals(GetSenseTranslateResponse, a, b);
    };
    GetSenseTranslateResponse.runtime = protobuf.proto3;
    GetSenseTranslateResponse.typeName = "translation.GetSenseTranslateResponse";
    GetSenseTranslateResponse.fields = protobuf.proto3.util.newFieldList(function () { return [
        { no: 1, name: "common", kind: "map", K: 9 /* ScalarType.STRING */, V: { kind: "scalar", T: 9 /* ScalarType.STRING */ } },
        { no: 2, name: "special", kind: "map", K: 9 /* ScalarType.STRING */, V: { kind: "scalar", T: 9 /* ScalarType.STRING */ } },
        { no: 3, name: "page", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
        { no: 4, name: "page_size", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
        { no: 5, name: "total", kind: "scalar", T: 3 /* ScalarType.INT64 */ },
        { no: 6, name: "total_pages", kind: "scalar", T: 3 /* ScalarType.INT64 */ },
        { no: 7, name: "special_total", kind: "scalar", T: 3 /* ScalarType.INT64 */ },
    ]; });
    return GetSenseTranslateResponse;
}(protobuf.Message));
/**
 * TextRequest 单个文本翻译请求
 * 用于批量翻译未缓存文本场景
 *
 * @generated from message translation.TextRequest
 */
var TextRequest = /** @class */ (function (_super) {
    __extends(TextRequest, _super);
    function TextRequest(data) {
        var _this = _super.call(this) || this;
        /**
         * 要翻译的原文
         *
         * @generated from field: string text = 1;
         */
        _this.text = "";
        protobuf.proto3.util.initPartial(data, _this);
        return _this;
    }
    TextRequest.fromBinary = function (bytes, options) {
        return new TextRequest().fromBinary(bytes, options);
    };
    TextRequest.fromJson = function (jsonValue, options) {
        return new TextRequest().fromJson(jsonValue, options);
    };
    TextRequest.fromJsonString = function (jsonString, options) {
        return new TextRequest().fromJsonString(jsonString, options);
    };
    TextRequest.equals = function (a, b) {
        return protobuf.proto3.util.equals(TextRequest, a, b);
    };
    TextRequest.runtime = protobuf.proto3;
    TextRequest.typeName = "translation.TextRequest";
    TextRequest.fields = protobuf.proto3.util.newFieldList(function () { return [
        { no: 1, name: "text", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 2, name: "from_lang", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
    ]; });
    return TextRequest;
}(protobuf.Message));
/**
 * TranslateStreamRequest 流式翻译请求
 *
 * @generated from message translation.TranslateStreamRequest
 */
var TranslateStreamRequest = /** @class */ (function (_super) {
    __extends(TranslateStreamRequest, _super);
    function TranslateStreamRequest(data) {
        var _this = _super.call(this) || this;
        /**
         * 用户输入文本（可选，用于上下文）
         *
         * @generated from field: string text = 1;
         */
        _this.text = "";
        /**
         * 要查询的sense ID
         *
         * @generated from field: string sense_id = 2;
         */
        _this.senseId = "";
        /**
         * 用户指纹，可选
         *
         * @generated from field: string fingerprint = 3;
         */
        _this.fingerprint = "";
        /**
         * 源语言，可选，用于翻译
         *
         * @generated from field: string from_lang = 4;
         */
        _this.fromLang = "";
        /**
         * 目标语言，必填，用于翻译
         *
         * @generated from field: string to_lang = 5;
         */
        _this.toLang = "";
        /**
         * 源语言过滤，可选，只返回指定源语言的翻译
         *
         * @generated from field: string src_lang = 6;
         */
        _this.srcLang = "";
        /**
         * 目标语言过滤，可选，只返回指定目标语言的翻译（预加载翻译池必填）
         *
         * @generated from field: string dst_lang = 7;
         */
        _this.dstLang = "";
        /**
         * 批量翻译未缓存文本列表
         * JS SDK 批量翻译未命中缓存的文本时使用
         *
         * @generated from field: repeated translation.TextRequest texts = 12;
         */
        _this.texts = [];
        protobuf.proto3.util.initPartial(data, _this);
        return _this;
    }
    TranslateStreamRequest.fromBinary = function (bytes, options) {
        return new TranslateStreamRequest().fromBinary(bytes, options);
    };
    TranslateStreamRequest.fromJson = function (jsonValue, options) {
        return new TranslateStreamRequest().fromJson(jsonValue, options);
    };
    TranslateStreamRequest.fromJsonString = function (jsonString, options) {
        return new TranslateStreamRequest().fromJsonString(jsonString, options);
    };
    TranslateStreamRequest.equals = function (a, b) {
        return protobuf.proto3.util.equals(TranslateStreamRequest, a, b);
    };
    TranslateStreamRequest.runtime = protobuf.proto3;
    TranslateStreamRequest.typeName = "translation.TranslateStreamRequest";
    TranslateStreamRequest.fields = protobuf.proto3.util.newFieldList(function () { return [
        { no: 1, name: "text", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 2, name: "sense_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 3, name: "fingerprint", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 4, name: "from_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 5, name: "to_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 6, name: "src_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 7, name: "dst_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 8, name: "request_id", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
        { no: 9, name: "persistent", kind: "scalar", T: 8 /* ScalarType.BOOL */, opt: true },
        { no: 10, name: "is_correction", kind: "scalar", T: 8 /* ScalarType.BOOL */, opt: true },
        { no: 11, name: "corrected_translation", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
        { no: 12, name: "texts", kind: "message", T: TextRequest, repeated: true },
    ]; });
    return TranslateStreamRequest;
}(protobuf.Message));
/**
 * TranslateStreamResponse 流式翻译响应
 *
 * @generated from message translation.TranslateStreamResponse
 */
var TranslateStreamResponse = /** @class */ (function (_super) {
    __extends(TranslateStreamResponse, _super);
    function TranslateStreamResponse(data) {
        var _this = _super.call(this) || this;
        /**
         * 原始请求文本
         *
         * @generated from field: string original_text = 1;
         */
        _this.originalText = "";
        /**
         * 翻译结果，key是原文，value是译文
         *
         * @generated from field: map<string, string> translation = 2;
         */
        _this.translation = {};
        /**
         * 时间戳
         *
         * @generated from field: int64 timestamp = 3;
         */
        _this.timestamp = protobuf.protoInt64.zero;
        /**
         * 是否是最后一条消息，完成标识
         *
         * @generated from field: bool finished = 4;
         */
        _this.finished = false;
        /**
         * 当前批次序号，从0开始
         *
         * @generated from field: int32 batch_index = 5;
         */
        _this.batchIndex = 0;
        protobuf.proto3.util.initPartial(data, _this);
        return _this;
    }
    TranslateStreamResponse.fromBinary = function (bytes, options) {
        return new TranslateStreamResponse().fromBinary(bytes, options);
    };
    TranslateStreamResponse.fromJson = function (jsonValue, options) {
        return new TranslateStreamResponse().fromJson(jsonValue, options);
    };
    TranslateStreamResponse.fromJsonString = function (jsonString, options) {
        return new TranslateStreamResponse().fromJsonString(jsonString, options);
    };
    TranslateStreamResponse.equals = function (a, b) {
        return protobuf.proto3.util.equals(TranslateStreamResponse, a, b);
    };
    TranslateStreamResponse.runtime = protobuf.proto3;
    TranslateStreamResponse.typeName = "translation.TranslateStreamResponse";
    TranslateStreamResponse.fields = protobuf.proto3.util.newFieldList(function () { return [
        { no: 1, name: "original_text", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 2, name: "translation", kind: "map", K: 9 /* ScalarType.STRING */, V: { kind: "scalar", T: 9 /* ScalarType.STRING */ } },
        { no: 3, name: "timestamp", kind: "scalar", T: 3 /* ScalarType.INT64 */ },
        { no: 4, name: "finished", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
        { no: 5, name: "batch_index", kind: "scalar", T: 5 /* ScalarType.INT32 */ },
        { no: 6, name: "request_id", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
        { no: 7, name: "src_lang", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
        { no: 8, name: "dst_lang", kind: "scalar", T: 9 /* ScalarType.STRING */, opt: true },
    ]; });
    return TranslateStreamResponse;
}(protobuf.Message));
/**
 * LLMTranslateRequest 大模型翻译请求
 *
 * @generated from message translation.LLMTranslateRequest
 */
var LLMTranslateRequest = /** @class */ (function (_super) {
    __extends(LLMTranslateRequest, _super);
    function LLMTranslateRequest(data) {
        var _this = _super.call(this) || this;
        /**
         * 要翻译的原文
         *
         * @generated from field: string text = 1;
         */
        _this.text = "";
        /**
         * 源语言
         *
         * @generated from field: string from_lang = 2;
         */
        _this.fromLang = "";
        /**
         * 目标语言
         *
         * @generated from field: string to_lang = 3;
         */
        _this.toLang = "";
        /**
         * 语义sense ID，可选
         *
         * @generated from field: string sense_id = 4;
         */
        _this.senseId = "";
        /**
         * 用户指纹，可选
         *
         * @generated from field: string fingerprint = 5;
         */
        _this.fingerprint = "";
        protobuf.proto3.util.initPartial(data, _this);
        return _this;
    }
    LLMTranslateRequest.fromBinary = function (bytes, options) {
        return new LLMTranslateRequest().fromBinary(bytes, options);
    };
    LLMTranslateRequest.fromJson = function (jsonValue, options) {
        return new LLMTranslateRequest().fromJson(jsonValue, options);
    };
    LLMTranslateRequest.fromJsonString = function (jsonString, options) {
        return new LLMTranslateRequest().fromJsonString(jsonString, options);
    };
    LLMTranslateRequest.equals = function (a, b) {
        return protobuf.proto3.util.equals(LLMTranslateRequest, a, b);
    };
    LLMTranslateRequest.runtime = protobuf.proto3;
    LLMTranslateRequest.typeName = "translation.LLMTranslateRequest";
    LLMTranslateRequest.fields = protobuf.proto3.util.newFieldList(function () { return [
        { no: 1, name: "text", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 2, name: "from_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 3, name: "to_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 4, name: "sense_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 5, name: "fingerprint", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    ]; });
    return LLMTranslateRequest;
}(protobuf.Message));
/**
 * LLMTranslateResponse 大模型翻译响应
 *
 * @generated from message translation.LLMTranslateResponse
 */
var LLMTranslateResponse = /** @class */ (function (_super) {
    __extends(LLMTranslateResponse, _super);
    function LLMTranslateResponse(data) {
        var _this = _super.call(this) || this;
        /**
         * 翻译结果
         *
         * @generated from field: string translation = 1;
         */
        _this.translation = "";
        /**
         * 源语言
         *
         * @generated from field: string from_lang = 2;
         */
        _this.fromLang = "";
        /**
         * 目标语言
         *
         * @generated from field: string to_lang = 3;
         */
        _this.toLang = "";
        protobuf.proto3.util.initPartial(data, _this);
        return _this;
    }
    LLMTranslateResponse.fromBinary = function (bytes, options) {
        return new LLMTranslateResponse().fromBinary(bytes, options);
    };
    LLMTranslateResponse.fromJson = function (jsonValue, options) {
        return new LLMTranslateResponse().fromJson(jsonValue, options);
    };
    LLMTranslateResponse.fromJsonString = function (jsonString, options) {
        return new LLMTranslateResponse().fromJsonString(jsonString, options);
    };
    LLMTranslateResponse.equals = function (a, b) {
        return protobuf.proto3.util.equals(LLMTranslateResponse, a, b);
    };
    LLMTranslateResponse.runtime = protobuf.proto3;
    LLMTranslateResponse.typeName = "translation.LLMTranslateResponse";
    LLMTranslateResponse.fields = protobuf.proto3.util.newFieldList(function () { return [
        { no: 1, name: "translation", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 2, name: "from_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
        { no: 3, name: "to_lang", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    ]; });
    return LLMTranslateResponse;
}(protobuf.Message));

// @generated by protoc-gen-connect-es v1.7.0 with parameter "target=ts,import_extension=.js"
// @generated from file proto/translation.proto (package translation, syntax proto3)
/* eslint-disable */
// @ts-nocheck
/**
 * TranslationService 翻译服务
 * 提供统一的翻译查询接口，支持普通查询和流式推送
 *
 * @generated from service translation.TranslationService
 */
var TranslationService = {
    typeName: "translation.TranslationService",
    methods: {
        /**
         * GetSenseTranslate 查询指定sense的翻译，一次性返回所有结果
         * 类似现有的REST API端点
         *
         * @generated from rpc translation.TranslationService.GetSenseTranslate
         */
        getSenseTranslate: {
            name: "GetSenseTranslate",
            I: GetSenseTranslateRequest,
            O: GetSenseTranslateResponse,
            kind: protobuf.MethodKind.Unary,
        },
        /**
         * TranslateStream 服务器流式推送翻译结果
         * 客户端发送一个查询请求，服务端逐条推送翻译结果
         * 适合大数据量实时推送场景
         *
         * @generated from rpc translation.TranslationService.TranslateStream
         */
        translateStream: {
            name: "TranslateStream",
            I: TranslateStreamRequest,
            O: TranslateStreamResponse,
            kind: protobuf.MethodKind.ServerStreaming,
        },
        /**
         * TranslateBidirectional 双向流式翻译
         * 客户端可以持续发送多个查询请求，服务端持续推送结果
         * 适合交互式翻译场景
         *
         * @generated from rpc translation.TranslationService.TranslateBidirectional
         */
        translateBidirectional: {
            name: "TranslateBidirectional",
            I: TranslateStreamRequest,
            O: TranslateStreamResponse,
            kind: protobuf.MethodKind.BiDiStreaming,
        },
        /**
         * LLMTranslate 大模型翻译（一元RPC）
         * 使用配置的大模型翻译provider进行实时翻译
         *
         * @generated from rpc translation.TranslationService.LLMTranslate
         */
        lLMTranslate: {
            name: "LLMTranslate",
            I: LLMTranslateRequest,
            O: LLMTranslateResponse,
            kind: protobuf.MethodKind.Unary,
        },
        /**
         * LLMTranslateStream 大模型流式翻译
         * 使用配置的大模型翻译provider进行实时翻译，流式推送结果
         *
         * @generated from rpc translation.TranslationService.LLMTranslateStream
         */
        lLMTranslateStream: {
            name: "LLMTranslateStream",
            I: LLMTranslateRequest,
            O: LLMTranslateResponse,
            kind: protobuf.MethodKind.ServerStreaming,
        },
    }
};

/**
 * IndexedDB Storage Wrapper for Translation Cache
 * Provides a more scalable storage solution than localStorage for large translation datasets
 *
 * Features:
 * - Supports storing large amounts of translation data (up to hundreds of MBs)
 * - Asynchronous operations don't block the main thread
 * - Supports indexes for fast lookups
 * - Automatic data expiration support
 */
var TranslationIndexedDB = /** @class */ (function () {
    function TranslationIndexedDB(options) {
        if (options === void 0) { options = {}; }
        this.db = null;
        this.initPromise = null;
        this.dbName = options.databaseName || 'laker-translation-cache';
        this.dbVersion = options.databaseVersion || 1;
        this.storeName = options.storeName || 'translations';
    }
    /**
     * Initialize the IndexedDB database
     */
    TranslationIndexedDB.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.db)
                    return [2 /*return*/];
                if (this.initPromise)
                    return [2 /*return*/, this.initPromise];
                this.initPromise = new Promise(function (resolve, reject) {
                    if (typeof indexedDB === 'undefined') {
                        reject(new Error('IndexedDB is not available in this environment'));
                        return;
                    }
                    var request = indexedDB.open(_this.dbName, _this.dbVersion);
                    request.onerror = function () {
                        console.error('[TranslationIndexedDB] Failed to open database:', request.error);
                        reject(request.error);
                    };
                    request.onsuccess = function () {
                        _this.db = request.result;
                        console.log('[TranslationIndexedDB] Database opened successfully');
                        resolve();
                    };
                    request.onupgradeneeded = function (event) {
                        var db = event.target.result;
                        // Create object store with keyPath
                        if (!db.objectStoreNames.contains(_this.storeName)) {
                            var store = db.createObjectStore(_this.storeName, { keyPath: 'id' });
                            // Create indexes for fast lookups
                            store.createIndex('poolKey', 'poolKey', { unique: false });
                            store.createIndex('text', 'text', { unique: false });
                            store.createIndex('dstLang', 'dstLang', { unique: false });
                            store.createIndex('expiresAt', 'expiresAt', { unique: false });
                            console.log('[TranslationIndexedDB] Object store created with indexes');
                        }
                    };
                });
                return [2 /*return*/, this.initPromise];
            });
        });
    };
    /**
     * Get a translation by pool key and text
     */
    TranslationIndexedDB.prototype.get = function (poolKey, text) {
        return __awaiter(this, void 0, void 0, function () {
            var id;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        if (!this.db)
                            return [2 /*return*/, null];
                        id = "".concat(poolKey, ":").concat(text);
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var transaction = _this.db.transaction([_this.storeName], 'readonly');
                                var store = transaction.objectStore(_this.storeName);
                                var request = store.get(id);
                                request.onerror = function () {
                                    console.error('[TranslationIndexedDB] Failed to get translation:', request.error);
                                    reject(request.error);
                                };
                                request.onsuccess = function () {
                                    var entry = request.result;
                                    // Check if entry has expired
                                    if (entry && entry.expiresAt && entry.expiresAt < Date.now()) {
                                        // Auto-delete expired entry
                                        _this.delete(poolKey, text).catch(console.error);
                                        resolve(null);
                                    }
                                    else {
                                        resolve(entry || null);
                                    }
                                };
                            })];
                }
            });
        });
    };
    /**
     * Get all translations for a pool key
     */
    TranslationIndexedDB.prototype.getAllByPoolKey = function (poolKey) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        if (!this.db)
                            return [2 /*return*/, []];
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var transaction = _this.db.transaction([_this.storeName], 'readonly');
                                var store = transaction.objectStore(_this.storeName);
                                var index = store.index('poolKey');
                                var request = index.getAll(poolKey);
                                request.onerror = function () {
                                    console.error('[TranslationIndexedDB] Failed to get translations by pool key:', request.error);
                                    reject(request.error);
                                };
                                request.onsuccess = function () {
                                    var entries = request.result;
                                    var now = Date.now();
                                    // Filter out expired entries and delete them
                                    var validEntries = [];
                                    var expiredIds = [];
                                    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                                        var entry = entries_1[_i];
                                        if (entry.expiresAt && entry.expiresAt < now) {
                                            expiredIds.push(entry.id);
                                        }
                                        else {
                                            validEntries.push(entry);
                                        }
                                    }
                                    // Delete expired entries in background
                                    if (expiredIds.length > 0) {
                                        _this.deleteMany(expiredIds).catch(console.error);
                                    }
                                    resolve(validEntries);
                                };
                            })];
                }
            });
        });
    };
    /**
     * Set a translation entry
     */
    TranslationIndexedDB.prototype.set = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        if (!this.db)
                            return [2 /*return*/];
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var transaction = _this.db.transaction([_this.storeName], 'readwrite');
                                var store = transaction.objectStore(_this.storeName);
                                var request = store.put(entry);
                                request.onerror = function () {
                                    console.error('[TranslationIndexedDB] Failed to set translation:', request.error);
                                    reject(request.error);
                                };
                                request.onsuccess = function () {
                                    resolve();
                                };
                            })];
                }
            });
        });
    };
    /**
     * Set multiple translation entries at once
     */
    TranslationIndexedDB.prototype.setMany = function (entries) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        if (!this.db || entries.length === 0)
                            return [2 /*return*/];
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var transaction = _this.db.transaction([_this.storeName], 'readwrite');
                                var store = transaction.objectStore(_this.storeName);
                                for (var _i = 0, entries_2 = entries; _i < entries_2.length; _i++) {
                                    var entry = entries_2[_i];
                                    store.put(entry);
                                }
                                transaction.oncomplete = function () {
                                    resolve();
                                };
                                transaction.onerror = function () {
                                    console.error('[TranslationIndexedDB] Failed to set many translations:', transaction.error);
                                    reject(transaction.error);
                                };
                            })];
                }
            });
        });
    };
    /**
     * Delete a translation entry
     */
    TranslationIndexedDB.prototype.delete = function (poolKey, text) {
        return __awaiter(this, void 0, void 0, function () {
            var id;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        if (!this.db)
                            return [2 /*return*/];
                        id = "".concat(poolKey, ":").concat(text);
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var transaction = _this.db.transaction([_this.storeName], 'readwrite');
                                var store = transaction.objectStore(_this.storeName);
                                var request = store.delete(id);
                                request.onerror = function () {
                                    console.error('[TranslationIndexedDB] Failed to delete translation:', request.error);
                                    reject(request.error);
                                };
                                request.onsuccess = function () {
                                    resolve();
                                };
                            })];
                }
            });
        });
    };
    /**
     * Delete multiple translation entries
     */
    TranslationIndexedDB.prototype.deleteMany = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        if (!this.db || ids.length === 0)
                            return [2 /*return*/];
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var transaction = _this.db.transaction([_this.storeName], 'readwrite');
                                var store = transaction.objectStore(_this.storeName);
                                for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
                                    var id = ids_1[_i];
                                    store.delete(id);
                                }
                                transaction.oncomplete = function () {
                                    resolve();
                                };
                                transaction.onerror = function () {
                                    console.error('[TranslationIndexedDB] Failed to delete many translations:', transaction.error);
                                    reject(transaction.error);
                                };
                            })];
                }
            });
        });
    };
    /**
     * Delete all translations for a pool key
     */
    TranslationIndexedDB.prototype.deleteAllByPoolKey = function (poolKey) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        if (!this.db)
                            return [2 /*return*/];
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var transaction = _this.db.transaction([_this.storeName], 'readwrite');
                                var store = transaction.objectStore(_this.storeName);
                                var index = store.index('poolKey');
                                var request = index.openCursor(IDBKeyRange.only(poolKey));
                                request.onerror = function () {
                                    console.error('[TranslationIndexedDB] Failed to delete translations by pool key:', request.error);
                                    reject(request.error);
                                };
                                request.onsuccess = function (event) {
                                    var cursor = event.target.result;
                                    if (cursor) {
                                        cursor.delete();
                                        cursor.continue();
                                    }
                                    else {
                                        resolve();
                                    }
                                };
                            })];
                }
            });
        });
    };
    /**
     * Clear all translations from the database
     */
    TranslationIndexedDB.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        if (!this.db)
                            return [2 /*return*/];
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var transaction = _this.db.transaction([_this.storeName], 'readwrite');
                                var store = transaction.objectStore(_this.storeName);
                                var request = store.clear();
                                request.onerror = function () {
                                    console.error('[TranslationIndexedDB] Failed to clear translations:', request.error);
                                    reject(request.error);
                                };
                                request.onsuccess = function () {
                                    resolve();
                                };
                            })];
                }
            });
        });
    };
    /**
     * Get the count of all entries
     */
    TranslationIndexedDB.prototype.count = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        if (!this.db)
                            return [2 /*return*/, 0];
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var transaction = _this.db.transaction([_this.storeName], 'readonly');
                                var store = transaction.objectStore(_this.storeName);
                                var request = store.count();
                                request.onerror = function () {
                                    console.error('[TranslationIndexedDB] Failed to count translations:', request.error);
                                    reject(request.error);
                                };
                                request.onsuccess = function () {
                                    resolve(request.result);
                                };
                            })];
                }
            });
        });
    };
    /**
     * Clean up expired entries
     */
    TranslationIndexedDB.prototype.cleanupExpired = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        if (!this.db)
                            return [2 /*return*/, 0];
                        now = Date.now();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var transaction = _this.db.transaction([_this.storeName], 'readwrite');
                                var store = transaction.objectStore(_this.storeName);
                                var index = store.index('expiresAt');
                                var range = IDBKeyRange.upperBound(now);
                                var request = index.openCursor(range);
                                var deletedCount = 0;
                                request.onerror = function () {
                                    console.error('[TranslationIndexedDB] Failed to cleanup expired translations:', request.error);
                                    reject(request.error);
                                };
                                request.onsuccess = function (event) {
                                    var cursor = event.target.result;
                                    if (cursor) {
                                        cursor.delete();
                                        deletedCount++;
                                        cursor.continue();
                                    }
                                    else {
                                        resolve(deletedCount);
                                    }
                                };
                            })];
                }
            });
        });
    };
    /**
     * Close the database connection
     */
    TranslationIndexedDB.prototype.close = function () {
        if (this.db) {
            this.db.close();
            this.db = null;
            this.initPromise = null;
        }
    };
    return TranslationIndexedDB;
}());
// Default instance for use across the SDK
new TranslationIndexedDB();

/**
 * Translation Service Connect RPC TypeScript/JavaScript Client
 *
 * Auto-generated for api.laker.dev Translation Service
 * Service: TranslationService
 * Source: proto/translation.proto
 *
 * This client uses Connect RPC for native HTTP streaming over HTTP/2
 * Supports true multiplexing on a single connection
 * Supports both web browsers and Node.js
 */
var createConnectTransport;
// Detect environment:
// - Browser (window exists) → use connect-web
// - React Native / Expo (navigator.product === 'ReactNative' || global?.__DEV__) → use connect-web
// - Node.js → use connect-node
var isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative' ||
    typeof global !== 'undefined' && global.__DEV__ !== undefined;
var isBrowser = typeof window !== 'undefined' || isReactNative;
var hasFetch = typeof fetch === 'function';
// Check if browser already preloaded the transport (for IIFE standalone build)
if (isBrowser && typeof window !== 'undefined' && window.__LAKER_BROWSER_TRANSPORT) {
    createConnectTransport = window.__LAKER_BROWSER_TRANSPORT;
}
else if (hasFetch && isBrowser) {
    // Browser / React Native / Expo environment - use statically imported connect-web
    // User's project already has @connectrpc/connect-web as dependency so it's available
    createConnectTransport = connectWeb.createConnectTransport;
}
else {
    // Node.js environment - use connect-node (based on Node.js HTTP/2)
    if (typeof require !== 'undefined') {
        (createConnectTransport = require('@connectrpc/connect-node').createConnectTransport);
    }
    else {
        // For pure ESM environments
        import('@connectrpc/connect-node').then(function (mod) {
            createConnectTransport = mod.createConnectTransport;
        });
    }
}
var cachedTransports = new Map();
function getTransportCacheKey(key) {
    // Create a stable cache key based on baseUrl, token presence and interceptor count
    // Interceptors are not compared by value - they are expected to be stable
    return "".concat(key.baseUrl, "|").concat(!!key.token, "|").concat(key.interceptors.length);
}
var defaultCrossTabOptions = {
    enabled: false,
    channelName: 'laker-translation-cache',
    storageKeyPrefix: 'laker_translation_',
};
/**
 * Automatic template extraction from text containing numeric variables
 * Also handles existing {varName} style templates
 * @param text Original text that may contain numeric variables
 * @returns Template extraction result
 */
function extractTemplate(text) {
    var result = text;
    var variables = [];
    // First, extract existing {name} style templates
    var braceRegex = /\{([^}]+)\}/g;
    var braceMatch;
    // We need to build a new string with the braces kept, but collect the variable names
    // For existing brace templates, we just extract their names as variables
    while ((braceMatch = braceRegex.exec(result)) !== null) {
        var varName = braceMatch[1];
        if (varName) {
            variables.push(varName);
        }
    }
    // If no existing brace templates, look for numeric variables to convert
    if (variables.length === 0) {
        var numberRegex = /\d+(?:\.\d+)?/g;
        var matches = text.match(numberRegex);
        if (matches && matches.length > 0) {
            var template_1 = text;
            matches.forEach(function (match, index) {
                var value = match;
                var varName = "var".concat(index + 1);
                template_1 = template_1.replace(match, "{".concat(varName, "}"));
                variables.push(value);
                result = template_1;
            });
        }
    }
    return {
        isTemplated: variables.length > 0,
        srcTemplate: result,
        dstTemplate: '',
        variables: variables,
    };
}
/**
 * Merge template with variables
 * @param template Template with {variable} placeholders
 * @param vars Object mapping variable names to values
 * @returns Merged text with variables substituted
 */
function mergeTemplate(template, vars) {
    var result = template;
    for (var _i = 0, _a = Object.entries(vars); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        result = result.replace(new RegExp("\\{".concat(key, "\\}"), 'g'), String(value));
    }
    return result;
}
// Version from package.json
var version = '1.6.150';
var TranslationPool = /** @class */ (function () {
    function TranslationPool(client, senseId, options) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        this.pools = new Map();
        this.currentFingerprint = null;
        this.currentToLang = null;
        this.broadcastChannel = null;
        this.loading = false;
        this.loadedCombinations = new Set();
        this.currentLanguageVersion = 0;
        this.queuedRequests = [];
        this.pendingResolutions = {};
        this.onTranslationLoaded = null;
        this.onPoolInitialized = null;
        this.onQueueProcessed = null;
        this.onTranslationUpdated = null;
        this.onCompensationTranslate = null;
        this.backgroundUpdateTimer = null;
        this.entryMetadata = new Map();
        this.updateCallback = null;
        // IndexedDB instance for browser cache storage (replaces localStorage for large datasets)
        this.indexedDB = null;
        // Whether to use IndexedDB instead of localStorage (browser only, for large datasets)
        this.useIndexedDB = false;
        this.client = client;
        this.senseId = senseId;
        this.defaultFromLang = options === null || options === void 0 ? void 0 : options.defaultFromLang;
        // Set up crossTabOptions with defaults
        this.crossTabOptions = __assign(__assign({}, defaultCrossTabOptions), options === null || options === void 0 ? void 0 : options.crossTab);
        // Set up backgroundUpdateOptions with defaults
        this.backgroundUpdateOptions = {
            enabled: (_b = (_a = options === null || options === void 0 ? void 0 : options.backgroundUpdate) === null || _a === void 0 ? void 0 : _a.enabled) !== null && _b !== void 0 ? _b : false,
            intervalMs: (_d = (_c = options === null || options === void 0 ? void 0 : options.backgroundUpdate) === null || _c === void 0 ? void 0 : _c.intervalMs) !== null && _d !== void 0 ? _d : 5 * 60 * 1000,
            batchSize: (_f = (_e = options === null || options === void 0 ? void 0 : options.backgroundUpdate) === null || _e === void 0 ? void 0 : _e.batchSize) !== null && _f !== void 0 ? _f : 50,
            staleThresholdMs: (_h = (_g = options === null || options === void 0 ? void 0 : options.backgroundUpdate) === null || _g === void 0 ? void 0 : _g.staleThresholdMs) !== null && _h !== void 0 ? _h : 24 * 60 * 60 * 1000,
        };
        // Store full options including defaults for API access
        this.options = __assign(__assign({}, options), { senseId: senseId, crossTab: this.crossTabOptions, backgroundUpdate: this.backgroundUpdateOptions });
        this.persistentStorage = options === null || options === void 0 ? void 0 : options.persistentStorage;
        if (this.crossTabOptions.enabled && typeof BroadcastChannel !== 'undefined') {
            this.initCrossTabSync();
        }
        // Initialize IndexedDB for browser cache storage (replaces localStorage for large datasets)
        // Only use IndexedDB in browser environment when explicitly enabled or when localStorage is unavailable
        var useIndexedDBOption = (_j = options === null || options === void 0 ? void 0 : options.useIndexedDB) !== null && _j !== void 0 ? _j : false;
        var isBrowserWithIDB = typeof indexedDB !== 'undefined';
        if (useIndexedDBOption && isBrowserWithIDB) {
            this.useIndexedDB = true;
            this.indexedDB = new TranslationIndexedDB({
                databaseName: "laker-translation-".concat(senseId),
                storeName: 'translations',
            });
            // Initialize the database and load cache asynchronously
            this.indexedDB.init()
                .then(function () { return _this.loadFromStorage(); })
                .catch(function (err) {
                console.warn('[TranslationPool] Failed to initialize IndexedDB, falling back to localStorage:', err);
                _this.useIndexedDB = false;
                _this.indexedDB = null;
                _this.loadFromStorage();
            });
        }
        else {
            // Load from localStorage synchronously
            this.loadFromStorage();
        }
        this.startBackgroundUpdateChecker();
    }
    /**
     * Add a pending resolution for a persistent stream request
     * Used when request has a request_id that will be matched on the response
     */
    TranslationPool.prototype.addPendingResolver = function (requestId, resolve, reject) {
        this.pendingResolutions[requestId] = {
            resolve: resolve,
            reject: reject,
            resolveList: [resolve],
            rejectList: [reject],
        };
    };
    TranslationPool.prototype.getPoolKey = function (fingerprint, toLang) {
        return "".concat(fingerprint, ":").concat(toLang);
    };
    TranslationPool.prototype.setTranslationLoadedCallback = function (callback) {
        this.onTranslationLoaded = callback;
    };
    TranslationPool.prototype.setPoolInitializedCallback = function (callback) {
        this.onPoolInitialized = callback;
    };
    TranslationPool.prototype.setQueueProcessedCallback = function (callback) {
        this.onQueueProcessed = callback;
    };
    TranslationPool.prototype.setTranslationUpdatedCallback = function (callback) {
        this.onTranslationUpdated = callback;
    };
    /**
     * Set callback to receive compensation translation requests when language is switched
     * After switching to a new language, the callback will be invoked with all texts that exist
     * in the old language pools but are missing in the new language. The integrator should
     * queue these texts for translation to ensure all visible text gets translated.
     * @param callback Callback that receives the list of missing texts and the new target language
     */
    TranslationPool.prototype.setCompensationTranslateCallback = function (callback) {
        this.onCompensationTranslate = callback;
    };
    TranslationPool.prototype.initCrossTabSync = function () {
        var _this = this;
        this.broadcastChannel = new BroadcastChannel(this.crossTabOptions.channelName);
        this.broadcastChannel.onmessage = function (event) {
            var message = event.data;
            if (message.senseId !== _this.senseId) {
                return;
            }
            switch (message.type) {
                case 'cache_update':
                    _this.handleCacheUpdate(message);
                    break;
                case 'cache_clear':
                    _this.handleCacheClear(message);
                    break;
                case 'request_initial_sync':
                    _this.handleInitialSyncRequest();
                    break;
            }
        };
        this.broadcastChannel.postMessage({
            type: 'request_initial_sync',
            senseId: this.senseId,
        });
    };
    TranslationPool.prototype.loadFromStorage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var prefix, loadPromises, i, key, afterPrefix, colonIndex, fingerprint, toLang;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.useIndexedDB && this.indexedDB)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadFromIndexedDB()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        if (typeof localStorage === 'undefined' || !this.crossTabOptions.enabled) {
                            return [2 /*return*/];
                        }
                        prefix = "".concat(this.crossTabOptions.storageKeyPrefix).concat(this.senseId, "_");
                        loadPromises = [];
                        for (i = 0; i < localStorage.length; i++) {
                            key = localStorage.key(i);
                            if (key && key.startsWith(prefix) && key.includes(':')) {
                                afterPrefix = key.substring(prefix.length);
                                colonIndex = afterPrefix.lastIndexOf(':');
                                if (colonIndex > 0) {
                                    fingerprint = afterPrefix.substring(0, colonIndex);
                                    toLang = afterPrefix.substring(colonIndex + 1);
                                    // Load all cached fingerprints from storage, not just common
                                    loadPromises.push(this.loadLanguageFromStorage(fingerprint, toLang));
                                }
                            }
                        }
                        return [4 /*yield*/, Promise.all(loadPromises)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load translations from IndexedDB
     */
    TranslationPool.prototype.loadFromIndexedDB = function () {
        return __awaiter(this, void 0, void 0, function () {
            var allEntries, poolKeyMap, _i, allEntries_1, entry, poolKey, colonIndex, poolData, _loop_1, this_1, _a, poolKeyMap_1, _b, poolKey, data, e_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.indexedDB)
                            return [2 /*return*/];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.indexedDB.getAllByPoolKey("".concat(this.senseId, "_"))];
                    case 2:
                        allEntries = _c.sent();
                        poolKeyMap = new Map();
                        for (_i = 0, allEntries_1 = allEntries; _i < allEntries_1.length; _i++) {
                            entry = allEntries_1[_i];
                            poolKey = entry.poolKey;
                            colonIndex = poolKey.indexOf(':');
                            if (colonIndex > 0) {
                                poolData = poolKeyMap.get(poolKey);
                                if (!poolData) {
                                    poolData = [];
                                    poolKeyMap.set(poolKey, poolData);
                                }
                                poolData.push({ text: entry.text, translation: entry.translation });
                            }
                        }
                        _loop_1 = function (poolKey, data) {
                            var pool = this_1.pools.get(poolKey);
                            if (!pool) {
                                pool = new Map();
                                this_1.pools.set(poolKey, pool);
                            }
                            data.forEach(function (_a) {
                                var text = _a.text, translation = _a.translation;
                                pool === null || pool === void 0 ? void 0 : pool.set(text, translation);
                            });
                            this_1.loadedCombinations.add(poolKey);
                        };
                        this_1 = this;
                        // Load each pool
                        for (_a = 0, poolKeyMap_1 = poolKeyMap; _a < poolKeyMap_1.length; _a++) {
                            _b = poolKeyMap_1[_a], poolKey = _b[0], data = _b[1];
                            _loop_1(poolKey, data);
                        }
                        console.log("[TranslationPool] Loaded ".concat(allEntries.length, " translations from IndexedDB"));
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _c.sent();
                        console.warn('Failed to load translation cache from IndexedDB:', e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TranslationPool.prototype.loadLanguageFromStorage = function (fingerprint, toLang) {
        return __awaiter(this, void 0, void 0, function () {
            var poolKey, storageKey, stored, data, pool_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        poolKey = this.getPoolKey(fingerprint, toLang);
                        if (!(this.useIndexedDB && this.indexedDB)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadLanguageFromIndexedDB(fingerprint, toLang)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        storageKey = this.getStorageKey(fingerprint, toLang);
                        try {
                            stored = localStorage.getItem(storageKey);
                            if (stored) {
                                data = JSON.parse(stored);
                                pool_1 = this.pools.get(poolKey);
                                if (!pool_1) {
                                    pool_1 = new Map();
                                    this.pools.set(poolKey, pool_1);
                                }
                                data.forEach(function (_a) {
                                    var text = _a.text, translation = _a.translation;
                                    pool_1 === null || pool_1 === void 0 ? void 0 : pool_1.set(text, translation);
                                });
                                this.loadedCombinations.add(poolKey);
                            }
                        }
                        catch (e) {
                            console.warn('Failed to load translation cache from localStorage:', e);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load translations for a specific fingerprint and language from IndexedDB
     */
    TranslationPool.prototype.loadLanguageFromIndexedDB = function (fingerprint, toLang) {
        return __awaiter(this, void 0, void 0, function () {
            var poolKey, dbPoolKey, entries, pool_2, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.indexedDB)
                            return [2 /*return*/];
                        poolKey = this.getPoolKey(fingerprint, toLang);
                        dbPoolKey = "".concat(this.senseId, "_").concat(poolKey);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.indexedDB.getAllByPoolKey(dbPoolKey)];
                    case 2:
                        entries = _a.sent();
                        if (entries.length > 0) {
                            pool_2 = this.pools.get(poolKey);
                            if (!pool_2) {
                                pool_2 = new Map();
                                this.pools.set(poolKey, pool_2);
                            }
                            entries.forEach(function (entry) {
                                pool_2 === null || pool_2 === void 0 ? void 0 : pool_2.set(entry.text, entry.translation);
                            });
                            this.loadedCombinations.add(poolKey);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        console.warn('Failed to load translation cache from IndexedDB:', e_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TranslationPool.prototype.getStorageKey = function (fingerprint, toLang) {
        return "".concat(this.crossTabOptions.storageKeyPrefix).concat(this.senseId, "_").concat(fingerprint, ":").concat(toLang);
    };
    TranslationPool.prototype.saveToStorage = function (fingerprint, toLang) {
        // If IndexedDB is enabled, save to IndexedDB instead of localStorage
        if (this.useIndexedDB && this.indexedDB) {
            this.saveToIndexedDB(fingerprint, toLang);
            return;
        }
        if (typeof localStorage === 'undefined' || !this.crossTabOptions.enabled) {
            return;
        }
        var poolKey = this.getPoolKey(fingerprint, toLang);
        var storageKey = this.getStorageKey(fingerprint, toLang);
        try {
            var pool = this.pools.get(poolKey);
            var data_1 = [];
            if (pool) {
                pool.forEach(function (translation, text) {
                    data_1.push({ text: text, translation: translation });
                });
            }
            localStorage.setItem(storageKey, JSON.stringify(data_1));
        }
        catch (e) {
            console.warn('Failed to save translation cache to localStorage:', e);
        }
    };
    /**
     * Save translations to IndexedDB
     */
    TranslationPool.prototype.saveToIndexedDB = function (fingerprint, toLang) {
        return __awaiter(this, void 0, void 0, function () {
            var poolKey, dbPoolKey, pool, entries, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.indexedDB)
                            return [2 /*return*/];
                        poolKey = this.getPoolKey(fingerprint, toLang);
                        dbPoolKey = "".concat(this.senseId, "_").concat(poolKey);
                        pool = this.pools.get(poolKey);
                        if (!pool || pool.size === 0)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        // First delete existing entries for this pool
                        return [4 /*yield*/, this.indexedDB.deleteAllByPoolKey(dbPoolKey)];
                    case 2:
                        // First delete existing entries for this pool
                        _a.sent();
                        entries = Array.from(pool.entries()).map(function (_a) {
                            var text = _a[0], translation = _a[1];
                            return ({
                                id: "".concat(dbPoolKey, ":").concat(text),
                                poolKey: dbPoolKey,
                                text: text,
                                translation: translation,
                                dstLang: toLang,
                                timestamp: Date.now(),
                                // Default expiration: 32 hours (matching backend Redis cache)
                                expiresAt: Date.now() + 32 * 60 * 60 * 1000,
                            });
                        });
                        return [4 /*yield*/, this.indexedDB.setMany(entries)];
                    case 3:
                        _a.sent();
                        console.log("[TranslationPool] Saved ".concat(entries.length, " translations to IndexedDB for ").concat(poolKey));
                        return [3 /*break*/, 5];
                    case 4:
                        e_3 = _a.sent();
                        console.warn('Failed to save translation cache to IndexedDB:', e_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    TranslationPool.prototype.broadcastUpdate = function (text, translation) {
        if (!this.broadcastChannel || !this.crossTabOptions.enabled) {
            return;
        }
        var fp = this.currentFingerprint || 'common';
        var toLang = this.currentToLang || 'en';
        var data = __assign({ result: this.getAllForFingerprint(fp, toLang) }, (text && translation && { text: text, translation: translation }));
        var message = {
            type: 'cache_update',
            senseId: this.senseId,
            fingerprint: this.currentFingerprint || undefined,
            data: data,
        };
        this.broadcastChannel.postMessage(message);
        this.saveToStorage(fp, toLang);
    };
    TranslationPool.prototype.handleCacheUpdate = function (message) {
        var _a, _b, _c;
        var fp = message.fingerprint || 'common';
        var toLang = this.currentToLang || 'en';
        var poolKey = this.getPoolKey(fp, toLang);
        if ((_a = message.data) === null || _a === void 0 ? void 0 : _a.result) {
            var pool_3 = this.pools.get(poolKey);
            if (!pool_3) {
                pool_3 = new Map();
                this.pools.set(poolKey, pool_3);
            }
            pool_3.clear();
            message.data.result.forEach(function (_a) {
                var text = _a.text, translation = _a.translation;
                // Skip empty keys or error placeholder keys
                if (!text || text === 'error') {
                    return;
                }
                pool_3.set(text, translation);
            });
            this.loadedCombinations.add(poolKey);
        }
        if (((_b = message.data) === null || _b === void 0 ? void 0 : _b.text) && ((_c = message.data) === null || _c === void 0 ? void 0 : _c.translation)) {
            // Skip empty keys or error placeholder keys
            if (!message.data.text || message.data.text === 'error') {
                return;
            }
            var pool = this.pools.get(poolKey) || new Map();
            pool.set(message.data.text, message.data.translation);
            this.pools.set(poolKey, pool);
            this.saveToStorage(fp, toLang);
        }
    };
    TranslationPool.prototype.handleCacheClear = function (message) {
        var fp = message.fingerprint || 'common';
        {
            this.clearFingerprint(fp);
        }
    };
    TranslationPool.prototype.handleInitialSyncRequest = function () {
        this.broadcastUpdate();
    };
    TranslationPool.prototype.queueTranslationRequest = function (request) {
        var _this = this;
        var key = "".concat(request.text, "-").concat(request.fingerprint || 'common');
        var existingPending = this.pendingResolutions[key];
        if (existingPending) {
            return new Promise(function (resolve, reject) {
                existingPending.resolveList.push(resolve);
                existingPending.rejectList.push(reject);
            });
        }
        return new Promise(function (resolve, reject) {
            var queuedReq = __assign(__assign({}, request), { resolveFunction: resolve, rejectFunction: reject });
            _this.queuedRequests.push(queuedReq);
            _this.pendingResolutions[key] = {
                resolve: resolve,
                reject: reject,
                resolveList: [resolve],
                rejectList: [reject],
            };
        });
    };
    TranslationPool.prototype.processQueuedRequests = function () {
        return __awaiter(this, arguments, void 0, function (maxRetries, retryDelayMs) {
            var requestsToProcess, uncachedRequests, cachedCount, _i, requestsToProcess_1, req, lookup, response, key, successCount, failCount, requestsByLang, _a, uncachedRequests_1, req, lang, _loop_2, this_2, _b, requestsByLang_1, _c, toLang, langRequests;
            var _d;
            var _e, e_4, _f, _g;
            if (maxRetries === void 0) { maxRetries = 3; }
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (this.queuedRequests.length === 0) {
                            this.loading = false;
                            return [2 /*return*/];
                        }
                        console.log("[TranslationPool] Processing ".concat(this.queuedRequests.length, " queued translation requests..."));
                        this.loading = false;
                        requestsToProcess = __spreadArray([], this.queuedRequests, true);
                        this.queuedRequests = [];
                        uncachedRequests = [];
                        cachedCount = 0;
                        for (_i = 0, requestsToProcess_1 = requestsToProcess; _i < requestsToProcess_1.length; _i++) {
                            req = requestsToProcess_1[_i];
                            lookup = this.lookup(req.text, req.fingerprint, req.toLang);
                            if (lookup.found && lookup.translation) {
                                // Already in cache, resolve immediately
                                cachedCount++;
                                this.addTranslation(req.text, lookup.translation);
                                response = TranslateStreamResponse.fromJson({
                                    originalText: req.text,
                                    translation: (_d = {}, _d[req.text] = lookup.translation, _d),
                                    timestamp: Date.now(),
                                    finished: true,
                                    batchIndex: 0,
                                });
                                req.resolveFunction(response);
                                key = "".concat(req.text, "-").concat(req.fingerprint || 'common');
                                delete this.pendingResolutions[key];
                                if (this.onTranslationUpdated) {
                                    this.onTranslationUpdated(req.text, lookup.translation);
                                }
                            }
                            else {
                                uncachedRequests.push(req);
                            }
                        }
                        if (uncachedRequests.length === 0) {
                            this.broadcastUpdate();
                            console.log("[TranslationPool] All ".concat(cachedCount, " requests found in cache"));
                            if (this.onQueueProcessed) {
                                this.onQueueProcessed(requestsToProcess.length);
                            }
                            return [2 /*return*/];
                        }
                        console.log("[TranslationPool] ".concat(cachedCount, " cached, ").concat(uncachedRequests.length, " uncached requesting from server in a single batch"));
                        successCount = cachedCount;
                        failCount = 0;
                        requestsByLang = new Map();
                        for (_a = 0, uncachedRequests_1 = uncachedRequests; _a < uncachedRequests_1.length; _a++) {
                            req = uncachedRequests_1[_a];
                            lang = req.toLang || 'en';
                            if (!requestsByLang.has(lang)) {
                                requestsByLang.set(lang, []);
                            }
                            requestsByLang.get(lang).push(req);
                        }
                        _loop_2 = function (toLang, langRequests) {
                            var commonFingerprint, versionAtStart, stream, _loop_3, _j, stream_1, stream_1_1, state_1, e_4_1, _k, langRequests_1, pendingReq, key, error, error_1, _l, langRequests_2, pendingReq, key, error_2;
                            return __generator(this, function (_m) {
                                switch (_m.label) {
                                    case 0:
                                        commonFingerprint = langRequests[0].fingerprint || this_2.currentFingerprint || 'common';
                                        versionAtStart = this_2.currentLanguageVersion;
                                        _m.label = 1;
                                    case 1:
                                        _m.trys.push([1, 14, , 15]);
                                        stream = this_2.client.translateBatchUncached(langRequests.map(function (r) { return ({ text: r.text, fromLang: r.fromLang }); }), toLang, commonFingerprint);
                                        _m.label = 2;
                                    case 2:
                                        _m.trys.push([2, 7, 8, 13]);
                                        _loop_3 = function () {
                                            _g = stream_1_1.value;
                                            _j = false;
                                            var response = _g;
                                            // If language version has changed, this response is from an old request
                                            // Do NOT process it - the language has already switched, old requests were cancelled
                                            // This prevents cache corruption and mixing data between different languages
                                            if (this_2.currentLanguageVersion !== versionAtStart) {
                                                console.log("[TranslationPool] Language version changed from ".concat(versionAtStart, " to ").concat(this_2.currentLanguageVersion, " during batch processing - stopping old batch"));
                                                return "break";
                                            }
                                            // Process each translation as it arrives
                                            // Use dstLang from response if available (back-end may auto-correct the target language)
                                            var responseDstLang = response.dstLang;
                                            var targetLang = responseDstLang || toLang;
                                            if (response.translation) {
                                                var _loop_4 = function (text, translation) {
                                                    var _r;
                                                    // Find the original pending request - if response has dstLang, match using response language
                                                    var pendingReq = void 0;
                                                    if (responseDstLang) {
                                                        // If response has its own language, find the exact match
                                                        pendingReq = langRequests.find(function (r) { return r.text === text && r.toLang === responseDstLang; });
                                                    }
                                                    else {
                                                        // Fallback to matching with original request language
                                                        pendingReq = langRequests.find(function (r) { return r.text === text && r.toLang === toLang; });
                                                    }
                                                    // Even if we don't have a pending request (shouldn't happen), still add to cache with correct language
                                                    // This ensures we always use the language from the response (back-end might auto-correct)
                                                    this_2.addTranslation(text, translation, targetLang);
                                                    if (pendingReq) {
                                                        // Resolve the pending promise
                                                        var fullResponse = TranslateStreamResponse.fromJson({
                                                            originalText: text,
                                                            translation: (_r = {}, _r[text] = translation, _r),
                                                            timestamp: Date.now(),
                                                            finished: response.finished && Object.keys(response.translation).length === 0,
                                                            batchIndex: response.batchIndex || 0,
                                                            srcLang: response.srcLang,
                                                            dstLang: response.dstLang,
                                                        });
                                                        pendingReq.resolveFunction(fullResponse);
                                                        var key = "".concat(text, "-").concat(pendingReq.fingerprint || 'common');
                                                        delete this_2.pendingResolutions[key];
                                                        if (this_2.onTranslationUpdated) {
                                                            this_2.onTranslationUpdated(text, translation);
                                                        }
                                                        successCount++;
                                                    }
                                                };
                                                for (var _o = 0, _p = Object.entries(response.translation); _o < _p.length; _o++) {
                                                    var _q = _p[_o], text = _q[0], translation = _q[1];
                                                    _loop_4(text, translation);
                                                }
                                            }
                                            if (response.finished) {
                                                return "break";
                                            }
                                        };
                                        _j = true, stream_1 = (e_4 = void 0, __asyncValues(stream));
                                        _m.label = 3;
                                    case 3: return [4 /*yield*/, stream_1.next()];
                                    case 4:
                                        if (!(stream_1_1 = _m.sent(), _e = stream_1_1.done, !_e)) return [3 /*break*/, 6];
                                        state_1 = _loop_3();
                                        if (state_1 === "break")
                                            return [3 /*break*/, 6];
                                        _m.label = 5;
                                    case 5:
                                        _j = true;
                                        return [3 /*break*/, 3];
                                    case 6: return [3 /*break*/, 13];
                                    case 7:
                                        e_4_1 = _m.sent();
                                        e_4 = { error: e_4_1 };
                                        return [3 /*break*/, 13];
                                    case 8:
                                        _m.trys.push([8, , 11, 12]);
                                        if (!(!_j && !_e && (_f = stream_1.return))) return [3 /*break*/, 10];
                                        return [4 /*yield*/, _f.call(stream_1)];
                                    case 9:
                                        _m.sent();
                                        _m.label = 10;
                                    case 10: return [3 /*break*/, 12];
                                    case 11:
                                        if (e_4) throw e_4.error;
                                        return [7 /*endfinally*/];
                                    case 12: return [7 /*endfinally*/];
                                    case 13:
                                        // Check for any pending requests in this language group that didn't get a response - they failed
                                        for (_k = 0, langRequests_1 = langRequests; _k < langRequests_1.length; _k++) {
                                            pendingReq = langRequests_1[_k];
                                            key = "".concat(pendingReq.text, "-").concat(pendingReq.fingerprint || 'common');
                                            if (this_2.pendingResolutions[key]) {
                                                // Still pending, means no response from server - fail it
                                                if (pendingReq.rejectFunction) {
                                                    error = new Error("No translation response received for: \"".concat(pendingReq.text, "\" (").concat(toLang, ")"));
                                                    pendingReq.rejectFunction(error);
                                                }
                                                delete this_2.pendingResolutions[key];
                                                failCount++;
                                            }
                                        }
                                        return [3 /*break*/, 15];
                                    case 14:
                                        error_1 = _m.sent();
                                        console.error("[TranslationPool] Batch request failed for language ".concat(toLang, ":"), error_1.message);
                                        // If batch fails, fail all remaining requests in this language group
                                        for (_l = 0, langRequests_2 = langRequests; _l < langRequests_2.length; _l++) {
                                            pendingReq = langRequests_2[_l];
                                            key = "".concat(pendingReq.text, "-").concat(pendingReq.fingerprint || 'common');
                                            if (this_2.pendingResolutions[key] && pendingReq.rejectFunction) {
                                                error_2 = new Error("Batch translation failed for: \"".concat(pendingReq.text, "\" (").concat(toLang, ")"));
                                                pendingReq.rejectFunction(error_2);
                                                delete this_2.pendingResolutions[key];
                                                failCount++;
                                            }
                                        }
                                        return [3 /*break*/, 15];
                                    case 15: return [2 /*return*/];
                                }
                            });
                        };
                        this_2 = this;
                        _b = 0, requestsByLang_1 = requestsByLang;
                        _h.label = 1;
                    case 1:
                        if (!(_b < requestsByLang_1.length)) return [3 /*break*/, 4];
                        _c = requestsByLang_1[_b], toLang = _c[0], langRequests = _c[1];
                        return [5 /*yield**/, _loop_2(toLang, langRequests)];
                    case 2:
                        _h.sent();
                        _h.label = 3;
                    case 3:
                        _b++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.broadcastUpdate();
                        console.log("[TranslationPool] Completed processing ".concat(requestsToProcess.length, " queued requests: ").concat(successCount, " success, ").concat(failCount, " failed (batch processing)"));
                        if (this.onQueueProcessed) {
                            this.onQueueProcessed(requestsToProcess.length);
                        }
                        if (failCount > 0) {
                            console.warn("[TranslationPool] ".concat(failCount, " requests failed after ").concat(maxRetries, " retries"));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    TranslationPool.prototype.hasQueuedRequests = function () {
        return this.queuedRequests.length > 0;
    };
    TranslationPool.prototype.clearQueuedRequests = function () {
        console.log("Clearing ".concat(this.queuedRequests.length, " queued requests"));
        this.queuedRequests = [];
        this.pendingResolutions = {};
    };
    TranslationPool.prototype.isLoading = function () {
        return this.loading;
    };
    TranslationPool.prototype.isLanguageLoaded = function (fingerprint, toLang) {
        if (toLang === undefined) {
            var checkedToLang = fingerprint;
            for (var _i = 0, _a = this.loadedCombinations; _i < _a.length; _i++) {
                var key = _a[_i];
                if (key.endsWith(":".concat(checkedToLang))) {
                    return true;
                }
            }
            return false;
        }
        var poolKey = this.getPoolKey(fingerprint, toLang);
        return this.loadedCombinations.has(poolKey);
    };
    TranslationPool.prototype.initialize = function (toLang) {
        return __awaiter(this, void 0, void 0, function () {
            var commonPoolKey, commonPool, hasLocalCache, fpPoolKey, fpPool, fpPoolKey, newLangTotal, fpPoolKey, fpPool, maxOtherLangSize, _i, _a, _b, poolKey, pool, shouldForceServerSync, allExistingTexts, existingInNewLang, _c, _d, _e, poolKey, pool, _f, _g, text, _h, _j, text, missingTexts, _k, allExistingTexts_1, text, error_3;
            var _l;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        if (this.loading) {
                            console.log("[TranslationPool] Already loading, skipping duplicate initialize");
                            return [2 /*return*/];
                        }
                        // Clear any pending requests from previous language to avoid backend pressure
                        this.clearQueuedRequests();
                        this.loading = true;
                        this.currentToLang = toLang;
                        _m.label = 1;
                    case 1:
                        _m.trys.push([1, 10, 11, 12]);
                        console.log("[TranslationPool] Starting pool initialization... (toLang: ".concat(toLang, ")"));
                        // First try to load from persistent storage (localStorage / IndexedDB) for new language
                        // This ensures we have the cached translations for the new language before processing requests
                        return [4 /*yield*/, this.loadLanguageFromStorage('common', toLang)];
                    case 2:
                        // First try to load from persistent storage (localStorage / IndexedDB) for new language
                        // This ensures we have the cached translations for the new language before processing requests
                        _m.sent();
                        commonPoolKey = this.getPoolKey('common', toLang);
                        commonPool = this.pools.get(commonPoolKey);
                        hasLocalCache = commonPool && commonPool.size > 0;
                        if (!this.currentFingerprint) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.loadLanguageFromStorage(this.currentFingerprint, toLang)];
                    case 3:
                        _m.sent();
                        fpPoolKey = this.getPoolKey(this.currentFingerprint, toLang);
                        fpPool = this.pools.get(fpPoolKey);
                        if (fpPool && fpPool.size > 0) {
                            hasLocalCache = true;
                        }
                        _m.label = 4;
                    case 4:
                        // Mark combinations as loaded
                        this.loadedCombinations.add(commonPoolKey);
                        if (this.currentFingerprint) {
                            fpPoolKey = this.getPoolKey(this.currentFingerprint, toLang);
                            this.loadedCombinations.add(fpPoolKey);
                        }
                        newLangTotal = (commonPool === null || commonPool === void 0 ? void 0 : commonPool.size) || 0;
                        if (this.currentFingerprint) {
                            fpPoolKey = this.getPoolKey(this.currentFingerprint, toLang);
                            fpPool = this.pools.get(fpPoolKey);
                            if (fpPool) {
                                newLangTotal += fpPool.size;
                            }
                        }
                        maxOtherLangSize = 0;
                        for (_i = 0, _a = this.pools.entries(); _i < _a.length; _i++) {
                            _b = _a[_i], poolKey = _b[0], pool = _b[1];
                            if (!poolKey.endsWith(":".concat(toLang))) {
                                if (pool.size > maxOtherLangSize) {
                                    maxOtherLangSize = pool.size;
                                }
                            }
                        }
                        shouldForceServerSync = hasLocalCache && maxOtherLangSize > 0 && newLangTotal < maxOtherLangSize * 0.5;
                        if (!(hasLocalCache && !shouldForceServerSync)) return [3 /*break*/, 5];
                        console.log("[TranslationPool] Using existing translations from local cache (no server fetch needed), loaded ".concat((commonPool === null || commonPool === void 0 ? void 0 : commonPool.size) || 0, " common + ").concat(this.currentFingerprint && ((_l = this.pools.get(this.getPoolKey(this.currentFingerprint, toLang))) === null || _l === void 0 ? void 0 : _l.size) || 0, " fingerprint entries"));
                        return [3 /*break*/, 8];
                    case 5:
                        if (shouldForceServerSync) {
                            console.log("[TranslationPool] Local cache has only ".concat(newLangTotal, " entries but largest other language has ").concat(maxOtherLangSize, " - forcing server sync to get auto-translated results"));
                        }
                        else {
                            console.log("Loading all translations from server for ".concat(toLang, " for cache synchronization (no local cache found)"));
                        }
                        // No local cache available, need to load from server
                        return [4 /*yield*/, this.loadFingerprintTranslations('common', undefined, toLang)];
                    case 6:
                        // No local cache available, need to load from server
                        _m.sent();
                        console.log("[TranslationPool] Common translations loaded for ".concat(toLang));
                        if (!this.currentFingerprint) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.loadFingerprintTranslations(this.currentFingerprint, this.currentFingerprint, toLang)];
                    case 7:
                        _m.sent();
                        console.log("[TranslationPool] ".concat(this.currentFingerprint, " translations loaded for ").concat(toLang));
                        _m.label = 8;
                    case 8:
                        this.broadcastUpdate();
                        console.log("[TranslationPool] Pool initialization completed for ".concat(toLang, " (local cache: ").concat(hasLocalCache ? 'used' : 'not found, fetched from server', ")"));
                        if (this.onPoolInitialized) {
                            this.onPoolInitialized();
                        }
                        return [4 /*yield*/, this.processQueuedRequests()];
                    case 9:
                        _m.sent();
                        // Perform compensation translation: collect all existing texts from previous languages
                        // and check which ones are missing in the new language pool. If we have a registered
                        // callback, send the missing texts for translation to ensure all text gets translated.
                        if (this.onCompensationTranslate && this.pools.size > 0) {
                            allExistingTexts = new Set();
                            existingInNewLang = new Set();
                            // Iterate all pools to collect texts
                            for (_c = 0, _d = this.pools.entries(); _c < _d.length; _c++) {
                                _e = _d[_c], poolKey = _e[0], pool = _e[1];
                                if (poolKey.endsWith(":".concat(toLang))) {
                                    // This pool is for the new language - add all texts to existingInNewLang
                                    for (_f = 0, _g = pool.keys(); _f < _g.length; _f++) {
                                        text = _g[_f];
                                        existingInNewLang.add(text);
                                    }
                                }
                                else {
                                    // This pool is for an older language - add texts to allExistingTexts
                                    for (_h = 0, _j = pool.keys(); _h < _j.length; _h++) {
                                        text = _j[_h];
                                        allExistingTexts.add(text);
                                    }
                                }
                            }
                            missingTexts = [];
                            for (_k = 0, allExistingTexts_1 = allExistingTexts; _k < allExistingTexts_1.length; _k++) {
                                text = allExistingTexts_1[_k];
                                if (!existingInNewLang.has(text)) {
                                    missingTexts.push(text);
                                }
                            }
                            if (missingTexts.length > 0) {
                                console.log("[TranslationPool] Found ".concat(missingTexts.length, " texts missing in new language ").concat(toLang, ", triggering compensation translation"));
                                this.onCompensationTranslate(missingTexts, toLang);
                            }
                            else {
                                console.log("[TranslationPool] No missing texts found in new language ".concat(toLang, ", no compensation needed"));
                            }
                        }
                        return [3 /*break*/, 12];
                    case 10:
                        error_3 = _m.sent();
                        console.error("[TranslationPool] Pool initialization failed for ".concat(toLang, ":"), error_3);
                        throw error_3;
                    case 11:
                        this.loading = false;
                        return [7 /*endfinally*/];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    TranslationPool.prototype.loadFingerprintTranslations = function (fp, fingerprint, toLang) {
        return __awaiter(this, void 0, void 0, function () {
            var poolKey, pool, updatedCount, addedCount, jsonRequest, req, stream, batchCount, _a, stream_2, stream_2_1, response, e_5_1, error_4;
            var _this = this;
            var _b, e_5, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        console.log("[TranslationPool] Loading translations for fingerprint=".concat(fp, ", toLang=").concat(toLang, "..."));
                        poolKey = this.getPoolKey(fp, toLang);
                        this.loadLanguageFromStorage(fp, toLang);
                        pool = this.pools.get(poolKey);
                        if (!pool) {
                            pool = new Map();
                            this.pools.set(poolKey, pool);
                        }
                        updatedCount = 0;
                        addedCount = 0;
                        jsonRequest = {
                            dstLang: toLang,
                        };
                        if (this.senseId && this.senseId.length > 0) {
                            jsonRequest.senseId = this.senseId;
                        }
                        if (fingerprint) {
                            jsonRequest.fingerprint = fingerprint;
                        }
                        // Add srcLang filter if defaultFromLang is configured (camelCase for fromJson)
                        if (this.defaultFromLang) {
                            jsonRequest.srcLang = this.defaultFromLang;
                        }
                        req = TranslateStreamRequest.fromJson(jsonRequest);
                        console.log("[TranslationPool] Sending batch initialization request:", jsonRequest);
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 14, , 15]);
                        stream = this.client.client.translateStream(req);
                        batchCount = 0;
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 7, 8, 13]);
                        _a = true, stream_2 = __asyncValues(stream);
                        _e.label = 3;
                    case 3: return [4 /*yield*/, stream_2.next()];
                    case 4:
                        if (!(stream_2_1 = _e.sent(), _b = stream_2_1.done, !_b)) return [3 /*break*/, 6];
                        _d = stream_2_1.value;
                        _a = false;
                        response = _d;
                        batchCount++;
                        console.log("[TranslationPool] Received batch #".concat(batchCount, ", ").concat(Object.keys(response.translation || {}).length, " entries"));
                        if (!response.translation)
                            return [3 /*break*/, 5];
                        Object.entries(response.translation).forEach(function (_a) {
                            var _b, _c;
                            var text = _a[0], translate = _a[1];
                            // Skip empty keys or error placeholder keys
                            if (!text || text === 'error') {
                                return;
                            }
                            var translateStr = translate;
                            var existing = pool === null || pool === void 0 ? void 0 : pool.get(text);
                            if (existing === undefined) {
                                addedCount++;
                            }
                            else if (existing !== translateStr) {
                                updatedCount++;
                            }
                            pool === null || pool === void 0 ? void 0 : pool.set(text, translateStr);
                            var key = "".concat(text, "-").concat(fp);
                            if (_this.pendingResolutions[key]) {
                                var responseObj_1 = TranslateStreamResponse.fromJson({
                                    originalText: text,
                                    translation: (_b = {}, _b[text] = translateStr, _b),
                                    timestamp: Date.now(),
                                    finished: true,
                                    batchIndex: 0,
                                });
                                _this.pendingResolutions[key].resolveList.forEach(function (resolve) { return resolve(responseObj_1); });
                                delete _this.pendingResolutions[key];
                            }
                            if (fp !== 'common') {
                                var commonKey = "".concat(text, "-common");
                                if (_this.pendingResolutions[commonKey]) {
                                    var responseObj_2 = TranslateStreamResponse.fromJson({
                                        originalText: text,
                                        translation: (_c = {}, _c[text] = translateStr, _c),
                                        timestamp: Date.now(),
                                        finished: true,
                                        batchIndex: 0,
                                    });
                                    _this.pendingResolutions[commonKey].resolveList.forEach(function (resolve) { return resolve(responseObj_2); });
                                    delete _this.pendingResolutions[commonKey];
                                }
                            }
                            if (_this.onTranslationLoaded) {
                                _this.onTranslationLoaded(text, translateStr);
                            }
                        });
                        _e.label = 5;
                    case 5:
                        _a = true;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_5_1 = _e.sent();
                        e_5 = { error: e_5_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _e.trys.push([8, , 11, 12]);
                        if (!(!_a && !_b && (_c = stream_2.return))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _c.call(stream_2)];
                    case 9:
                        _e.sent();
                        _e.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_5) throw e_5.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13:
                        this.saveToStorage(fp, toLang);
                        if (updatedCount > 0 || addedCount > 0) {
                            console.log("[TranslationPool] Loaded ".concat(fp, ":").concat(toLang, " - added ").concat(addedCount, ", updated ").concat(updatedCount, " from remote"));
                        }
                        else {
                            console.log("[TranslationPool] Finished loading ".concat(fp, ":").concat(toLang, " - no new entries added"));
                        }
                        this.loadedCombinations.add(poolKey);
                        return [3 /*break*/, 15];
                    case 14:
                        error_4 = _e.sent();
                        console.error("[TranslationPool] Failed to load ".concat(fp, ":").concat(toLang, " from server:"), error_4);
                        throw error_4;
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    TranslationPool.prototype.addPreloadedTranslations = function (preloaded) {
        var _this = this;
        Object.entries(preloaded).forEach(function (_a) {
            var fingerprint = _a[0], langMap = _a[1];
            Object.entries(langMap).forEach(function (_a) {
                var toLang = _a[0], translations = _a[1];
                var poolKey = _this.getPoolKey(fingerprint, toLang);
                var pool = _this.pools.get(poolKey);
                if (!pool) {
                    pool = new Map();
                    _this.pools.set(poolKey, pool);
                }
                Object.entries(translations).forEach(function (_a) {
                    var text = _a[0], translation = _a[1];
                    pool.set(text, translation);
                    if (_this.onTranslationLoaded) {
                        _this.onTranslationLoaded(text, translation);
                    }
                });
                _this.loadedCombinations.add(poolKey);
                _this.saveToStorage(fingerprint, toLang);
            });
        });
        this.broadcastUpdate();
    };
    TranslationPool.prototype.addTranslation = function (text, translation, toLang) {
        var fp = this.currentFingerprint || 'common';
        var lang = toLang || this.currentToLang || 'en';
        var poolKey = this.getPoolKey(fp, lang);
        var pool = this.pools.get(poolKey);
        if (!pool) {
            pool = new Map();
            this.pools.set(poolKey, pool);
        }
        pool.set(text, translation);
        this.saveToStorage(fp, lang);
        this.broadcastUpdate(text, translation);
    };
    TranslationPool.prototype.addTranslationToFingerprint = function (text, translation, fingerprint, toLang) {
        var poolKey = this.getPoolKey(fingerprint, toLang);
        var pool = this.pools.get(poolKey);
        if (!pool) {
            pool = new Map();
            this.pools.set(poolKey, pool);
        }
        pool.set(text, translation);
        this.saveToStorage(fingerprint, toLang);
        this.broadcastUpdate(text, translation);
    };
    /**
     * Correct an existing translation and synchronize the correction to backend database
     * This updates both the local cache and persists the correction to the server
     * @param text Original source text
     * @param correctedTranslation The corrected translation
     * @param fingerprint Optional fingerprint (uses current fingerprint if not provided)
     * @param toLang Optional target language (uses current language if not provided)
     * @param fromLang Optional source language (uses sense default if not provided)
     * @returns Promise that resolves when correction is saved to server
     */
    TranslationPool.prototype.correctTranslation = function (text, correctedTranslation, fingerprint, toLang, fromLang) {
        return __awaiter(this, void 0, void 0, function () {
            var fp, lang, requestId, jsonRequest, req, stream, _a, stream_3, stream_3_1, response, e_6_1, error_5;
            var _b, e_6, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        fp = fingerprint || this.currentFingerprint || 'common';
                        lang = toLang || this.currentToLang;
                        if (!lang) {
                            console.error('[TranslationPool] Cannot correct translation: target language not set');
                            return [2 /*return*/, { success: false, error: 'Target language not set' }];
                        }
                        // First update local cache immediately so UI reflects the correction
                        this.addTranslationToFingerprint(text, correctedTranslation, fp, lang);
                        // Trigger callback for UI updates
                        if (this.onTranslationUpdated) {
                            this.onTranslationUpdated(text, correctedTranslation);
                        }
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 14, , 15]);
                        requestId = "correct-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
                        jsonRequest = {
                            requestId: requestId,
                            text: text,
                            fromLang: fromLang || '',
                            toLang: lang,
                            fingerprint: fp,
                            isCorrection: true,
                            correctedTranslation: correctedTranslation,
                        };
                        if (this.senseId && this.senseId.length > 0) {
                            jsonRequest.senseId = this.senseId;
                        }
                        req = TranslateStreamRequest.fromJson(jsonRequest);
                        stream = this.client.client.translateStream(req);
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 7, 8, 13]);
                        _a = true, stream_3 = __asyncValues(stream);
                        _e.label = 3;
                    case 3: return [4 /*yield*/, stream_3.next()];
                    case 4:
                        if (!(stream_3_1 = _e.sent(), _b = stream_3_1.done, !_b)) return [3 /*break*/, 6];
                        _d = stream_3_1.value;
                        _a = false;
                        response = _d;
                        if (response.finished) {
                            console.log("[TranslationPool] Correction saved for \"".concat(text, "\" \u2192 \"").concat(correctedTranslation, "\""));
                            return [2 /*return*/, { success: true }];
                        }
                        _e.label = 5;
                    case 5:
                        _a = true;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_6_1 = _e.sent();
                        e_6 = { error: e_6_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _e.trys.push([8, , 11, 12]);
                        if (!(!_a && !_b && (_c = stream_3.return))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _c.call(stream_3)];
                    case 9:
                        _e.sent();
                        _e.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_6) throw e_6.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13: return [2 /*return*/, { success: true }];
                    case 14:
                        error_5 = _e.sent();
                        console.error("[TranslationPool] Failed to save correction for \"".concat(text, "\":"), error_5);
                        return [2 /*return*/, { success: false, error: error_5 instanceof Error ? error_5.message : String(error_5) }];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Alias for addTranslationToFingerprint - convenient manual caching
     * Parameter order: text, fingerprint, translation, toLang
     */
    TranslationPool.prototype.put = function (text, fingerprint, translation, toLang) {
        // Set current language if not set, so subsequent lookups work correctly
        if (!this.currentToLang) {
            this.currentToLang = toLang;
        }
        this.addTranslationToFingerprint(text, translation, fingerprint, toLang);
    };
    TranslationPool.prototype.lookup = function (text, fingerprint, toLang) {
        var _this = this;
        var fp = fingerprint || this.currentFingerprint || 'common';
        var lang = toLang || this.currentToLang || 'en';
        var poolKey = this.getPoolKey(fp, lang);
        var pool = this.pools.get(poolKey);
        // Check if found in specific pool
        if (pool && pool.has(text)) {
            var translation = pool.get(text);
            // Check metadata to see if this entry is stale - trigger background update
            var metadataKey = "".concat(text, "|").concat(lang);
            var metadata = this.entryMetadata.get(metadataKey);
            var now = Date.now();
            var staleThreshold = this.backgroundUpdateOptions.staleThresholdMs;
            if (this.backgroundUpdateOptions.enabled && (!metadata || now - metadata.lastUpdated > staleThreshold)) {
                // Stale cache entry - trigger asynchronous background check for updates
                // This will fetch the latest translation (including any manual corrections) from backend
                // If updated, cache will be updated automatically and UI will be notified
                setTimeout(function () {
                    if (_this.updateCallback) {
                        _this.updateCallback(text, lang);
                        // Update timestamp immediately to avoid repeated triggers
                        _this.updateEntryMetadata(text, lang);
                    }
                }, 0);
            }
            return { found: true, fromCache: true, translation: translation };
        }
        // Check common pool if not found in specific fingerprint
        if (fp !== 'common') {
            var commonPoolKey = this.getPoolKey('common', lang);
            var commonPool = this.pools.get(commonPoolKey);
            if (commonPool && commonPool.has(text)) {
                var translation = commonPool.get(text);
                // Same stale check for common pool entries
                var metadataKey = "".concat(text, "|").concat(lang);
                var metadata = this.entryMetadata.get(metadataKey);
                var now = Date.now();
                var staleThreshold = this.backgroundUpdateOptions.staleThresholdMs;
                if (this.backgroundUpdateOptions.enabled && (!metadata || now - metadata.lastUpdated > staleThreshold)) {
                    setTimeout(function () {
                        if (_this.updateCallback) {
                            _this.updateCallback(text, lang);
                            _this.updateEntryMetadata(text, lang);
                        }
                    }, 0);
                }
                return { found: true, fromCache: true, translation: translation };
            }
        }
        return { found: false, fromCache: false };
    };
    /**
     * Check if any translation exists for the current language
     * This can be used to determine if translation pool has any translations
     * @returns boolean true if pool has any translations for current language
     */
    TranslationPool.prototype.hasAnyTranslations = function () {
        var toLang = this.currentToLang;
        if (!toLang)
            return false;
        for (var _i = 0, _a = this.pools.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], poolKey = _b[0], pool = _b[1];
            if (poolKey.endsWith(":".concat(toLang)) && pool.size > 0) {
                return true;
            }
        }
        return false;
    };
    /**
     * Get the number of cached translations for a specific fingerprint and language
     * If language is not specified, uses current language
     * If fingerprint is not specified, returns total size across all fingerprints for current language
     * @param fingerprint Fingerprint (optional, returns total if not specified)
     * @param toLang Target language (uses current if not specified)
     * @returns Number of cached translations
     */
    TranslationPool.prototype.getCacheSize = function (fingerprint, toLang) {
        var targetLang = toLang || this.currentToLang || 'en';
        // If fingerprint is specified, return size for that specific pool
        if (fingerprint) {
            var poolKey = this.getPoolKey(fingerprint, targetLang);
            var pool = this.pools.get(poolKey);
            return (pool === null || pool === void 0 ? void 0 : pool.size) || 0;
        }
        // If no fingerprint specified, return total size across all fingerprints for current language
        var totalSize = 0;
        for (var _i = 0, _a = this.pools.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], poolKey = _b[0], pool = _b[1];
            if (poolKey.endsWith(":".concat(targetLang))) {
                totalSize += pool.size;
            }
        }
        return totalSize;
    };
    /**
     * Get all translations for a fingerprint+language combination
     * @param fingerprint Fingerprint ('common' or specific)
     * @param toLang Target language
     * @returns Array of {text, translation}
     */
    TranslationPool.prototype.getAllForFingerprint = function (fingerprint, toLang) {
        var poolKey = this.getPoolKey(fingerprint, toLang);
        var pool = this.pools.get(poolKey);
        var result = [];
        if (pool) {
            pool.forEach(function (translation, text) {
                result.push({ text: text, translation: translation });
            });
        }
        return result;
    };
    /**
     * Get all cached translations for current language across all fingerprints
     * @returns Map of all cached translations with full keys
     */
    TranslationPool.prototype.getAllForCurrentLanguage = function () {
        var toLang = this.currentToLang;
        if (!toLang)
            return new Map();
        var result = new Map();
        for (var _i = 0, _a = this.pools.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], poolKey = _b[0], pool = _b[1];
            if (poolKey.endsWith(":".concat(toLang))) {
                result.set(poolKey, new Map(pool));
            }
        }
        return result;
    };
    /**
     * Clear all translations for a specific fingerprint
     * @param fingerprint Fingerprint to clear
     */
    TranslationPool.prototype.clearFingerprint = function (fingerprint) {
        var toLang = this.currentToLang;
        if (!toLang) {
            // If no language set, just remove the pool keys from memory
            for (var _i = 0, _a = this.pools.keys(); _i < _a.length; _i++) {
                var key = _a[_i];
                if (key.startsWith("".concat(fingerprint, ":"))) {
                    this.pools.delete(key);
                    this.loadedCombinations.delete(key);
                }
            }
            return;
        }
        var poolKey = this.getPoolKey(fingerprint, toLang);
        this.pools.delete(poolKey);
        this.loadedCombinations.delete(poolKey);
        if (this.crossTabOptions.enabled) {
            var storageKey = this.getStorageKey(fingerprint, toLang);
            try {
                localStorage.removeItem(storageKey);
            }
            catch (e) {
                console.warn('Failed to remove from localStorage:', e);
            }
        }
        this.clearQueuedRequests();
    };
    /**
     * Clear all cached translations for all fingerprints and languages
     * Does not affect preloaded translations unless they were added after initialization
     */
    TranslationPool.prototype.clearAll = function () {
        this.pools.clear();
        this.loadedCombinations.clear();
        this.clearQueuedRequests();
        if (typeof localStorage !== 'undefined' && this.crossTabOptions.enabled) {
            var prefix = "".concat(this.crossTabOptions.storageKeyPrefix).concat(this.senseId, "_");
            var keysToRemove = [];
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(function (key) { return localStorage.removeItem(key); });
        }
        console.log('[TranslationPool] Cleared all cached translations');
    };
    /**
     * Alias for clearAll - clear entire cache
     */
    TranslationPool.prototype.clearCache = function () {
        this.clearAll();
    };
    /**
     * Alias for clearAll - clear entire cache
     * Simple clear method for API compatibility
     */
    TranslationPool.prototype.clear = function () {
        this.clearAll();
    };
    /**
     * Set the current active fingerprint
     * Automatically loads the new fingerprint's translations for the current language
     * @param fingerprint New fingerprint to set
     * @param toLang Target language (optional, uses currentToLang if not provided)
     */
    TranslationPool.prototype.setCurrentFingerprint = function (fingerprint, toLang) {
        return __awaiter(this, void 0, void 0, function () {
            var targetLang, oldFingerprint, poolKey, pool;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        targetLang = toLang || this.currentToLang;
                        oldFingerprint = this.currentFingerprint;
                        this.currentFingerprint = fingerprint;
                        this.currentLanguageVersion++;
                        console.log("[TranslationPool] Changed current fingerprint from ".concat(oldFingerprint, " to: ").concat(fingerprint));
                        if (!(targetLang && fingerprint && fingerprint !== oldFingerprint)) return [3 /*break*/, 3];
                        poolKey = this.getPoolKey(fingerprint, targetLang);
                        this.loadLanguageFromStorage(fingerprint, targetLang);
                        pool = this.pools.get(poolKey);
                        if (!(pool && pool.size > 0)) return [3 /*break*/, 1];
                        // We already have cached translations in localStorage, no need to load from server
                        this.loadedCombinations.add(poolKey);
                        console.log("[TranslationPool] Using cached translations for fingerprint: ".concat(fingerprint, " (").concat(targetLang, ") from localStorage (").concat(pool.size, " entries)"));
                        return [3 /*break*/, 3];
                    case 1:
                        // No local cache available, need to load from server
                        console.log("[TranslationPool] No local cache found, loading translations for fingerprint: ".concat(fingerprint, " (").concat(targetLang, ") from server"));
                        return [4 /*yield*/, this.loadFingerprintTranslations(fingerprint, fingerprint, targetLang)];
                    case 2:
                        _a.sent();
                        console.log("[TranslationPool] Loaded translations for fingerprint: ".concat(fingerprint, " (").concat(targetLang, ")"));
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Set the current target language
     * Automatically initializes the translation pool for the new language with common and current fingerprint
     * Uses existing initialize() method that already handles both common and fingerprint loading
     * @param toLang New target language
     * @param fingerprint Optional fingerprint (uses current fingerprint if not provided)
     */
    TranslationPool.prototype.setCurrentLanguage = function (toLang, fingerprint) {
        return __awaiter(this, void 0, void 0, function () {
            var newLang, oldLang, _i, _a, req, _b, _c, key, pending, _d, _e, reject;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        newLang = toLang;
                        oldLang = this.currentToLang;
                        // Update fingerprint if provided
                        if (fingerprint !== undefined && fingerprint !== this.currentFingerprint) {
                            this.currentFingerprint = fingerprint;
                        }
                        // Clear queued requests when switching language to prevent backend pressure
                        // from accumulated requests during multiple language switches
                        if (this.queuedRequests.length > 0) {
                            console.log("[TranslationPool] Clearing ".concat(this.queuedRequests.length, " queued requests when switching language from ").concat(oldLang, " to ").concat(newLang));
                            for (_i = 0, _a = this.queuedRequests; _i < _a.length; _i++) {
                                req = _a[_i];
                                if (req.rejectFunction) {
                                    req.rejectFunction(new Error("Language switched from ".concat(oldLang, " to ").concat(newLang, ", request cancelled")));
                                }
                            }
                            this.queuedRequests = [];
                        }
                        // Clear pending resolutions for any requests that were waiting
                        for (_b = 0, _c = Object.keys(this.pendingResolutions); _b < _c.length; _b++) {
                            key = _c[_b];
                            pending = this.pendingResolutions[key];
                            if (pending.rejectList) {
                                for (_d = 0, _e = pending.rejectList; _d < _e.length; _d++) {
                                    reject = _e[_d];
                                    reject(new Error("Language switched from ".concat(oldLang, " to ").concat(newLang, ", request cancelled")));
                                }
                            }
                            delete this.pendingResolutions[key];
                        }
                        this.currentToLang = newLang;
                        this.currentLanguageVersion++;
                        console.log("[TranslationPool] Changed current target language from ".concat(oldLang, " to: ").concat(newLang));
                        // When switching language, stop the persistent stream because any old responses
                        // would be for the wrong language and cause cache corruption
                        if (this.client.isPersistentStreamConnected()) {
                            console.log('[TranslationPool] Language changed, stopping persistent stream to prevent cache corruption');
                            this.client.stopPersistentStream();
                        }
                        // Full initialize for the new language - this properly loads both common and current fingerprint
                        // The existing initialize method already has the correct logic
                        return [4 /*yield*/, this.initialize(newLang)];
                    case 1:
                        // Full initialize for the new language - this properly loads both common and current fingerprint
                        // The existing initialize method already has the correct logic
                        _f.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get current active fingerprint
     * @returns Current fingerprint or null
     */
    TranslationPool.prototype.getCurrentFingerprint = function () {
        return this.currentFingerprint;
    };
    /**
     * Get current target language
     * @returns Current target language or null
     */
    TranslationPool.prototype.getCurrentLanguage = function () {
        return this.currentToLang;
    };
    /**
     * Start background update checker that periodically checks for stale translations
     * Only runs if background update is enabled
     */
    TranslationPool.prototype.startBackgroundUpdateChecker = function () {
        var _this = this;
        if (!this.backgroundUpdateOptions.enabled || typeof window === 'undefined') {
            return;
        }
        if (this.backgroundUpdateTimer) {
            clearInterval(this.backgroundUpdateTimer);
        }
        this.backgroundUpdateTimer = setInterval(function () {
            _this.checkForStaleTranslations();
        }, this.backgroundUpdateOptions.intervalMs);
        console.log("[TranslationPool] Started background update checker every ".concat(this.backgroundUpdateOptions.intervalMs, "ms"));
    };
    /**
     * Stop background update checker
     */
    TranslationPool.prototype.stopBackgroundUpdateChecker = function () {
        if (this.backgroundUpdateTimer) {
            clearInterval(this.backgroundUpdateTimer);
            this.backgroundUpdateTimer = null;
            console.log('[TranslationPool] Stopped background update checker');
        }
    };
    /**
     * Check for stale translations and request updates
     * This is called automatically by the background timer
     */
    TranslationPool.prototype.checkForStaleTranslations = function () {
        var _this = this;
        if (!this.updateCallback || !this.currentToLang) {
            return;
        }
        var now = Date.now();
        var staleThreshold = this.backgroundUpdateOptions.staleThresholdMs;
        var staleEntries = [];
        this.entryMetadata.forEach(function (metadata, key) {
            if (now - metadata.lastUpdated > staleThreshold) {
                var _a = key.split('|'), text = _a[0], toLang = _a[1];
                staleEntries.push({ text: text, toLang: toLang });
            }
        });
        if (staleEntries.length === 0) {
            return;
        }
        var batchSize = this.backgroundUpdateOptions.batchSize;
        var staleToProcess = staleEntries.slice(0, batchSize);
        staleToProcess.forEach(function (_a) {
            var text = _a.text, toLang = _a.toLang;
            if (_this.updateCallback) {
                _this.updateCallback(text, toLang);
            }
        });
        console.log("[TranslationPool] Triggered update for ".concat(staleToProcess.length, " stale translations"));
    };
    /**
     * Update metadata for a cache entry when it's fetched from server
     * @param text Original text
     * @param toLang Target language
     */
    TranslationPool.prototype.updateEntryMetadata = function (text, toLang) {
        var key = "".concat(text, "|").concat(toLang);
        var existing = this.entryMetadata.get(key);
        this.entryMetadata.set(key, {
            lastUpdated: Date.now(),
            version: ((existing === null || existing === void 0 ? void 0 : existing.version) || 0) + 1,
        });
    };
    return TranslationPool;
}());
var TranslationClient = /** @class */ (function () {
    function TranslationClient(options) {
        var _this = this;
        this.persistentStream = null;
        this.persistentStreamWriter = null;
        this.persistentStreamReader = null;
        this.persistentStreamConnected = false;
        this.options = options;
        // If baseUrl is not provided, use the default production endpoint
        // The baseUrl should include the API path prefix for Connect RPC
        // New route structure: /api/v1/rpc/cr/<service>/<method>
        // Expected format: https://api.hottol.com/laker (behind API gateway, context path /laker)
        // All connect rpc requests start with /api/v1/rpc/cr/ for easier routing management
        var defaultBaseUrl = "https://api.hottol.com/laker";
        this.baseUrl = options.baseUrl
            ? options.baseUrl.replace(/\/$/, "") + "/api/v1/rpc/cr/translate"
            : defaultBaseUrl.replace(/\/$/, "") + "/api/v1/rpc/cr/translate";
        this.token = options.token;
        // Interceptor that guarantees no dots in final URL - remove any segment containing a dot
        // This is defense in depth, double guarantee
        var urlRewriteInterceptor = function (next) { return function (req) { return __awaiter(_this, void 0, void 0, function () {
            var url, parts, filtered;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = new URL(req.url);
                        parts = url.pathname.split('/').filter(function (p) { return p !== ''; });
                        filtered = parts.filter(function (segment) { return !segment.includes('.'); });
                        if (filtered.length !== parts.length) {
                            url.pathname = '/' + filtered.join('/');
                            // connect-core 的 HttpRequest.url 是 readonly；用 defineProperty 覆盖以保留重写行为
                            Object.defineProperty(req, 'url', { value: url.toString(), writable: true, configurable: true });
                            console.debug('[TranslationClient] Rewrote URL:', req.url);
                        }
                        return [4 /*yield*/, next(req)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); }; };
        // Get original baseUrl, we need to ensure no segments contain dots
        // We actually want the baseUrl to stop before adding service/method
        // After filtering, the interceptor will do the final cleanup
        var urlObj = new URL(this.baseUrl);
        var pathParts = urlObj.pathname.split('/').filter(function (p) { return p !== ''; });
        // Remove ALL segments that contain dots - these are service names with dots from misconfiguration
        var filteredParts = pathParts.filter(function (segment) { return !segment.includes('.'); });
        urlObj.pathname = '/' + filteredParts.join('/');
        var baseUrl = urlObj.toString();
        // Update this.baseUrl to the filtered version for debugging
        this.baseUrl = baseUrl;
        // Combine interceptors - URL rewrite must come first, then auth
        var baseInterceptors = [urlRewriteInterceptor];
        if (this.token) {
            baseInterceptors.push(function (next) { return function (req) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            req.header.set('api-key-token', this.token);
                            return [4 /*yield*/, next(req)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }; });
        }
        // When user provides a custom transport, we still need to add our base interceptors
        // This ensures that:
        // 1. URL rewrite is always applied (removing dots from segments)
        // 2. Authentication token is always added if provided
        // We combine our base interceptors with any existing interceptors from the user's transport creation
        // Note: For createConnectTransport generated transports, interceptors are stored on the transport object
        // so we can extract them and recreate with combined interceptors
        // User can also provide createConnectTransport in options for Node.js ESM use case
        var createConnectTransportFn = options.createConnectTransport || createConnectTransport;
        var combinedInterceptors = __spreadArray([], baseInterceptors, true);
        if (options.transport) {
            // @ts-ignore - types match at runtime, accessing original options from transport creation
            // createConnectTransport stores baseUrl and interceptors on the instance
            if (options.transport._interceptors) {
                // @ts-ignore
                combinedInterceptors = __spreadArray(__spreadArray([], baseInterceptors, true), options.transport._interceptors, true);
            }
            // When user provides transport created with createConnectTransport, we extract
            // the baseUrl and recreate with our combined interceptors. This guarantees
            // our base interceptors (URL rewrite and auth) are always applied
            // @ts-ignore
            var existingBaseUrl = options.transport._baseUrl || baseUrl;
            if (!createConnectTransportFn) {
                // If createConnectTransport isn't available (pure ESM Node.js loading dynamic),
                // we can't recreate - user must have already added our required interceptors themselves
                this.transport = options.transport;
                console.debug('[TranslationClient] Using user-provided transport as-is (createConnectTransport unavailable)');
            }
            else {
                // Check cache for existing transport with identical configuration
                var cacheKey = getTransportCacheKey({
                    baseUrl: existingBaseUrl,
                    interceptors: combinedInterceptors,
                    token: this.token
                });
                if (cachedTransports.has(cacheKey)) {
                    // Reuse existing transport - this maximizes HTTP connection reuse
                    this.transport = cachedTransports.get(cacheKey);
                    console.debug('[TranslationClient] Reusing cached transport for', existingBaseUrl);
                }
                else {
                    // Recreate the transport with our combined interceptors
                    // This guarantees our base interceptors are always applied
                    var newTransport = createConnectTransportFn({
                        baseUrl: existingBaseUrl,
                        useHttpGet: false,
                        useBinary: false,
                        interceptors: combinedInterceptors,
                    });
                    // Store baseUrl and interceptors on our new transport for future reuse
                    // @ts-ignore
                    newTransport._baseUrl = existingBaseUrl;
                    // @ts-ignore
                    newTransport._interceptors = combinedInterceptors;
                    // @ts-ignore - transport interface matches
                    this.transport = newTransport;
                    // Cache for future reuse
                    cachedTransports.set(cacheKey, this.transport);
                    console.debug('[TranslationClient] Recreated user-provided transport with base interceptors added');
                }
            }
        }
        else {
            // Create Connect transport with our base interceptors that guarantee URL rewrite and auth
            if (!createConnectTransport) {
                throw new Error('createConnectTransport is not initialized. If you are using pure ESM in Node.js, ' +
                    'you need to manually create and provide the transport. ' +
                    'See documentation for details.');
            }
            // Check cache for existing transport with identical configuration
            var cacheKey = getTransportCacheKey({
                baseUrl: baseUrl,
                interceptors: combinedInterceptors,
                token: this.token
            });
            if (cachedTransports.has(cacheKey)) {
                // Reuse existing transport - this maximizes HTTP connection reuse
                this.transport = cachedTransports.get(cacheKey);
                console.debug('[TranslationClient] Reusing cached transport for', baseUrl);
            }
            else {
                // Use JSON encoding because backend uses custom json codec (application/json)
                // This matches the backend registration: encoding.RegisterCodec(jsonCodec{}) with Name() = "json"
                var originalTransport = createConnectTransportFn({
                    baseUrl: baseUrl,
                    useHttpGet: false,
                    useBinary: false,
                    interceptors: combinedInterceptors,
                });
                // Store baseUrl and interceptors on the transport instance for potential reuse
                // @ts-ignore
                originalTransport._baseUrl = baseUrl;
                // @ts-ignore
                originalTransport._interceptors = combinedInterceptors;
                // @ts-ignore - transport interface matches
                this.transport = originalTransport;
                // Cache for future reuse
                cachedTransports.set(cacheKey, this.transport);
                console.debug('[TranslationClient] Created new transport and cached for reuse');
            }
        }
        this.client = connect.createClient(TranslationService, this.transport);
        this.senseId = options.senseId;
        this.defaultFromLang = options.defaultFromLang || 'en';
        // Create and manage translation pool internally
        this.pool = new TranslationPool(this, this.senseId, {
            crossTab: options.crossTab,
            backgroundUpdate: options.backgroundUpdate,
            persistentStorage: options.persistentStorage,
            defaultFromLang: this.defaultFromLang,
        });
    }
    /**
     * Simple one-shot translation - automatically handles caching, initialization, and queuing
     * Auto-detects fingerprint and language changes, automatically loads new translation pool
     * @param text Original text to translate
     * @param toLang Target language code
     * @param fromLang Source language code (optional, defaults to client default)
     * @param fingerprint Text fingerprint for domain-specific translations
     * @returns Promise with translated text (resolves when translation completes)
     */
    TranslationClient.prototype.translate = function (text, toLang, fromLang, fingerprint) {
        return __awaiter(this, void 0, void 0, function () {
            var actualFromLang, actualFingerprint, currentLang, currentFingerprint, lookup, response;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        actualFromLang = fromLang || this.defaultFromLang;
                        actualFingerprint = (_a = fingerprint !== null && fingerprint !== void 0 ? fingerprint : this.pool.getCurrentFingerprint()) !== null && _a !== void 0 ? _a : 'common';
                        currentLang = this.pool.getCurrentLanguage();
                        if (!(currentLang === null || currentLang !== toLang)) return [3 /*break*/, 2];
                        // Language changed (or first load after page refresh), auto-load the new language for the current fingerprint
                        console.log("[TranslationClient] Language changed from ".concat(currentLang, " to ").concat(toLang, ", auto-loading translation pool"));
                        return [4 /*yield*/, this.pool.setCurrentLanguage(toLang, actualFingerprint)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        currentFingerprint = this.pool.getCurrentFingerprint();
                        if (!(fingerprint !== undefined && fingerprint !== currentFingerprint)) return [3 /*break*/, 4];
                        // Fingerprint changed, update current and auto-load for current language
                        console.log("[TranslationClient] Fingerprint changed from ".concat(currentFingerprint, " to ").concat(fingerprint, ", auto-loading translations"));
                        return [4 /*yield*/, this.pool.setCurrentFingerprint(fingerprint, toLang)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        lookup = this.pool.lookup(text, actualFingerprint, toLang);
                        if (lookup.found && lookup.translation) {
                            return [2 /*return*/, lookup.translation];
                        }
                        if (!!this.pool.isLanguageLoaded(actualFingerprint, toLang)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.pool.initialize(toLang)];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        // Use persistent streaming connection for all real-time requests
                        // This avoids creating a new HTTP connection for every single word
                        if (this.persistentStreamConnected && this.persistentStreamWriter) {
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var requestId = "".concat(text, "-").concat(Date.now(), "-").concat(Math.random());
                                    var req = TranslateStreamRequest.fromJson({
                                        text: text,
                                        senseId: _this.senseId,
                                        toLang: toLang,
                                        fromLang: actualFromLang,
                                        fingerprint: actualFingerprint,
                                        requestId: requestId,
                                        persistent: true,
                                    });
                                    // Store the pending resolver in the pool
                                    _this.pool.addPendingResolver(requestId, function (response) {
                                        resolve(response.translation[text] || text);
                                    }, reject);
                                    // Send the request through the persistent stream
                                    _this.persistentStreamWriter(req).catch(function (err) {
                                        console.error('[TranslationClient] Failed to send request on persistent stream:', err);
                                        reject(err);
                                    });
                                })];
                        }
                        return [4 /*yield*/, this.pool.queueTranslationRequest({
                                text: text,
                                toLang: toLang,
                                fromLang: actualFromLang,
                                fingerprint: actualFingerprint,
                            })];
                    case 7:
                        response = _b.sent();
                        return [2 /*return*/, response.translation[text] || text];
                }
            });
        });
    };
    /**
    * Translate text with full response details (direct API call, no caching)
    * Auto-detects fingerprint if not provided
    * @param text Original text to translate
    * @param toLang Target language code
    * @param fromLang Source language code (optional, defaults to client default)
    * @param fingerprint Text fingerprint for domain-specific translations
    * @returns Promise with complete translation response
    */
    TranslationClient.prototype.translateWithDetails = function (text_1, toLang_1, fromLang_1, fingerprint_1) {
        return __awaiter(this, arguments, void 0, function (text, toLang, fromLang, fingerprint, timeoutMs) {
            var actualFromLang, actualFingerprint, req, lastResponse, received, stream_4, timeoutPromise, streamPromise, error_6;
            var _this = this;
            var _a;
            if (timeoutMs === void 0) { timeoutMs = 30000; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        actualFromLang = fromLang || this.defaultFromLang;
                        actualFingerprint = (_a = fingerprint !== null && fingerprint !== void 0 ? fingerprint : this.pool.getCurrentFingerprint()) !== null && _a !== void 0 ? _a : 'common';
                        req = TranslateStreamRequest.fromJson({
                            text: text,
                            toLang: toLang,
                            fromLang: actualFromLang,
                            fingerprint: actualFingerprint,
                        });
                        console.log("[TranslationClient] Requesting translation for \"".concat(text, "\", fingerprint=").concat(actualFingerprint, ", toLang=").concat(toLang));
                        console.log("[TranslationClient] Request:", req);
                        lastResponse = null;
                        received = 0;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        stream_4 = this.client.translateStream(req);
                        timeoutPromise = new Promise(function (_, reject) {
                            setTimeout(function () {
                                reject(new Error("Translation timeout after ".concat(timeoutMs, "ms for \"").concat(text, "\"")));
                            }, timeoutMs);
                        });
                        streamPromise = (function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, stream_5, stream_5_1, response, e_7_1;
                            var _b, e_7, _c, _d;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        _e.trys.push([0, 5, 6, 11]);
                                        _a = true, stream_5 = __asyncValues(stream_4);
                                        _e.label = 1;
                                    case 1: return [4 /*yield*/, stream_5.next()];
                                    case 2:
                                        if (!(stream_5_1 = _e.sent(), _b = stream_5_1.done, !_b)) return [3 /*break*/, 4];
                                        _d = stream_5_1.value;
                                        _a = false;
                                        response = _d;
                                        received++;
                                        console.log("[TranslationClient] Received chunk ".concat(received, ":"), response);
                                        lastResponse = response;
                                        // If response is marked as finished, we can stop early
                                        if (response.finished) {
                                            return [3 /*break*/, 4];
                                        }
                                        _e.label = 3;
                                    case 3:
                                        _a = true;
                                        return [3 /*break*/, 1];
                                    case 4: return [3 /*break*/, 11];
                                    case 5:
                                        e_7_1 = _e.sent();
                                        e_7 = { error: e_7_1 };
                                        return [3 /*break*/, 11];
                                    case 6:
                                        _e.trys.push([6, , 9, 10]);
                                        if (!(!_a && !_b && (_c = stream_5.return))) return [3 /*break*/, 8];
                                        return [4 /*yield*/, _c.call(stream_5)];
                                    case 7:
                                        _e.sent();
                                        _e.label = 8;
                                    case 8: return [3 /*break*/, 10];
                                    case 9:
                                        if (e_7) throw e_7.error;
                                        return [7 /*endfinally*/];
                                    case 10: return [7 /*endfinally*/];
                                    case 11: return [2 /*return*/, lastResponse];
                                }
                            });
                        }); })();
                        return [4 /*yield*/, Promise.race([streamPromise, timeoutPromise])];
                    case 2:
                        lastResponse = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _b.sent();
                        console.error("[TranslationClient] Translation failed for \"".concat(text, "\":"), error_6);
                        throw error_6;
                    case 4:
                        if (lastResponse) {
                            console.log("[TranslationClient] Translation complete, final response:", lastResponse);
                            return [2 /*return*/, lastResponse];
                        }
                        // If no response, throw an error
                        console.error("[TranslationClient] No translation response received for \"".concat(text, "\""));
                        throw new Error('No translation response received');
                }
            });
        });
    };
    /**
     * Translate multiple uncached texts in a single batch streaming request
     * All requests are sent over ONE HTTP connection, only shows one request in browser network panel
     * Greatly reduces the number of visible requests during page initialization
     * @param texts Array of text objects to translate ({text, fromLang})
     * @param toLang Target language for all translations
     * @param fingerprint Optional fingerprint
     * @returns Async iterable stream of translation responses as they arrive
     */
    TranslationClient.prototype.translateBatchUncached = function (texts, toLang, fingerprint) {
        // All requests go in the same single HTTP/2 streaming connection
        // This creates only ONE request entry in browser developer tools network panel
        var req = TranslateStreamRequest.fromJson({
            senseId: this.senseId,
            dstLang: toLang,
            fingerprint: fingerprint,
            persistent: false,
            texts: texts.map(function (t) { return ({
                text: t.text,
                fromLang: t.fromLang,
            }); }),
        });
        var stream = this.client.translateStream(req);
        return stream;
    };
    /**
     * Stream translation batches for a semantic sense
     * Uses native Connect RPC streaming with true multiplexing
     * @param senseId Semantic sense ID
     * @param dstLang Target language
     * @param fingerprint Optional fingerprint for specific domain
     * @param batchSize Optional batch size (default 500)
     * @returns Async iterable stream of translation responses
     */
    TranslationClient.prototype.translateStream = function (senseId, dstLang, fingerprint) {
        var req = TranslateStreamRequest.fromJson({
            senseId: senseId,
            dstLang: dstLang,
        });
        if (fingerprint) {
            req.fingerprint = fingerprint;
        }
        return this.client.translateStream(req);
    };
    /**
     Get paged list of translations for a semantic sense with optional filtering
     * @param options Request options including filtering, pagination
     * @returns Promise with filtered, paged translations
     */
    TranslationClient.prototype.getSenseTranslations = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var req;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        req = GetSenseTranslateRequest.fromJson({
                            senseId: options.senseId,
                        });
                        if (options.fingerprint !== undefined) {
                            req.fingerprint = options.fingerprint;
                        }
                        if (options.page !== undefined) {
                            req.page = options.page;
                        }
                        if (options.pageSize !== undefined) {
                            req.pageSize = options.pageSize;
                        }
                        // Pass language filtering parameters - use camelCase field names as generated by Protobuf ES
                        if (options.srcLang !== undefined) {
                            req.fromLang = options.srcLang;
                        }
                        if (options.dstLang !== undefined) {
                            req.toLang = options.dstLang;
                        }
                        return [4 /*yield*/, this.client.getSenseTranslate(req)];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    /**
     * Alias for getSenseTranslations - compatibility alias
     * Get paged list of translations for a semantic sense with optional filtering
     * @param options Request options including filtering, pagination
     * @returns Promise with filtered, paged translations
     */
    TranslationClient.prototype.getSenseTranslate = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getSenseTranslations(options)];
            });
        });
    };
    /**
     * Compatibility connect method - Connect RPC automatically manages connections
     * This is provided for API compatibility only
     */
    TranslationClient.prototype.connect = function () {
        // Connect RPC manages connection automatically - no action needed
        console.debug('[TranslationClient] connect() called - Connect RPC manages connections automatically');
    };
    /**
     * Create a translation pool for preloading and caching translations
     * @param senseId Semantic sense ID to create pool for
     * @param options Pool configuration options
     * @returns TranslationPool instance
     */
    TranslationClient.prototype.createPool = function (senseId, options) {
        return new TranslationPool(this, senseId, options);
    };
    /**
     * Get the underlying Connect RPC client for advanced use
     * @returns The client instance
     */
    TranslationClient.prototype.getClient = function () {
        return this.client;
    };
    /**
     * Start a persistent streaming connection for all real-time translation requests.
     * This reuses a single long-lived HTTP connection for all requests,
     * avoiding the overhead of creating a new connection for every word.
     * Only one persistent stream is maintained at a time.
     * @returns Promise that resolves when the stream is connected and ready
     */
    TranslationClient.prototype.startPersistentStream = function () {
        return __awaiter(this, void 0, void 0, function () {
            var req;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.persistentStreamConnected) {
                    console.log('[TranslationClient] Persistent stream already connected');
                    return [2 /*return*/];
                }
                if (this.persistentStream) {
                    console.log('[TranslationClient] Persistent stream already started, reconnecting...');
                }
                console.log('[TranslationClient] Starting persistent streaming connection...');
                req = TranslateStreamRequest.fromJson({
                    persistent: true, // Mark as persistent connection on server side
                });
                this.persistentStream = this.client.translateStream(req);
                // We need a channel-like approach to allow sending requests while reading responses
                // Connect RPC for browser uses HTTP/2 streaming which supports full duplex
                // We have server streaming where client sends one initial request
                // To get full duplex, we need to handle it as a stream that allows sending multiple requests
                // For browsers with connect-web, it's server streaming - so we use request batching
                // So the persistent stream will listen for responses while allowing new requests to be batched
                // In our current protocol:
                //  - We use POST with chunked encoding, every response comes back as they're processed
                //  - Each request has request_id, matches the response comes back with same request_id
                // Start the reader in the background that continuously processes responses
                this.persistentStreamReader = function () { return __awaiter(_this, void 0, void 0, function () {
                    var versionAtStart, _loop_5, this_3, _a, _b, _c, state_2, e_8_1, error_7;
                    var _this = this;
                    var _d, e_8, _e, _f;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                _g.trys.push([0, 13, , 14]);
                                versionAtStart = this.pool.currentLanguageVersion;
                                _g.label = 1;
                            case 1:
                                _g.trys.push([1, 6, 7, 12]);
                                _loop_5 = function () {
                                    _f = _c.value;
                                    _a = false;
                                    var response = _f;
                                    // If language version has changed, this is an old stream from previous language
                                    // Stop reading immediately - all pending requests were already rejected
                                    // This prevents cache corruption where old responses get added to new language cache
                                    if (this_3.pool.currentLanguageVersion !== versionAtStart) {
                                        console.log("[TranslationClient] Language version changed from ".concat(versionAtStart, " to ").concat(this_3.pool.currentLanguageVersion, " during persistent streaming - stopping old stream"));
                                        this_3.stopPersistentStream();
                                        return "break";
                                    }
                                    // Check if this response matches a pending request by requestId
                                    var resp = response;
                                    if (resp.requestId) {
                                        var pending = this_3.pool.pendingResolutions[resp.requestId];
                                        if (pending) {
                                            // Resolve the pending request with the response
                                            pending.resolveList.forEach(function (resolve) { return resolve(response); });
                                            // Remove from pending after resolving
                                            delete this_3.pool.pendingResolutions[resp.requestId];
                                            // Add translation to the cache if it contains translations
                                            if (resp.translation && Object.keys(resp.translation).length > 0) {
                                                Object.entries(resp.translation).forEach(function (_a) {
                                                    var _b, _c;
                                                    var text = _a[0], translation = _a[1];
                                                    var fp = (_b = _this.pool.getCurrentFingerprint()) !== null && _b !== void 0 ? _b : 'common';
                                                    var toLang = (_c = _this.pool.getCurrentLanguage()) !== null && _c !== void 0 ? _c : 'en';
                                                    _this.pool.addTranslationToFingerprint(text, translation, fp, toLang);
                                                });
                                            }
                                        }
                                    }
                                    // If finished flag means this particular batch is done
                                    if (resp.finished && !resp.requestId) {
                                        // Whole connection is closed by server, we can reconnect
                                        console.log('[TranslationClient] Persistent stream finished by server, will reconnect on next request');
                                        this_3.stopPersistentStream();
                                        return "break";
                                    }
                                };
                                this_3 = this;
                                _a = true, _b = __asyncValues(this.persistentStream);
                                _g.label = 2;
                            case 2: return [4 /*yield*/, _b.next()];
                            case 3:
                                if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 5];
                                state_2 = _loop_5();
                                if (state_2 === "break")
                                    return [3 /*break*/, 5];
                                _g.label = 4;
                            case 4:
                                _a = true;
                                return [3 /*break*/, 2];
                            case 5: return [3 /*break*/, 12];
                            case 6:
                                e_8_1 = _g.sent();
                                e_8 = { error: e_8_1 };
                                return [3 /*break*/, 12];
                            case 7:
                                _g.trys.push([7, , 10, 11]);
                                if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 9];
                                return [4 /*yield*/, _e.call(_b)];
                            case 8:
                                _g.sent();
                                _g.label = 9;
                            case 9: return [3 /*break*/, 11];
                            case 10:
                                if (e_8) throw e_8.error;
                                return [7 /*endfinally*/];
                            case 11: return [7 /*endfinally*/];
                            case 12: return [3 /*break*/, 14];
                            case 13:
                                error_7 = _g.sent();
                                console.error('[TranslationClient] Persistent stream reader error:', error_7);
                                // Reject all pending requests
                                Object.values(this.pool.pendingResolutions).forEach(function (pending) {
                                    pending.rejectList.forEach(function (reject) { return reject(error_7); });
                                });
                                this.pool.pendingResolutions = {};
                                this.stopPersistentStream();
                                return [3 /*break*/, 14];
                            case 14: return [2 /*return*/];
                        }
                    });
                }); };
                // Start reading in the background
                this.persistentStreamConnected = true;
                // We need to allow sending - for server streaming, we can't send after initial request
                // So our protocol changes: All requests are sent with request_id and responses match request_id
                // Since it's server streaming from the browser, we open the persistent connection,
                // and the server sends back responses as requests are processed
                // To send new requests after opening, we need to have multiple requests batched in initial connection
                // So for persistent connection we just keep it open continuously
                // Start reading responses
                // In our current implementation with server streaming, we can do:
                // The client sends a request with all current queued requests, server streams back responses
                // When a new request comes in, it goes to queue and we wait for it to be processed on the next reconnect
                // Actually - connect-web doesn't support client streaming from browser, only server streaming
                // So we keep it simple: we keep the connection open as long as possible,
                // when new requests come while connection is open, they get queued to be processed when connection opens next time
                this.persistentStreamReader().catch(function (err) {
                    console.error('[TranslationClient] Unhandled error in persistent stream reader:', err);
                });
                this.persistentStreamWriter = function (req) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        // Since we can't send more than initial request in server streaming from browser (connect-web limitation),
                        // we have one connection per batch - when requests are pending,
                        // we send them all at once when connection starts
                        // If we have an existing connection, any new requests will be processed on the next connection
                        // when current connection finishes. This still provides efficient batching.
                        // For the persistent stream, we just accept the request is queued,
                        // and the server will get it when the stream is created with all queued requests.
                        // This is the best we can do with server streaming from browser.
                        // If there is no active connection or connection closed, automatically reconnect
                        if (!this.persistentStreamConnected || !this.persistentStream) {
                            console.log('[TranslationClient] Persistent stream not connected, restarting...');
                            this.startPersistentStream().catch(function (err) {
                                console.error('[TranslationClient] Failed to restart persistent stream:', err);
                            });
                        }
                        return [2 /*return*/];
                    });
                }); };
                console.log('[TranslationClient] Persistent streaming connection started');
                return [2 /*return*/];
            });
        });
    };
    /**
     * Stop the persistent streaming connection
     * Cleans up all pending requests
     */
    TranslationClient.prototype.stopPersistentStream = function () {
        this.persistentStreamConnected = false;
        this.persistentStream = null;
        this.persistentStreamWriter = null;
        this.persistentStreamReader = null;
        // Reject all pending requests so they can fall back to individual connections
        Object.values(this.pool.pendingResolutions).forEach(function (pending) {
            pending.rejectList.forEach(function (reject) { return reject(new Error('Persistent stream stopped')); });
        });
        this.pool.pendingResolutions = {};
        console.log('[TranslationClient] Persistent streaming connection stopped');
    };
    /**
     * Check if persistent stream is connected and ready
     * @returns true if connected and ready
     */
    TranslationClient.prototype.isPersistentStreamConnected = function () {
        return this.persistentStreamConnected;
    };
    /**
     * Get information about the current sense
     * @returns Object containing sense ID and default settings
     */
    TranslationClient.prototype.getSenseInfo = function () {
        return {
            senseId: this.senseId,
            defaultFromLang: this.defaultFromLang,
        };
    };
    /**
     * Synchronous cache lookup (for immediate synchronous return in UI)
     * SDK automatically handles all caching internally
     * @param text Original text
     * @param toLang Target language
     * @param fromLang Source language (optional)
     * @param fingerprint Fingerprint (optional)
     * @returns Cache lookup result with found flag and translation
     */
    TranslationClient.prototype.lookupSync = function (text, toLang, fromLang, fingerprint) {
        var _a;
        fromLang || this.defaultFromLang;
        var actualFingerprint = (_a = fingerprint !== null && fingerprint !== void 0 ? fingerprint : this.pool.getCurrentFingerprint()) !== null && _a !== void 0 ? _a : 'common';
        return this.pool.lookup(text, actualFingerprint, toLang);
    };
    /**
     * Register callback for when translations are updated in the cache
     * This is used to trigger UI re-renders after background translation completes
     * @param callback Callback to invoke when translations are updated
     */
    TranslationClient.prototype.onTranslationUpdated = function (callback) {
        this.pool.setTranslationUpdatedCallback(callback);
    };
    /**
     * Register callback for compensation translation when language is switched
     * After switching to a new language, the callback will be invoked with all texts
     * that are missing translations for the new language, so the integrator can
     * queue them for translation to ensure all visible text gets translated
     * @param callback Callback to invoke with missing texts list and new language
     */
    TranslationClient.prototype.onCompensationTranslate = function (callback) {
        this.pool.setCompensationTranslateCallback(callback);
    };
    /**
     * Clear all cached translations for the current sense
     * Clears both in-memory cache and persistent storage
     */
    TranslationClient.prototype.clear = function () {
        this.pool.clear();
    };
    return TranslationClient;
}());

exports.TranslationClient = TranslationClient;
exports.TranslationPool = TranslationPool;
exports.default = TranslationClient;
exports.extractTemplate = extractTemplate;
exports.mergeTemplate = mergeTemplate;
exports.version = version;
//# sourceMappingURL=translation-client.cjs.map
