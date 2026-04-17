<?php
/**
 * Plugin Name: Laker Translation Service
 * Plugin URI: https://api.laker.dev/
 * Description: Integrates Laker Translation Service for automatic content translation in WordPress
 * Version: 1.0.0
 * Author: alaikis
 * Author URI: https://api.laker.dev/
 * License: MIT
 * Text Domain: laker-translation
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Require composer autoloader if exists
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
} else {
    // Include the client directly if composer not used
    require_once __DIR__ . '/../php/TranslationClient.php';
}

use Laker\Translation\Client;
use Laker\Translation\TranslationPool;

/**
 * Class Laker_Translation
 */
class Laker_Translation
{
    /**
     * Singleton instance
     * @var Laker_Translation|null
     */
    private static $instance = null;

    /**
     * @var Client|null
     */
    private $client = null;

    /**
     * @var TranslationPool[]
     */
    private $pools = [];

    /**
     * Plugin options
     * @var array
     */
    private $options = [];

    /**
     * Get singleton instance
     * @return Laker_Translation
     */
    public static function instance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct()
    {
        $this->options = get_option('laker_translation_options', [
            'base_url' => LAKER_TRANSLATION_DEFAULT_BASE_URL,
            'token' => '',
            'enabled' => false,
        ]);

        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_filter('gettext', [$this, 'translate_text'], 10, 2);
        add_filter('gettext_with_context', [$this, 'translate_text_with_context'], 10, 4);

        // Initialize client if configured
        $this->init_client();
    }

    /**
     * Initialize the API client
     */
    private function init_client()
    {
        if (empty($this->options['enabled']) || empty($this->options['base_url'])) {
            return;
        }

        $this->client = new Client($this->options['base_url']);
        if (!empty($this->options['token'])) {
            $this->client->setToken($this->options['token']);
        }
    }

    /**
     * Get the client instance
     * @return Client|null
     */
    public function get_client()
    {
        return $this->client;
    }

    /**
     * Get or create a translation pool for a specific sense
     * @param string $senseId
     * @return TranslationPool|null
     */
    public function get_pool(string $senseId)
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
     * Add admin menu
     */
    public function add_admin_menu()
    {
        add_options_page(
            __('Laker Translation Settings', 'laker-translation'),
            __('Laker Translation', 'laker-translation'),
            'manage_options',
            'laker-translation',
            [$this, 'render_settings_page']
        );
    }

    /**
     * Register settings
     */
    public function register_settings()
    {
        register_setting('laker_translation_options', 'laker_translation_options');
    }

    /**
     * Render settings page
     */
    public function render_settings_page()
    {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'laker-translation'));
        }
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('Laker Translation Settings', 'laker-translation'); ?></h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('laker_translation_options');
                do_settings_sections('laker_translation_options');
                ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row"><?php esc_html_e('Enable Translation', 'laker-translation'); ?></th>
                        <td>
                            <input type="checkbox" name="laker_translation_options[enabled]" value="1" <?php checked($this->options['enabled'] ?? false, 1); ?> />
                            <p class="description"><?php esc_html_e('Check to enable automatic translation', 'laker-translation'); ?></p>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row"><?php esc_html_e('API Base URL', 'laker-translation'); ?></th>
                        <td>
                            <input type="url" name="laker_translation_options[base_url]" value="<?php echo esc_attr($this->options['base_url'] ?? LAKER_TRANSLATION_DEFAULT_BASE_URL); ?>" class="regular-text" />
                            <p class="description"><?php esc_html_e('Base URL for your Laker Translation API endpoint', 'laker-translation'); ?></p>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row"><?php esc_html_e('Authentication Token', 'laker-translation'); ?></th>
                        <td>
                            <input type="password" name="laker_translation_options[token]" value="<?php echo esc_attr($this->options['token'] ?? ''); ?>" class="regular-text" />
                            <p class="description"><?php esc_html_e('JWT token for authentication (if required)', 'laker-translation'); ?></p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    /**
     * Translate text through gettext filter
     * @param string $translation
     * @param string $text
     * @return string
     */
    public function translate_text($translation, $text)
    {
        if ($this->client === null || empty($this->options['enabled'])) {
            return $translation;
        }

        // If translation already exists (not the original English), return it
        if ($translation !== $text) {
            return $translation;
        }

        // Get current locale
        $locale = get_locale();
        // Convert WordPress locale format to our format (zh_CN -> zh)
        $langCode = strtolower(substr($locale, 0, 2));

        // Only translate if target is different from source (assuming source is en)
        if ($langCode === 'en') {
            return $translation;
        }

        try {
            // For WordPress, we use a default senseId for core strings
            $senseId = apply_filters('laker_translation_sense_id', 'wordpress-core', $text);
            $pool = $this->get_pool($senseId);

            if ($pool === null) {
                return $translation;
            }

            $result = $pool->lookup($text);
            if ($result->found) {
                return $result->translation;
            }

            // Request translation on-demand
            $response = $pool->requestTranslation($text, 'en', $langCode);
            if (!empty($response->translatedText)) {
                return $response->translatedText;
            }
        } catch (\GuzzleHttp\Exception\GuzzleException $e) {
            error_log('Laker Translation error: ' . $e->getMessage());
        }

        return $translation;
    }

    /**
     * Translate text with context
     * @param string $translation
     * @param string $text
     * @param string $context
     * @param string $domain
     * @return string
     */
    public function translate_text_with_context($translation, $text, $context, $domain)
    {
        // We treat context as part of the lookup key for better accuracy
        if ($this->client === null || empty($this->options['enabled'])) {
            return $translation;
        }

        if ($translation !== $text) {
            return $translation;
        }

        $locale = get_locale();
        $langCode = strtolower(substr($locale, 0, 2));

        if ($langCode === 'en') {
            return $translation;
        }

        try {
            $senseId = apply_filters('laker_translation_sense_id', 'wordpress-' . $domain, $text);
            $pool = $this->get_pool($senseId);

            if ($pool === null) {
                return $translation;
            }

            // Include context in lookup key
            $lookupKey = $context . "\004" . $text;
            $result = $pool->lookup($lookupKey);
            if ($result->found) {
                return $result->translation;
            }

            $response = $pool->requestTranslation($lookupKey, 'en', $langCode);
            if (!empty($response->translatedText)) {
                return $response->translatedText;
            }
        } catch (\GuzzleHttp\Exception\GuzzleException $e) {
            error_log('Laker Translation error: ' . $e->getMessage());
        }

        return $translation;
    }

    /**
     * Initialize pool for a specific post type / sense
     * @param string $senseId
     * @return bool
     */
    public function initialize_pool(string $senseId): bool
    {
        if ($this->client === null) {
            return false;
        }

        $pool = $this->get_pool($senseId);
        if ($pool === null) {
            return false;
        }

        try {
            $pool->initialize();
            return true;
        } catch (\GuzzleHttp\Exception\GuzzleException $e) {
            error_log('Laker Translation initialization error: ' . $e->getMessage());
            return false;
        }
    }
}

// Initialize the plugin
add_action('plugins_loaded', function () {
    Laker_Translation::instance();
});

// Activation hook
register_activation_hook(__FILE__, function () {
    // Default options
    $default_options = [
        'base_url' => LAKER_TRANSLATION_DEFAULT_BASE_URL,
        'token' => '',
        'enabled' => false,
    ];
    add_option('laker_translation_options', $default_options);
});

// Deactivation hook
register_deactivation_hook(__FILE__, function () {
    // Cleanup if needed
});
