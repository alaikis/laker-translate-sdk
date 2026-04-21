/**
 * Browser-specific entry point that statically imports from @connectrpc/connect-web
 * This ensures bundlers don't include Node.js modules in browser builds
 */
import { GetSenseTranslateRequest, GetSenseTranslateResponse, TranslateStreamRequest, TranslateStreamResponse, TranslateRecord } from './gen/proto/proto/translation_pb';
export type { GetSenseTranslateRequest, GetSenseTranslateResponse, TranslateStreamRequest, TranslateStreamResponse, TranslateRecord, };
export * from './translation-client';
export { TranslationService } from './gen/proto/proto/translation_connect';
