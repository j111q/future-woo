<?php
/**
 * Custom Orders Empty State.
 *
 * Replaces the default WooCommerce empty orders page with a CIAB-style
 * empty state and wraps the "Tools for your store" in a collapsible card.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WAR_Orders_Empty_State {

	public static function register() {
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_assets' ) );
		// Render our own tools via the WooCommerce hook (replaces default marketplace suggestions).
		add_action( 'wc_marketplace_suggestions_orders_empty_state', array( __CLASS__, 'render_tools_data' ), 5 );
	}

	public static function enqueue_assets() {
		$screen = get_current_screen();
		if ( ! $screen || $screen->id !== 'woocommerce_page_wc-orders' ) {
			return;
		}

		wp_enqueue_style( 'wp-components' );

		wp_enqueue_style(
			'war-orders-empty-state',
			WAR_URL . 'assets/css/orders-empty-state.css',
			array( 'wp-components' ),
			WAR_VERSION
		);

		wp_enqueue_script(
			'war-orders-empty-state',
			WAR_URL . 'assets/js/orders-empty-state.js',
			array(),
			WAR_VERSION,
			true
		);

		wp_localize_script( 'war-orders-empty-state', 'warOrdersEmptyState', array(
			'illustrationUrl' => WAR_URL . 'assets/images/orders-empty-state.svg',
		) );
	}

	/**
	 * Output a marker so JS knows to extract tools from the original DOM.
	 */
	public static function render_tools_data() {
		echo '<div id="war-tools-marker" style="display:none"></div>';
	}
}
