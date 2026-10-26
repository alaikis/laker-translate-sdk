// Test CommonJS import
const sdk = require('./translation-client.cjs');

console.log('✓ CommonJS import successful');
console.log('All exports:', Object.keys(sdk));
console.log('TranslationClient:', typeof sdk.TranslationClient);
console.log('TranslationPool:', typeof sdk.TranslationPool);
console.log('extractTemplate:', typeof sdk.extractTemplate);

// Extract Template test
const templateTest = sdk.extractTemplate('Translate 123 and 456');
console.log('✓ extractTemplate works:', templateTest);

// Try client instantiation
if (sdk.TranslationClient) {
  // SDK creates transport internally, user just needs to provide options
  const client = new sdk.TranslationClient({
    baseUrl: 'http://localhost:8080',
    senseId: 'test-sense',
  });
  console.log('✓ Client instantiation successful');
  console.log('Methods on client:', Object.keys(client));
}


