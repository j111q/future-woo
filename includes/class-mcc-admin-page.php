<?php
/**
 * Registers the Marketing > Campaigns submenu inside wc-admin and
 * enqueues the React bundle that mounts there.
 *
 * Pattern follows plugins/woocommerce/src/Internal/Admin/Marketing.php +
 * client/admin/docs/page-controller.md (Adding a New WooCommerce Admin Page).
 *
 * Vendored into Future Woo from the standalone `multichannel-campaigns`
 * prototype (Jill Quek, ~May 2026). The bundle now builds to
 * assets/js/campaigns/ via Future Woo's own webpack config, so the enqueue
 * paths below use WAR_URL/WAR_PATH instead of the source plugin's
 * MCC_PLUGIN_* constants.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

class MCC_Admin_Page {

	const PAGE_ID   = 'mcc-campaigns';
	const PATH      = '/marketing/campaigns';
	const SCRIPT_ID = 'multichannel-campaigns';

	public function __construct() {
		add_filter( 'woocommerce_marketing_menu_items', array( $this, 'register_page' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue' ) );
		// wc-admin's PageController::register_page() writes a path like
		// `wc-admin&path=/marketing/campaigns` directly into the wp_submenu
		// array, missing the `admin.php?page=` prefix. WC core patches its
		// own Overview submenu the same way (see Internal/Admin/Marketing.php
		// register_overview_page()). Mirror that workaround for our entry.
		add_action( 'admin_menu', array( $this, 'fix_submenu_url' ), 100 );
	}

	/**
	 * Add "Campaigns" to the Marketing submenu. wc-admin renders it
	 * inside its React shell, so we get the WC header + breadcrumbs free.
	 */
	public function register_page( $pages ) {
		$pages[] = array(
			'id'         => self::PAGE_ID,
			'title'      => __( 'Campaigns', 'multichannel-campaigns' ),
			'path'       => self::PATH,
			'capability' => 'manage_woocommerce',
			'nav_args'   => array(
				'order'  => 2,
				'parent' => 'woocommerce-marketing',
			),
		);
		return $pages;
	}

	/**
	 * Enqueue the bundle on wc-admin pages. wc-admin loads its full app
	 * on ?page=wc-admin URLs; our addFilter runs there and mounts when
	 * the path matches.
	 */
	public function enqueue( $hook ) {
		// wc-admin hook is toplevel_page_wc-admin or any *_page_wc-admin.
		if ( ! function_exists( 'wc_admin_url' ) ) return;
		if ( ! $this->is_wc_admin_page( $hook ) ) return;

		$asset_file = WAR_PATH . 'assets/js/campaigns/index.asset.php';
		if ( ! file_exists( $asset_file ) ) {
			// Build hasn't run yet — emit a console warning so the developer
			// knows to `npm run build`.
			add_action( 'admin_footer', function () {
				echo '<script>console.warn("[future-woo] assets/js/campaigns/index.asset.php missing. Run `npm run build` in the plugin directory.");</script>';
			} );
			return;
		}

		$asset = include $asset_file;

		wp_enqueue_script(
			self::SCRIPT_ID,
			WAR_URL . 'assets/js/campaigns/index.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			self::SCRIPT_ID,
			WAR_URL . 'assets/js/campaigns/style-index.css',
			array( 'wp-components' ),
			$asset['version']
		);

		wp_localize_script( self::SCRIPT_ID, 'MCC_BOOT', array(
			'restUrl'   => esc_url_raw( rest_url( MCC_REST::NAMESPACE . '/' ) ),
			'nonce'     => wp_create_nonce( 'wp_rest' ),
			'campaigns' => MCC_Data::get_campaigns(),
			'channels'  => MCC_Data::get_channels(),
			'rollup'    => MCC_Data::get_rollup(),
			'path'      => self::PATH,
		) );
	}

	/**
	 * Rewrite the broken wc-admin submenu URL into a working admin.php one.
	 * Runs at admin_menu priority 100, after wc-admin's PageController has
	 * registered everything at priority 9 / 10.
	 */
	public function fix_submenu_url() {
		global $submenu;
		if ( ! isset( $submenu['woocommerce-marketing'] ) ) return;

		foreach ( $submenu['woocommerce-marketing'] as &$item ) {
			// $item[2] is the slug. Items that came through wc-admin's
			// register_page() look like `wc-admin&path=/marketing/...`.
			// Items that were already correct (or that we want to leave
			// alone) start with `admin.php?` or another known prefix.
			if ( isset( $item[2] ) && 0 === strpos( $item[2], 'wc-admin' ) ) {
				$item[2] = 'admin.php?page=' . $item[2];
			}
		}
	}

	private function is_wc_admin_page( $hook ) {
		// wc-admin's admin pages all hang off ?page=wc-admin.
		// The hook suffix varies (toplevel_page_wc-admin, woocommerce_page_wc-admin, etc.).
		if ( strpos( $hook, 'wc-admin' ) !== false ) return true;
		$page = isset( $_GET['page'] ) ? sanitize_key( $_GET['page'] ) : '';
		return $page === 'wc-admin';
	}
}
