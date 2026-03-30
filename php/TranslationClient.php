<?php
/**
 * Laker Translation Service PHP Client SDK
 * 
 * Auto-generated for api.laker.dev Translation Service
 * Service: TranslationService
 * Source: proto/translation.proto
 */

namespace Laker\Translation;

use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Client as GuzzleClient;

define('LAKER_TRANSLATION_DEFAULT_BASE_URL', 'https://api.hottol.com/laker/');

/**
 * TranslateRecord represents a single translation record
 */
class TranslateRecord
{
    /** @var string */
    public $id;
    /** @var string */
    public $text;
    /** @var string */
    public $translate;
    /** @var bool */
    public $isCustom;

    /**
     * @param array $data
     */
    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? '';
        $this->text = $data['text'] ?? '';
        $this->translate = $data['translate'] ?? '';
        $this->isCustom = $data['isCustom'] ?? false;
    }

    /**
     * @return array
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'text' => $this->text,
            'translate' => $this->translate,
            'isCustom' => $this->isCustom,
        ];
    }
}

/**
 * GetSenseTranslateRequest represents a request to get translations for a sense
 */
class GetSenseTranslateRequest
{
    /** @var string */
    public $senseId;
    /** @var string|null */
    public $fingerprint;
    /** @var int|null */
    public $page;
    /** @var int|null */
    public $pageSize;

    /**
     * @param string $senseId
     * @param string|null $fingerprint
     * @param int|null $page
     * @param int|null $pageSize
     */
    public function __construct(
        string $senseId,
        ?string $fingerprint = null,
        ?int $page = null,
        ?int $pageSize = null
    ) {
        $this->senseId = $senseId;
        $this->fingerprint = $fingerprint;
        $this->page = $page;
        $this->pageSize = $pageSize;
    }

    /**
     * @return array
     */
    public function toArray(): array
    {
        $data = ['senseId' => $this->senseId];
        if ($this->fingerprint !== null) {
            $data['fingerprint'] = $this->fingerprint;
        }
        if ($this->page !== null) {
            $data['page'] = $this->page;
        }
        if ($this->pageSize !== null) {
            $data['pageSize'] = $this->pageSize;
        }
        return $data;
    }
}

/**
 * GetSenseTranslateResponse represents the response for a sense translation query
 */
class GetSenseTranslateResponse
{
    /** @var string */
    public $senseId;
    /** @var int */
    public $total;
    /** @var int */
    public $page;
    /** @var int */
    public $pageSize;
    /** @var TranslateRecord[] */
    public $translations;

    /**
     * @param array $data
     */
    public function __construct(array $data)
    {
        $this->senseId = $data['senseId'] ?? '';
        $this->total = $data['total'] ?? 0;
        $this->page = $data['page'] ?? 1;
        $this->pageSize = $data['pageSize'] ?? 0;
        $this->translations = array_map(function ($t) {
            return new TranslateRecord($t);
        }, $data['translations'] ?? []);
    }

    /**
     * @return array
     */
    public function toArray(): array
    {
        return [
            'senseId' => $this->senseId,
            'total' => $this->total,
            'page' => $this->page,
            'pageSize' => $this->pageSize,
            'translations' => array_map(function ($t) {
                return $t->toArray();
            }, $this->translations),
        ];
    }
}

/**
 * LLMTranslateRequest represents a large language model translation request
 */
class LLMTranslateRequest
{
    /** @var string */
    public $text;
    /** @var string|null */
    public $fromLang;
    /** @var string */
    public $toLang;
    /** @var string|null */
    public $provider;
    /** @var string|null */
    public $senseId;

    /**
     * @param string $text
     * @param string $toLang
     * @param string|null $fromLang
     * @param string|null $provider
     * @param string|null $senseId
     */
    public function __construct(
        string $text,
        string $toLang,
        ?string $fromLang = null,
        ?string $provider = null,
        ?string $senseId = null
    ) {
        $this->text = $text;
        $this->fromLang = $fromLang;
        $this->toLang = $toLang;
        $this->provider = $provider;
        $this->senseId = $senseId;
    }

    /**
     * @return array
     */
    public function toArray(): array
    {
        $data = [
            'text' => $this->text,
            'toLang' => $this->toLang,
        ];
        if ($this->fromLang !== null) {
            $data['fromLang'] = $this->fromLang;
        }
        if ($this->provider !== null) {
            $data['provider'] = $this->provider;
        }
        if ($this->senseId !== null) {
            $data['senseId'] = $this->senseId;
        }
        return $data;
    }
}

/**
 * LLMTranslateResponse represents a large language model translation response
 */
class LLMTranslateResponse
{
    /** @var string */
    public $originalText;
    /** @var string */
    public $translatedText;
    /** @var string */
    public $provider;
    /** @var int */
    public $timestamp;
    /** @var bool */
    public $finished;
    /** @var bool */
    public $cached;
    /** @var string|null */
    public $fromLang;
    /** @var string|null */
    public $toLang;

