/**
 * Translation Service gRPC-Web TypeScript/JavaScript Client
 *
 * Auto-generated for api.laker.dev Translation Service
 * Service: TranslationService
 * Source: proto/translation.proto
 */

export interface TranslateRecord {
  id: string;
  text: string;
  translate: string;
  isCustom: boolean;
}

export interface GetSenseTranslateRequest {
  senseId: string;
  fingerprint?: string;
  page?: number;
  pageSize?: number;
}

export interface GetSenseTranslateResponse {
  senseId: string;
  total: number;
  page: number;
  pageSize: number;
  translations: TranslateRecord[];
}

export interface TranslateStreamRequest {
  senseId: string;
  fingerprint?: string;
  batchSize?: number;
}

export interface TranslateStreamResponse {
  batch: number;
  hasMore: boolean;
  total: number;
  translations: TranslateRecord[];
}

/**
 * Result of template extraction
 */
export interface TemplateExtractResult {
  isTemplated: boolean;
  srcTemplate: string;
  dstTemplate: string;
  variables: string[];
}

export interface LLMTranslateRequest {
  text: string;
  fromLang?: string;
  toLang: string;
  provider?: string;
  senseId?: string;
}

export interface LLMTranslateResponse {
  originalText: string;
  translatedText: string;
  provider: string;
  timestamp: number;
  finished: boolean;
  cached: boolean;
  fromLang?: string;
  toLang?: string;
}

/**
 * Result of translation lookup in TranslationPool
 */
export interface TranslationLookupResult {
  found: boolean;
  translation: string;
  source: 'special' | 'common' | null;
}

/**
 * Automatic template extraction from text containing numeric variables
 * @param text Original text that may contain numeric variables
 * @returns Template extraction result
 */
export function extractTemplate(text: string): TemplateExtractResult {
  // Regex to find numbers in text
  const numberRegex = /\d+(?:\.\d+)?/g;
  const matches = text.match(numberRegex);
  
  if (!matches || matches.length === 0) {
    return {
      isTemplated: false,
      srcTemplate: text,
      dstTemplate: '',
      variables: []
    };
  }
  
  let template = text;
  const variables: string[] = [];
  
  matches.forEach((match, index) => {
    const varName = `{var${index + 1}}`;
    template = template.replace(match, varName);
    variables.push(match);
  });
  
  return {
    isTemplated: variables.length > 0,
    srcTemplate: template,
    dstTemplate: '',
    variables
  };
}

/**
 * TranslationPool - Two-level translation cache with priority lookup
 * 
 * Architecture:
 * - commonPool: stores general/common translations (automatic from backend)
 * - fingerprintPools: stores special translations for specific fingerprint (requires manual input)
 * 
 * Lookup Priority:
 * 1. Current fingerprint special translations
 * 2. Common translations  
 * 3. If not found, request from backend
 * 
 * Rules:
 * - All new translations from backend are automatically added to commonPool
 * - Special translations must be added manually
 */
export class TranslationPool {
  private client: TranslationClient;
  private senseId: string;
  private commonPool: Map<string, string> = new Map();
  private fingerprintPools: Map<string, Map<string, string>> = new Map();
  private currentFingerprint: string | null = null;
  
  /**
   * Create a new TranslationPool for a specific sense
   * @param client TranslationClient instance
   * @param senseId The semantic sense ID
   */
  constructor(client: TranslationClient, senseId: string) {
    this.client = client;
    this.senseId = senseId;
  }
  
  /**
   * Initialize the pool - loads all common translations from backend
   */
  async initialize(): Promise<void> {
    let page = 1;
    const pageSize = 5000;
    
    // Stream all common translations
    const response = await this.client.getSenseTranslate({
      senseId: this.senseId,
      page,
      pageSize
    });
    
    // Add all common translations to pool
    response.translations.forEach(record => {
      if (record.isCustom) {
        // Custom translations go to common
        this.commonPool.set(record.text, record.translate);
      }
    });
    
    // If there are more pages, continue loading
    while (response.page * response.pageSize < response.total) {
      page++;
      const nextResponse = await this.client.getSenseTranslate({
        senseId: this.senseId,
        page,
        pageSize
      });
      nextResponse.translations.forEach(record => {
        if (record.isCustom) {
          this.commonPool.set(record.text, record.translate);
        }
      });
    }
  }
  
