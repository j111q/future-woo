<?php
/**
 * Registers the Marketing > Campaigns and Analytics > Marketing wc-admin
 * pages and enqueues the React bundles that mount there.
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

	const ANALYTICS_PAGE_ID   = 'future-woo-analytics-marketing';
	const ANALYTICS_PATH      = '/analytics/marketing';
	const ANALYTICS_SCRIPT_ID = 'future-woo-marketing-analytics';

	public function __construct() {
		add_filter( 'woocommerce_marketing_menu_items', array( $this, 'register_page' ) );
		add_filter( 'woocommerce_analytics_report_menu_items', array( $this, 'register_analytics_page' ) );
		add_filter( 'woocommerce_admin_menu_tree', array( $this, 'remove_campaigns_nav_until_connected' ), 20, 3 );
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
		if ( ! MCC_Data::has_connected_channel() ) {
			return $pages;
		}

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
	 * Remove the synthetic Marketing > Campaigns rail item until there is a
	 * connected marketing channel to run campaigns from.
	 */
	public function remove_campaigns_nav_until_connected( array $tree, array $menu, array $submenu ): array {
		if ( MCC_Data::has_connected_channel() ) {
			return $tree;
		}

		unset( $tree['wc-admin&path=/marketing/campaigns'] );

		foreach ( $tree as $slug => $node ) {
			if ( ( $node['url'] ?? '' ) === 'admin.php?page=wc-admin&path=/marketing/campaigns' ) {
				unset( $tree[ $slug ] );
			}
		}

		return $tree;
	}

	/**
	 * Add "Marketing" to the Analytics reports menu. The React route is
	 * registered in src/analytics/index.tsx.
	 */
	public function register_analytics_page( $pages ) {
		$pages[] = array(
			'id'     => self::ANALYTICS_PAGE_ID,
			'title'  => __( 'Marketing', 'multichannel-campaigns' ),
			'parent' => 'woocommerce-analytics',
			'path'   => self::ANALYTICS_PATH,
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

		$campaigns_asset_file = WAR_PATH . 'assets/js/campaigns/index.asset.php';
		$analytics_asset_file = WAR_PATH . 'assets/js/analytics/index.asset.php';
		$boot                 = $this->get_boot_payload();

		if ( file_exists( $campaigns_asset_file ) ) {
			$campaigns_asset = include $campaigns_asset_file;
			wp_enqueue_script(
				self::SCRIPT_ID,
				WAR_URL . 'assets/js/campaigns/index.js',
				$campaigns_asset['dependencies'],
				$campaigns_asset['version'],
				true
			);
			wp_enqueue_style(
				self::SCRIPT_ID,
				WAR_URL . 'assets/js/campaigns/style-index.css',
				array( 'wp-components' ),
				$campaigns_asset['version']
			);
			wp_localize_script( self::SCRIPT_ID, 'MCC_BOOT', $boot );
		} else {
			$this->warn_missing_asset( 'assets/js/campaigns/index.asset.php' );
		}

		if ( file_exists( $analytics_asset_file ) ) {
			$analytics_asset = include $analytics_asset_file;
			$analytics_style_dependencies = array( 'wp-components' );
			wp_enqueue_script(
				self::ANALYTICS_SCRIPT_ID,
				WAR_URL . 'assets/js/analytics/index.js',
				$analytics_asset['dependencies'],
				$analytics_asset['version'],
				true
			);
			if ( file_exists( WAR_PATH . 'assets/js/analytics/index.css' ) ) {
				wp_enqueue_style(
					self::ANALYTICS_SCRIPT_ID . '-charts',
					WAR_URL . 'assets/js/analytics/index.css',
					array( 'wp-components' ),
					$analytics_asset['version']
				);
				$analytics_style_dependencies[] = self::ANALYTICS_SCRIPT_ID . '-charts';
			}
			wp_enqueue_style(
				self::ANALYTICS_SCRIPT_ID,
				WAR_URL . 'assets/js/analytics/style-index.css',
				$analytics_style_dependencies,
				$analytics_asset['version']
			);
			wp_localize_script( self::ANALYTICS_SCRIPT_ID, 'MCC_BOOT', $boot );
		} else {
			$this->warn_missing_asset( 'assets/js/analytics/index.asset.php' );
		}
	}

	private function get_boot_payload() {
		$business_location = '';
		if ( function_exists( 'WC' ) && WC()->countries ) {
			$base_country       = WC()->countries->get_base_country();
			$countries          = WC()->countries->get_countries();
			$business_location  = isset( $countries[ $base_country ] ) ? $countries[ $base_country ] : $base_country;
		}

		return array(
			'restUrl'          => esc_url_raw( rest_url( MCC_REST::NAMESPACE . '/' ) ),
			'nonce'            => wp_create_nonce( 'wp_rest' ),
			'campaigns'        => MCC_Data::get_campaigns(),
			'channels'         => MCC_Data::get_channels(),
			'rollup'           => MCC_Data::get_rollup(),
			'marketingAnalytics' => MCC_Data::get_marketing_analytics(),
			'hasConnectedMarketingChannel' => MCC_Data::has_connected_channel(),
			'path'             => self::PATH,
			'businessLocation' => $business_location,
		);
	}

	private function warn_missing_asset( $asset_path ) {
		add_action( 'admin_footer', function () use ( $asset_path ) {
			printf(
				'<script>console.warn("[future-woo] %s missing. Run `npm run build` in the plugin directory.");</script>',
				esc_js( $asset_path )
			);
		} );
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
