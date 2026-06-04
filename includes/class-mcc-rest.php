<?php
/**
 * REST routes that back the React UI. Read-only for the prototype.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

class MCC_REST {

	const NAMESPACE = 'mcc/v1';

	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route( self::NAMESPACE, '/campaigns', array(
			'methods'  => 'GET',
			'callback' => array( $this, 'list_campaigns' ),
			'permission_callback' => array( $this, 'can_view' ),
		) );

		register_rest_route( self::NAMESPACE, '/campaigns/(?P<id>\d+)', array(
			'methods'  => 'GET',
			'callback' => array( $this, 'get_campaign' ),
			'permission_callback' => array( $this, 'can_view' ),
			'args'     => array( 'id' => array( 'sanitize_callback' => 'absint' ) ),
		) );

		register_rest_route( self::NAMESPACE, '/channels', array(
			'methods'  => 'GET',
			'callback' => array( $this, 'list_channels' ),
			'permission_callback' => array( $this, 'can_view' ),
		) );

		register_rest_route( self::NAMESPACE, '/rollup', array(
			'methods'  => 'GET',
			'callback' => array( $this, 'get_rollup' ),
			'permission_callback' => array( $this, 'can_view' ),
		) );
	}

	public function can_view() {
		return current_user_can( 'manage_woocommerce' ) || current_user_can( 'manage_options' );
	}

	public function list_campaigns()        { return rest_ensure_response( MCC_Data::get_campaigns() ); }
	public function list_channels()         { return rest_ensure_response( MCC_Data::get_channels() ); }
	public function get_rollup()            { return rest_ensure_response( MCC_Data::get_rollup() ); }
	public function get_campaign( $req )    {
		$detail = MCC_Data::get_campaign_detail( $req['id'] );
		if ( ! $detail ) return new WP_Error( 'not_found', 'Campaign not found', array( 'status' => 404 ) );
		return rest_ensure_response( $detail );
	}
}
