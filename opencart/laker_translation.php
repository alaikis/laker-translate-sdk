<?php
/**
 * Laker Translation Service for OpenCart
 *
 * @package  LakerTranslation
 * @author   alaikis
 * @license  MIT
 * @link     https://api.laker.dev/
 */

// If accessed directly, exit
if (!defined('DIR_APPLICATION')) {
    exit;
}

require_once __DIR__ . '/../../php/TranslationClient.php';

use Laker\Translation\Client;
use Laker\Translation\TranslationPool;

class ControllerExtensionTranslationLakerTranslation extends Controller
{
    /**
     * @var Client
     */
    private $client;

    /**
     * @var TranslationPool[]
     */
    private $pools = [];

    /**
     * Constructor
     */
    public function __construct($registry)
    {
        parent::__construct($registry);

        $this->initClient();
    }

    /**
     * Initialize the API client based on settings
     */
    private function initClient()
    {
        $baseUrl = $this->config->get('translation_laker_translation_base_url');
        $token = $this->config->get('translation_laker_translation_token');
        $enabled = $this->config->get('translation_laker_translation_enabled');

        if (!$enabled || empty($baseUrl)) {
            return;
        }

        $this->client = new Client($baseUrl);
        if (!empty($token)) {
            $this->client->setToken($token);
        }
    }

    /**
     * Get client instance
     * @return Client|null
     */
    public function getClient()
    {
        return $this->client;
    }

    /**
     * Get or create a translation pool
     * @param string $senseId
     * @return TranslationPool|null
     */
    public function getPool(string $senseId)
    {
        if ($this->client === null) {
            return null;
        }

        if (!isset($this->pools[$senseId])) {
            $this->pools[$senseId] = new TranslationPool($this->client, $senseId);
        }
        return $this->pools[$senseId];
    }

    /**
     * Translate a string
     * @param string $text
     * @param string $fromLang
     * @param string $toLang
     * @param string $senseId
     * @return string
     */
    public function translate(string $text, string $fromLang = 'en', string $toLang = '', string $senseId = 'opencart-frontend'): string
    {
        if ($this->client === null || empty($text)) {
            return $text;
        }

        // If target language matches source, return original
        if (empty($toLang)) {
            $toLang = $this->config->get('config_language');
            if (empty($toLang)) {
                $toLang = $this->session->data['language'];
            }
            // Extract lang code
            $toLang = strtolower(substr($toLang, 0, 2));
        }

        if ($toLang === $fromLang) {
            return $text;
        }

        try {
            $pool = $this->getPool($senseId);
            if ($pool === null) {
                return $text;
            }

            $result = $pool->lookup($text);
            if ($result->found) {
                return $result->translation;
            }

            $response = $pool->requestTranslation($text, $fromLang, $toLang);
            if (!empty($response->translatedText)) {
                return $response->translatedText;
            }
        } catch (\GuzzleHttp\Exception\GuzzleException $e) {
            $this->log->write('Laker Translation Error: ' . $e->getMessage());
        }

        return $text;
    }

    /**
     * Settings page in admin
     */
    public function index()
    {
        $this->load->language('extension/translation/laker_translation');
        $this->document->setTitle($this->language->get('heading_title'));

        $this->load->model('setting/setting');

        if (($this->request->server['REQUEST_METHOD'] == 'POST') && $this->validate()) {
            $this->model_setting_setting->editSetting('translation_laker_translation', $this->request->post);
            $this->session->data['success'] = $this->language->get('text_success');
            $this->response->redirect($this->url->link('extension/translation', 'token=' . $this->session->data['token'], true));
        }

        $data['error_warning'] = '';
        if (isset($this->error['warning'])) {
            $data['error_warning'] = $this->error['warning'];
        }

        $data['breadcrumbs'] = array();
        $data['breadcrumbs'][] = array(
            'text' => $this->language->get('text_home'),
            'href' => $this->url->link('common/dashboard', 'token=' . $this->session->data['token'], true)
        );
        $data['breadcrumbs'][] = array(
            'text' => $this->language->get('text_extension'),
            'href' => $this->url->link('extension/translation', 'token=' . $this->session->data['token'], true)
        );
        $data['breadcrumbs'][] = array(
            'text' => $this->language->get('heading_title'),
            'href' => $this->url->link('extension/translation/laker_translation', 'token=' . $this->session->data['token'], true)
        );

        $data['action'] = $this->url->link('extension/translation/laker_translation', 'token=' . $this->session->data['token'], true);
        $data['cancel'] = $this->url->link('extension/translation', 'token=' . $this->session->data['token'], true);

        if (isset($this->request->post['translation_laker_translation_enabled'])) {
            $data['translation_laker_translation_enabled'] = $this->request->post['translation_laker_translation_enabled'];
        } else {
            $data['translation_laker_translation_enabled'] = $this->config->get('translation_laker_translation_enabled');
        }

        if (isset($this->request->post['translation_laker_translation_base_url'])) {
            $data['translation_laker_translation_base_url'] = $this->request->post['translation_laker_translation_base_url'];
        } else {
            $data['translation_laker_translation_base_url'] = $this->config->get('translation_laker_translation_base_url') ?: LAKER_TRANSLATION_DEFAULT_BASE_URL;
        }

        if (isset($this->request->post['translation_laker_translation_token'])) {
            $data['translation_laker_translation_token'] = $this->request->post['translation_laker_translation_token'];
        } else {
            $data['translation_laker_translation_token'] = $this->config->get('translation_laker_translation_token');
        }

        $data['header'] = $this->load->controller('common/header');
        $data['column_left'] = $this->load->controller('common/column_left');
        $data['footer'] = $this->load->controller('common/footer');

        $this->response->setOutput($this->load->view('extension/translation/laker_translation', $data));
    }

    /**
     * Validate permissions and settings
     */
    protected function validate()
    {
        if (!$this->user->hasPermission('modify', 'extension/translation/laker_translation')) {
            $this->error['warning'] = $this->language->get('error_permission');
        }

        if (empty($this->request->post['translation_laker_translation_base_url'])) {
            $this->error['warning'] = $this->language->get('error_base_url_required');
        }

        return !$this->error;
    }

    /**
     * Install the extension
     */
    public function install()
    {
        // Default settings
        $this->load->model('setting/setting');
        $this->model_setting_setting->editSetting('translation_laker_translation', [
            'translation_laker_translation_enabled' => 0,
            'translation_laker_translation_base_url' => LAKER_TRANSLATION_DEFAULT_BASE_URL,
            'translation_laker_translation_token' => '',
        ]);
    }

    /**
     * Uninstall the extension
     */
    public function uninstall()
    {
        $this->load->model('setting/setting');
        $this->model_setting_setting->deleteSetting('translation_laker_translation');
    }
}

// Helper function for theme translations
function laker_translate($text, $fromLang = 'en', $toLang = '', $senseId = 'opencart-frontend')
{
    $registry = \Registry::getInstance();
    $controller = $registry->get('controller_extension_translation_laker_translation');

    if ($controller && method_exists($controller, 'translate')) {
        return $controller->translate($text, $fromLang, $toLang, $senseId);
    }

    return $text;
}