  /**
   * Switch to a different fingerprint, loads its special translations
   * @param fingerprint The fingerprint to switch to
   */
  async switchFingerprint(fingerprint: string): Promise<void> {
    // Clear current fingerprint to free memory
    this.currentFingerprint = null;
    
    // Check if we already have this fingerprint cached
    if (!this.fingerprintPools.has(fingerprint)) {
      this.fingerprintPools.set(fingerprint, new Map());
      
      // Load special translations for this fingerprint
      let page = 1;
      const pageSize = 1000;
      
      const response = await this.client.getSenseTranslate({
        senseId: this.senseId,
        fingerprint,
        page,
        pageSize
      });
      
      const pool = this.fingerprintPools.get(fingerprint)!;
      response.translations.forEach(record => {
        if (record.isCustom) {
          pool.set(record.text, record.translate);
        }
      });
      
      // Load more pages if needed
      while (response.page * response.pageSize < response.total) {
        page++;
        const nextResponse = await this.client.getSenseTranslate({
          senseId: this.senseId,
          fingerprint,
          page,
          pageSize
        });
        nextResponse.translations.forEach(record => {
          if (record.isCustom) {
            pool.set(record.text, record.translate);
          }
        });
      }
    }
    
    this.currentFingerprint = fingerprint;
  }
  
  /**
   * Clear the current fingerprint to free memory
   */
  clearCurrentFingerprint(): void {
    this.currentFingerprint = null;
  }
  
  /**
   * Lookup translation following priority rules:
   * 1. Current fingerprint special translation
   * 2. Common translation
   * 3. Not found
   * 
   * @param text Original text to lookup
   * @returns Lookup result
   */
  lookup(text: string): TranslationLookupResult {
    // Check current fingerprint first
    if (this.currentFingerprint) {
      const specialPool = this.fingerprintPools.get(this.currentFingerprint);
      if (specialPool && specialPool.has(text)) {
        return {
          found: true,
          translation: specialPool.get(text)!,
          source: 'special'
        };
      }
    }
    
    // Check common pool
    if (this.commonPool.has(text)) {
      return {
        found: true,
        translation: this.commonPool.get(text)!,
        source: 'common'
      };
    }
    
    // Not found
    return {
      found: false,
      translation: '',
      source: null
    };
  }
  
  /**
   * Add a special translation to the current fingerprint
   * Requires that a fingerprint is currently active
   * 
   * @param text Original text
   * @param translation Translated text
   * @returns true if added successfully, false if no current fingerprint
   */
  addSpecialTranslation(text: string, translation: string): boolean {
    if (!this.currentFingerprint) {
      return false;
    }
    
    const specialPool = this.fingerprintPools.get(this.currentFingerprint);
    if (!specialPool) {
      return false;
    }
    
    specialPool.set(text, translation);
    return true;
  }
  
  /**
   * Request translation from backend, automatically adds to common pool if found
   * 
   * @param text Text to translate
   * @param fromLang Source language
   * @param toLang Target language
   * @returns Translation response
   */
  async requestTranslation(
    text: string,
    fromLang: string,
    toLang: string
  ): Promise<LLMTranslateResponse> {
    const response = await this.client.llmTranslate({
      text,
      fromLang,
      toLang,
      senseId: this.senseId
    });
    
    // Add to common pool automatically
    if (response.translatedText) {
      this.commonPool.set(text, response.translatedText);
    }
    
    return response;
  }
  
  /**
   * Get all common translations
   * @returns Array of {text, translation}
   */
  getAllCommon(): Array<{ text: string; translation: string }> {
    const result: Array<{ text: string; translation: string }> = [];
    this.commonPool.forEach((translation, text) => {
      result.push({ text, translation });
    });
    return result;
  }
  
  /**
   * Get all special translations for current fingerprint
   * @returns Array of {text, translation} or empty if no current fingerprint
   */
  getAllCurrentSpecial(): Array<{ text: string; translation: string }> {
    if (!this.currentFingerprint) {
      return [];
    }
    const specialPool = this.fingerprintPools.get(this.currentFingerprint);
    if (!specialPool) {
      return [];
    }
    const result: Array<{ text: string; translation: string }> = [];
    specialPool.forEach((translation, text) => {
      result.push({ text, translation });
    });
    return result;
  }
  
