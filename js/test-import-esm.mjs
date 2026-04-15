// Test ESM import
import { TranslationClient, TranslationPool, extractTemplate } from './translation-client.js';
import { createConnectTransport } from '@connectrpc/connect-node';

console.log('✓ ESM import successful');
console.log('TranslationClient:', typeof TranslationClient);
console.log('TranslationPool:', typeof TranslationPool);
console.log('extractTemplate:', typeof extractTemplate);

// Extract Template test
const templateTest = extractTemplate('Translate 123 and 456');
console.log('✓ extractTemplate works:', templateTest);

// In pure ESM Node.js environment, dynamic import is async so we need manual transport injection
const client = new TranslationClient({
  baseUrl: 'http://localhost:8080',
  senseId: 'test-sense',
  transport: createConnectTransport({
    baseUrl: 'http://localhost:8080',
    httpVersion: '2',
  })
});
console.log('✓ Client instantiation successful with manual transport');
console.log('Methods on client:', Object.keys(client));

console.log('\n✅ All exports work correctly');

console.log('\n✅ All exports work correctly');

console.log('\n✅ All exports work correctly');

console.log('\n✅ All exports work correctly');

