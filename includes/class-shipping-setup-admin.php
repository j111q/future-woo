<?php
/**
 * Hooks into WooCommerce Settings → Shipping tab to replace the shipping
 * zones UI and add an Operations section.
 *
 * Instead of adding separate sidebar menu items, we:
 *   1. Add an "Operations" section to Settings → Shipping
 *   2. Override the default Shipping zones section output with our React app
 *   3. Override the Operations section output with our React app
 *
 * This keeps everything under Settings → Shipping (no duplicate menu items).
 *
 * @package WooAdminRevamp
 */

namespace WAR;

class Shipping_Setup_Admin {

	public static function init() {
		// Add "Operations" as a section under Settings → Shipping.
		add_filter( 'woocommerce_get_sections_shipping', array( __CLASS__, 'add_shipping_sections' ) );

		// Replace the output for our sections.
		add_action( 'woocommerce_settings_shipping', array( __CLASS__, 'render_section' ) );

		// Shipping header is now rendered by WAR_Custom_Header.

		// Add body class for CSS scoping.
		add_filter( 'admin_body_class', array( __CLASS__, 'add_body_class' ) );

		// Enqueue assets on the shipping settings page.
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_assets' ) );
	}

	/**
	 * Add Operations section to Settings → Shipping tab.
	 *
	 * WooCommerce already has: '' (Shipping zones), 'options', 'classes'.
	 * We add: 'operations' (Shipping Operations).
	 */
	public static function add_shipping_sections( $sections ) {
		// Remove default sections we've replaced — keep only zones + our operations.
		unset( $sections['options'] );   // "Shipping settings"
		unset( $sections['classes'] );   // "Classes"

		// Remove "Local pickup" if WC added it (we handle pickup in zones > delivery options).
		foreach ( $sections as $key => $label ) {
			if ( stripos( $label, 'pickup' ) !== false && '' !== $key && 'operations' !== $key ) {
				unset( $sections[ $key ] );
			}
		}

		$sections['operations'] = __( 'Operations', 'woo-admin-revamp' );
		return $sections;
	}

	/**
	 * Render our React app for the shipping zones section and operations section.
	 */
	public static function render_section() {
		global $current_section;

		// Only render for the default zones section or our operations section.
		if ( '' !== $current_section && 'operations' !== $current_section ) {
			return;
		}

		$page = ( 'operations' === $current_section ) ? 'operations' : 'zones';

		echo '<div id="wss-shipping-setup-root" data-page="' . esc_attr( $page ) . '"></div>';

		// Hide WC default shipping UI that appears after our root.
		echo '<style>
			.wc-shipping-zones, .wc-shipping-zone-settings,
			.woocommerce-recommended-shipping-extensions, .wc_addons_wrap,
			#wss-shipping-setup-root ~ *:not(.woocommerce-layout) { display: none !important; }
		</style>';

		// Hide save button — we handle saving ourselves.
		$GLOBALS['hide_save_button'] = true;

		// Stop WC from rendering more content after our root.
		remove_all_actions( 'woocommerce_admin_field_shipping_zone_table' );
	}

	/**
	 * Add body class on our shipping settings pages for CSS scoping.
	 */
	public static function add_body_class( $classes ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$tab  = isset( $_GET['tab'] ) ? sanitize_text_field( wp_unslash( $_GET['tab'] ) ) : '';

		if ( 'wc-settings' === $page && 'shipping' === $tab ) {
			$classes .= ' wss-shipping-active';
		}
		return $classes;
	}

