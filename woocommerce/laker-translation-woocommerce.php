<?php
/**
 * Plugin Name: Laker Translation for WooCommerce
 * Plugin URI: https://api.laker.dev/
 * Description: Integrates Laker Translation Service specifically for WooCommerce product translation
 * Version: 1.0.0
 * Author: alaikis
 * Author URI: https://api.laker.dev/
 * License: MIT
 * Text Domain: laker-translation-woocommerce
 * Requires Plugins: woocommerce
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Check if WooCommerce is active
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
    return;
}

// Include WordPress base integration if not already loaded
if (!class_exists('Laker_Translation', false)) {
    if (file_exists(__DIR__ . '/../../wordpress/laker-translation.php')) {
        require_once __DIR__ . '/../../wordpress/laker-translation.php';
    } else {
        require_once __DIR__ . '/../php/TranslationClient.php';
    }
}

use Laker\Translation\Client;
use Laker\Translation\TranslationPool;

/**
 * Class Laker_Translation_WooCommerce
 */
class Laker_Translation_WooCommerce
{
    /**
     * Singleton instance
     * @var Laker_Translation_WooCommerce|null
     */
    private static $instance = null;

    /**
     * @var Client|null
     */
    private $client = null;

    /**
     * @var TranslationPool|null
     */
    private $productPool = null;

    /**
     * Plugin options
     * @var array
     */
    private $options = [];

    /**
     * Get singleton instance
     * @return Laker_Translation_WooCommerce
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
        $this->options = get_option('laker_translation_woocommerce_options', [
            'enabled' => false,
            'sense_id' => 'woocommerce-products',
            'auto_translate_products' => false,
        ]);

        // Get base client from WordPress integration if available
        if (class_exists('Laker_Translation', false)) {
            $wp = Laker_Translation::instance();
            $this->client = $wp->get_client();
        } else {
            $this->initClient();
        }

        // Add hooks for product translation
        add_action('init', [$this, 'initHooks']);
        add_action('admin_menu', [$this, 'addAdminMenu']);
        add_action('admin_init', [$this, 'registerSettings']);
    }

    /**
     * Initialize client if standalone
     */
    private function initClient()
    {
        $baseUrl = get_option('laker_translation_base_url', LAKER_TRANSLATION_DEFAULT_BASE_URL);
        $token = get_option('laker_translation_token', '');
        $enabled = $this->options['enabled'] ?? false;

        if (!$enabled || empty($baseUrl)) {
            return;
        }

        $this->client = new Client($baseUrl);
        if (!empty($token)) {
            $this->client->setToken($token);
        }
    }

    /**
     * Initialize hooks
     */
    public function initHooks()
    {
        if (!$this->options['enabled'] || $this->client === null) {
            return;
        }

        $senseId = $this->options['sense_id'] ?? 'woocommerce-products';
        $this->productPool = new TranslationPool($this->client, $senseId);

        // Initialize in frontend
        if (!is_admin()) {
            add_action('wp', [$this, 'initializePool']);
        }

        // Translate product title
        add_filter('the_title', [$this, 'translateProductTitle'], 10, 2);
        // Translate product description
        add_filter('get_the_excerpt', [$this, 'translateProductExcerpt'], 10, 2);
        // Translate product content
        add_filter('the_content', [$this, 'translateProductContent'], 10);
        // Translate attribute terms
        add_filter('woocommerce_attribute_label', [$this, 'translateAttributeLabel'], 10, 2);
        // Translate category names
        add_filter('woocommerce_product_category_name', [$this, 'translateTermName'], 10);
        // Translate tag names
        add_filter('woocommerce_product_tag_name', [$this, 'translateTermName'], 10);
        // Translate cart item names
        add_filter('woocommerce_cart_item_name', [$this, 'translateCartItemName'], 10, 3);
    }

    /**
     * Initialize the translation pool
     */
    public function initializePool()
    {
        if ($this->productPool === null || $this->client === null) {
            return;
        }

        // Only initialize if auto-translate is enabled
        if (!empty($this->options['auto_translate_products'])) {
            try {
                $this->productPool->initialize();
            } catch (\GuzzleHttp\Exception\GuzzleException $e) {
                error_log('Laker Translation WooCommerce: ' . $e->getMessage());
            }
        }
    }

