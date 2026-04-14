<?php
/**
 * Development Tool: Orders State Switcher.
 *
 * Renders a floating action button on the Orders page that lets admins
 * toggle between an empty store and a store with fake sample orders.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CDW_Orders_State_Switcher {

	/** Option key for tracking whether fake orders exist. */
	const FAKE_ORDERS_KEY = 'cdw_fake_orders_ids';

	/** Option key for tracking dummy products created for orders. */
	const FAKE_PRODUCTS_KEY = 'cdw_fake_product_ids';

	public static function register() {
		add_action( 'admin_footer', array( __CLASS__, 'render_fab' ) );
	}

	// -------------------------------------------------------------------------
	// Render
	// -------------------------------------------------------------------------

	public static function render_fab() {
		$has_fake_orders = ! empty( get_option( self::FAKE_ORDERS_KEY, array() ) );
		?>
		<div id="cdw-orders-state-fab" class="cdw-state-fab">
			<div id="cdw-orders-state-menu" class="cdw-state-menu" hidden>
				<p class="cdw-state-menu-label">
					<?php esc_html_e( 'Orders state', 'custom-dashboard-widgets' ); ?>
				</p>
				<ul class="cdw-state-menu-list">
					<li>
						<button
							type="button"
							class="cdw-state-option <?php echo ! $has_fake_orders ? 'cdw-state-option--active' : ''; ?>"
							data-orders-state="empty"
						>
							<span class="cdw-state-option-dot" aria-hidden="true"></span>
							<?php esc_html_e( 'Empty store (no orders)', 'custom-dashboard-widgets' ); ?>
						</button>
					</li>
					<li>
						<button
							type="button"
							class="cdw-state-option <?php echo $has_fake_orders ? 'cdw-state-option--active' : ''; ?>"
							data-orders-state="with_orders"
						>
							<span class="cdw-state-option-dot" aria-hidden="true"></span>
							<?php esc_html_e( 'Store with orders', 'custom-dashboard-widgets' ); ?>
						</button>
					</li>
				</ul>
			</div>

			<button id="cdw-orders-fab-btn" class="cdw-state-fab-btn" type="button" aria-haspopup="true" aria-expanded="false">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
					<path d="M9 3v9.386l-3.846 5.24A1 1 0 006 19h12a1 1 0 00.846-1.374L15 12.387V3h-2v9.613l3 4.09-1.223.297H9.223L8 17.703l3-4.09V3H9zm-1.5-2h9A1.5 1.5 0 0118 2.5v.5H6v-.5A1.5 1.5 0 017.5 1z"/>
				</svg>
				<?php esc_html_e( 'States', 'custom-dashboard-widgets' ); ?>
			</button>
		</div>

		<script>
		(function() {
			var ajaxUrl = <?php echo wp_json_encode( admin_url( 'admin-ajax.php' ) ); ?>;
			var nonce   = <?php echo wp_json_encode( wp_create_nonce( 'cdw_nonce' ) ); ?>;

			var fabBtn = document.getElementById('cdw-orders-fab-btn');
			var menu   = document.getElementById('cdw-orders-state-menu');

			if ( ! fabBtn || ! menu ) return;

			fabBtn.addEventListener('click', function() {
				var open = menu.hidden;
				menu.hidden = ! open;
				fabBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
			});

			document.addEventListener('click', function(e) {
				if ( ! e.target.closest('#cdw-orders-state-fab') ) {
					menu.hidden = true;
					fabBtn.setAttribute('aria-expanded', 'false');
				}
			});

			menu.querySelectorAll('[data-orders-state]').forEach(function(btn) {
				btn.addEventListener('click', function() {
					var state = btn.getAttribute('data-orders-state');

					var formData = new FormData();
					formData.append('action', 'cdw_orders_set_state');
					formData.append('nonce', nonce);
					formData.append('state', state);

					fetch(ajaxUrl, { method: 'POST', body: formData })
						.then(function(r) { return r.json(); })
						.then(function(data) {
							if ( data.success ) {
								window.location.reload();
							}
						});
				});
			});
		})();
		</script>
		<?php
	}

	// -------------------------------------------------------------------------
	// AJAX
	// -------------------------------------------------------------------------

	public static function ajax_set_state() {
		check_ajax_referer( 'cdw_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Insufficient permissions.' ) );
		}

		$state = isset( $_POST['state'] ) ? sanitize_key( $_POST['state'] ) : '';

		if ( 'with_orders' === $state ) {
			self::create_fake_orders();
		} elseif ( 'empty' === $state ) {
			self::delete_fake_orders();
		} else {
			wp_send_json_error( array( 'message' => 'Invalid state.' ) );
		}

		wp_send_json_success();
	}

	// -------------------------------------------------------------------------
	// Order creation / deletion
	// -------------------------------------------------------------------------

	/**
	 * Get or create dummy products to add as line items on fake orders.
	 */
	private static function get_dummy_products() {
		$existing = get_option( self::FAKE_PRODUCTS_KEY, array() );

		// Return existing products if they still exist.
		if ( ! empty( $existing ) ) {
			$valid = array();
			foreach ( $existing as $pid ) {
				$product = wc_get_product( $pid );
				if ( $product ) {
					$valid[] = $product;
				}
			}
			if ( count( $valid ) >= 5 ) {
				return $valid;
			}
		}

		$catalog = array(
			array( 'name' => 'Ceramic Coffee Mug - Sage Green', 'sku' => 'MUG-SG-001',  'price' => '35.00' ),
			array( 'name' => 'Wool Throw Blanket - Navy',       'sku' => 'BLK-NV-012',  'price' => '120.00' ),
			array( 'name' => 'Scented Soy Candle - Lavender',   'sku' => 'CND-LV-008',  'price' => '28.00' ),
			array( 'name' => 'Linen Table Runner - Natural',    'sku' => 'TBR-NT-003',  'price' => '45.00' ),
			array( 'name' => 'Hand-Poured Soap Set',            'sku' => 'SOP-SET-005', 'price' => '22.00' ),
			array( 'name' => 'Stoneware Dinner Plate',          'sku' => 'PLT-SW-014',  'price' => '38.00' ),
			array( 'name' => 'Cotton Napkin Set (4)',            'sku' => 'NAP-CT-009',  'price' => '18.00' ),
			array( 'name' => 'Bamboo Cutting Board',            'sku' => 'CBR-BB-011',  'price' => '42.00' ),
		);

		$products   = array();
		$product_ids = array();

		foreach ( $catalog as $item ) {
			// Reuse existing product with same SKU if it exists.
			$existing_id = wc_get_product_id_by_sku( $item['sku'] );
			if ( $existing_id ) {
				$product = wc_get_product( $existing_id );
				if ( $product ) {
					$products[]    = $product;
					$product_ids[] = $product->get_id();
					continue;
				}
			}

			$product = new WC_Product_Simple();
			$product->set_name( $item['name'] );
			$product->set_sku( $item['sku'] );
			$product->set_regular_price( $item['price'] );
			$product->set_status( 'publish' );
			$product->save();

			$products[]   = $product;
			$product_ids[] = $product->get_id();
		}

		update_option( self::FAKE_PRODUCTS_KEY, $product_ids );

		return $products;
	}

	/**
	 * Add random line items (1–6 products, qty 1–3 each) to an order.
	 * Recalculates the order total from actual line items.
	 */
	private static function add_line_items( $order, $products, $item_count = null ) {
		if ( null === $item_count ) {
			$item_count = wp_rand( 1, 6 );
		}

		// Pick random products without repeating.
		$picks = (array) array_rand( $products, min( $item_count, count( $products ) ) );

		foreach ( $picks as $idx ) {
			$qty = wp_rand( 1, 3 );
			$order->add_product( $products[ $idx ], $qty );
		}

		$order->calculate_totals();
	}

	private static function create_fake_orders() {
		// If fake orders exist but have no line items (old code), delete and recreate.
		$existing = get_option( self::FAKE_ORDERS_KEY, array() );
		if ( ! empty( $existing ) ) {
			$needs_rebuild = false;
			foreach ( $existing as $oid ) {
				$order = wc_get_order( $oid );
				if ( $order && count( $order->get_items() ) === 0 ) {
					$needs_rebuild = true;
					break;
				}
			}
			if ( $needs_rebuild ) {
				self::delete_fake_orders();
			} else {
				return;
			}
		}

		if ( ! class_exists( 'WC_Order' ) ) {
			return;
		}

		$products  = self::get_dummy_products();
		$order_ids = array();

		// Order 1: Completed order — Sarah Johnson.
		$order = wc_create_order( array( 'status' => 'completed' ) );
		$order->set_billing_first_name( 'Sarah' );
		$order->set_billing_last_name( 'Johnson' );
		$order->set_billing_email( 'sarah@example.com' );
		$order->set_billing_address_1( '123 Main St' );
		$order->set_billing_city( 'Portland' );
		$order->set_billing_state( 'OR' );
		$order->set_billing_postcode( '97201' );
		$order->set_billing_country( 'US' );
		$order->set_payment_method( 'cod' );
		$order->set_payment_method_title( 'Cash on delivery' );
		self::add_line_items( $order, $products, 4 );
		$order->save();
		$order->add_order_note( 'Payment received via Cash on delivery.' );
		$order->add_order_note( 'Order status changed from Processing to Completed.', false, true );
		$order->add_order_note( 'Shipping label created — tracking #1Z999AA10123456784.' );
		$order->add_order_note( 'Order completed email sent to sarah@example.com.', false, true );
		$order_ids[] = $order->get_id();

		// Order 2: Processing order — Mike Chen.
		$order = wc_create_order( array( 'status' => 'processing' ) );
		$order->set_billing_first_name( 'Mike' );
		$order->set_billing_last_name( 'Chen' );
		$order->set_billing_email( 'mike@example.com' );
		$order->set_billing_address_1( '456 Oak Ave' );
		$order->set_billing_city( 'Seattle' );
		$order->set_billing_state( 'WA' );
		$order->set_billing_postcode( '98101' );
		$order->set_billing_country( 'US' );
		$order->set_payment_method( 'bacs' );
		$order->set_payment_method_title( 'Direct bank transfer' );
		self::add_line_items( $order, $products, 3 );
		$order->save();
		$order->add_order_note( 'Payment of €245.00 received via Direct bank transfer.' );
		$order->add_order_note( 'Order confirmation email sent to mike@example.com.', false, true );
		$order->add_order_note( 'Customer requested gift wrapping.', true );
		$order->add_order_note( 'Stock levels reduced for Wool Throw Blanket (1).', false, true );
		$order_ids[] = $order->get_id();

		// Order 3: On-hold order — Emma Wilson.
		$order = wc_create_order( array( 'status' => 'on-hold' ) );
		$order->set_billing_first_name( 'Emma' );
		$order->set_billing_last_name( 'Wilson' );
		$order->set_billing_email( 'emma@example.com' );
		$order->set_billing_address_1( '789 Pine Rd' );
		$order->set_billing_city( 'Austin' );
		$order->set_billing_state( 'TX' );
		$order->set_billing_postcode( '78701' );
		$order->set_billing_country( 'US' );
		$order->set_payment_method( 'cod' );
		$order->set_payment_method_title( 'Cash on delivery' );
		self::add_line_items( $order, $products, 1 );
		$order->save();
		$order->add_order_note( 'Awaiting payment — order placed via Cash on delivery.' );
		$order->add_order_note( 'Order on-hold email sent to emma@example.com.', false, true );
		$order_ids[] = $order->get_id();

		// Order 4: Pending payment — Alex Rivera.
		$order = wc_create_order( array( 'status' => 'pending' ) );
		$order->set_billing_first_name( 'Alex' );
		$order->set_billing_last_name( 'Rivera' );
		$order->set_billing_email( 'alex@example.com' );
		$order->set_billing_address_1( '321 Elm Blvd' );
		$order->set_billing_city( 'Denver' );
		$order->set_billing_state( 'CO' );
		$order->set_billing_postcode( '80202' );
		$order->set_billing_country( 'US' );
		$order->set_payment_method( 'bacs' );
		$order->set_payment_method_title( 'Direct bank transfer' );
		self::add_line_items( $order, $products, 5 );
		$order->save();
		$order->add_order_note( 'Awaiting Direct bank transfer payment.' );
		$order->add_order_note( 'New order email sent to admin.', false, true );
		$order_ids[] = $order->get_id();

		// Order 5: Refunded order — Jordan Lee.
		$order = wc_create_order( array( 'status' => 'refunded' ) );
		$order->set_billing_first_name( 'Jordan' );
		$order->set_billing_last_name( 'Lee' );
		$order->set_billing_email( 'jordan@example.com' );
		$order->set_billing_address_1( '555 Cedar Ln' );
		$order->set_billing_city( 'Chicago' );
		$order->set_billing_state( 'IL' );
		$order->set_billing_postcode( '60601' );
		$order->set_billing_country( 'US' );
		$order->set_payment_method( 'cod' );
		$order->set_payment_method_title( 'Cash on delivery' );
		self::add_line_items( $order, $products, 2 );
		$order->save();
		$order->add_order_note( 'Payment of €72.00 received via Cash on delivery.' );
		$order->add_order_note( 'Order status changed from Processing to Completed.', false, true );
		$order->add_order_note( 'Customer requested a refund — item arrived damaged.', true );
		$order->add_order_note( 'Refund of €72.00 processed successfully.' );
		$order->add_order_note( 'Order status changed from Completed to Refunded.', false, true );
		$order_ids[] = $order->get_id();

		update_option( self::FAKE_ORDERS_KEY, $order_ids );
	}

	private static function delete_fake_orders() {
		$order_ids = get_option( self::FAKE_ORDERS_KEY, array() );

		if ( ! empty( $order_ids ) ) {
			foreach ( $order_ids as $order_id ) {
				$order = wc_get_order( $order_id );
				if ( $order ) {
					$order->delete( true );
				}
			}
			delete_option( self::FAKE_ORDERS_KEY );
		}

		// Also clean up dummy products.
		$product_ids = get_option( self::FAKE_PRODUCTS_KEY, array() );
		if ( ! empty( $product_ids ) ) {
			foreach ( $product_ids as $pid ) {
				$product = wc_get_product( $pid );
				if ( $product ) {
					$product->delete( true );
				}
			}
			delete_option( self::FAKE_PRODUCTS_KEY );
		}
	}
}
