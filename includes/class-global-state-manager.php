<?php
/**
 * Global State Manager.
 *
 * Manages the global prototype state across all admin screens.
 * Creates/deletes fake products and orders as a unit.
 *
 * Global states:
 *   - new_store:     Empty everything. Setup widget visible, no products, no orders.
 *   - setting_up:    Setup 2/5 done. Has products (with images), no orders.
 *   - active_store:  Setup complete. Has products and orders (orders use real products).
 *
 * Dashboard-specific:
 *   - new_design:    Toggle for redesigned dashboard layout.
 *   - grow_complete: All growth tasks dismissed (only when active_store).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WAR_Global_State_Manager {

	const STATE_KEY          = 'war_global_state';
	const FAKE_PRODUCTS_KEY  = 'war_global_fake_products';
	const FAKE_ORDERS_KEY    = 'war_global_fake_orders';

	/**
	 * Product catalog — ceramic line.
	 */
	private static $product_catalog = array(
		array(
			'name'        => 'Ceramic Coffee Mug',
			'sku'         => 'CER-MUG-001',
			'price'       => '35.00',
			'description' => 'Handcrafted ceramic coffee mug with a smooth matte finish. Perfect for your morning coffee or tea.',
			'short_desc'  => 'Handcrafted matte-finish ceramic mug.',
			'image'       => 'ceramic-mug-2.png',
			'stock'       => 85,
		),
		array(
			'name'        => 'Ceramic Serving Bowl',
			'sku'         => 'CER-BWL-002',
			'price'       => '28.00',
			'description' => 'A versatile serving bowl with an organic shape. Microwave and dishwasher safe.',
			'short_desc'  => 'Organic-shaped ceramic serving bowl.',
			'image'       => 'ceramic-bowl-2.png',
			'stock'       => 120,
		),
		array(
			'name'        => 'Ceramic Dinner Plate',
			'sku'         => 'CER-PLT-003',
			'price'       => '38.00',
			'description' => 'Minimalist dinner plate with a subtle speckled glaze. Sold individually.',
			'short_desc'  => 'Speckled-glaze ceramic dinner plate.',
			'image'       => 'ceramic-plate-2.png',
			'stock'       => 200,
		),
		array(
			'name'        => 'Ceramic Bud Vase',
			'sku'         => 'CER-VAS-004',
			'price'       => '65.00',
			'description' => 'Tall, elegant bud vase with a reactive glaze that makes each piece unique.',
			'short_desc'  => 'Reactive-glaze ceramic bud vase.',
			'image'       => 'ceramic-vase-2.png',
			'stock'       => 30,
		),
		array(
			'name'        => 'Ceramic Pitcher',
			'sku'         => 'CER-PIT-005',
			'price'       => '45.00',
			'description' => 'Rustic ceramic pitcher for water, juice, or as a decorative piece.',
			'short_desc'  => 'Rustic ceramic pitcher.',
			'image'       => 'ceramic-pitcher-2.png',
			'stock'       => 55,
		),
		array(
			'name'        => 'Ceramic Planter',
			'sku'         => 'CER-PLN-006',
			'price'       => '42.00',
			'description' => 'Indoor ceramic planter with drainage hole. Fits pots up to 6 inches.',
			'short_desc'  => 'Indoor ceramic planter with drainage.',
			'image'       => 'ceramic-planter-2.png',
			'stock'       => 70,
		),
	);

	// -------------------------------------------------------------------------
	// State getter/setter
	// -------------------------------------------------------------------------

	public static function get_state(): string {
		$state = get_option( self::STATE_KEY, 'new_store' );
		return is_string( $state ) ? $state : 'new_store';
	}

	// -------------------------------------------------------------------------
	// AJAX handler
	// -------------------------------------------------------------------------

	public static function ajax_set_state() {
		check_ajax_referer( 'war_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Insufficient permissions.' ) );
		}

		$state   = isset( $_POST['state'] ) ? sanitize_key( $_POST['state'] ) : '';
		$allowed = array( 'new_store', 'setting_up', 'active_store' );

		if ( ! in_array( $state, $allowed, true ) ) {
			wp_send_json_error( array( 'message' => 'Invalid state.' ) );
		}

		// Clean up everything first.
		self::delete_all_fake_data();

		// Set new state.
		update_option( self::STATE_KEY, $state );

		// Ensure taxes are enabled so the Tax settings tab works.
		update_option( 'woocommerce_calc_taxes', 'yes' );

		// Build data for the new state.
		switch ( $state ) {
			case 'new_store':
				// Dashboard: new_store state.
				update_user_meta( get_current_user_id(), 'cdw_dev_state', 'new_store' );
				delete_user_meta( get_current_user_id(), 'cdw_setup_complete_notice_shown' );
				delete_user_meta( get_current_user_id(), 'cdw_whats_next_dismissed' );
				// Site is in coming soon mode.
				update_option( 'woocommerce_coming_soon', 'yes' );
				break;

			case 'setting_up':
				// Create products (no orders).
				self::create_fake_products();
				// Dashboard: setup in progress.
				update_user_meta( get_current_user_id(), 'cdw_dev_state', 'setup_in_progress' );
				delete_user_meta( get_current_user_id(), 'cdw_setup_complete_notice_shown' );
				delete_user_meta( get_current_user_id(), 'cdw_whats_next_dismissed' );
				// Site is in coming soon mode.
				update_option( 'woocommerce_coming_soon', 'yes' );
				break;

			case 'active_store':
				// Create products, then orders that use those products.
				self::create_fake_products();
				self::create_fake_orders();
				// Dashboard: active store.
				update_user_meta( get_current_user_id(), 'cdw_dev_state', 'active_store' );
				update_user_meta( get_current_user_id(), 'cdw_setup_complete_notice_shown', '1' );
				delete_user_meta( get_current_user_id(), 'cdw_whats_next_dismissed' );
				// Site is live.
				update_option( 'woocommerce_coming_soon', 'no' );
				break;
		}

		// Reset dashboard widget order.
		delete_user_meta( get_current_user_id(), 'meta-box-order_dashboard' );

		wp_send_json_success();
	}

	// -------------------------------------------------------------------------
	// Dashboard-specific AJAX
	// -------------------------------------------------------------------------

	public static function ajax_toggle_grow_complete() {
		check_ajax_referer( 'war_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error();
		}

		$enabled = isset( $_POST['enabled'] ) ? sanitize_key( $_POST['enabled'] ) : '0';

		if ( $enabled === '1' ) {
			// Dismiss all What's Next tasks.
			$all_ids = array( 'grow_business', 'extensions', 'payment_options', 'mobile_app', 'shipping_options', 'connect_paypal', 'fraud_protection', 'google', 'pinterest', 'activate_payments' );
			update_user_meta( get_current_user_id(), 'cdw_whats_next_dismissed', $all_ids );
		} else {
			delete_user_meta( get_current_user_id(), 'cdw_whats_next_dismissed' );
		}

		wp_send_json_success();
	}

	// -------------------------------------------------------------------------
	// Product creation
	// -------------------------------------------------------------------------

	private static function create_fake_products() {
		$existing = get_option( self::FAKE_PRODUCTS_KEY, array() );
		if ( ! empty( $existing ) ) {
			return;
		}

		$product_ids = array();
		$images_dir  = WAR_PATH . 'assets/images/products/';
		$images_url  = WAR_URL . 'assets/images/products/';

		foreach ( self::$product_catalog as $item ) {
			// Check if product with this SKU already exists.
			$existing_id = wc_get_product_id_by_sku( $item['sku'] );
			if ( $existing_id ) {
				$product_ids[] = $existing_id;
				continue;
			}

			$product = new \WC_Product_Simple();
			$product->set_name( $item['name'] );
			$product->set_status( 'publish' );
			$product->set_regular_price( $item['price'] );
			$product->set_description( $item['description'] );
			$product->set_short_description( $item['short_desc'] );
			$product->set_sku( $item['sku'] );
			$product->set_manage_stock( true );
			$product->set_stock_quantity( $item['stock'] );
			$product->set_catalog_visibility( 'visible' );
			$product->save();

			// Attach product image.
			$image_path = $images_dir . $item['image'];
			if ( file_exists( $image_path ) ) {
				$attach_id = self::attach_image( $image_path, $item['image'], $product->get_id() );
				if ( $attach_id ) {
					$product->set_image_id( $attach_id );
					$product->save();
				}
			}

			$product_ids[] = $product->get_id();
		}

		update_option( self::FAKE_PRODUCTS_KEY, $product_ids );
	}

	/**
	 * Attach an image file to a product as its featured image.
	 */
	private static function attach_image( string $file_path, string $filename, int $parent_id ): int {
		$upload_dir = wp_upload_dir();
		$dest       = $upload_dir['path'] . '/' . $filename;

		// Copy to uploads.
		if ( ! file_exists( $dest ) ) {
			copy( $file_path, $dest );
		}

		$filetype = wp_check_filetype( $filename );
		$attachment = array(
			'guid'           => $upload_dir['url'] . '/' . $filename,
			'post_mime_type' => $filetype['type'],
			'post_title'     => sanitize_file_name( pathinfo( $filename, PATHINFO_FILENAME ) ),
			'post_content'   => '',
			'post_status'    => 'inherit',
		);

		$attach_id = wp_insert_attachment( $attachment, $dest, $parent_id );

		if ( ! is_wp_error( $attach_id ) ) {
			require_once ABSPATH . 'wp-admin/includes/image.php';
			$metadata = wp_generate_attachment_metadata( $attach_id, $dest );
			wp_update_attachment_metadata( $attach_id, $metadata );
		}

		return is_wp_error( $attach_id ) ? 0 : $attach_id;
	}

	// -------------------------------------------------------------------------
	// Order creation
	// -------------------------------------------------------------------------

	private static function create_fake_orders() {
		$existing = get_option( self::FAKE_ORDERS_KEY, array() );
		if ( ! empty( $existing ) ) {
			return;
		}

		$product_ids = get_option( self::FAKE_PRODUCTS_KEY, array() );
		$products    = array();
		foreach ( $product_ids as $pid ) {
			$p = wc_get_product( $pid );
			if ( $p ) {
				$products[] = $p;
			}
		}

		if ( empty( $products ) ) {
			return;
		}

		$order_ids = array();

		// Order 1: Completed — Sarah Johnson (3 items).
		$order = wc_create_order( array( 'status' => 'completed' ) );
		$order->set_billing_first_name( 'Sarah' );
		$order->set_billing_last_name( 'Johnson' );
		$order->set_billing_email( 'sarah@example.com' );
		$order->set_billing_address_1( '123 Main St' );
		$order->set_billing_city( 'Portland' );
		$order->set_billing_state( 'OR' );
		$order->set_billing_postcode( '97201' );
		$order->set_billing_country( 'US' );
		$order->set_payment_method_title( 'Credit Card' );
		self::add_products_to_order( $order, array_slice( $products, 0, 3 ) );
		$order->save();
		$order->add_order_note( 'Payment received via Credit Card.' );
		$order->add_order_note( 'Order status changed from Processing to Completed.', false, true );
		$order->add_order_note( 'Shipping label created — tracking #1Z999AA10123456784.' );
		$order->add_order_note( 'Order completed email sent to sarah@example.com.', false, true );
		$order_ids[] = $order->get_id();

		// Order 2: Processing — Mike Chen (2 items).
		$order = wc_create_order( array( 'status' => 'processing' ) );
		$order->set_billing_first_name( 'Mike' );
		$order->set_billing_last_name( 'Chen' );
		$order->set_billing_email( 'mike@example.com' );
		$order->set_billing_address_1( '456 Oak Ave' );
		$order->set_billing_city( 'Seattle' );
		$order->set_billing_state( 'WA' );
		$order->set_billing_postcode( '98101' );
		$order->set_billing_country( 'US' );
		$order->set_payment_method_title( 'PayPal' );
		self::add_products_to_order( $order, array_slice( $products, 1, 2 ) );
		$order->save();
		$order->add_order_note( 'Payment received via PayPal.' );
		$order->add_order_note( 'Confirmation email sent to mike@example.com.', false, true );
		$order->add_order_note( 'Customer requested gift wrapping.', true );
		$order_ids[] = $order->get_id();

		// Order 3: On-hold — Emma Wilson (1 item).
		$order = wc_create_order( array( 'status' => 'on-hold' ) );
		$order->set_billing_first_name( 'Emma' );
		$order->set_billing_last_name( 'Wilson' );
		$order->set_billing_email( 'emma@example.com' );
		$order->set_billing_address_1( '789 Pine Rd' );
		$order->set_billing_city( 'Austin' );
		$order->set_billing_state( 'TX' );
		$order->set_billing_postcode( '78701' );
		$order->set_billing_country( 'US' );
		$order->set_payment_method_title( 'Bank Transfer' );
		self::add_products_to_order( $order, array_slice( $products, 3, 1 ) );
		$order->save();
		$order->add_order_note( 'Awaiting bank transfer payment.' );
		$order->add_order_note( 'On-hold email sent to emma@example.com.', false, true );
		$order_ids[] = $order->get_id();

		// Order 4: Pending — Alex Rivera (4 items).
		$order = wc_create_order( array( 'status' => 'pending' ) );
		$order->set_billing_first_name( 'Alex' );
		$order->set_billing_last_name( 'Rivera' );
		$order->set_billing_email( 'alex@example.com' );
		$order->set_billing_address_1( '321 Elm Blvd' );
		$order->set_billing_city( 'Denver' );
		$order->set_billing_state( 'CO' );
		$order->set_billing_postcode( '80202' );
		$order->set_billing_country( 'US' );
		$order->set_payment_method_title( 'Credit Card' );
		self::add_products_to_order( $order, array_slice( $products, 0, 4 ) );
		$order->save();
		$order->add_order_note( 'Awaiting payment.' );
		$order->add_order_note( 'New order email sent to admin.', false, true );
		$order_ids[] = $order->get_id();

		// Order 5: Refunded — Jordan Lee (2 items).
		$order = wc_create_order( array( 'status' => 'refunded' ) );
		$order->set_billing_first_name( 'Jordan' );
		$order->set_billing_last_name( 'Lee' );
		$order->set_billing_email( 'jordan@example.com' );
		$order->set_billing_address_1( '555 Cedar Ln' );
		$order->set_billing_city( 'Chicago' );
		$order->set_billing_state( 'IL' );
		$order->set_billing_postcode( '60601' );
		$order->set_billing_country( 'US' );
		$order->set_payment_method_title( 'Credit Card' );
		self::add_products_to_order( $order, array_slice( $products, 4, 2 ) );
		$order->save();
		$order->add_order_note( 'Payment received via Credit Card.' );
		$order->add_order_note( 'Order fulfilled and shipped.' );
		$order->add_order_note( 'Customer requested refund — item arrived damaged.', true );
		$order->add_order_note( 'Refund processed successfully.' );
		$order_ids[] = $order->get_id();

		update_option( self::FAKE_ORDERS_KEY, $order_ids );

		// Also set the old keys so other parts of the plugin recognize them.
		update_option( 'cdw_fake_orders_ids', $order_ids );
	}

	/**
	 * Add real products to an order as line items.
	 */
	private static function add_products_to_order( $order, $products ) {
		$total = 0;
		foreach ( $products as $product ) {
			$qty = rand( 1, 3 );
			$order->add_product( $product, $qty );
			$total += floatval( $product->get_price() ) * $qty;
		}
		$order->set_total( $total );
	}

	// -------------------------------------------------------------------------
	// Cleanup
	// -------------------------------------------------------------------------

	public static function delete_all_fake_data() {
		// Delete fake orders from all known keys.
		$order_keys = array( self::FAKE_ORDERS_KEY, 'cdw_fake_orders_ids' );
		if ( class_exists( 'CDW_Orders_State_Switcher' ) ) {
			$order_keys[] = CDW_Orders_State_Switcher::FAKE_ORDERS_KEY;
		}
		foreach ( $order_keys as $key ) {
			$ids = get_option( $key, array() );
			if ( ! empty( $ids ) ) {
				foreach ( $ids as $id ) {
					$order = wc_get_order( $id );
					if ( $order ) {
						$order->delete( true );
					}
				}
				delete_option( $key );
			}
		}

		// Also delete ALL remaining orders (nuclear cleanup for demo).
		$all_orders = wc_get_orders( array( 'limit' => -1, 'return' => 'ids', 'status' => array_keys( wc_get_order_statuses() ) ) );
		foreach ( $all_orders as $oid ) {
			$order = wc_get_order( $oid );
			if ( $order ) {
				$order->delete( true );
			}
		}

		// Delete fake products from all known keys.
		$product_keys = array( self::FAKE_PRODUCTS_KEY, 'war_fake_products_ids', 'cdw_fake_product_ids' );
		foreach ( $product_keys as $key ) {
			$ids = get_option( $key, array() );
			if ( ! empty( $ids ) ) {
				foreach ( $ids as $id ) {
					$product = wc_get_product( $id );
					if ( $product ) {
						$product->delete( true );
					}
				}
				delete_option( $key );
			}
		}

		// Also delete ALL remaining products (nuclear cleanup for demo).
		$all_products = wc_get_products( array( 'limit' => -1, 'return' => 'ids', 'status' => array( 'publish', 'draft', 'pending', 'private', 'trash' ) ) );
		foreach ( $all_products as $pid ) {
			$product = wc_get_product( $pid );
			if ( $product ) {
				$product->delete( true );
			}
		}
	}
}