    /**
     * @param array $data
     */
    public function __construct(array $data)
    {
        $this->originalText = $data['originalText'] ?? '';
        $this->translatedText = $data['translatedText'] ?? '';
        $this->provider = $data['provider'] ?? '';
        $this->timestamp = $data['timestamp'] ?? 0;
        $this->finished = $data['finished'] ?? true;
        $this->cached = $data['cached'] ?? false;
        $this->fromLang = $data['fromLang'] ?? null;
        $this->toLang = $data['toLang'] ?? null;
    }

    /**
     * @return array
     */
    public function toArray(): array
    {
        $data = [
            'originalText' => $this->originalText,
            'translatedText' => $this->translatedText,
            'provider' => $this->provider,
            'timestamp' => $this->timestamp,
            'finished' => $this->finished,
            'cached' => $this->cached,
        ];
        if ($this->fromLang !== null) {
            $data['fromLang'] = $this->fromLang;
        }
        if ($this->toLang !== null) {
            $data['toLang'] = $this->toLang;
        }
        return $data;
    }
}

/**
 * TranslationLookupResult represents the result of a translation lookup in TranslationPool
 */
class TranslationLookupResult
{
    /** @var bool */
    public $found;
    /** @var string */
    public $translation;
    /** @var string|null 'special' or 'common' or null */
    public $source;

    /**
     * @param bool $found
     * @param string $translation
     * @param string|null $source
     */
    public function __construct(bool $found, string $translation = '', ?string $source = null)
    {
        $this->found = $found;
        $this->translation = $translation;
        $this->source = $source;
    }
}

/**
 * TranslationPool implements two-level translation cache with priority lookup
 * 
 * Architecture:
 *   - commonPool: stores general/common translations (automatic from backend)
 *   - fingerprintPools: stores special translations for specific fingerprint (requires manual input)
 * 
 * Lookup Priority:
 *  1. Current fingerprint special translations
 *  2. Common translations
 *  3. If not found, request from backend
 * 
 * Rules:
 *   - All new translations from backend are automatically added to commonPool
 *   - Special translations must be added manually
 */
class TranslationPool
{
    /** @var Client */
    private $client;
    /** @var string */
    private $senseId;
    /** @var array<string, string> */
    private $commonPool = [];
    /** @var array<string, array<string, string>> */
    private $fingerprintPools = [];
    /** @var string|null */
    private $currentFingerprint = null;

    /**
     * @param Client $client
     * @param string $senseId
     */
    public function __construct(Client $client, string $senseId)
    {
        $this->client = $client;
        $this->senseId = $senseId;
    }

    /**
     * Initialize loads all common translations from backend into the pool
     * @throws GuzzleException
     */
    public function initialize(): bool
    {
        $page = 1;
        $pageSize = 5000;

        $response = $this->client->getSenseTranslate(
            new GetSenseTranslateRequest($this->senseId, null, $page, $pageSize)
        );

        // Common translations have isCustom == false
        foreach ($response->translations as $record) {
            if (!$record->isCustom) {
                $this->commonPool[$record->text] = $record->translate;
            }
        }

        while (($response->page * $response->pageSize) < $response->total) {
            $page++;
            $response = $this->client->getSenseTranslate(
                new GetSenseTranslateRequest($this->senseId, null, $page, $pageSize)
            );
            // Common translations have isCustom == false
            foreach ($response->translations as $record) {
                if (!$record->isCustom) {
                    $this->commonPool[$record->text] = $record->translate;
                }
            }
        }

        return true;
    }

    /**
     * SwitchFingerprint switches to a different fingerprint and loads its special translations
     * @throws GuzzleException
     */
    public function switchFingerprint(string $fingerprint): bool
    {
        $this->currentFingerprint = null;

        if (!isset($this->fingerprintPools[$fingerprint])) {
            $this->fingerprintPools[$fingerprint] = [];
            $page = 1;
            $pageSize = 1000;

            $response = $this->client->getSenseTranslate(
                new GetSenseTranslateRequest($this->senseId, $fingerprint, $page, $pageSize)
            );

            $pool = &$this->fingerprintPools[$fingerprint];
            foreach ($response->translations as $record) {
                if ($record->isCustom) {
                    $pool[$record->text] = $record->translate;
                }
            }

            while (($response->page * $response->pageSize) < $response->total) {
                $page++;
                $response = $this->client->getSenseTranslate(
                    new GetSenseTranslateRequest($this->senseId, $fingerprint, $page, $pageSize)
                );
                foreach ($response->translations as $record) {
                    if ($record->isCustom) {
                        $pool[$record->text] = $record->translate;
                    }
                }
            }
        }

        $this->currentFingerprint = $fingerprint;
        return true;
    }

    /**
     * ClearCurrentFingerprint clears the current fingerprint to free memory
     */
    public function clearCurrentFingerprint(): void
    {
        $this->currentFingerprint = null;
    }

    /**
     * Lookup finds translation following priority rules
     */
    public function lookup(string $text): TranslationLookupResult
    {
        // Check current fingerprint first
        if ($this->currentFingerprint !== null) {
            if (isset($this->fingerprintPools[$this->currentFingerprint][$text])) {
                $translation = $this->fingerprintPools[$this->currentFingerprint][$text];
                return new TranslationLookupResult(true, $translation, 'special');
            }
        }

        // Check common pool
        if (isset($this->commonPool[$text])) {
            $translation = $this->commonPool[$text];
            return new TranslationLookupResult(true, $translation, 'common');
        }

        // Not found
        return new TranslationLookupResult(false);
    }