  /**
   * Clear all cached data to free memory
   */
  clearAll(): void {
    this.commonPool.clear();
    this.fingerprintPools.clear();
    this.currentFingerprint = null;
  }
}

/**
 * TranslationClient - gRPC-Web compatible client for TranslationService
 * Uses JSON over HTTP transport for compatibility
 */
export class TranslationClient {
  private baseUrl: string;
  private token: string;
  private timeout: number;

  /**
   * Create a new TranslationClient
   * @param baseUrl Base URL of the gRPC-Web endpoint, defaults to https://api.hottol.com/laker/
   * @param token JWT authentication token (optional)
   * @param timeout Request timeout in milliseconds (default: 30000)
   */
  constructor(baseUrl: string = 'https://api.hottol.com/laker/', token: string = '', timeout: number = 30000) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.token = token;
    this.timeout = timeout;
  }

  /**
   * Set or update the JWT authentication token
   * @param token JWT token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * GetSenseTranslate - One-shot unary request with pagination
   * @param request Request parameters
   */
  async getSenseTranslate(request: GetSenseTranslateRequest): Promise<GetSenseTranslateResponse> {
    const url = `${this.baseUrl}/TranslationService/GetSenseTranslate`;

    const response = await this.fetchJson(url, request);
    return response as GetSenseTranslateResponse;
  }

  /**
   * TranslateStream - Server streaming, receives multiple batches progressively
   * @param request Request parameters
   * @param onBatch Callback for each batch received. Return false to stop streaming early.
   */
  async translateStream(
    request: TranslateStreamRequest,
    onBatch: (response: TranslateStreamResponse) => boolean | void
  ): Promise<void> {
    const url = `${this.baseUrl}/TranslationService/TranslateStream`;
    
    // For gRPC-Web streaming over HTTP, we use GET with SSE-style streaming
    // This implementation works with the improbabe-eng/grpc-web Go handler
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(request),
      headers: this.getHeaders()
    });
    
    if (!response.body) {
      throw new Error('No response body for streaming request');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      
      const chunk = decoder.decode(value);
      // Parse each line as a JSON message
      const lines = chunk.split('\n').filter(line => line.trim().length > 0);
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          const shouldContinue = onBatch(data as TranslateStreamResponse);
          if (shouldContinue === false) {
            reader.cancel();
            return;
          }
        } catch (e) {
          console.warn('Failed to parse streaming chunk:', line, e);
        }
      }
    }
  }

  /**
   * Collect all streaming responses into an array
   * @param request Request parameters
   */
  async translateStreamCollect(request: TranslateStreamRequest): Promise<TranslateStreamResponse[]> {
    const result: TranslateStreamResponse[] = [];
    await this.translateStream(request, (response) => {
      result.push(response);
      return true;
    });
    return result;
  }

  /**
   * LLMTranslate - One-shot large language model translation
   * @param request Translation request
   */
  async llmTranslate(request: LLMTranslateRequest): Promise<LLMTranslateResponse> {
    const url = `${this.baseUrl}/TranslationService/LLMTranslate`;

    const response = await this.fetchJson(url, request);
    return response as LLMTranslateResponse;
  }

  /**
   * LLMTranslateStream - Streaming large language model translation
   * @param request Translation request
   * @param onResponse Callback for each response chunk
   */
  async llmTranslateStream(
    request: LLMTranslateRequest,
    onResponse: (response: LLMTranslateResponse) => boolean | void
  ): Promise<void> {
    const url = `${this.baseUrl}/TranslationService/LLMTranslateStream`;
    
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(request),
      headers: this.getHeaders()
    });
    
    if (!response.body) {
      throw new Error('No response body for streaming request');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim().length > 0);
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          const shouldContinue = onResponse(data as LLMTranslateResponse);
          if (shouldContinue === false) {
            reader.cancel();
            return;
          }
        } catch (e) {
          console.warn('Failed to parse streaming chunk:', line, e);
        }
      }
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/grpc-web+json',
      'X-Grpc-Web': '1'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  private async fetchJson(url: string, body: any): Promise<any> {
    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeout);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(id);
    return response;
  }
}

export default TranslationClient;
