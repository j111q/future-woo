<?php
/**
 * REST API endpoint for Site Visibility settings.
 *
 * GET  /war/v1/settings/site-visibility — returns current option values.
 * POST /war/v1/settings/site-visibility — saves option values.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WAR_Site_Visibility_API {

	private static $options = array(
		'woocommerce_coming_soon',
		'woocommerce_store_pages_only',
		'woocommerce_private_link',
	);

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	public static function register_routes() {
		register_rest_route( 'war/v1', '/settings/site-visibility', array(
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
		foreach ( self::$options as $key ) {
			$data[ $key ] = get_option( $key, 'no' );
		}
		return rest_ensure_response( $data );
	}

	public static function save_settings( $request ) {
		$params = $request->get_json_params();

		foreach ( self::$options as $key ) {
			if ( isset( $params[ $key ] ) ) {
				$value = sanitize_text_field( $params[ $key ] );
				update_option( $key, $value );
			}
		}

		return rest_ensure_response( array( 'success' => true ) );
	}
}
