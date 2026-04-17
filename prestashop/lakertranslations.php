<?php
/**
 * Laker Translation Service for PrestaShop
 *
 * @author    alaikis
 * @copyright Copyright (c) 2024
 * @license   MIT
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

require_once __DIR__ . '/../../php/TranslationClient.php';

use Laker\Translation\Client;
use Laker\Translation\TranslationPool;

class LakerTranslations extends Module
{
    /**
     * @var Client|null
     */
    private $client = null;

    /**
     * @var TranslationPool[]
     */
    private $pools = [];

    public function __construct()
    {
        $this->name = 'lakertranslations';
        $this->tab = 'administration';
        $this->version = '1.0.0';
        $this->author = 'alaikis';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = [
            'min' => '1.7',
            'max' => _PS_VERSION_
        ];
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('Laker Translation Service');
        $this->description = $this->l('Automatic AI-powered translation using Laker Translation Service');

        $this->confirmUninstall = $this->l('Are you sure you want to uninstall?');

        $this->initClient();
    }

    /**
     * Initialize API client based on configuration
     */
    private function initClient()
    {
        $baseUrl = Configuration::get('LAKERTRANSLATIONS_BASE_URL');
        $token = Configuration::get('LAKERTRANSLATIONS_TOKEN');
        $enabled = Configuration::get('LAKERTRANSLATIONS_ENABLED');

        if (!$enabled || empty($baseUrl)) {
            return;
        }

        $this->client = new Client($baseUrl);
        if (!empty($token)) {
            $this->client->setToken($token);
        }
    }

    /**
     * Install the module
     */
    public function install()
    {
        return parent::install() &&
            Configuration::updateValue('LAKERTRANSLATIONS_ENABLED', 0) &&
            Configuration::updateValue('LAKERTRANSLATIONS_BASE_URL', LAKER_TRANSLATION_DEFAULT_BASE_URL) &&
            Configuration::updateValue('LAKERTRANSLATIONS_TOKEN', '');
    }

    /**
     * Uninstall the module
     */
    public function uninstall()
    {
        return Configuration::deleteByName('LAKERTRANSLATIONS_ENABLED') &&
            Configuration::deleteByName('LAKERTRANSLATIONS_BASE_URL') &&
            Configuration::deleteByName('LAKERTRANSLATIONS_TOKEN') &&
            parent::uninstall();
    }

    /**
     * Get content for configuration page
     */
    public function getContent()
    {
        $output = '';

        if (Tools::isSubmit('submit' . $this->name)) {
            $enabled = (int)Tools::getValue('LAKERTRANSLATIONS_ENABLED');
            $baseUrl = Tools::getValue('LAKERTRANSLATIONS_BASE_URL');
            $token = Tools::getValue('LAKERTRANSLATIONS_TOKEN');

            Configuration::updateValue('LAKERTRANSLATIONS_ENABLED', $enabled);
            Configuration::updateValue('LAKERTRANSLATIONS_BASE_URL', $baseUrl);
            Configuration::updateValue('LAKERTRANSLATIONS_TOKEN', $token);

            $this->initClient();

            $output .= $this->displayConfirmation($this->l('Settings updated'));
        }

        return $output . $this->displayForm();
    }

    /**
     * Display configuration form
     */
    public function displayForm()
    {
        $fields_form = [
            'form' => [
                'legend' => [
                    'title' => $this->l('Settings'),
                    'icon' => 'icon-cogs',
                ],
                'input' => [
                    [
                        'type' => 'switch',
                        'label' => $this->l('Enable Translation'),
                        'name' => 'LAKERTRANSLATIONS_ENABLED',
                        'is_bool' => true,
                        'values' => [
                            [
                                'id' => 'active_on',
                                'value' => 1,
                                'label' => $this->l('Yes'),
                            ],
                            [
                                'id' => 'active_off',
                                'value' => 0,
                                'label' => $this->l('No'),
                            ],
                        ],
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->l('API Base URL'),
                        'name' => 'LAKERTRANSLATIONS_BASE_URL',
                        'size' => 80,
                        'required' => true,
                        'desc' => $this->l('Base URL for your Laker Translation API endpoint'),
                    ],
                    [
                        'type' => 'password',
                        'label' => $this->l('Authentication Token'),
                        'name' => 'LAKERTRANSLATIONS_TOKEN',
                        'size' => 80,
                        'desc' => $this->l('JWT token for authentication if required'),
                    ],
                ],
                'submit' => [
                    'title' => $this->l('Save'),
                    'class' => 'btn btn-default pull-right',
                ],
            ],
        ];

        $helper = new HelperForm();
        $helper->show_toolbar = false;
        $helper->table = $this->table;
        $helper->module = $this;
        $helper->default_form_language = $this->context->language->id;
        $helper->allow_employee_form_lang = Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG', 0);

        $helper->identifier = $this->identifier;
        $helper->submit_action = 'submit' . $this->name;
        $helper->currentIndex = $this->context->link->getAdminLink('AdminModules', false) .
            '&configure=' . $this->name . '&tab_module=' . $this->tab . '&module_name=' . $this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');

        $helper->fields_value['LAKERTRANSLATIONS_ENABLED'] = Configuration::get('LAKERTRANSLATIONS_ENABLED');
        $helper->fields_value['LAKERTRANSLATIONS_BASE_URL'] = Configuration::get('LAKERTRANSLATIONS_BASE_URL');
        $helper->fields_value['LAKERTRANSLATIONS_TOKEN'] = Configuration::get('LAKERTRANSLATIONS_TOKEN');

        return $helper->generateForm([$fields_form]);
    }

    /**
     * Get or create translation pool
     */
    public function getPool(string $senseId): ?TranslationPool
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
     */
    public function translate(string $text, string $fromLang = 'en', string $toLang = ''): string
    {
        if ($this->client === null || empty($text)) {
            return $text;
        }

        if (empty($toLang)) {
            $toLang = $this->context->language->iso_code;
        }

        $toLang = strtolower(substr($toLang, 0, 2));
        if ($toLang === $fromLang) {
            return $text;
        }

        try {
            $senseId = 'prestashop-' . $this->context->shop->id;
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
            PrestaShopLogger::addLog('Laker Translation Error: ' . $e->getMessage(), 3);
        }

        return $text;
    }
}

// Helper function for theme developers
if (!function_exists('laker_translate')) {
    function laker_translate($text, $fromLang = 'en', $toLang = '')
    {
        $module = Module::getInstanceByName('lakertranslations');
        if ($module && $module->active) {
            return $module->translate($text, $fromLang, $toLang);
        }
        return $text;
    }
}
