<?php
/**
 * REST API endpoints for pickup location management.
 *
 * Mirrors CIAB Admin's pickup settings architecture:
 *   - Settings stored via WP Settings API (site entity in core-data)
 *   - pickup_location_settings: { enabled, title, cost, tax_status }
 *   - pickup_locations: PickupLocation[]
 *
 * @see ciab-admin/wordpress/plugins/woocommerce-next/routes/settings-shipping-pickup/stage.tsx
 * @see ciab-admin/wordpress/plugins/woocommerce-next/routes/settings-shipping-pickup/constants.tsx
 * @see ciab-admin/wordpress/plugins/woocommerce-next/routes/settings-shipping-pickup/location-modal.tsx
 *
 * @package WooCommerceShippingSetup
 */

namespace WAR;

class Shipping_Pickup_API {

	const SETTINGS_KEY  = 'wss_pickup_settings';
	const LOCATIONS_KEY = 'wss_pickup_locations';

	/**
	 * Initialize REST API routes.
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * Register REST routes for pickup settings and locations.
	 *
	 * In CIAB, this data is managed via the WP Site entity ('root', 'site')
	 * through editEntityRecord/saveEntityRecord. Here we expose dedicated endpoints.
	 */
	public static function register_routes() {
		// Pickup settings (enable/disable, title, fees).
		register_rest_route( 'wss/v1', '/pickup/settings', array(
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

		// Pickup locations CRUD.
		register_rest_route( 'wss/v1', '/pickup/locations', array(
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'get_locations' ),
				'permission_callback' => array( __CLASS__, 'check_permissions' ),
			),
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'save_location' ),
				'permission_callback' => array( __CLASS__, 'check_permissions' ),
			),
		) );

		register_rest_route( 'wss/v1', '/pickup/locations/(?P<index>\d+)', array(
			array(
				'methods'             => 'PUT',
				'callback'            => array( __CLASS__, 'update_location' ),
				'permission_callback' => array( __CLASS__, 'check_permissions' ),
			),
			array(
				'methods'             => 'DELETE',
				'callback'            => array( __CLASS__, 'delete_location' ),
				'permission_callback' => array( __CLASS__, 'check_permissions' ),
			),
		) );

		// Toggle location enabled/disabled.
		register_rest_route( 'wss/v1', '/pickup/locations/(?P<index>\d+)/toggle', array(
			'methods'             => 'POST',
			'callback'            => array( __CLASS__, 'toggle_location' ),
			'permission_callback' => array( __CLASS__, 'check_permissions' ),
		) );
	}

	/**
	 * Get pickup settings.
	 *
	 * Mirrors CIAB's pickup_location_settings shape:
	 *   { enabled: 'yes'|'no', title: string, cost: string, tax_status: 'taxable'|'none' }
	 *
	 * @see ciab-admin: settings-shipping-pickup/constants.tsx (settingsFields)
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_settings() {
		$defaults = array(
			'enabled'    => 'no',
			'title'      => '',
			'cost'       => '',
			'tax_status' => 'none',
		);
		$settings = get_option( self::SETTINGS_KEY, $defaults );
		$settings = wp_parse_args( $settings, $defaults );

		return rest_ensure_response( $settings );
	}

	/**
	 * Update pickup settings.
	 *
	 * @see ciab-admin: settings-shipping-pickup/stage.tsx (handleChange, handleSave)
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function update_settings( $request ) {
		$current  = get_option( self::SETTINGS_KEY, array() );
		$allowed  = array( 'enabled', 'title', 'cost', 'tax_status' );
		$updated  = array();

		foreach ( $allowed as $key ) {
			$value = $request->get_param( $key );
			if ( null !== $value ) {
				$updated[ $key ] = sanitize_text_field( $value );
			}
		}

		$merged = wp_parse_args( $updated, $current );
		update_option( self::SETTINGS_KEY, $merged );

		return rest_ensure_response( $merged );
	}

	/**
	 * Get all pickup locations.
	 *
	 * Returns PickupLocation[] matching CIAB's type:
	 *   { enabled: boolean, name: string, details: string, address: { address_1, city, state, postcode, country } }
	 *
	 * @see ciab-admin: settings-shipping-pickup/location-modal.tsx (initialLocation shape)
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_locations() {
		$locations = get_option( self::LOCATIONS_KEY, array() );
		return rest_ensure_response( $locations );
	}

	/**
	 * Save (add) a new pickup location.
	 *
	 * @see ciab-admin: settings-shipping-pickup/location-modal.tsx (handleSave for new location)
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function save_location( $request ) {
		$locations = get_option( self::LOCATIONS_KEY, array() );
		$location  = self::sanitize_location( $request->get_json_params() );
		$locations[] = $location;
		update_option( self::LOCATIONS_KEY, $locations );

		return rest_ensure_response( $locations );
	}

	/**
	 * Update an existing pickup location by index.
	 *
	 * @see ciab-admin: settings-shipping-pickup/location-modal.tsx (handleSave for edit)
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function update_location( $request ) {
		$locations = get_option( self::LOCATIONS_KEY, array() );
		$index     = absint( $request['index'] );

		if ( ! isset( $locations[ $index ] ) ) {
			return new \WP_Error( 'not_found', __( 'Location not found.', 'woocommerce-shipping-setup' ), array( 'status' => 404 ) );
		}

		$locations[ $index ] = self::sanitize_location( $request->get_json_params() );
		update_option( self::LOCATIONS_KEY, $locations );

		return rest_ensure_response( $locations );
	}

	/**
	 * Delete a pickup location by index.
	 *
	 * @see ciab-admin: settings-shipping-pickup/stage.tsx (handleDelete)
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function delete_location( $request ) {
		$locations = get_option( self::LOCATIONS_KEY, array() );
		$index     = absint( $request['index'] );

		if ( ! isset( $locations[ $index ] ) ) {
			return new \WP_Error( 'not_found', __( 'Location not found.', 'woocommerce-shipping-setup' ), array( 'status' => 404 ) );
		}

		array_splice( $locations, $index, 1 );

		// If no enabled locations remain, disable pickup — mirrors CIAB behavior.
		$has_enabled = false;
		foreach ( $locations as $loc ) {
			if ( ! empty( $loc['enabled'] ) ) {
				$has_enabled = true;
				break;
			}
		}
		if ( ! $has_enabled ) {
			$settings = get_option( self::SETTINGS_KEY, array() );
			$settings['enabled'] = 'no';
			update_option( self::SETTINGS_KEY, $settings );
		}

		update_option( self::LOCATIONS_KEY, $locations );
		return rest_ensure_response( $locations );
	}

	/**
	 * Toggle a location's enabled state.
	 *
	 * @see ciab-admin: settings-shipping-pickup/stage.tsx (handleToggleLocation)
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function toggle_location( $request ) {
		$locations = get_option( self::LOCATIONS_KEY, array() );
		$index     = absint( $request['index'] );

		if ( ! isset( $locations[ $index ] ) ) {
			return new \WP_Error( 'not_found', __( 'Location not found.', 'woocommerce-shipping-setup' ), array( 'status' => 404 ) );
		}

		$locations[ $index ]['enabled'] = ! $locations[ $index ]['enabled'];

		// Auto-disable pickup settings if no locations are active.
		$has_enabled = false;
		foreach ( $locations as $loc ) {
			if ( ! empty( $loc['enabled'] ) ) {
				$has_enabled = true;
				break;
			}
		}
		if ( ! $has_enabled ) {
			$settings = get_option( self::SETTINGS_KEY, array() );
			$settings['enabled'] = 'no';
			update_option( self::SETTINGS_KEY, $settings );
		}

		update_option( self::LOCATIONS_KEY, $locations );
		return rest_ensure_response( $locations );
	}

	/**
	 * Sanitize a pickup location object.
	 *
	 * Ensures the shape matches CIAB's PickupLocation type:
	 *   { enabled, name, details, address: { address_1, city, state, postcode, country } }
	 *
	 * @param array $data Raw location data.
	 * @return array
	 */
	private static function sanitize_location( $data ) {
		$address = isset( $data['address'] ) ? $data['address'] : array();
		return array(
			'enabled'  => isset( $data['enabled'] ) ? (bool) $data['enabled'] : true,
			'name'     => sanitize_text_field( $data['name'] ?? '' ),
			'details'  => sanitize_textarea_field( $data['details'] ?? '' ),
			'address'  => array(
				'address_1' => sanitize_text_field( $address['address_1'] ?? '' ),
				'city'      => sanitize_text_field( $address['city'] ?? '' ),
				'state'     => sanitize_text_field( $address['state'] ?? '' ),
				'postcode'  => sanitize_text_field( $address['postcode'] ?? '' ),
				'country'   => sanitize_text_field( $address['country'] ?? 'US' ),
			),
		);
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
