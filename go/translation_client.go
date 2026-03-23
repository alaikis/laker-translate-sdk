/**
 * Laker Translation Service Go Client SDK
 *
 * Auto-generated for api.laker.dev Translation Service
 * Service: TranslationService
 * Source: proto/translation.proto
 */

package translation

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// DefaultBaseURL is the default API endpoint
const DefaultBaseURL = "https://api.hottol.com/laker/"

// TranslateRecord represents a single translation record
type TranslateRecord struct {
	ID        string `json:"id"`
	Text      string `json:"text"`
	Translate string `json:"translate"`
	IsCustom  bool   `json:"isCustom"`
}

// GetSenseTranslateRequest represents a request to get translations for a sense
type GetSenseTranslateRequest struct {
	SenseID     string  `json:"senseId"`
	Fingerprint *string `json:"fingerprint,omitempty"`
	Page        int32   `json:"page,omitempty"`
	PageSize    int32   `json:"pageSize,omitempty"`
}

// GetSenseTranslateResponse represents the response for a sense translation query
type GetSenseTranslateResponse struct {
	SenseID      string            `json:"senseId"`
	Total        int64             `json:"total"`
	Page         int32             `json:"page"`
	PageSize     int32             `json:"pageSize"`
	Translations []TranslateRecord `json:"translations"`
}

// TranslateStreamRequest represents a streaming translation request
type TranslateStreamRequest struct {
	SenseID     string  `json:"senseId"`
	Fingerprint *string `json:"fingerprint,omitempty"`
	BatchSize   *int32  `json:"batchSize,omitempty"`
}

// TranslateStreamResponse represents a streaming translation response batch
type TranslateStreamResponse struct {
	Batch        int32             `json:"batch"`
	HasMore      bool              `json:"hasMore"`
	Total        int64             `json:"total"`
	Translations []TranslateRecord `json:"translations"`
}

// LLMTranslateRequest represents a large language model translation request
type LLMTranslateRequest struct {
	Text     string  `json:"text"`
	FromLang *string `json:"fromLang,omitempty"`
	ToLang   string  `json:"toLang"`
	Provider *string `json:"provider,omitempty"`
	SenseID  *string `json:"senseId,omitempty"`
}

// LLMTranslateResponse represents a large language model translation response
type LLMTranslateResponse struct {
	OriginalText   string  `json:"originalText"`
	TranslatedText string  `json:"translatedText"`
	Provider       string  `json:"provider"`
	Timestamp      int64   `json:"timestamp"`
	Finished       bool    `json:"finished"`
	Cached         bool    `json:"cached"`
	FromLang       *string `json:"fromLang,omitempty"`
	ToLang         *string `json:"toLang,omitempty"`
}

// TemplateExtractResult represents the result of automatic template extraction
type TemplateExtractResult struct {
	IsTemplated bool     `json:"isTemplated"`
	SrcTemplate string   `json:"srcTemplate"`
	DstTemplate string   `json:"dstTemplate"`
	Variables   []string `json:"variables"`
}

// TranslationLookupResult represents the result of a translation lookup in TranslationPool
type TranslationLookupResult struct {
	Found       bool    `json:"found"`
	Translation string  `json:"translation"`
	Source      *string `json:"source"` // "special" or "common" or null
}

// TranslationPool implements two-level translation cache with priority lookup
//
// Architecture:
//   - commonPool: stores general/common translations (automatic from backend)
//   - fingerprintPools: stores special translations for specific fingerprint (requires manual input)
//
// Lookup Priority:
//  1. Current fingerprint special translations
//  2. Common translations
//  3. If not found, request from backend
//
// Rules:
//   - All new translations from backend are automatically added to commonPool
//   - Special translations must be added manually
type TranslationPool struct {
	client             *Client
	senseID            string
	commonPool         map[string]string
	fingerprintPools   map[string]map[string]string
	currentFingerprint *string
}

// NewTranslationPool creates a new TranslationPool for a specific sense
func NewTranslationPool(client *Client, senseID string) *TranslationPool {
	return &TranslationPool{
		client:           client,
		senseID:          senseID,
		commonPool:       make(map[string]string),
		fingerprintPools: make(map[string]map[string]string),
	}
}

