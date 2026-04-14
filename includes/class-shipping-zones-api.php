<?php
/**
 * REST API endpoints for shipping zones and methods.
 *
 * Mirrors the CIAB data layer's entity definitions:
 *   SHIPPING_ZONE_ENTITY:          /wc/v4/shipping-zones
 *   SHIPPING_ZONE_LOCATION_ENTITY: /wc/next/shipping/zones/locations
 *   SHIPPING_ZONE_METHOD_ENTITY:   /wc/v4/shipping-zone-method
 *
 * @see ciab-admin/wordpress/plugins/woocommerce-next/packages/data/src/constants.ts
 * @see ciab-admin/wordpress/plugins/woocommerce-next/routes/shipping-zone/
 * @see ciab-admin/wordpress/plugins/woocommerce-next/routes/shipping-zone-method/
 *
 * @package WooCommerceShippingSetup
 */

namespace WAR;

class Shipping_Zones_API {

	/**
	 * Initialize REST API routes.
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * Register REST routes for zones, zone methods, and zone locations.
	 *
	 * CIAB uses @wordpress/core-data entity records with these base URLs:
	 *   - shipping_zone:          /wc/v4/shipping-zones
	 *   - shipping_zone_location: /wc/next/shipping/zones/locations
	 *   - shipping_zone_method:   /wc/v4/shipping-zone-method
	 *
	 * We wrap WooCommerce's existing endpoints and add convenience methods.
	 */
	public static function register_routes() {
		// List all zones with locations and methods (combined view like CIAB DataViews).
		register_rest_route( 'wss/v1', '/shipping-zones', array(
			'methods'             => 'GET',
			'callback'            => array( __CLASS__, 'get_zones' ),
			'permission_callback' => array( __CLASS__, 'check_permissions' ),
		) );

		// Create a new zone.
		register_rest_route( 'wss/v1', '/shipping-zones', array(
			'methods'             => 'POST',
			'callback'            => array( __CLASS__, 'create_zone' ),
			'permission_callback' => array( __CLASS__, 'check_permissions' ),
		) );

		// Update a zone.
		register_rest_route( 'wss/v1', '/shipping-zones/(?P<id>\d+)', array(
			'methods'             => 'PUT',
			'callback'            => array( __CLASS__, 'update_zone' ),
			'permission_callback' => array( __CLASS__, 'check_permissions' ),
		) );

		// Delete a zone.
		register_rest_route( 'wss/v1', '/shipping-zones/(?P<id>\d+)', array(
			'methods'             => 'DELETE',
			'callback'            => array( __CLASS__, 'delete_zone' ),
			'permission_callback' => array( __CLASS__, 'check_permissions' ),
		) );

		// Zone methods (rates).
		register_rest_route( 'wss/v1', '/shipping-zones/(?P<zone_id>\d+)/methods', array(
			'methods'             => 'GET',
			'callback'            => array( __CLASS__, 'get_zone_methods' ),
			'permission_callback' => array( __CLASS__, 'check_permissions' ),
		) );

		register_rest_route( 'wss/v1', '/shipping-zones/(?P<zone_id>\d+)/methods', array(
			'methods'             => 'POST',
			'callback'            => array( __CLASS__, 'add_zone_method' ),
			'permission_callback' => array( __CLASS__, 'check_permissions' ),
		) );
	}

	/**
	 * Get all shipping zones with their locations and methods.
	 *
	 * This replicates what CIAB's DataViews component fetches:
	 * each zone record includes `locations` and `methods` arrays.
	 *
	 * @see ciab-admin: settings-shipping-zones/constants.tsx (fields definition)
	 *
	 * @return \WP_REST_Response
	 */
	public static function get_zones() {
		$zones  = \WC_Shipping_Zones::get_zones();
		$result = array();

		foreach ( $zones as $zone_data ) {
			$zone = new \WC_Shipping_Zone( $zone_data['id'] );
			$result[] = self::format_zone( $zone );
		}

		// Include "Rest of the World" zone (id=0) — mirrors CIAB's REST_OF_WORLD_ZONE_PLACEHOLDER_ID.
		$rest_of_world = new \WC_Shipping_Zone( 0 );
		$result[] = self::format_zone( $rest_of_world );

		return rest_ensure_response( $result );
	}

