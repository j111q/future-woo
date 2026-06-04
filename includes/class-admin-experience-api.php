<?php
/**
 * REST API endpoint for Admin Experience settings.
 *
 * GET  /war/v1/settings/admin-experience — returns current option values.
 * POST /war/v1/settings/admin-experience — saves option values.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WAR_Admin_Experience_API {

	/**
	 * Default values.
	 */
	private static $defaults = array(
		'war_show_store_menu'  => 'yes',
	);

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	public static function register_routes() {
		register_rest_route( 'war/v1', '/settings/admin-experience', array(
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'get_settings' ),
				'permission_callback' => array( __CLASS__, 'check_permission' ),
			),
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'save_settings' ),
				'permission_callback' => array( __CLASS__, 'check_permission' ),
			),
		) );
	}

	public static function check_permission() {
		return current_user_can( 'manage_woocommerce' );
	}

	public static function get_settings() {
		$data = array();
		foreach ( self::$defaults as $key => $default ) {
			$data[ $key ] = get_option( $key, $default );
		}
		return rest_ensure_response( $data );
	}

	public static function save_settings( $request ) {
		$params = $request->get_json_params();

		foreach ( self::$defaults as $key => $default ) {
			if ( isset( $params[ $key ] ) ) {
				update_option( $key, sanitize_text_field( $params[ $key ] ) );
			}
		}

		return rest_ensure_response( array( 'success' => true ) );
	}

	/**
	 * Check if "Show Store menu in top bar" is enabled.
	 */
	public static function is_store_menu_enabled(): bool {
		return get_option( 'war_show_store_menu', 'yes' ) === 'yes';
	}
}