    /**
     * Add admin menu
     */
    public function addAdminMenu()
    {
        add_submenu_page(
            'woocommerce',
            __('Laker Translation Settings', 'laker-translation-woocommerce'),
            __('Laker Translation', 'laker-translation-woocommerce'),
            'manage_options',
            'laker-translation-woocommerce',
            [$this, 'renderSettingsPage']
        );
    }

    /**
     * Register settings
     */
    public function registerSettings()
    {
        register_setting('laker_translation_woocommerce_options', 'laker_translation_woocommerce_options');
    }

    /**
     * Render settings page
     */
    public function renderSettingsPage()
    {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'laker-translation-woocommerce'));
        }
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('Laker Translation for WooCommerce Settings', 'laker-translation-woocommerce'); ?></h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('laker_translation_woocommerce_options');
                do_settings_sections('laker_translation_woocommerce_options');
                ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row"><?php esc_html_e('Enable WooCommerce Translation', 'laker-translation-woocommerce'); ?></th>
                        <td>
                            <input type="checkbox" name="laker_translation_woocommerce_options[enabled]" value="1" <?php checked($this->options['enabled'] ?? false, 1); ?> />
                            <p class="description"><?php esc_html_e('Check to enable automatic product translation', 'laker-translation-woocommerce'); ?></p>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row"><?php esc_html_e('Sense ID', 'laker-translation-woocommerce'); ?></th>
                        <td>
                            <input type="text" name="laker_translation_woocommerce_options[sense_id]" value="<?php echo esc_attr($this->options['sense_id'] ?? 'woocommerce-products'); ?>" class="regular-text" />
                            <p class="description"><?php esc_html_e('Unique sense identifier for your WooCommerce products', 'laker-translation-woocommerce'); ?></p>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row"><?php esc_html_e('Pre-initialize All Products', 'laker-translation-woocommerce'); ?></th>
                        <td>
                            <input type="checkbox" name="laker_translation_woocommerce_options[auto_translate_products]" value="1" <?php checked($this->options['auto_translate_products'] ?? false, 1); ?> />
                            <p class="description"><?php esc_html_e('Load all product translations on initialization. This can increase memory usage but improves performance.', 'laker-translation-woocommerce'); ?></p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    /**
     * Get current language
     */
    private function getCurrentLang(): string
    {
        $locale = get_locale();
        return strtolower(substr($locale, 0, 2));
    }

    /**
     * Translate product title
     */
    public function translateProductTitle(string $title, int $postId): string
    {
        if (!is_product($postId) || $this->productPool === null) {
            return $title;
        }

        $currentLang = $this->getCurrentLang();
        if ($currentLang === 'en') {
            return $title;
        }

        return $this->translateText($title, 'en', $currentLang);
    }

    /**
     * Translate product excerpt
     */
    public function translateProductExcerpt(string $excerpt, WP_Post $post): string
    {
        if (!is_product() || $this->productPool === null || empty(trim($excerpt))) {
            return $excerpt;
        }

        $currentLang = $this->getCurrentLang();
        if ($currentLang === 'en') {
            return $excerpt;
        }

        // Translate short excerpts as a whole
        if (strlen($excerpt) < 200) {
            return $this->translateText($excerpt, 'en', $currentLang);
        }

        // For longer excerpts, we leave it as is since it's better to translate paragraph by paragraph
        return $excerpt;
    }

    /**
     * Translate product content
     */
    public function translateProductContent(string $content): string
    {
        if (!is_product() || $this->productPool === null || empty(trim($content))) {
            return $content;
        }

        $currentLang = $this->getCurrentLang();
        if ($currentLang === 'en') {
            return $content;
        }

        // Split into paragraphs and translate each
        $paragraphs = explode("</p>", $content);
        foreach ($paragraphs as &$paragraph) {
            $clean = trim(strip_tags($paragraph));
            if (strlen($clean) > 3 && strlen($clean) < 500) {
                $translated = $this->translateText($clean, 'en', $currentLang);
                // Replace the text inside the paragraph
                $paragraph = str_replace($clean, $translated, $paragraph);
            }
        }

        return implode("</p>", $paragraphs);
    }

    /**
     * Translate attribute label
     */
    public function translateAttributeLabel(string $label, int $id): string
    {
        if ($this->productPool === null || empty($label)) {
            return $label;
        }

        $currentLang = $this->getCurrentLang();
        if ($currentLang === 'en') {
            return $label;
        }

        return $this->translateText($label, 'en', $currentLang);
    }

    /**
     * Translate term name
     */
    public function translateTermName(string $name): string
    {
        if ($this->productPool === null || empty($name)) {
            return $name;
        }

        $currentLang = $this->getCurrentLang();
        if ($currentLang === 'en') {
            return $name;
        }

        return $this->translateText($name, 'en', $currentLang);
    }

    /**
     * Translate cart item name
     */
    public function translateCartItemName(string $name, array $cartItem, string $key): string
    {
        if ($this->productPool === null || empty($name)) {
            return $name;
        }

        $currentLang = $this->getCurrentLang();
        if ($currentLang === 'en') {
            return $name;
        }

        return $this->translateText($name, 'en', $currentLang);
    }

    /**
     * Translate a single text
     */
    private function translateText(string $text, string $fromLang, string $toLang): string
    {
        if ($this->productPool === null) {
            return $text;
        }

        try {
            $result = $this->productPool->lookup($text);
            if ($result->found) {
                return $result->translation;
            }

            $response = $this->productPool->requestTranslation($text, $fromLang, $toLang);
            if (!empty($response->translatedText)) {
                return $response->translatedText;
            }
        } catch (\GuzzleHttp\Exception\GuzzleException $e) {
            error_log('Laker Translation error: ' . $e->getMessage());
        }

        return $text;
    }

    /**
     * Bulk translate products
     * Can be called via WP CLI or admin action
     */
    public function bulkTranslateProducts(array $productIds = null): array
    {
        $results = [
            'total' => 0,
            'translated' => 0,
            'errors' => [],
        ];

        if ($this->productPool === null || $this->client === null) {
            $results['errors'][] = 'Client not initialized';
            return $results;
        }

        if (empty($productIds)) {
            $productIds = get_posts([
                'post_type' => 'product',
                'posts_per_page' => -1,
                'fields' => 'ids',
                'post_status' => 'publish',
            ]);
        }

        $results['total'] = count($productIds);
        $currentLang = $this->getCurrentLang();

        foreach ($productIds as $productId) {
            $product = wc_get_product($productId);
            if (!$product) {
                continue;
            }

            try {
                // Translate name
                $name = $product->get_name();
                if (!empty($name) && strlen($name) < 200) {
                    $result = $this->productPool->lookup($name);
                    if (!$result->found) {
                        $this->productPool->requestTranslation($name, 'en', $currentLang);
                        $results['translated']++;
                    }
                }

                // Translate short description
                $shortDesc = $product->get_short_description();
                if (!empty($shortDesc) && strlen($shortDesc) < 500) {
                    $result = $this->productPool->lookup($shortDesc);
                    if (!$result->found) {
                        $this->productPool->requestTranslation($shortDesc, 'en', $currentLang);
                        $results['translated']++;
                    }
                }
            } catch (\GuzzleHttp\Exception\GuzzleException $e) {
                $results['errors'][$productId] = $e->getMessage();
            }
        }

        return $results;
    }
}

// WP CLI command for bulk translation
if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('laker-translation bulk-translate-products', function($args, $assocArgs) {
        $instance = Laker_Translation_WooCommerce::instance();
        $productIds = !empty($args) ? array_map('intval', $args) : null;
        $results = $instance->bulkTranslateProducts($productIds);

        WP_CLI::success(sprintf(
            'Completed: Total %d products, %d translations added. Errors: %d',
            $results['total'],
            $results['translated'],
            count($results['errors'])
        ));

        if (!empty($results['errors'])) {
            foreach ($results['errors'] as $productId => $error) {
                WP_CLI::warning(sprintf('Product %d: %s', $productId, $error));
            }
        }
    });
}

// Initialize
add_action('plugins_loaded', function() {
    Laker_Translation_WooCommerce::instance();
});

// Activation hook
register_activation_hook(__FILE__, function() {
    // Default options
    $default_options = [
        'enabled' => false,
        'sense_id' => 'woocommerce-products',
        'auto_translate_products' => false,
    ];
    add_option('laker_translation_woocommerce_options', $default_options);
});