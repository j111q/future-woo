<?php
/**
 * Products State Switcher.
 *
 * Creates/deletes fake sample products for dev/QA testing.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WAR_Products_State_Switcher {

	const FAKE_PRODUCTS_KEY = 'war_fake_products_ids';

	/**
	 * AJAX handler: create or delete fake products.
	 */
	public static function ajax_set_state() {
		check_ajax_referer( 'cdw_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Insufficient permissions.' ) );
		}

		$state = isset( $_POST['state'] ) ? sanitize_key( $_POST['state'] ) : '';

		if ( 'with_products' === $state ) {
			self::create_fake_products();
		} elseif ( 'empty' === $state ) {
			self::delete_fake_products();
		} else {
			wp_send_json_error( array( 'message' => 'Invalid state.' ) );
		}

		wp_send_json_success();
	}

	/**
	 * Check if fake products exist.
	 */
	public static function has_fake_products(): bool {
		return ! empty( get_option( self::FAKE_PRODUCTS_KEY, array() ) );
	}

	// -------------------------------------------------------------------------
	// Product creation / deletion
	// -------------------------------------------------------------------------

	private static function create_fake_products() {
		$existing = get_option( self::FAKE_PRODUCTS_KEY, array() );
		if ( ! empty( $existing ) ) {
			return;
		}

		if ( ! function_exists( 'wc_get_product' ) ) {
			return;
		}

		$product_ids = array();

		// Product 1: Simple product.
		$product = new WC_Product_Simple();
		$product->set_name( 'Classic Cotton T-Shirt' );
		$product->set_status( 'publish' );
		$product->set_regular_price( '29.99' );
		$product->set_description( 'A comfortable, everyday cotton t-shirt available in multiple colors. Made from 100% organic cotton.' );
		$product->set_short_description( 'Comfortable organic cotton t-shirt.' );
		$product->set_sku( 'WAR-TSHIRT-001' );
		$product->set_manage_stock( true );
		$product->set_stock_quantity( 150 );
		$product->set_weight( '0.2' );
		$product->set_catalog_visibility( 'visible' );
		$product->save();
		$product_ids[] = $product->get_id();

		// Product 2: Simple product, higher price.
		$product = new WC_Product_Simple();
		$product->set_name( 'Wireless Bluetooth Headphones' );
		$product->set_status( 'publish' );
		$product->set_regular_price( '89.99' );
		$product->set_sale_price( '69.99' );
		$product->set_description( 'Premium wireless headphones with noise cancellation and 30-hour battery life.' );
		$product->set_short_description( 'Premium wireless headphones with noise cancellation.' );
		$product->set_sku( 'WAR-HEADPHONES-001' );
		$product->set_manage_stock( true );
		$product->set_stock_quantity( 45 );
		$product->set_weight( '0.3' );
		$product->set_catalog_visibility( 'visible' );
		$product->save();
		$product_ids[] = $product->get_id();

		// Product 3: Simple product, low stock.
		$product = new WC_Product_Simple();
		$product->set_name( 'Handmade Ceramic Mug' );
		$product->set_status( 'publish' );
		$product->set_regular_price( '24.00' );
		$product->set_description( 'Handcrafted ceramic mug, perfect for your morning coffee. Each piece is unique.' );
		$product->set_short_description( 'Handcrafted ceramic mug — each piece is unique.' );
		$product->set_sku( 'WAR-MUG-001' );
		$product->set_manage_stock( true );
		$product->set_stock_quantity( 8 );
		$product->set_low_stock_amount( 10 );
		$product->set_weight( '0.4' );
		$product->set_catalog_visibility( 'visible' );
		$product->save();
		$product_ids[] = $product->get_id();

		// Product 4: Digital/downloadable product.
		$product = new WC_Product_Simple();
		$product->set_name( 'Digital Marketing eBook' );
		$product->set_status( 'publish' );
		$product->set_regular_price( '14.99' );
		$product->set_description( 'A comprehensive guide to digital marketing strategies for small businesses.' );
		$product->set_short_description( 'Digital marketing guide for small businesses.' );
		$product->set_sku( 'WAR-EBOOK-001' );
		$product->set_virtual( true );
		$product->set_downloadable( true );
		$product->set_catalog_visibility( 'visible' );
		$product->save();
		$product_ids[] = $product->get_id();

		// Product 5: Draft product.
		$product = new WC_Product_Simple();
		$product->set_name( 'Organic Scented Candle' );
		$product->set_status( 'draft' );
		$product->set_regular_price( '18.50' );
		$product->set_description( 'Hand-poured soy candle with natural essential oils. Burns for up to 40 hours.' );
		$product->set_short_description( 'Hand-poured soy candle with essential oils.' );
		$product->set_sku( 'WAR-CANDLE-001' );
		$product->set_manage_stock( true );
		$product->set_stock_quantity( 60 );
		$product->set_catalog_visibility( 'visible' );
		$product->save();
		$product_ids[] = $product->get_id();

		update_option( self::FAKE_PRODUCTS_KEY, $product_ids );
	}

	private static function delete_fake_products() {
		// Delete products created by both the products AND orders state switchers.
		$all_keys = array( self::FAKE_PRODUCTS_KEY, 'cdw_fake_product_ids' );

		foreach ( $all_keys as $key ) {
			$product_ids = get_option( $key, array() );
			if ( empty( $product_ids ) ) {
				continue;
			}
			foreach ( $product_ids as $product_id ) {
				$product = wc_get_product( $product_id );
				if ( $product ) {
					$product->delete( true );
				}
			}
			delete_option( $key );
		}

		// Also delete any remaining products (for a truly empty state).
		$remaining = wc_get_products( array( 'limit' => -1, 'return' => 'ids', 'status' => array( 'publish', 'draft', 'pending', 'private' ) ) );
		foreach ( $remaining as $product_id ) {
			$product = wc_get_product( $product_id );
			if ( $product ) {
				$product->delete( true );
			}
		}
	}

}
