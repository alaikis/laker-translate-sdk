import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import replace from '@rollup/plugin-replace';

// For browser IIFE build, we use a browser-specific entry point
// that doesn't depend on @connectrpc/connect-node (which requires Node.js built-ins)
const browserConfig = {
  input: 'browser.ts',
  // Only exclude @connectrpc/connect-node - we need to include everything else for the standalone IIFE build
  external: [
    /^@connectrpc\/connect-node$/
  ],
  output: {
    file: 'translation-client.iife.js',
    format: 'iife',
    sourcemap: true,
    name: 'LakerTranslation',
    inlineDynamicImports: true
  },
  plugins: [
    nodePolyfills({
      // We only need to polyfill util if it's actually required somewhere
      include: ['util']
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
      mainFields: ['browser', 'module', 'main']
    }),
    commonjs({
      include: /node_modules/
    }),
    typescript({
      include: ["**/*.ts"]
    })
  ]
};

// For CJS and ESM, we use the main entry with dynamic conditional loading
const mainConfig = {
  input: 'translation-client.ts',
  external: [
    /^@bufbuild\//,
    /^@connectrpc\//,
    /^broadcast-channel/,
    /^@react-native-async-storage\//,
    /^expo-secure-store$/,
    /^assert$/,
    /^net$/,
    /^http$/,
    /^https$/,
    /^stream$/,
    /^buffer$/,
    /^util$/,
    /^zlib$/,
    /^querystring$/,
    /^events$/,
    /^url$/,
    /^tls$/,
    /^util\/types$/,
    /^stream\/web$/,
    /^node:stream$/,
    /^node:util$/,
    /^node:events$/,
    /^async_hooks$/,
    /^worker_threads$/,
    /^perf_hooks$/,
    /^string_decoder$/,
    /^diagnostics_channel$/,
    /^http2$/
  ],
  output: [
    {
      file: 'translation-client.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true
    },
    {
      file: 'translation-client.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true
    }
  ],
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
      mainFields: ['browser', 'module', 'main']
    }),
    commonjs({
      include: /node_modules/
    }),
    typescript({
      include: ["**/*.ts"]
    })
  ]
};

// Expo / React Native 入口构建（./expo 子路径）
const nativeConfig = {
  input: 'native/index.ts',
  output: [
    {
      file: 'native/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true,
    },
    {
      file: 'native/index.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true,
    },
  ],
  external: [
    /^@bufbuild\//,
    /^@connectrpc\//,
    /^broadcast-channel/,
    /^@react-native-async-storage\//,
    /^expo-secure-store$/,
    /^assert$/,
    /^net$/,
    /^http$/,
    /^https$/,
    /^stream$/,
    /^buffer$/,
    /^util$/,
    /^zlib$/,
    /^querystring$/,
    /^events$/,
    /^url$/,
    /^tls$/,
    /^util\/types$/,
    /^stream\/web$/,
    /^node:stream$/,
    /^node:util$/,
    /^node:events$/,
    /^async_hooks$/,
    /^worker_threads$/,
    /^perf_hooks$/,
    /^string_decoder$/,
    /^diagnostics_channel$/,
    /^http2$/,
  ],
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
      mainFields: ['browser', 'module', 'main'],
    }),
    commonjs({
      include: /node_modules/,
    }),
    typescript({
      include: ['**/*.ts'],
    }),
  ],
};

// 原生 React Native 入口构建（./rn 子路径）
const rnConfig = {
  input: 'rn/index.ts',
  output: [
    {
      file: 'rn/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true,
    },
    {
      file: 'rn/index.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
      inlineDynamicImports: true,
    },
  ],
  external: [
    /^@bufbuild\//,
    /^@connectrpc\//,
    /^broadcast-channel/,
    /^@react-native-async-storage\//,
    /^expo-secure-store$/,
    /^assert$/,
    /^net$/,
    /^http$/,
    /^https$/,
    /^stream$/,
    /^buffer$/,
    /^util$/,
    /^zlib$/,
    /^querystring$/,
    /^events$/,
    /^url$/,
    /^tls$/,
    /^util\/types$/,
    /^stream\/web$/,
    /^node:stream$/,
    /^node:util$/,
    /^node:events$/,
    /^async_hooks$/,
    /^worker_threads$/,
    /^perf_hooks$/,
    /^string_decoder$/,
    /^diagnostics_channel$/,
    /^http2$/,
  ],
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
      mainFields: ['browser', 'module', 'main'],
    }),
    commonjs({
      include: /node_modules/,
    }),
    typescript({
      include: ['**/*.ts'],
    }),
  ],
};

export default [mainConfig, browserConfig, nativeConfig, rnConfig];
