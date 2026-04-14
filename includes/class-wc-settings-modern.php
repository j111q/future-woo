<?php
/**
 * Modern (React) renderer for the WooCommerce General Settings tab.
 *
 * When the cdw_modern_settings site option is truthy this class:
 *   1. Injects a React mount-point before the PHP fields are rendered.
 *   2. Removes the default PHP field output so only the React UI is shown.
 *   3. Hides the PHP save button (React renders its own).
 *   4. Enqueues the built JS + CSS bundle.
 *
 * When the option is falsy the class is a no-op and the legacy PHP page
 * renders exactly as before.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CDW_WC_Settings_Modern {

	/** Site-option key for the modern-settings feature flag. */
	const OPTION_KEY = 'cdw_modern_settings';

	/** Tabs we support with modern React UI. */
	private static $supported_tabs = array( 'general', 'products', 'account', 'integration', 'tax', 'site-visibility', 'advanced' );

	public static function init() {
		// Register injection hooks for each supported tab.
		foreach ( self::$supported_tabs as $tab ) {
			add_action( "woocommerce_before_settings_{$tab}", array( __CLASS__, 'maybe_inject_app' ), 1 );
		}
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_assets' ) );
	}

	// -------------------------------------------------------------------------
	// Feature flag helpers
	// -------------------------------------------------------------------------

	public static function is_enabled(): bool {
		return true;
	}

	public static function enable(): void {
		update_option( self::OPTION_KEY, '1', false );
	}

	public static function disable(): void {
		delete_option( self::OPTION_KEY );
	}

	// -------------------------------------------------------------------------
	// Injection
	// -------------------------------------------------------------------------

	/**
	 * Fires at `woocommerce_before_settings_general` (priority 1).
	 *
	 * When modern mode is active:
	 *   - Outputs the React mount point.
	 *   - Uses output buffering to swallow the PHP field table output.
	 *   - Injects a tiny <style> to hide the PHP save button.
	 */
	public static function maybe_inject_app(): void {
		if ( ! self::is_enabled() ) {
			return;
		}

		// Determine which tab we're on from the current action.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$tab = isset( $_GET['tab'] ) ? sanitize_key( $_GET['tab'] ) : 'general';

		if ( ! in_array( $tab, self::$supported_tabs, true ) ) {
			return;
		}

		// Tax: only use modern UI for the options section, not rate tables.
		if ( 'tax' === $tab ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$section = isset( $_GET['section'] ) ? sanitize_key( $_GET['section'] ) : '';
			if ( '' !== $section ) {
				return;
			}
		}

		// Buffer and discard the PHP field table.
		add_action( "woocommerce_settings_{$tab}", array( __CLASS__, 'ob_start' ), 0 );
		add_action( "woocommerce_settings_{$tab}", array( __CLASS__, 'ob_end_clean' ), PHP_INT_MAX );

		// Hide the PHP save button — React renders its own.
		echo '<style>.woocommerce-save-button{display:none!important}</style>';

		// React mount point.
		echo '<div id="wc-settings-modern-' . esc_attr( $tab ) . '"></div>';
	}

	public static function ob_start(): void {
		ob_start();
	}

	public static function ob_end_clean(): void {
		ob_end_clean();
	}

	// -------------------------------------------------------------------------
	// Assets
	// -------------------------------------------------------------------------

	/**
	 * Enqueues the React bundle only on WC Settings > General.
	 */
	public static function enqueue_assets( string $hook ): void {
		if ( ! self::is_enabled() ) {
			return;
		}

		if ( 'woocommerce_page_wc-settings' !== $hook ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$tab = isset( $_GET['tab'] ) ? sanitize_key( $_GET['tab'] ) : 'general';
		if ( ! in_array( $tab, self::$supported_tabs, true ) ) {
			return;
		}

		// Tax: only use modern UI for the options section.
		if ( 'tax' === $tab ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$section = isset( $_GET['section'] ) ? sanitize_key( $_GET['section'] ) : '';
			if ( '' !== $section ) {
				return;
			}
		}

		$js_path    = WAR_PATH . 'assets/js/settings/settings-general.js';
		$asset_path = WAR_PATH . 'assets/js/settings/settings-general.asset.php';
		$css_path   = WAR_PATH . 'assets/css/settings-general.css';

		if ( ! file_exists( $js_path ) ) {
			// Bundle not built yet — skip silently in production, warn in debug.
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_trigger_error
				trigger_error(
					'CDW: settings-general.js not found. Run `npm run build` in the plugin directory.',
					E_USER_NOTICE
				);
			}
			return;
		}

		$asset = file_exists( $asset_path )
			? require $asset_path
			: array( 'dependencies' => array(), 'version' => WAR_VERSION );

		// Strip any handles that are not registered in this WP install
		// (e.g. wp-theme, a transitive @wordpress/ui dep not in WP core).
		global $wp_scripts;
		$deps = array_filter(
			$asset['dependencies'],
			static function ( $handle ) use ( $wp_scripts ) {
				return isset( $wp_scripts->registered[ $handle ] );
			}
		);

		wp_enqueue_script(
			'cdw-settings-general',
			WAR_URL . 'assets/js/settings/settings-general.js',
			array_values( $deps ),
			$asset['version'],
			true
		);

		if ( file_exists( $css_path ) ) {
			wp_enqueue_style(
				'cdw-settings-general',
				WAR_URL . 'assets/css/settings-general.css',
				array( 'wp-components' ),
				WAR_VERSION
			);
		}

		wp_localize_script(
			'cdw-settings-general',
			'cdwSettingsData',
			array(
				'restRoot'       => esc_url_raw( rest_url() ),
				'nonce'          => wp_create_nonce( 'wp_rest' ),
				'legacyUrl'      => add_query_arg(
					array(
						'page'           => 'wc-settings',
						'tab'            => 'general',
						'legacy_settings' => '1',
					),
					admin_url( 'admin.php' )
				),
				'modernSettings' => true,
			)
		);
	}
}
