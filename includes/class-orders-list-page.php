<?php
/**
 * Replaces the WooCommerce orders list page with a DataViews-powered table.
 * PHP header stays (consistent with other pages) — React adds tabs + table below it.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WAR_Orders_List_Page {

	public function __construct() {
		add_action( 'current_screen', array( $this, 'maybe_intercept' ) );
	}

	public function maybe_intercept() {
		if ( ! $this->is_orders_list() ) {
			return;
		}

		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'admin_head', array( $this, 'hide_default_table' ) );
		add_action( 'admin_footer', array( $this, 'render_react_mount' ) );
	}

	private function is_orders_list() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$page   = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$action = isset( $_GET['action'] ) ? sanitize_text_field( wp_unslash( $_GET['action'] ) ) : '';

		return 'wc-orders' === $page && 'edit' !== $action && 'new' !== $action;
	}

	public function enqueue_assets() {
		$asset_path = WAR_PATH . 'assets/js/orders-list/index.asset.php';
		$asset      = file_exists( $asset_path )
			? require $asset_path
			: array(
				'dependencies' => array( 'wp-element', 'wp-components', 'wp-api-fetch', 'wp-i18n' ),
				'version'      => WAR_VERSION,
			);

		wp_enqueue_script(
			'war-orders-list',
			WAR_URL . 'assets/js/orders-list/index.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'war-orders-list',
			WAR_URL . 'assets/js/orders-list/style.css',
			array( 'wp-components' ),
			$asset['version']
		);

		wp_localize_script( 'war-orders-list', 'wcOrdersList', array(
			'restNonce' => wp_create_nonce( 'wp_rest' ),
			'restUrl'   => rest_url(),
			'adminUrl'  => admin_url(),
			'currency'  => function_exists( 'get_woocommerce_currency_symbol' )
				? get_woocommerce_currency_symbol()
				: '$',
			'statuses'  => function_exists( 'wc_get_order_statuses' )
				? wc_get_order_statuses()
				: array(),
		) );
	}

	/**
	 * Hide only the default WooCommerce orders list table.
	 * PHP header stays visible — React renders tabs + DataViews below it.
	 */
	public function hide_default_table() {
		?>
		<style>
			/* Hide default WooCommerce orders list table */
			.woocommerce_page_wc-orders .wrap > .subsubsub,
			.woocommerce_page_wc-orders .wrap > .search-box,
			.woocommerce_page_wc-orders .wrap > .tablenav,
			.woocommerce_page_wc-orders .wrap > .wp-list-table,
			.woocommerce_page_wc-orders .wrap > #posts-filter,
			.woocommerce_page_wc-orders .wrap > form,
			.woocommerce_page_wc-orders .wrap > .clear,
			/* Hide default WP heading (PHP header replaces it) */
			.woocommerce_page_wc-orders .wrap > h1.wp-heading-inline,
			.woocommerce_page_wc-orders .wrap > .page-title-action,
			.woocommerce_page_wc-orders .wrap > hr.wp-header-end {
				display: none !important;
			}
		</style>
		<?php
	}

	public function render_react_mount() {
		?>
		<script>
		(function() {
			var wrap = document.querySelector('.woocommerce_page_wc-orders .wrap');
			if (wrap && !document.getElementById('wc-orders-list-root')) {
				var div = document.createElement('div');
				div.id = 'wc-orders-list-root';
				wrap.appendChild(div);
			}
		})();
		</script>
		<?php
	}
}
