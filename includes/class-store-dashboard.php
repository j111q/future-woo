<?php
/**
 * Store Dashboard — a WooCommerce-focused dashboard page.
 *
 * When "Open WooCommerce by default" is enabled, this page replaces the
 * WordPress dashboard as the landing page. It renders only store-related
 * widgets using the same layout system as core WP dashboard.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WAR_Store_Dashboard {

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register_page' ) );

		if ( WAR_Admin_Experience_API::is_default_to_store() ) {
			add_action( 'load-index.php', array( __CLASS__, 'maybe_redirect' ) );
		}
	}

	public static function register_page() {
		$hook = add_submenu_page(
			null,
			__( 'Dashboard', 'woo-admin-revamp' ),
			__( 'Dashboard', 'woo-admin-revamp' ),
			'manage_woocommerce',
			'war-store-dashboard',
			array( __CLASS__, 'render' )
		);

		if ( $hook ) {
			add_action( "load-{$hook}", array( __CLASS__, 'setup_screen' ) );
		}
	}

	public static function setup_screen() {
		$screen = get_current_screen();
		if ( $screen ) {
			$screen->set_parentage( 'admin.php' );
		}

		// Don't register layout_columns — this hides the Layout radio buttons.
		// Instead we render all 4 containers and let CSS handle responsive sizing.

		self::register_widgets();

		wp_enqueue_style( 'dashboard' );
		wp_enqueue_script( 'dashboard' );
		wp_enqueue_script( 'postbox' );

		wp_enqueue_style(
			'war-store-dashboard',
			WAR_URL . 'assets/css/dashboard-widgets.css',
			array(),
			WAR_VERSION
		);
		wp_enqueue_script(
			'war-store-dashboard-js',
			WAR_URL . 'assets/js/dashboard-widgets.js',
			array( 'jquery' ),
			WAR_VERSION,
			true
		);
		wp_localize_script( 'war-store-dashboard-js', 'cdwData', array(
			'ajaxUrl'           => admin_url( 'admin-ajax.php' ),
			'nonce'             => wp_create_nonce( 'cdw_nonce' ),
			'checkListImageUrl' => WAR_URL . 'assets/images/check-list.svg',
			'i18n'              => array(
				'guardrailTitle'      => __( 'Store Setup cannot be removed', 'woo-admin-revamp' ),
				'guardrailMessage'    => __( 'The Store Setup widget cannot be hidden until all setup tasks are complete. Please finish your store setup first.', 'woo-admin-revamp' ),
				'guardrailClose'      => __( 'Got it', 'woo-admin-revamp' ),
				'dismissAll'          => __( 'Dismiss all', 'woo-admin-revamp' ),
				'whatsNextOptions'    => __( 'Options', 'woo-admin-revamp' ),
				'whatsNextEmptyText'  => __( "You're all caught up! Check back later for new recommendations.", 'woo-admin-revamp' ),
				'readMore'            => __( 'Read more', 'woo-admin-revamp' ),
				'inboxEmpty'          => __( 'Your inbox is empty.', 'woo-admin-revamp' ),
				'inboxLoadError'      => __( 'Could not load messages.', 'woo-admin-revamp' ),
				'statsSettings'       => __( 'Stats settings', 'woo-admin-revamp' ),
			),
		) );
	}

	public static function maybe_redirect() {
		global $pagenow;
		if ( $pagenow !== 'index.php' ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( isset( $_GET['wp-dashboard'] ) ) {
			return;
		}

		if ( wp_doing_ajax() || defined( 'REST_REQUEST' ) ) {
			return;
		}

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}

		wp_safe_redirect( admin_url( 'admin.php?page=war-store-dashboard' ) );
		exit;
	}

	/**
	 * Render the Store Dashboard with responsive columns.
	 */
	public static function render() {
		$screen    = get_current_screen();
		$screen_id = $screen->id;

		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Dashboard', 'woo-admin-revamp' ); ?></h1>

			<div id="dashboard-widgets-wrap">
				<div id="dashboard-widgets" class="metabox-holder">
					<div id="postbox-container-1" class="postbox-container">
						<?php do_meta_boxes( $screen_id, 'normal', '' ); ?>
					</div>
					<div id="postbox-container-2" class="postbox-container">
						<?php do_meta_boxes( $screen_id, 'side', '' ); ?>
					</div>
					<div id="postbox-container-3" class="postbox-container">
						<?php do_meta_boxes( $screen_id, 'column3', '' ); ?>
					</div>
					<div id="postbox-container-4" class="postbox-container">
						<?php do_meta_boxes( $screen_id, 'column4', '' ); ?>
					</div>
				</div>

				<?php wp_nonce_field( 'closedpostboxes', 'closedpostboxesnonce', false ); ?>
				<?php wp_nonce_field( 'meta-box-order', 'meta-box-order-nonce', false ); ?>
			</div>
		</div>
		<style>
			#dashboard-widgets .postbox-container { float: left; }

			/* 4 columns on very wide screens */
			@media screen and (min-width: 1800px) {
				#dashboard-widgets .postbox-container { width: 25%; }
			}
			/* 3 columns */
			@media screen and (min-width: 1200px) and (max-width: 1799px) {
				#dashboard-widgets .postbox-container { width: 33.33%; }
				#dashboard-widgets #postbox-container-4 .empty-container { border: none; }
			}
			/* 2 columns (default) */
			@media screen and (min-width: 800px) and (max-width: 1199px) {
				#dashboard-widgets .postbox-container { width: 50%; }
				#dashboard-widgets #postbox-container-3 .empty-container,
				#dashboard-widgets #postbox-container-4 .empty-container { border: none; }
			}
			/* 1 column on narrow */
			@media screen and (max-width: 799px) {
				#dashboard-widgets .postbox-container { width: 100%; float: none; }
			}
		</style>
		<script>jQuery(document).ready(function(){ postboxes.add_postbox_toggles('<?php echo esc_js( $screen_id ); ?>'); });</script>
		<?php
	}

	private static function register_widgets() {
		require_once ABSPATH . 'wp-admin/includes/dashboard.php';

		global $wp_meta_boxes;
		$screen    = get_current_screen();
		$screen_id = $screen->id;

		// Switch to 'dashboard' screen so wp_add_dashboard_widget works,
		// then copy meta boxes to our screen.
		$original_screen = get_current_screen();
		set_current_screen( 'dashboard' );

		if ( class_exists( 'CDW_Woo_Setup_Widget' ) ) {
			CDW_Woo_Setup_Widget::register();
		}
		if ( class_exists( 'CDW_Store_Status_Widget' ) ) {
			CDW_Store_Status_Widget::register();
		}
		if ( class_exists( 'CDW_Whats_Next_Widget' ) ) {
			CDW_Whats_Next_Widget::register();
		}
		if ( class_exists( 'CDW_Store_Management_Widget' ) ) {
			CDW_Store_Management_Widget::register();
		}
		if ( class_exists( 'CDW_Stats_Widget' ) ) {
			CDW_Stats_Widget::register();
		}
		if ( class_exists( 'CDW_Woo_Inbox_Widget' ) ) {
			CDW_Woo_Inbox_Widget::register();
		}

		// Remove WooCommerce's default widgets.
		remove_meta_box( 'woocommerce_dashboard_status', 'dashboard', 'normal' );
		remove_meta_box( 'wc_admin_dashboard_setup', 'dashboard', 'normal' );

		// Copy all dashboard meta boxes to our screen.
		if ( isset( $wp_meta_boxes['dashboard'] ) ) {
			$wp_meta_boxes[ $screen_id ] = $wp_meta_boxes['dashboard'];

			// Distribute widgets across 3 columns:
			// Col 1 (normal): Store Status, Grow your store
			// Col 2 (side):   Store Stats, Store Inbox
			// Col 3:          Store Management
			$move_map = array(
				'cdw_stats'            => 'side',
				'cdw_woo_inbox'        => 'side',
				'cdw_store_management' => 'column3',
			);
			foreach ( $move_map as $widget_id => $target ) {
				foreach ( array( 'normal', 'side', 'column3', 'column4' ) as $ctx ) {
					if ( $ctx === $target ) {
						continue;
					}
					foreach ( array( 'high', 'core', 'default', 'low' ) as $pri ) {
						if ( isset( $wp_meta_boxes[ $screen_id ][ $ctx ][ $pri ][ $widget_id ] ) ) {
							$wp_meta_boxes[ $screen_id ][ $target ][ $pri ][ $widget_id ] = $wp_meta_boxes[ $screen_id ][ $ctx ][ $pri ][ $widget_id ];
							unset( $wp_meta_boxes[ $screen_id ][ $ctx ][ $pri ][ $widget_id ] );
						}
					}
				}
			}

		}

		set_current_screen( $original_screen->id );
	}

}