	/**
	 * Create a new shipping zone.
	 *
	 * @see ciab-admin: settings-shipping-zones/add-zone-modal/index.tsx
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function create_zone( $request ) {
		$zone = new \WC_Shipping_Zone();
		$zone->set_zone_name( sanitize_text_field( $request->get_param( 'name' ) ) );
		$zone->set_zone_order( absint( $request->get_param( 'order' ) ) );
		$zone->save();

		// Add locations if provided.
		$locations = $request->get_param( 'locations' );
		if ( $locations && is_array( $locations ) ) {
			$zone->set_locations( $locations );
			$zone->save();
		}

		return rest_ensure_response( self::format_zone( $zone ) );
	}

	/**
	 * Update an existing zone.
	 *
	 * @see ciab-admin: routes/shipping-zone/edit-zone-modal/index.tsx
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function update_zone( $request ) {
		$zone = new \WC_Shipping_Zone( absint( $request['id'] ) );
		if ( ! $zone->get_id() && 0 !== absint( $request['id'] ) ) {
			return new \WP_Error( 'invalid_zone', __( 'Zone not found.', 'woocommerce-shipping-setup' ), array( 'status' => 404 ) );
		}

		if ( $request->get_param( 'name' ) ) {
			$zone->set_zone_name( sanitize_text_field( $request->get_param( 'name' ) ) );
		}
		if ( $request->get_param( 'locations' ) ) {
			$zone->set_locations( $request->get_param( 'locations' ) );
		}
		$zone->save();

		return rest_ensure_response( self::format_zone( $zone ) );
	}

	/**
	 * Delete a zone.
	 *
	 * @see ciab-admin: settings-shipping-zones/constants.tsx (getActions → delete-shipping-zone)
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function delete_zone( $request ) {
		$zone_id = absint( $request['id'] );

		// Cannot delete "Rest of the World" (mirrors CIAB's isEligible check).
		if ( 0 === $zone_id ) {
			return new \WP_Error( 'cannot_delete', __( 'Cannot delete the Rest of the World zone.', 'woocommerce-shipping-setup' ), array( 'status' => 403 ) );
		}

		\WC_Shipping_Zones::delete_zone( $zone_id );
		return rest_ensure_response( array( 'deleted' => true ) );
	}

	/**
	 * Get shipping methods for a zone.
	 *
	 * @see ciab-admin: routes/shipping-zone-method/stage.tsx
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function get_zone_methods( $request ) {
		$zone    = new \WC_Shipping_Zone( absint( $request['zone_id'] ) );
		$methods = $zone->get_shipping_methods();
		$result  = array();

		foreach ( $methods as $method ) {
			$result[] = array(
				'instance_id' => $method->get_instance_id(),
				'method_id'   => $method->id,
				'title'       => $method->get_title(),
				'enabled'     => $method->is_enabled(),
				'settings'    => $method->get_instance_form_fields(),
				'cost'        => $method->get_option( 'cost', '' ),
			);
		}

		return rest_ensure_response( $result );
	}

	/**
	 * Add a shipping method to a zone.
	 *
	 * In CIAB, this is handled by the shipping-zone-method route's form:
	 * @see ciab-admin: routes/shipping-zone-method/constants.tsx (flat_rate, free_shipping forms)
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function add_zone_method( $request ) {
		$zone = new \WC_Shipping_Zone( absint( $request['zone_id'] ) );
		$method_id = sanitize_text_field( $request->get_param( 'method_id' ) );

		$instance_id = $zone->add_shipping_method( $method_id );
		if ( ! $instance_id ) {
			return new \WP_Error( 'method_error', __( 'Could not add shipping method.', 'woocommerce-shipping-setup' ), array( 'status' => 500 ) );
		}

		// Apply settings if provided (e.g., cost for flat_rate).
		$settings = $request->get_param( 'settings' );
		if ( $settings && is_array( $settings ) ) {
			$method = \WC_Shipping_Zones::get_shipping_method( $instance_id );
			if ( $method ) {
				foreach ( $settings as $key => $value ) {
					$method->update_option( $key, sanitize_text_field( $value ) );
				}
			}
		}

		return rest_ensure_response( array(
			'instance_id' => $instance_id,
			'method_id'   => $method_id,
		) );
	}

	/**
	 * Format a WC_Shipping_Zone into the structure CIAB's DataViews expects.
	 *
	 * Mirrors the ShippingZoneEntityRecord type from @woocommerce-next/data:
	 *   { id, name, order, locations: [{code, type, name}], methods: [{instance_id, title, ...}] }
	 *
	 * @param \WC_Shipping_Zone $zone
	 * @return array
	 */
	private static function format_zone( $zone ) {
		$methods = array();
		foreach ( $zone->get_shipping_methods() as $method ) {
			$methods[] = array(
				'instance_id' => $method->get_instance_id(),
				'method_id'   => $method->id,
				'title'       => $method->get_title(),
				'enabled'     => $method->is_enabled(),
				'cost'        => $method->get_option( 'cost', '' ),
			);
		}

		$locations = array();
		foreach ( $zone->get_zone_locations() as $loc ) {
			$locations[] = array(
				'code' => $loc->code,
				'type' => $loc->type,
				'name' => self::get_location_name( $loc ),
			);
		}

		return array(
			'id'        => $zone->get_id(),
			'name'      => $zone->get_zone_name(),
			'order'     => $zone->get_zone_order(),
			'locations' => $locations,
			'methods'   => $methods,
		);
	}

	/**
	 * Resolve a location code to a human-readable name.
	 *
	 * @param object $location
	 * @return string
	 */
	private static function get_location_name( $location ) {
		$countries = WC()->countries->get_countries();
		$states    = WC()->countries->get_states();

		switch ( $location->type ) {
			case 'country':
				return $countries[ $location->code ] ?? $location->code;
			case 'state':
				list( $country, $state ) = explode( ':', $location->code );
				$country_name = $countries[ $country ] ?? $country;
				$state_name   = $states[ $country ][ $state ] ?? $state;
				return "$state_name, $country_name";
			case 'continent':
				$continents = WC()->countries->get_continents();
				return $continents[ $location->code ]['name'] ?? $location->code;
			case 'postcode':
				return $location->code;
			default:
				return $location->code;
		}
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
