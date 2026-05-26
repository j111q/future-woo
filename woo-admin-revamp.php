<?php
/**
 * Plugin Name: Future Woo
 * Description: A designer's vision of where WooCommerce admin could go — redesigned dashboard, modern settings, reimagined order view, unified admin bar, and a state switcher for demoing three store states. Prototype only.
 * Version: 2.1.0
 * Requires Plugins: woocommerce
 * Text Domain: woo-admin-revamp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'WAR_VERSION', '2.1.0' );
define( 'WAR_PATH', plugin_dir_path( __FILE__ ) );
define( 'WAR_URL', plugin_dir_url( __FILE__ ) );

// Enable the React-based order view in WooCommerce core's Edit.php.
if ( ! defined( 'WC_USE_REACT_ORDER_VIEW' ) ) {
	define( 'WC_USE_REACT_ORDER_VIEW', true );
}

// Reset all states to empty on plugin activation.
register_activation_hook( __FILE__, function() {
	// Clear fake orders.
	$order_ids = get_option( 'cdw_fake_orders_ids', array() );
	foreach ( $order_ids as $oid ) {
		if ( function_exists( 'wc_get_order' ) ) {
			$order = wc_get_order( $oid );
			if ( $order ) $order->delete( true );
		}
	}
	delete_option( 'cdw_fake_orders_ids' );

	// Clear fake products (both keys).
	foreach ( array( 'war_fake_products_ids', 'cdw_fake_product_ids' ) as $key ) {
		$pids = get_option( $key, array() );
		foreach ( $pids as $pid ) {
			if ( function_exists( 'wc_get_product' ) ) {
				$product = wc_get_product( $pid );
				if ( $product ) $product->delete( true );
			}
		}
		delete_option( $key );
	}

	// Reset the initial cleanup flag so it runs fresh.
	delete_option( 'war_initial_cleanup_done' );

	// Enable taxes so the Tax settings tab is available.
	update_option( 'woocommerce_calc_taxes', 'yes' );
} );

// --- Includes ---

// Order page (React-based card layout).
require_once WAR_PATH . 'includes/class-order-page.php';
require_once WAR_PATH . 'includes/class-global-state-manager.php';
require_once WAR_PATH . 'includes/class-admin-experience-api.php';
require_once WAR_PATH . 'includes/class-store-dashboard.php';
WAR_Admin_Experience_API::init();
require_once WAR_PATH . 'includes/class-admin-bar-menu.php';

// Modern (React) General Settings.
require_once WAR_PATH . 'includes/class-wc-settings-modern.php';

// Orders list page (DataViews-powered table).
require_once WAR_PATH . 'includes/class-orders-list-page.php';
new WAR_Orders_List_Page();

// State switchers.
require_once WAR_PATH . 'includes/class-state-switcher.php';
require_once WAR_PATH . 'includes/class-unified-state-switcher.php';

// Custom header (replaces WP page header chrome on WooCommerce pages).
require_once WAR_PATH . 'includes/class-custom-header.php';

// Shipping setup (CIAB-style zones, pickup, operations — replaces WC Settings > Shipping).
require_once WAR_PATH . 'includes/class-shipping-setup-admin.php';
require_once WAR_PATH . 'includes/class-shipping-zones-api.php';
require_once WAR_PATH . 'includes/class-shipping-pickup-api.php';
require_once WAR_PATH . 'includes/class-shipping-operations-api.php';

// Site Visibility API.
require_once WAR_PATH . 'includes/class-site-visibility-api.php';
WAR_Site_Visibility_API::init();

// Dashboard state switchers.
require_once WAR_PATH . 'includes/class-dashboard-state-switcher.php';
require_once WAR_PATH . 'includes/class-orders-state-switcher.php';

// Empty states (CIAB-style).
require_once WAR_PATH . 'includes/class-orders-empty-state.php';
require_once WAR_PATH . 'includes/class-products-empty-state.php';
require_once WAR_PATH . 'includes/class-products-state-switcher.php';
// On first activation, clean up any existing fake data so we start in empty state.
add_action( 'admin_init', function() {
	if ( get_option( 'war_initial_cleanup_done' ) ) {
		return;
	}
	// Delete any fake orders and products from previous sessions.
	if ( class_exists( 'CDW_Orders_State_Switcher' ) ) {
		$order_ids = get_option( CDW_Orders_State_Switcher::FAKE_ORDERS_KEY, array() );
		foreach ( $order_ids as $oid ) {
			$order = wc_get_order( $oid );
			if ( $order ) {
				$order->delete( true );
			}
		}
		delete_option( CDW_Orders_State_Switcher::FAKE_ORDERS_KEY );
	}
	if ( class_exists( 'WAR_Products_State_Switcher' ) ) {
		$product_ids = get_option( WAR_Products_State_Switcher::FAKE_PRODUCTS_KEY, array() );
		foreach ( $product_ids as $pid ) {
			$product = wc_get_product( $pid );
			if ( $product ) {
				$product->delete( true );
			}
		}
		delete_option( WAR_Products_State_Switcher::FAKE_PRODUCTS_KEY );
		// Also clean up orders switcher's products.
		$order_product_ids = get_option( 'cdw_fake_product_ids', array() );
		foreach ( $order_product_ids as $pid ) {
			$product = wc_get_product( $pid );
			if ( $product ) {
				$product->delete( true );
			}
		}
		delete_option( 'cdw_fake_product_ids' );
	}
	update_option( 'war_initial_cleanup_done', '1' );
}, 0 );

// Register empty states only when plugin is enabled (deferred to admin_init so user is loaded).
add_action( 'admin_init', function() {
	if ( WAR_Unified_State_Switcher::is_plugin_enabled() ) {
		WAR_Orders_Empty_State::register();
		WAR_Products_Empty_State::register();
	}
}, 0 );

// Dashboard widgets.
require_once WAR_PATH . 'includes/class-woo-inbox-widget.php';
require_once WAR_PATH . 'includes/class-woo-setup-widget.php';
require_once WAR_PATH . 'includes/class-whats-next-widget.php';
require_once WAR_PATH . 'includes/class-stats-widget.php';
require_once WAR_PATH . 'includes/class-store-status-widget.php';
require_once WAR_PATH . 'includes/class-store-management-widget.php';

// --- Hook registration ---

// AJAX handlers and state switcher always load (so you can toggle the plugin back on).
add_action( 'init', 'war_register_all_ajax' );
add_action( 'admin_init', array( 'WAR_Unified_State_Switcher', 'register' ) );

// Redesign body class must load on all admin pages (not just wp_dashboard_setup).
add_filter( 'admin_body_class', array( 'CDW_State_Switcher', 'add_body_class' ) );

// Store Dashboard must register early (admin_menu fires before admin_init).
WAR_Store_Dashboard::init();

// Initialize shipping setup early (needs admin_body_class which fires before admin_init).
add_action( 'plugins_loaded', function() {
	if ( ! class_exists( 'WooCommerce', false ) ) {
		return;
	}
	// Can't check is_plugin_enabled() here (no user yet), so always init shipping.
	// The body class and render hooks are harmless when the plugin is "disabled"
	// because the CSS/JS won't be enqueued.
	\WAR\Shipping_Setup_Admin::init();
	\WAR\Shipping_Zones_API::init();
	\WAR\Shipping_Pickup_API::init();
	\WAR\Shipping_Operations_API::init();
} );

// All other hooks only run when the plugin is enabled.
add_action( 'admin_init', function() {
	if ( ! WAR_Unified_State_Switcher::is_plugin_enabled() ) {
		return;
	}

	CDW_WC_Settings_Modern::init();
	new WAR_Order_Page();
	if ( WAR_Admin_Experience_API::is_store_menu_enabled() ) {
		WAR_Admin_Bar_Menu::init();
	}
	// Only register our widgets on WP dashboard if "default to store" is off.
	// When on, widgets live on the Store Dashboard page instead.
	if ( ! WAR_Admin_Experience_API::is_default_to_store() ) {
		add_action( 'wp_dashboard_setup', 'cdw_register_widgets' );
	}
	// Always remove WooCommerce's default dashboard widgets (ours replace them).
	add_action( 'wp_dashboard_setup', function() {
		remove_meta_box( 'woocommerce_dashboard_status', 'dashboard', 'normal' );
		remove_meta_box( 'wc_admin_dashboard_setup', 'dashboard', 'normal' );
		remove_meta_box( 'woocommerce_dashboard_recent_reviews', 'dashboard', 'normal' );
	}, 99 );

	add_filter( 'get_user_option_screen_layout_dashboard', 'cdw_force_four_columns' );
	add_filter( 'get_user_option_meta-box-order_dashboard', 'cdw_force_widget_position' );
	add_action( 'admin_menu', 'cdw_remove_wc_home', 99 );
	add_action( 'admin_head', 'cdw_hide_wc_home_link' );
	add_action( 'admin_head', 'war_woo_page_background' );
	add_action( 'admin_footer', 'cdw_rearrange_admin_menu_js' );
	add_action( 'current_screen', 'cdw_block_product_redirect', 5 );
	add_action( 'admin_init', 'cdw_redirect_wc_home' );
	add_action( 'admin_enqueue_scripts', 'cdw_enqueue_assets' );
}, 1 );

// These need to load early (plugins_loaded), so check enabled there too.
add_action( 'plugins_loaded', function () {
	if ( ! class_exists( 'WooCommerce', false ) ) {
		return;
	}
	// Orders empty state and products empty state always register
	// (they check for empty conditions themselves).
} );

// --- AJAX handlers (combined) ---

function war_register_all_ajax() {
	// WAR: Order page state switcher.
	add_action( 'wp_ajax_war_set_state', array( 'WAR_State_Switcher', 'ajax_set_state' ) );

	// CDW: Inbox.
	add_action( 'wp_ajax_cdw_dismiss_note',          array( 'CDW_Woo_Inbox_Widget', 'ajax_dismiss_note' ) );
	add_action( 'wp_ajax_cdw_inbox_load_panel',      array( 'CDW_Woo_Inbox_Widget', 'ajax_load_panel' ) );
	add_action( 'wp_ajax_cdw_inbox_dismiss_all',     array( 'CDW_Woo_Inbox_Widget', 'ajax_dismiss_all' ) );

	// CDW: What's Next.
	add_action( 'wp_ajax_cdw_whats_next_dismiss_task', array( 'CDW_Whats_Next_Widget', 'ajax_dismiss_task' ) );
	add_action( 'wp_ajax_cdw_whats_next_dismiss_all',  array( 'CDW_Whats_Next_Widget', 'ajax_dismiss_all' ) );

	// CDW: Stats.
	add_action( 'wp_ajax_cdw_stats_get',             array( 'CDW_Stats_Widget', 'ajax_get_stats' ) );
	add_action( 'wp_ajax_cdw_stats_save_settings',   array( 'CDW_Stats_Widget', 'ajax_save_settings' ) );

	// CDW: Dashboard state switcher.
	add_action( 'wp_ajax_cdw_set_state',             array( 'CDW_State_Switcher', 'ajax_set_state' ) );

	// CDW: Restore inbox.
	add_action( 'wp_ajax_cdw_restore_inbox',         array( 'CDW_Woo_Inbox_Widget', 'ajax_restore_inbox' ) );

	// CDW: Orders state switcher.
	add_action( 'wp_ajax_cdw_orders_set_state',      array( 'CDW_Orders_State_Switcher', 'ajax_set_state' ) );

	// CDW: Redesign toggle.
	add_action( 'wp_ajax_cdw_toggle_redesign',       array( 'CDW_State_Switcher', 'ajax_toggle_redesign' ) );

	// Products state switcher.
	add_action( 'wp_ajax_war_products_set_state',    array( 'WAR_Products_State_Switcher', 'ajax_set_state' ) );

	// Plugin enable/disable toggle.
	add_action( 'wp_ajax_war_toggle_plugin',         array( 'WAR_Unified_State_Switcher', 'ajax_toggle_plugin' ) );

	// Admin experience toggles.
	add_action( 'wp_ajax_war_toggle_admin_experience', array( 'WAR_Unified_State_Switcher', 'ajax_toggle_admin_experience' ) );

	// Global state manager.
	add_action( 'wp_ajax_war_global_set_state',      array( 'WAR_Global_State_Manager', 'ajax_set_state' ) );
	add_action( 'wp_ajax_war_toggle_grow_complete',  array( 'WAR_Global_State_Manager', 'ajax_toggle_grow_complete' ) );
}

// --- WooCommerce page background ---

function war_woo_page_background() {
	$screen = get_current_screen();
	if ( ! $screen ) {
		return;
	}

	$woo_screens = array(
		'woocommerce_page_wc-orders',
		'woocommerce_page_wc-settings',
		'woocommerce_page_wc-status',
		'woocommerce_page_wc-addons',
		'woocommerce_page_wc-reports',
		'woocommerce_page_wc-admin',
	);

	$is_woo = in_array( $screen->id, $woo_screens, true )
		|| strpos( $screen->id, 'woocommerce' ) !== false
		|| ( isset( $screen->post_type ) && $screen->post_type === 'product' );

	if ( $is_woo ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$cur_page = isset( $_GET['page'] ) ? sanitize_key( $_GET['page'] ) : '';
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$cur_tab = isset( $_GET['tab'] ) ? sanitize_key( $_GET['tab'] ) : 'general';
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$cur_section = isset( $_GET['section'] ) ? sanitize_key( $_GET['section'] ) : '';
		$is_settings = ( $cur_page === 'wc-settings' );
		$modern_tabs = array( 'general', 'products', 'account', 'integration', 'tax', 'site-visibility', 'advanced' );
		$is_modern_tab = $is_settings && in_array( $cur_tab, $modern_tabs, true );

		// Tax is only modern on the options section (not rate tables).
		if ( $cur_tab === 'tax' && $cur_section !== '' ) {
			$is_modern_tab = false;
		}

		echo '<style>
			:root { --war-page-bg: #fcfcfc; }
			#wpfooter { display: none !important; }
		</style>';

		// On all settings pages, hide the WooCommerce tab bar (left nav replaces it).
		if ( $is_settings ) {
			echo '<style>
				.wrap.woocommerce > form > .nav-tab-wrapper,
				.wrap.woocommerce > form > nav.woo-nav-tab-wrapper,
				.wrap.woocommerce > h1 { display: none !important; }
			</style>';

			// Hide sub-tabs on modern tabs and tax (we render our own tabs in the header).
			if ( $is_modern_tab || $cur_tab === 'tax' ) {
				echo '<style>
					.wrap.woocommerce > form > ul.subsubsub,
					.wrap.woocommerce ul.subsubsub,
					.subsubsub { display: none !important; }
				</style>';
			}
		}

		// On modern settings tabs only, also hide the PHP save button and screen reader title.
		if ( $is_modern_tab ) {
			echo '<style>
				.wrap.woocommerce > form > h1.screen-reader-text,
				.wrap.woocommerce > form > p.submit { display: none !important; }
			</style>';
		}

		// Late-loading override to beat WooCommerce's own stylesheets.
		add_action( 'admin_footer', function() {
			echo '<style>
				html, body, #wpwrap, #wpcontent, #wpbody, #wpbody-content,
				.wrap, .wrap.woocommerce,
				.woocommerce-layout, .woocommerce-layout__main,
				.wc-shipping, .wc-shipping__content,
				#wpbody-content > .wrap { background-color: var(--war-page-bg) !important; }
			</style>';
			echo '<script>
			(function(){
				var bg = getComputedStyle(document.documentElement).getPropertyValue("--war-page-bg").trim() || "#fcfcfc";
				var skip = ["#wpadminbar", ".war-page-header", ".components-button", ".war-state-fab", ".war-state-menu", ".order-status", "mark.order-status", ".status-label", "mark", ".column-order_status", ".column-wc_actions"];
				document.querySelectorAll("#wpbody, #wpbody *, #wpbody-content, #wpbody-content > *").forEach(function(el){
					for (var i = 0; i < skip.length; i++) {
						if (el.closest(skip[i])) return;
					}
					var cs = getComputedStyle(el);
					var bgc = cs.backgroundColor;
					if (bgc && bgc !== "rgba(0, 0, 0, 0)" && bgc !== "transparent" && bgc !== "rgb(255, 255, 255)") {
						el.style.setProperty("background-color", bg, "important");
					}
				});
			})();
			</script>';
		}, 9999 );
	}
}

// --- CDW functions ---

// --- Orders state switcher registration ---

// Orders state switcher FAB is now handled by WAR_Unified_State_Switcher.
// CDW_Orders_State_Switcher AJAX handler is still registered for backend functionality.

// --- Dashboard layout ---

function cdw_force_four_columns() {
	return 4;
}

function cdw_force_widget_position( $order ) {
	if ( ! is_array( $order ) ) {
		$order = array();
	}

	$all_cdw = array( 'cdw_woo_setup', 'cdw_whats_next', 'cdw_store_status', 'cdw_woo_inbox', 'cdw_stats', 'cdw_store_management' );

	foreach ( array( 'normal', 'side', 'column3', 'column4' ) as $col ) {
		if ( ! empty( $order[ $col ] ) ) {
			$items         = array_filter( explode( ',', $order[ $col ] ) );
			$order[ $col ] = implode( ',', array_values( array_diff( $items, $all_cdw ) ) );
		}
	}

	foreach (
		array(
			'normal'  => array( 'cdw_woo_setup', 'cdw_store_status', 'cdw_whats_next' ),
			'side'    => array( 'cdw_woo_inbox' ),
			'column3' => array( 'cdw_stats' ),
			'column4' => array( 'cdw_store_management' ),
		) as $col => $widgets
	) {
		$existing      = ! empty( $order[ $col ] ) ? array_filter( explode( ',', $order[ $col ] ) ) : array();
		$order[ $col ] = implode( ',', array_merge( $widgets, array_values( $existing ) ) );
	}

	return $order;
}

// --- Dashboard widgets ---

function cdw_register_widgets() {
	remove_meta_box( 'woocommerce_dashboard_status', 'dashboard', 'normal' );
	remove_meta_box( 'wc_admin_dashboard_setup', 'dashboard', 'normal' );

	// CDW_State_Switcher FAB is now handled by WAR_Unified_State_Switcher.
	// Body class for redesign is registered globally (see top of file).

	CDW_Woo_Inbox_Widget::register();
	CDW_Whats_Next_Widget::register();
	CDW_Woo_Setup_Widget::register();
	CDW_Stats_Widget::register();
	CDW_Store_Status_Widget::register();
	CDW_Store_Management_Widget::register();
}

// --- WooCommerce menu customization ---

function cdw_remove_wc_home() {
	remove_submenu_page( 'woocommerce', 'wc-setup' );
}

function cdw_hide_wc_home_link() {
	?>
	<style>
		/* Hide wc-admin "Home" from WooCommerce submenu */
		#toplevel_page_woocommerce .wp-submenu a[href="admin.php?page=wc-admin"] { display: none; }

		/* Hide WooCommerce submenu flyout in main nav (not in drilldown) */
		#adminmenu:not(.cdw-drilldown-open) #toplevel_page_woocommerce .wp-submenu {
			display: none !important;
		}

		/* In main view: hide commerce items and adjacent separators */
		#adminmenu .cdw-woo-item { display: none; }
		#adminmenu .cdw-woo-sep { display: none; }

		/* In drilldown view: show only drilldown items */
		#adminmenu.cdw-drilldown-open > li { display: none !important; }
		#adminmenu.cdw-drilldown-open > li.cdw-woo-item { display: block !important; }
		#adminmenu.cdw-drilldown-open > li.cdw-woo-promoted { display: block !important; }
		#adminmenu.cdw-drilldown-open > #cdw-back-item { display: block !important; }

		/* Back button: hidden by default, shown only in drilldown */
		#cdw-back-item { display: none; }

		/* Drilldown header: hidden by default, shown only in drilldown */
		#cdw-drilldown-header { display: none; }
		#adminmenu.cdw-drilldown-open > #cdw-drilldown-header { display: block !important; }
		#cdw-drilldown-header {
			pointer-events: none;
			cursor: default;
		}
		.cdw-drilldown-header__label {
			padding: 8px 12px;
			font-size: 13px;
			font-weight: 400;
			color: #a7aaad;
			border-bottom: 1px solid hsla(0,0%,100%,.15);
			margin-bottom: 4px;
		}
		#cdw-back-item a.menu-top,
		#cdw-back-item a.menu-top:hover,
		#cdw-back-item a.menu-top:focus {
			font-size: 13px !important;
			background: none !important;
			color: #f0f0f1 !important;
		}
		#cdw-back-item,
		#cdw-back-item.wp-has-current-submenu,
		#cdw-back-item.current {
			background: none !important;
		}
		#cdw-back-item .dashicons-arrow-left-alt2 {
			margin-right: 2px;
		}

		/* Orders nav badge — matches WooCommerce core red circle */
		#adminmenu .war-nav-order-badge {
			display: inline-block;
			min-width: 8px;
			padding: 0 5px;
			height: 16px;
			line-height: 16px;
			border-radius: 8px;
			background: #d63638;
			color: #fff;
			font-size: 9px;
			font-weight: 600;
			text-align: center;
			margin-left: 5px;
			vertical-align: middle;
			position: relative;
			top: -1px;
		}

		/* Promoted items: hide by default, only show in drilldown */
		.cdw-woo-promoted { display: none; }

		/* Hide notification bubbles on Payments and Extensions */
		.cdw-woo-item .update-plugins,
		.cdw-woo-item .awaiting-mod { display: none !important; }
	</style>
	<?php
}