    /**
     * AddSpecialTranslation adds a special translation to the current fingerprint
     */
    public function addSpecialTranslation(string $text, string $translation): bool
    {
        if ($this->currentFingerprint === null) {
            return false;
        }
        if (!isset($this->fingerprintPools[$this->currentFingerprint])) {
            return false;
        }
        $this->fingerprintPools[$this->currentFingerprint][$text] = $translation;
        return true;
    }

    /**
     * RequestTranslation requests translation from backend, automatically adds to common pool
     * @throws GuzzleException
     */
    public function requestTranslation(string $text, string $fromLang, string $toLang): LLMTranslateResponse
    {
        $request = new LLMTranslateRequest($text, $toLang, $fromLang, null, $this->senseId);
        $response = $this->client->llmTranslate($request);

        if (!empty($response->translatedText)) {
            $this->commonPool[$text] = $response->translatedText;
        }

        return $response;
    }

    /**
     * GetAllCommon returns all common translations
     * @return array<array{text: string, translation: string}>
     */
    public function getAllCommon(): array
    {
        $result = [];
        foreach ($this->commonPool as $text => $translation) {
            $result[] = ['text' => $text, 'translation' => $translation];
        }
        return $result;
    }

    /**
     * GetAllCurrentSpecial returns all special translations for current fingerprint
     * @return array<array{text: string, translation: string}>|null
     */
    public function getAllCurrentSpecial(): ?array
    {
        if ($this->currentFingerprint === null) {
            return null;
        }
        if (!isset($this->fingerprintPools[$this->currentFingerprint])) {
            return null;
        }
        $result = [];
        foreach ($this->fingerprintPools[$this->currentFingerprint] as $text => $translation) {
            $result[] = ['text' => $text, 'translation' => $translation];
        }
        return $result;
    }

    /**
     * ClearAll clears all cached data
     */
    public function clearAll(): void
    {
        $this->commonPool = [];
        $this->fingerprintPools = [];
        $this->currentFingerprint = null;
    }
}

/**
 * Client is the HTTP client for TranslationService
 */
class Client
{
    /** @var string */
    private $baseUrl;
    /** @var string */
    private $token = '';
    /** @var int */
    private $timeout = 30;
    /** @var ClientInterface */
    private $httpClient;

    /**
     * @param string|null $baseUrl
     * @param ClientInterface|null $httpClient
     */
    public function __construct(?string $baseUrl = null, ?ClientInterface $httpClient = null)
    {
        $this->baseUrl = $baseUrl ?? LAKER_TRANSLATION_DEFAULT_BASE_URL;
        // Ensure no trailing slash
        if (substr($this->baseUrl, -1) === '/') {
            $this->baseUrl = substr($this->baseUrl, 0, -1);
        }
    
        if ($httpClient !== null) {
            $this->httpClient = $httpClient;
        } else {
            $this->httpClient = new GuzzleClient([
                'timeout' => $this->timeout,
            ]);
        }
    }
    
    /**
     * SetToken sets or updates the JWT authentication token
     */
    public function setToken(string $token): void
    {
        $this->token = $token;
    }
    
    /**
     * SetTimeout sets the request timeout in seconds
     */
    public function setTimeout(int $timeout): void
    {
        $this->timeout = $timeout;
    }
    
    /**
     * getSenseTranslate makes a unary request to get sense translations
     * @throws GuzzleException
     */
    public function getSenseTranslate(GetSenseTranslateRequest $request): GetSenseTranslateResponse
    {
        $url = sprintf('%s/TranslationService/GetSenseTranslate', $this->baseUrl);
        $response = $this->doRequest($url, $request->toArray());
        return new GetSenseTranslateResponse($response);
    }
    
    /**
     * llmTranslate makes a unary request for LLM translation
     * @throws GuzzleException
     */
    public function llmTranslate(LLMTranslateRequest $request): LLMTranslateResponse
    {
        $url = sprintf('%s/TranslationService/LLMTranslate', $this->baseUrl);
        $response = $this->doRequest($url, $request->toArray());
        return new LLMTranslateResponse($response);
    }
    
    /**
     * @param string $url
     * @param array $body
     * @return array
     * @throws GuzzleException
     */
    private function doRequest(string $url, array $body): array
    {
        $headers = [
            'Content-Type' => 'application/grpc-web+json',
            'X-Grpc-Web' => '1',
        ];
    
        if (!empty($this->token)) {
            $headers['Authorization'] = sprintf('Bearer %s', $this->token);
        }
    
        $response = $this->httpClient->post($url, [
            'json' => $body,
            'headers' => $headers,
            'timeout' => $this->timeout,
        ]);
    
        $content = $response->getBody()->getContents();
        $data = json_decode($content, true);
        return is_array($data) ? $data : [];
    }
    }
