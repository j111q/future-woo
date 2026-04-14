<?php
/**
 * REST API endpoints for shipping operations (fulfillment).
 *
 * Mirrors CIAB Admin's fulfillment and operations architecture:
 *   - woocommerce-shipping-next plugin registers the "Operations" menu item
 *   - The fulfillment route provides label purchase and manual shipment entry
 *   - FulfillmentType enum: PurchaseLabel | ManualEntry
 *
 * @see ciab-admin/wordpress/plugins/woocommerce-shipping-next/woocommerce-shipping-next.php
 * @see ciab-admin/wordpress/plugins/woocommerce-next/routes/fulfillment/stage.tsx
 * @see ciab-admin/wordpress/plugins/woocommerce-next/routes/fulfillment/types.ts
 *
 * @package WooCommerceShippingSetup
 */

namespace WAR;

class Shipping_Operations_API {

	const SETTINGS_KEY = 'wss_operations_settings';

	/**
	 * Initialize REST API routes.
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * Register REST routes for operations/fulfillment settings.
	 *
	 * In CIAB, the operations section integrates WC Shipping for label purchase
	 * and manual fulfillment entry. Here we expose the configuration surface.
	 */
	public static function register_routes() {
		// Operations settings.
		register_rest_route( 'wss/v1', '/operations/settings', array(
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'get_settings' ),
				'permission_callback' => array( __CLASS__, 'check_permissions' ),
			),
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'update_settings' ),
				'permission_callback' => array( __CLASS__, 'check_permissions' ),
			),
		) );

		// Available shipping providers (mirrors ShippingProviderSelect component).
		register_rest_route( 'wss/v1', '/operations/providers', array(
			'methods'             => 'GET',
			'callback'            => array( __CLASS__, 'get_providers' ),
			'permission_callback' => array( __CLASS__, 'check_permissions' ),
		) );

		// Order fulfillment records.
		register_rest_route( 'wss/v1', '/operations/fulfillments', array(
			'methods'             => 'GET',
			'callback'            => array( __CLASS__, 'get_fulfillments' ),
			'permission_callback' => array( __CLASS__, 'check_permissions' ),
		) );
	}

	/**
	 * Get operations settings.
	 *
	 * Includes: label printing preferences, default provider, fulfillment API toggle.
	 *
	 * @see ciab-admin: woocommerce-shipping-next activation sets wcshipping_use_fulfillment_api
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_settings() {
		$defaults = array(
			'fulfillment_enabled'  => true,
			'default_provider'     => '',
			'label_size'           => 'letter',
			'auto_fulfill'         => false,
			'tracking_email'       => true,
		);
		$settings = get_option( self::SETTINGS_KEY, $defaults );
		$settings = wp_parse_args( $settings, $defaults );

		return rest_ensure_response( $settings );
	}

	/**
	 * Update operations settings.
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function update_settings( $request ) {
		$current = get_option( self::SETTINGS_KEY, array() );
		$allowed = array( 'fulfillment_enabled', 'default_provider', 'label_size', 'auto_fulfill', 'tracking_email' );
		$updated = array();

		foreach ( $allowed as $key ) {
			$value = $request->get_param( $key );
			if ( null !== $value ) {
				if ( is_bool( $value ) || in_array( $key, array( 'fulfillment_enabled', 'auto_fulfill', 'tracking_email' ), true ) ) {
					$updated[ $key ] = (bool) $value;
				} else {
					$updated[ $key ] = sanitize_text_field( $value );
				}
			}
		}

		// Handle sender_addresses array (matches Figma "Sender addresses" card).
		$sender_addresses = $request->get_param( 'sender_addresses' );
		if ( null !== $sender_addresses && is_array( $sender_addresses ) ) {
			$updated['sender_addresses'] = array_map( function ( $addr ) {
				return array(
					'name'              => sanitize_text_field( $addr['name'] ?? '' ),
					'address'           => sanitize_text_field( $addr['address'] ?? '' ),
					'is_active'         => ! empty( $addr['is_active'] ),
					'is_default_sender' => ! empty( $addr['is_default_sender'] ),
					'is_default_return' => ! empty( $addr['is_default_return'] ),
				);
			}, $sender_addresses );
		}

		// Handle pickup_locations array (matches Figma "Pickup location" card).
		$pickup_locations = $request->get_param( 'pickup_locations' );
		if ( null !== $pickup_locations && is_array( $pickup_locations ) ) {
			$updated['pickup_locations'] = array_map( function ( $loc ) {
				return array(
					'name'    => sanitize_text_field( $loc['name'] ?? '' ),
					'address' => sanitize_text_field( $loc['address'] ?? '' ),
					'enabled' => isset( $loc['enabled'] ) ? (bool) $loc['enabled'] : true,
				);
			}, $pickup_locations );
		}

		$merged = wp_parse_args( $updated, $current );
		update_option( self::SETTINGS_KEY, $merged );

		return rest_ensure_response( $merged );
	}

	/**
	 * Get available shipping providers.
	 *
	 * In CIAB, the fulfillment route uses a ShippingProviderSelect component
	 * that pulls carriers from WC Shipping.
	 *
	 * @see ciab-admin: routes/fulfillment/components/shipping-provider-select.tsx
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_providers() {
		// Static list — in production this would integrate with WC Shipping's carrier API.
		$providers = array(
			array(
				'id'   => 'usps',
				'name' => 'USPS',
				'logo' => '',
			),
			array(
				'id'   => 'ups',
				'name' => 'UPS',
				'logo' => '',
			),
			array(
				'id'   => 'fedex',
				'name' => 'FedEx',
				'logo' => '',
			),
			array(
				'id'   => 'dhl',
				'name' => 'DHL Express',
				'logo' => '',
			),
		);

		return rest_ensure_response( $providers );
	}

	/**
	 * Get recent fulfillment records.
	 *
	 * In CIAB, fulfillment records are fetched as entity records:
	 *   useEntityRecords('root', 'fulfillment', { order_id })
	 *
	 * @see ciab-admin: routes/fulfillment/stage.tsx
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_fulfillments() {
		$fulfillments = get_option( 'wss_fulfillments', array() );
		return rest_ensure_response( $fulfillments );
	}

	/**
	 * Permission check.
	 *
	 * @return bool
	 */
	public static function check_permissions() {
		return current_user_can( 'manage_woocommerce' );
	}
}