// --- Drilldown navigation JS ---

function cdw_rearrange_admin_menu_js() {
	?>
	<script>
	(function() {
		var menu = document.getElementById('adminmenu');
		if ( ! menu ) return;

		var items = menu.querySelectorAll(':scope > li');

		function find( partial ) {
			for ( var i = 0; i < items.length; i++ ) {
				var a = items[i].querySelector('a');
				if ( a && a.getAttribute('href') && a.getAttribute('href').indexOf( partial ) !== -1 ) {
					return items[i];
				}
			}
			return null;
		}

		function createPromotedItem( href, text, dashicon ) {
			var li = document.createElement('li');
			li.className = 'cdw-woo-promoted wp-not-current-submenu menu-top';
			var a = document.createElement('a');
			a.href = href;
			a.className = 'menu-top';
			a.innerHTML =
				'<div class="wp-menu-arrow"><div></div></div>' +
				'<div class="wp-menu-image dashicons-before ' + dashicon + '" aria-hidden="true"><br></div>' +
				'<div class="wp-menu-name">' + text + '</div>';
			li.appendChild(a);

			if ( window.location.href.indexOf( href.replace('admin.php?', '') ) !== -1 ) {
				li.className = 'cdw-woo-promoted wp-has-current-submenu wp-menu-open menu-top';
				a.className = 'menu-top wp-has-current-submenu wp-menu-open';
			}
			return li;
		}

		var icons = {
			orders:     'dashicons-text-page',
			customers:  'dashicons-groups',
			settings:   'dashicons-admin-settings',
			status:     'dashicons-info',
			reports:    'dashicons-chart-area',
			addons:     'dashicons-admin-plugins',
			extensions: 'dashicons-admin-plugins'
		};

		var woo       = document.getElementById('toplevel_page_woocommerce');
		var dashboard = find('index.php');
		var products  = find('edit.php?post_type=product');
		var payments  = find('PAYMENTS_MENU_ITEM');
		var analytics = find('path=/analytics/overview');
		var marketing = find('path=/marketing');

		if ( ! woo || ! dashboard ) return;

		var after = dashboard.nextElementSibling;
		if ( after && after.classList.contains('wp-menu-separator') ) {
			after = after.nextElementSibling;
		}
		menu.insertBefore( woo, after );

		[products, payments, analytics, marketing].filter(Boolean).forEach(function(li) {
			li.classList.add('cdw-woo-item');
			var prev = li.previousElementSibling;
			if (prev && prev.classList.contains('wp-menu-separator')) {
				prev.classList.add('cdw-woo-sep');
			}
			var next = li.nextElementSibling;
			if (next && next.classList.contains('wp-menu-separator')) {
				next.classList.add('cdw-woo-sep');
			}
		});

		// Coupons: remove from WooCommerce submenu (Marketing already has its own).
		if (marketing) {
			woo.querySelectorAll('.wp-submenu li a').forEach(function(a) {
				if (a.getAttribute('href') && a.getAttribute('href').indexOf('coupons') !== -1) {
					var li = a.closest('li');
					if (li) li.style.display = 'none';
				}
			});
		}

		var wooSubItems = [];
		woo.querySelectorAll('.wp-submenu li a').forEach(function(a) {
			var href = a.getAttribute('href');
			var text = a.textContent.trim();
			if ( href && text && href !== 'admin.php?page=wc-admin' ) {
				wooSubItems.push({ href: href, text: text });
			}
		});

		function findWooSub( partial ) {
			for ( var i = 0; i < wooSubItems.length; i++ ) {
				if ( wooSubItems[i].href.indexOf( partial ) !== -1 ) return wooSubItems[i];
			}
			return null;
		}

		var ordersInfo    = findWooSub('wc-orders');
		var customersInfo = findWooSub('/customers');
		var settingsInfo  = findWooSub('wc-settings');
		var statusInfo    = findWooSub('wc-status');
		var addonsInfo    = findWooSub('wc-addons');
		var extensionsInfo = findWooSub('/extensions');

		var orderCount = <?php
			$oc = 0;
			if ( function_exists( 'wc_orders_count' ) ) {
				$oc += (int) wc_orders_count( 'processing' );
				$oc += (int) wc_orders_count( 'on-hold' );
			} else {
				global $wpdb;
				$hpos = $wpdb->prefix . 'wc_orders';
				if ( $wpdb->get_var( "SHOW TABLES LIKE '$hpos'" ) === $hpos ) {
					$oc = (int) $wpdb->get_var( "SELECT COUNT(*) FROM $hpos WHERE status IN ('wc-processing', 'wc-on-hold')" );
				}
			}
			echo (int) $oc;
		?>;

		var ordersLabel = 'Orders';
		if ( orderCount > 0 ) {
			ordersLabel += ' <span class="war-nav-order-badge">' + orderCount + '</span>';
		}

		var orders = ordersInfo ? createPromotedItem( ordersInfo.href, ordersLabel, icons.orders ) : null;
		var customers = customersInfo ? createPromotedItem( customersInfo.href, customersInfo.text, icons.customers ) : null;

		function createSettingsWithSubmenu( baseHref ) {
			var tabs = [
				{ label: 'General',            href: 'admin.php?page=wc-settings&tab=general' },
				{ label: 'Products',           href: 'admin.php?page=wc-settings&tab=products' },
				{ label: 'Tax',                href: 'admin.php?page=wc-settings&tab=tax' },
				{ label: 'Shipping',           href: 'admin.php?page=wc-settings&tab=shipping' },
				{ label: 'Payments',           href: 'admin.php?page=wc-settings&tab=checkout' },
				{ label: 'Accounts & Privacy', href: 'admin.php?page=wc-settings&tab=account' },
				{ label: 'Emails',             href: 'admin.php?page=wc-settings&tab=email' },
				{ label: 'Integration',        href: 'admin.php?page=wc-settings&tab=integration' },
				{ label: 'Site Visibility',    href: 'admin.php?page=wc-settings&tab=site-visibility' },
				{ label: 'Advanced',           href: 'admin.php?page=wc-settings&tab=advanced' },
			];

			var loc        = window.location.href;
			var onSettings = loc.indexOf('page=wc-settings') !== -1;
			var tabMatch   = loc.match(/[?&]tab=([^&]+)/);
			var currentTab = tabMatch ? tabMatch[1] : 'general';

			var li = document.createElement('li');
			li.className = 'cdw-woo-promoted wp-has-submenu menu-top' +
				( onSettings ? ' wp-has-current-submenu wp-menu-open' : ' wp-not-current-submenu' );

			var a = document.createElement('a');
			a.href = baseHref || 'admin.php?page=wc-settings';
			a.className = 'menu-top' +
				( onSettings ? ' wp-has-current-submenu wp-menu-open' : ' wp-not-current-submenu wp-has-submenu' );
			a.innerHTML =
				'<div class="wp-menu-arrow"><div></div></div>' +
				'<div class="wp-menu-image dashicons-before dashicons-admin-settings" aria-hidden="true"><br></div>' +
				'<div class="wp-menu-name">Settings</div>';
			li.appendChild( a );

			var ul = document.createElement('ul');
			ul.className = 'wp-submenu wp-submenu-wrap';

			tabs.forEach(function( tab ) {
				var tabLi = document.createElement('li');
				var isActive = onSettings && tab.href.indexOf( 'tab=' + currentTab ) !== -1;
				if ( isActive ) tabLi.className = 'current';
				var tabA = document.createElement('a');
				tabA.href = tab.href;
				tabA.textContent = tab.label;
				tabLi.appendChild( tabA );
				ul.appendChild( tabLi );
			});

			li.appendChild( ul );
			return li;
		}

		var settings = createSettingsWithSubmenu( settingsInfo ? settingsInfo.href : null );
		var status    = statusInfo    ? createPromotedItem( statusInfo.href, statusInfo.text, icons.status ) : null;
		var addons    = addonsInfo    ? createPromotedItem( addonsInfo.href, addonsInfo.text, icons.addons ) : null;
		var extensions = extensionsInfo ? createPromotedItem( extensionsInfo.href, 'Extensions', icons.extensions ) : null;

		// Add "Home" to the drilldown if "default to store" is enabled.
		var storeHome = null;
		<?php if ( WAR_Admin_Experience_API::is_default_to_store() ) : ?>
		storeHome = createPromotedItem( 'admin.php?page=war-store-dashboard', 'Dashboard', 'dashicons-dashboard' );
		<?php endif; ?>

		var drilldownOrder = [
			storeHome, orders, payments, products, customers, marketing, analytics,
			settings, extensions, status
		].filter(Boolean);

		drilldownOrder.forEach(function(li) {
			menu.appendChild(li);
		});

		after = dashboard.nextElementSibling;
		if ( after && after.classList.contains('wp-menu-separator') ) {
			after = after.nextElementSibling;
		}
		menu.insertBefore( woo, after );

		woo.classList.add('cdw-woo-entry');

		drilldownOrder.forEach(function(li) {
			var next = li.nextElementSibling;
			if (next && next.classList.contains('wp-menu-separator')) {
				next.style.display = 'none';
			}
		});

		var backItem = document.createElement('li');
		backItem.id = 'cdw-back-item';
		backItem.className = 'wp-not-current-submenu menu-top';
		var backLink = document.createElement('a');
		backLink.href = '#';
		backLink.className = 'menu-top';
		backLink.innerHTML = '<div class="wp-menu-arrow"></div><div class="wp-menu-image dashicons-before dashicons-arrow-left-alt2"></div><div class="wp-menu-name">Back</div>';
		backItem.appendChild(backLink);
		menu.insertBefore(backItem, drilldownOrder[0]);

		var headerItem = document.createElement('li');
		headerItem.id = 'cdw-drilldown-header';
		var headerLabel = document.createElement('div');
		headerLabel.className = 'cdw-drilldown-header__label';
		headerLabel.textContent = 'WooCommerce';
		headerItem.appendChild(headerLabel);
		menu.insertBefore(headerItem, drilldownOrder[0]);

		var loc = window.location.href;
		var isOnWooPage = (
			loc.indexOf('page=wc-orders') !== -1 ||
			loc.indexOf('page=wc-admin') !== -1 ||
			loc.indexOf('post_type=product') !== -1 ||
			loc.indexOf('post_type=shop_coupon') !== -1 ||
			loc.indexOf('page=wc-settings') !== -1 ||
			loc.indexOf('page=wc-status') !== -1 ||
			loc.indexOf('PAYMENTS_MENU_ITEM') !== -1 ||
			loc.indexOf('page=product') !== -1 ||
			loc.indexOf('page=coupons') !== -1 ||
			loc.indexOf('coupons-moved') !== -1 ||
			loc.indexOf('page=wc-reports') !== -1 ||
			loc.indexOf('page=wc-addons') !== -1 ||
			loc.indexOf('page=war-store-dashboard') !== -1
		);

		function openDrilldown() {
			menu.classList.add('cdw-drilldown-open');
		}

		function closeDrilldown() {
			menu.classList.remove('cdw-drilldown-open');
		}

		var wooLink = woo.querySelector('a.menu-top');
		if (wooLink) {
			wooLink.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				window.location.href = <?php echo WAR_Admin_Experience_API::is_default_to_store()
					? "'admin.php?page=war-store-dashboard'"
					: "'admin.php?page=wc-orders'"; ?>;
			});
		}

		backLink.addEventListener('click', function(e) {
			e.preventDefault();
			window.location.href = 'index.php?wp-dashboard=1';
		});

		if ( isOnWooPage ) {
			openDrilldown();
		}
	})();
	</script>
	<?php
}