// Initialize loads all common translations from backend into the pool
func (p *TranslationPool) Initialize(ctx context.Context) error {
	page := int32(1)
	pageSize := int32(5000)

	resp, err := p.client.GetSenseTranslate(ctx, &GetSenseTranslateRequest{
		SenseID:  p.senseID,
		Page:     &page,
		PageSize: &pageSize,
	})
	if err != nil {
		return err
	}

	// Add all common translations
	for _, record := range resp.Translations {
		if record.IsCustom {
			p.commonPool[record.Text] = record.Translate
		}
	}

	// Load more pages if needed
	for int64(resp.Page*resp.PageSize) < resp.Total {
		page++
		resp, err := p.client.GetSenseTranslate(ctx, &GetSenseTranslateRequest{
			SenseID:  p.senseID,
			Page:     &page,
			PageSize: &pageSize,
		})
		if err != nil {
			return err
		}
		for _, record := range resp.Translations {
			if record.IsCustom {
				p.commonPool[record.Text] = record.Translate
			}
		}
	}

	return nil
}

// SwitchFingerprint switches to a different fingerprint and loads its special translations
func (p *TranslationPool) SwitchFingerprint(ctx context.Context, fingerprint string) error {
	// Clear current
	p.currentFingerprint = nil

	// Check if already cached
	if _, ok := p.fingerprintPools[fingerprint]; !ok {
		p.fingerprintPools[fingerprint] = make(map[string]string)

		page := int32(1)
		pageSize := int32(1000)

		resp, err := p.client.GetSenseTranslate(ctx, &GetSenseTranslateRequest{
			SenseID:     p.senseID,
			Fingerprint: &fingerprint,
			Page:        &page,
			PageSize:    &pageSize,
		})
		if err != nil {
			return err
		}

		pool := p.fingerprintPools[fingerprint]
		for _, record := range resp.Translations {
			if record.IsCustom {
				pool[record.Text] = record.Translate
			}
		}

		// Load more pages if needed
		for int64(resp.Page*resp.PageSize) < resp.Total {
			page++
			resp, err := p.client.GetSenseTranslate(ctx, &GetSenseTranslateRequest{
				SenseID:     p.senseID,
				Fingerprint: &fingerprint,
				Page:        &page,
				PageSize:    &pageSize,
			})
			if err != nil {
				return err
			}
			for _, record := range resp.Translations {
				if record.IsCustom {
					pool[record.Text] = record.Translate
				}
			}
		}
	}

	fp := fingerprint
	p.currentFingerprint = &fp
	return nil
}

// ClearCurrentFingerprint clears the current fingerprint to free memory
func (p *TranslationPool) ClearCurrentFingerprint() {
	p.currentFingerprint = nil
}

// Lookup finds translation following priority rules
func (p *TranslationPool) Lookup(text string) TranslationLookupResult {
	// Check current fingerprint first
	if p.currentFingerprint != nil {
		if pool, ok := p.fingerprintPools[*p.currentFingerprint]; ok {
			if translation, ok := pool[text]; ok {
				source := "special"
				return TranslationLookupResult{
					Found:       true,
					Translation: translation,
					Source:      &source,
				}
			}
		}
	}

	// Check common pool
	if translation, ok := p.commonPool[text]; ok {
		source := "common"
		return TranslationLookupResult{
			Found:       true,
			Translation: translation,
			Source:      &source,
		}
	}

	// Not found
	return TranslationLookupResult{
		Found:       false,
		Translation: "",
		Source:      nil,
	}
}

// AddSpecialTranslation adds a special translation to the current fingerprint
func (p *TranslationPool) AddSpecialTranslation(text string, translation string) bool {
	if p.currentFingerprint == nil {
		return false
	}

	pool, ok := p.fingerprintPools[*p.currentFingerprint]
	if !ok {
		return false
	}

	pool[text] = translation
	return true
}

