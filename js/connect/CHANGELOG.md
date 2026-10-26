# Changelog

## 1.6.150

- Fix: `global` and `require` type declarations in `translation-client.ts` — the React Native / Node.js environment-detection block now compiles under a consumer's strict TypeScript config (no more "Cannot find name 'global'" / "Cannot find name 'require'" errors when the SDK's `.ts` source is type-checked).
- Fix: `TranslateStreamResponse.fromJson` / `TranslateStreamRequest.fromJson` argument type assertions — partial object literals now cast through `unknown` to satisfy the generated-code `JsonValue` parameter type.
- Fix: `urlRewriteInterceptor` now typed as `Interceptor` (previously implicit `any` parameters).
- Fix: `persistentStreamWriter` null-invocation now uses the non-null assertion (`!`) to reflect the established post-guard invariant.

## 1.6.149

- (baseline published to npm registry)