// --- WooCommerce page access fixes ---

function cdw_block_product_redirect() {
	$screen = get_current_screen();
	if ( $screen && 'edit' === $screen->base && 'product' === $screen->post_type ) {
		remove_all_actions( 'current_screen', 30 );
	}
}

function cdw_redirect_wc_home() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$page = isset( $_GET['page'] ) ? sanitize_key( $_GET['page'] ) : '';
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$path = isset( $_GET['path'] ) ? sanitize_text_field( wp_unslash( $_GET['path'] ) ) : '';
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$task = isset( $_GET['task'] ) ? sanitize_key( $_GET['task'] ) : '';

	if ( $page === 'wc-admin' && ( $path === '' || $path === '/' ) && $task === '' ) {
		wp_safe_redirect( admin_url() );
		exit;
	}
}

// --- Asset enqueue ---

function cdw_enqueue_assets( $hook ) {
	$screen = get_current_screen();
	$is_dashboard = ( $hook === 'index.php' );
	$is_orders    = ( $screen && $screen->id === 'woocommerce_page_wc-orders' );

	if ( ! $is_dashboard && ! $is_orders ) {
		return;
	}

	wp_enqueue_style(
		'cdw-styles',
		WAR_URL . 'assets/css/dashboard-widgets.css',
		array(),
		WAR_VERSION
	);

	wp_enqueue_script(
		'cdw-scripts',
		WAR_URL . 'assets/js/dashboard-widgets.js',
		array( 'jquery' ),
		WAR_VERSION,
		true
	);

	wp_localize_script( 'cdw-scripts', 'cdwData', array(
		'ajaxUrl'           => admin_url( 'admin-ajax.php' ),
		'nonce'             => wp_create_nonce( 'cdw_nonce' ),
		'checkListImageUrl' => WAR_URL . 'assets/images/check-list.svg',
		'i18n'    => array(
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