	/**
	 * Render a CIAB-style header: Settings / Shipping breadcrumb + Zones | Operations tabs.
	 *
	 * Uses the same war-page-header pattern as the custom header (class-custom-header.php)
	 * so all WooCommerce pages share a consistent look. The breadcrumb pattern matches
	 * CIAB admin-toolkit Breadcrumbs component:
	 *   - 15px, weight 600, line-height 20px, color #1e1e1e
	 *   - Separator "/" with gap 8px
	 *   - Linked items use underline, current item is plain text
	 *   See: ciab-admin/packages/admin-toolkit/src/components/breadcrumbs/
	 *
	 * Hides WC's default Settings title + tab navigation.
	 */
	public static function render_shipping_header() {
		// Only on WC Settings > Shipping tab.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$tab  = isset( $_GET['tab'] ) ? sanitize_text_field( wp_unslash( $_GET['tab'] ) ) : '';

		if ( 'wc-settings' !== $page || 'shipping' !== $tab ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$section        = isset( $_GET['section'] ) ? sanitize_text_field( wp_unslash( $_GET['section'] ) ) : '';
		$is_operations  = ( 'operations' === $section );
		$settings_url   = admin_url( 'admin.php?page=wc-settings' );
		$zones_url      = admin_url( 'admin.php?page=wc-settings&tab=shipping' );
		$operations_url = admin_url( 'admin.php?page=wc-settings&tab=shipping&section=operations' );
		?>
		<div class="war-page-header war-page-header--shipping" id="wss-page-header">
			<div class="war-page-header__top">
				<div class="war-page-header__left">
					<h1 class="war-page-header__breadcrumb" id="wss-breadcrumb">
						<?php esc_html_e( 'Shipping', 'woo-admin-revamp' ); ?>
						<span id="wss-breadcrumb-extra"></span>
					</h1>
				</div>
				<div class="war-page-header__actions">
					<div id="wss-header-actions"></div>
				</div>
			</div>
			<span id="wss-subtitle"></span>
			<nav class="war-page-header__tabs" id="wss-tabs" aria-label="<?php esc_attr_e( 'Shipping sections', 'woo-admin-revamp' ); ?>">
				<a href="<?php echo esc_url( $zones_url ); ?>"
				   class="war-page-header__tab <?php echo ! $is_operations ? 'war-page-header__tab--active' : ''; ?>">
					<?php esc_html_e( 'Zones', 'woo-admin-revamp' ); ?>
				</a>
				<a href="<?php echo esc_url( $operations_url ); ?>"
				   class="war-page-header__tab <?php echo $is_operations ? 'war-page-header__tab--active' : ''; ?>">
					<?php esc_html_e( 'Operations', 'woo-admin-revamp' ); ?>
				</a>
			</nav>
		</div>
		<?php
	}

	/**
	 * Enqueue React app and styles on the WooCommerce Shipping settings page.
	 */
	public static function enqueue_assets( $hook ) {
		// Only on WooCommerce Settings pages.
		if ( 'woocommerce_page_wc-settings' !== $hook ) {
			return;
		}

		// Only on the Shipping tab.
		$tab = isset( $_GET['tab'] ) ? sanitize_text_field( wp_unslash( $_GET['tab'] ) ) : '';
		$section = isset( $_GET['section'] ) ? sanitize_text_field( wp_unslash( $_GET['section'] ) ) : '';

		if ( 'shipping' !== $tab ) {
			return;
		}

		// Only on zones (default) or operations section.
		if ( '' !== $section && 'operations' !== $section ) {
			return;
		}

		$asset_file = WAR_PATH . 'assets/js/shipping-native/index.asset.php';
		$asset      = file_exists( $asset_file )
			? require $asset_file
			: array(
				'dependencies' => array( 'wp-components', 'wp-element', 'wp-i18n' ),
				'version'      => WAR_VERSION,
			);

		wp_enqueue_script(
			'wss-shipping-setup',
			WAR_URL . 'assets/js/shipping-native/index.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		$initial_page = ( 'operations' === $section ) ? 'operations' : 'zones';

		wp_localize_script( 'wss-shipping-setup', 'wssShippingData', array(
			'restUrl'       => rest_url( 'wss/v1/' ),
			'nonce'         => wp_create_nonce( 'wp_rest' ),
			'initialPage'   => $initial_page,
			'operationsUrl' => admin_url( 'admin.php?page=wc-settings&tab=shipping&section=operations' ),
			'zonesUrl'      => admin_url( 'admin.php?page=wc-settings&tab=shipping' ),
			'currency'      => array(
				'symbol'   => get_woocommerce_currency_symbol(),
				'code'     => get_woocommerce_currency(),
				'position' => get_option( 'woocommerce_currency_pos', 'left' ),
			),
			'countries' => \WC()->countries->get_countries(),
			'states'    => \WC()->countries->get_states(),
			'storeAddress' => array(
				'address_1' => get_option( 'woocommerce_store_address', '' ),
				'city'      => get_option( 'woocommerce_store_city', '' ),
				'state'     => \WC()->countries->get_base_state(),
				'postcode'  => get_option( 'woocommerce_store_postcode', '' ),
				'country'   => \WC()->countries->get_base_country(),
			),
		) );

		wp_enqueue_style(
			'wss-shipping-setup',
			WAR_URL . 'assets/js/shipping-native/style-index.css',
			array( 'wp-components' ),
			WAR_VERSION
		);

		wp_enqueue_style(
			'wss-shipping-setup-source',
			WAR_URL . 'assets/js/shipping-native/index.css',
			array( 'wss-shipping-setup' ),
			WAR_VERSION
		);
	}
}