// RequestTranslation requests translation from backend, automatically adds to common pool
func (p *TranslationPool) RequestTranslation(
	ctx context.Context,
	text string,
	fromLang string,
	toLang string,
) (*LLMTranslateResponse, error) {
	resp, err := p.client.LLMTranslate(ctx, &LLMTranslateRequest{
		Text:     text,
		FromLang: &fromLang,
		ToLang:   toLang,
		SenseID:  &p.senseID,
	})
	if err != nil {
		return nil, err
	}

	if resp.TranslatedText != "" {
		p.commonPool[text] = resp.TranslatedText
	}

	return resp, nil
}

// GetAllCommon returns all common translations
func (p *TranslationPool) GetAllCommon() []struct{ Text, Translation string } {
	result := make([]struct{ Text, Translation string }, 0, len(p.commonPool))
	for text, translation := range p.commonPool {
		result = append(result, struct{ Text, Translation string }{text, translation})
	}
	return result
}

// GetAllCurrentSpecial returns all special translations for current fingerprint
func (p *TranslationPool) GetAllCurrentSpecial() []struct{ Text, Translation string } {
	if p.currentFingerprint == nil {
		return nil
	}
	pool, ok := p.fingerprintPools[*p.currentFingerprint]
	if !ok {
		return nil
	}
	result := make([]struct{ Text, Translation string }, 0, len(pool))
	for text, translation := range pool {
		result = append(result, struct{ Text, Translation string }{text, translation})
	}
	return result
}

// ClearAll clears all cached data
func (p *TranslationPool) ClearAll() {
	for k := range p.commonPool {
		delete(p.commonPool, k)
	}
	for k := range p.fingerprintPools {
		delete(p.fingerprintPools, k)
	}
	p.currentFingerprint = nil
}

// Client is the gRPC-Web compatible client for TranslationService
type Client struct {
	baseURL string
	token   string
	timeout time.Duration
}

// NewClient creates a new TranslationClient with default endpoint
func NewClient() *Client {
	return NewClientWithBaseURL(DefaultBaseURL)
}

// NewClientWithBaseURL creates a new TranslationClient with custom base URL
func NewClientWithBaseURL(baseURL string) *Client {
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}
	if baseURL[len(baseURL)-1] == '/' {
		baseURL = baseURL[:len(baseURL)-1]
	}
	return &Client{
		baseURL: baseURL,
		timeout: 30 * time.Second,
	}
}

// SetToken sets or updates the JWT authentication token
func (c *Client) SetToken(token string) {
	c.token = token
}

// SetTimeout sets the request timeout
func (c *Client) SetTimeout(timeout time.Duration) {
	c.timeout = timeout
}

// GetSenseTranslate makes a unary request to get sense translations
func (c *Client) GetSenseTranslate(ctx context.Context, req *GetSenseTranslateRequest) (*GetSenseTranslateResponse, error) {
	url := fmt.Sprintf("%s/TranslationService/GetSenseTranslate", c.baseURL)

	var resp GetSenseTranslateResponse
	err := c.doRequest(ctx, url, req, &resp)
	if err != nil {
		return nil, err
	}

	return &resp, nil
}

// LLMTranslate makes a unary request for LLM translation
func (c *Client) LLMTranslate(ctx context.Context, req *LLMTranslateRequest) (*LLMTranslateResponse, error) {
	url := fmt.Sprintf("%s/TranslationService/LLMTranslate", c.baseURL)

	var resp LLMTranslateResponse
	err := c.doRequest(ctx, url, req, &resp)
	if err != nil {
		return nil, err
	}

	return &resp, nil
}

// ExtractTemplate automatically extracts template from text containing numeric variables
func ExtractTemplate(text string) TemplateExtractResult {
	// This is a Go implementation, for actual regex matching see the logic
	// In Go, we'd use regexp.FindAllString
	// For brevity, the implementation is omitted in this skeleton
	// Full implementation would match TypeScript version
	return TemplateExtractResult{
		IsTemplated: false,
		SrcTemplate: text,
	}
}

func (c *Client) doRequest(ctx context.Context, url string, body any, result any) error {
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/grpc-web+json")
	req.Header.Set("X-Grpc-Web", "1")
	if c.token != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.token))
	}

	client := &http.Client{
		Timeout: c.timeout,
	}

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	return json.NewDecoder(resp.Body).Decode(result)
}
