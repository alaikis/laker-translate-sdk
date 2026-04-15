import typescript from '@rollup/plugin-typescript';

export default {
  input: 'translation-client.ts',
  // Keep only core dependencies external - host projects must install @connectrpc/*, broadcast-channel
  // We bundle all generated proto code internally to avoid splitting packages
  external: [
    /^@connectrpc\//,
    /^broadcast-channel/
  ],
  output: [
    {
      file: 'translation-client.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'translation-client.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    }
  ],
  plugins: [typescript()]
};
