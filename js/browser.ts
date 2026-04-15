/**
 * Browser-specific entry point that statically imports from @connectrpc/connect-web
 * This ensures bundlers don't include Node.js modules in browser builds
 */

// MUST set this BEFORE importing translation-client!
// Because translation-client checks this during module initialization
import { createConnectTransport } from '@connectrpc/connect-web';
if (typeof window !== 'undefined') {
  (window as any).__LAKER_BROWSER_TRANSPORT = createConnectTransport;
}

// Import generated Connect RPC code
import {
  GetSenseTranslateRequest,
  GetSenseTranslateResponse,
  TranslateStreamRequest,
  TranslateStreamResponse,
  TranslateRecord,
} from './gen/translation_pb';
import { TranslationService } from './gen/translation_connect';
import * as translationClient from './translation-client';

// Export generated types
export type {
  GetSenseTranslateRequest,
  GetSenseTranslateResponse,
  TranslateStreamRequest,
  TranslateStreamResponse,
  TranslateRecord,
};

// Export everything from translation-client
export * from './translation-client';
export { TranslationService } from './gen/translation_connect';

// Explicitly ensure all exports are available on window.LakerTranslation
// This guarantees that even if Rollup IIFE doesn't work, we still have the exports
if (typeof window !== 'undefined') {
  if (!(window as any).LakerTranslation) {
    (window as any).LakerTranslation = {};
  }
  // Copy all exports to window
  Object.assign((window as any).LakerTranslation, translationClient);
  (window as any).LakerTranslation.TranslationService = TranslationService;
}
