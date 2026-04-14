<?php
/**
 * Custom Products Empty State.
 *
 * Replaces the default WooCommerce empty products page with a CIAB-style
 * empty state.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WAR_Products_Empty_State {

	public static function register() {
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_assets' ) );
	}

	public static function enqueue_assets() {
		$screen = get_current_screen();
		if ( ! $screen ) {
			return;
		}

		// Only on the products list page (not single product edit).
		if ( $screen->id !== 'edit-product' ) {
			return;
		}

		wp_enqueue_style( 'wp-components' );

		wp_enqueue_style(
			'war-products-empty-state',
			WAR_URL . 'assets/css/products-empty-state.css',
			array( 'wp-components' ),
			WAR_VERSION
		);

		wp_enqueue_script(
			'war-products-empty-state',
			WAR_URL . 'assets/js/products-empty-state.js',
			array(),
			WAR_VERSION,
			true
		);
	}
}
