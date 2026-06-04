<?php
/**
 * WooCommerce Admin Bar Menu.
 *
 * Adds a "Store" dropdown to the WordPress admin bar with quick
 * access to Orders, Products, Inbox, and site visibility status.
 * Removes the default WooCommerce visibility badge from the admin bar.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WAR_Admin_Bar_Menu {

	public static function init() {
		add_action( 'admin_bar_menu', array( __CLASS__, 'add_store_menu' ), 50 );
		add_action( 'admin_bar_menu', array( __CLASS__, 'remove_wc_visibility_badge' ), 999 );
		add_action( 'admin_head', array( __CLASS__, 'render_styles' ) );
		add_action( 'wp_head', array( __CLASS__, 'render_styles' ) );
		add_action( 'admin_footer', array( __CLASS__, 'render_inbox_panel' ) );
		add_action( 'wp_footer', array( __CLASS__, 'render_inbox_panel' ) );
		add_action( 'admin_head', array( __CLASS__, 'render_favicon' ), 1 );
		add_action( 'wp_head', array( __CLASS__, 'render_favicon' ), 1 );
	}

	/**
	 * Override the favicon with our purple heart icon.
	 */
	public static function render_favicon() {
		echo '<link rel="icon" href="' . esc_url( WAR_URL . 'assets/images/favicon.svg' ) . '" type="image/svg+xml">' . "\n";
	}

	/**
	 * Remove the default WooCommerce site visibility badge from the admin bar.
	 */
	public static function remove_wc_visibility_badge( $wp_admin_bar ) {
		$wp_admin_bar->remove_node( 'woocommerce-site-visibility-badge' );
	}

	/**
	 * Add the Store menu to the admin bar.
	 */
	public static function add_store_menu( $wp_admin_bar ) {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}

		// Get pending order count (same logic as WooCommerce core nav badge).
		$order_count = self::get_actionable_order_count();
		$order_badge = '';
		if ( $order_count > 0 ) {
			$order_badge = ' <span class="war-adminbar-count war-adminbar-count--orders">' . number_format_i18n( $order_count ) . '</span>';
		}

		// Get inbox unread count.
		$inbox_count = self::get_inbox_count();
		// Also try WC Admin API count as fallback.
		if ( $inbox_count === 0 && function_exists( 'wc_get_notes_count' ) ) {
			$inbox_count = (int) wc_get_notes_count( 'unactioned', 'info' );
		}
		// For the prototype: if the CDW inbox widget has notes, count those.
		if ( $inbox_count === 0 && class_exists( 'CDW_Woo_Inbox_Widget' ) ) {
			$inbox_count = CDW_Woo_Inbox_Widget::get_note_count();
		}
		$inbox_badge = $inbox_count > 0
			? ' <span class="war-adminbar-count war-adminbar-count--inbox">' . number_format_i18n( $inbox_count ) . '</span>'
			: '';
		$inbox_text = __( 'Inbox', 'woo-admin-revamp' ) . $inbox_badge;

		// Determine visibility based on actual WooCommerce site visibility setting.
		if ( get_option( 'woocommerce_coming_soon' ) === 'yes' ) {
			$visibility_label = __( 'Coming soon', 'woo-admin-revamp' );
			$visibility_class = 'coming-soon';
		} else {
			$visibility_label = __( 'Live', 'woo-admin-revamp' );
			$visibility_class = 'live';
		}

		// Top-level "Store" node.
		$has_orders_dot = $order_count > 0 ? ' war-store-has-orders' : '';
		$wp_admin_bar->add_node( array(
			'id'    => 'war-store-menu',
			'title' => '<span class="ab-icon war-store-icon"></span>' . __( 'Store', 'woo-admin-revamp' ),
			'href'  => admin_url( 'admin.php?page=wc-orders' ),
			'meta'  => array(
				'class' => 'war-store-menu-item' . $has_orders_dot,
			),
		) );

		// Store setup (only for new_store and setting_up states) — first item.
		$global_state = WAR_Global_State_Manager::get_state();
		if ( in_array( $global_state, array( 'new_store', 'setting_up' ), true ) ) {
			$tasks = CDW_Woo_Setup_Widget::get_tasks_public();
			$total = count( $tasks );
			$done  = count( array_filter( $tasks, fn( $t ) => $t['complete'] ) );

			$setup_url = admin_url( 'admin.php?page=war-store-dashboard' );

			$wp_admin_bar->add_node( array(
				'parent' => 'war-store-menu',
				'id'     => 'war-store-setup',
				'title'  => __( 'Store setup', 'woo-admin-revamp' )
					. ' <span class="war-adminbar-count war-adminbar-count--inbox">'
					. sprintf( '%d/%d', $done, $total )
					. '</span>',
				'href'   => $setup_url,
			) );

			// Separator after setup.
			$wp_admin_bar->add_node( array(
				'parent' => 'war-store-menu',
				'id'     => 'war-store-sep-setup',
				'title'  => '',
				'meta'   => array(
					'class' => 'war-store-separator',
				),
			) );
		}

		// Orders.
		$wp_admin_bar->add_node( array(
			'parent' => 'war-store-menu',
			'id'     => 'war-store-orders',
			'title'  => __( 'Orders', 'woo-admin-revamp' ) . $order_badge,
			'href'   => admin_url( 'admin.php?page=wc-orders' ),
		) );

		// Products.
		$wp_admin_bar->add_node( array(
			'parent' => 'war-store-menu',
			'id'     => 'war-store-products',
			'title'  => __( 'Products', 'woo-admin-revamp' ),
			'href'   => admin_url( 'edit.php?post_type=product' ),
		) );

		// Inbox.
		$wp_admin_bar->add_node( array(
			'parent' => 'war-store-menu',
			'id'     => 'war-store-inbox',
			'title'  => $inbox_text,
			'href'   => '#war-inbox',
			'meta'   => array(
				'class' => 'war-store-inbox-trigger',
			),
		) );

		// Separator.
		$wp_admin_bar->add_node( array(
			'parent' => 'war-store-menu',
			'id'     => 'war-store-sep',
			'title'  => '',
			'meta'   => array(
				'class' => 'war-store-separator',
			),
		) );

		// Visibility status (last item).
		$wp_admin_bar->add_node( array(
			'parent' => 'war-store-menu',
			'id'     => 'war-store-visibility',
			'title'  => '<span class="war-visibility-status war-visibility-status--' . esc_attr( $visibility_class ) . '">'
				. esc_html( $visibility_label ) . '</span>',
			'href'   => admin_url( 'admin.php?page=wc-settings&tab=site-visibility' ),
		) );
	}

	/**
	 * Get count of orders in actionable statuses.
	 * Matches the WooCommerce core logic for the admin menu badge.
	 */
	private static function get_actionable_order_count(): int {
		$count = 0;

		// Try WooCommerce's own count functions.
		if ( function_exists( 'wc_orders_count' ) ) {
			$count += (int) wc_orders_count( 'processing' );
			$count += (int) wc_orders_count( 'on-hold' );
			return $count;
		}

		// Fallback: count from the database directly.
		global $wpdb;

		// HPOS orders table.
		$hpos_table = $wpdb->prefix . 'wc_orders';
		if ( $wpdb->get_var( "SHOW TABLES LIKE '$hpos_table'" ) === $hpos_table ) {
			$count = (int) $wpdb->get_var(
				"SELECT COUNT(*) FROM $hpos_table WHERE status IN ('wc-processing', 'wc-on-hold')"
			);
			return $count;
		}

		// Legacy CPT fallback.
		$counts = wp_count_posts( 'shop_order' );
		if ( $counts ) {
			$count += isset( $counts->{'wc-processing'} ) ? (int) $counts->{'wc-processing'} : 0;
			$count += isset( $counts->{'wc-on-hold'} ) ? (int) $counts->{'wc-on-hold'} : 0;
		}

		return $count;
	}

	/**
	 * Get count of unread inbox notes.
	 */
	private static function get_inbox_count(): int {
		global $wpdb;

		// Try wc_admin_notes table.
		$table = $wpdb->prefix . 'wc_admin_notes';
		if ( $wpdb->get_var( "SHOW TABLES LIKE '$table'" ) === $table ) {
			$count = (int) $wpdb->get_var(
				"SELECT COUNT(*) FROM $table WHERE status = 'unactioned' AND is_deleted = 0"
			);
			if ( $count > 0 ) {
				return $count;
			}
		}

		// Try alternate table name.
		$table2 = $wpdb->prefix . 'woocommerce_admin_notes';
		if ( $wpdb->get_var( "SHOW TABLES LIKE '$table2'" ) === $table2 ) {
			$count = (int) $wpdb->get_var(
				"SELECT COUNT(*) FROM $table2 WHERE status = 'unactioned' AND is_deleted = 0"
			);
			if ( $count > 0 ) {
				return $count;
			}
		}

		// Try counting all unactioned notes without is_deleted filter (older WC).
		if ( $wpdb->get_var( "SHOW TABLES LIKE '$table'" ) === $table ) {
			$count = (int) $wpdb->get_var(
				"SELECT COUNT(*) FROM $table WHERE status = 'unactioned'"
			);
			return $count;
		}

		return 0;
	}

	/**
	 * Render inline styles for the admin bar menu.
	 */
	public static function render_styles() {
		if ( ! is_admin_bar_showing() || ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}
		?>
		<style>
			/* Hide the default WooCommerce visibility badge */
			#wpadminbar #wp-admin-bar-woocommerce-site-visibility-badge {
				display: none !important;
			}

			/* Store icon — shopping bag dashicon, vertically centered */
			#wpadminbar .war-store-menu-item > .ab-item .war-store-icon {
				display: inline-flex;
				align-items: center;
				justify-content: center;
				width: 20px;
				height: 32px;
				margin-right: 2px;
			}
			.war-store-icon::before {
				content: '\f174';
				font-family: dashicons;
				font-size: 20px;
				line-height: 1;
			}

			/* Match the site name dropdown visual style */
			#wpadminbar .war-store-menu-item > .ab-item {
				display: flex !important;
				align-items: center;
				gap: 2px;
			}

			#wpadminbar .war-store-menu-item .ab-icon {
				margin-right: 0;
				top: 0;
			}

			/* Red dot on store icon when there are actionable orders */
			#wpadminbar .war-store-has-orders .war-store-icon::after {
				content: '';
				position: absolute;
				top: 8px;
				right: -2px;
				width: 6px;
				height: 6px;
				border-radius: 50%;
				background: #d63638;
				border: 2px solid #23282d;
			}

			/* Count badges in Store dropdown */
			#wpadminbar .war-adminbar-count--inbox {
				display: inline-block !important;
				min-width: 8px !important;
				padding: 0 5px !important;
				height: 16px !important;
				line-height: 16px !important;
				border-radius: 8px !important;
				background: rgba(255,255,255,0.2) !important;
				color: #fff !important;
				font-size: 9px !important;
				font-weight: 600 !important;
				text-align: center !important;
				margin-left: 5px !important;
				vertical-align: middle !important;
				position: relative !important;
				top: -1px !important;
			}

			/* Order count badge — matches WooCommerce core red circle */
			#wpadminbar .war-adminbar-count--orders {
				display: inline-block !important;
				min-width: 8px !important;
				padding: 0 5px !important;
				height: 16px !important;
				line-height: 16px !important;
				border-radius: 8px !important;
				background: #d63638 !important;
				color: #fff !important;
				font-size: 9px !important;
				font-weight: 600 !important;
				text-align: center !important;
				margin-left: 5px !important;
				vertical-align: middle !important;
			}

			/* Visibility status row */
			#wpadminbar #wp-admin-bar-war-store-visibility > .ab-item {
				display: flex !important;
				align-items: center !important;
				gap: 6px !important;
			}

			#wpadminbar .war-visibility-label {
				color: #a7aaad !important;
				font-size: 12px !important;
			}

			#wpadminbar .war-visibility-status {
				display: inline-block !important;
				font-size: 12px !important;
				font-weight: 500 !important;
				padding: 0 8px !important;
				border-radius: 4px !important;
				line-height: 22px !important;
				height: auto !important;
				vertical-align: middle !important;
				background: none !important;
			}

			#wpadminbar .war-visibility-status--live {
				background: #d4edda !important;
				color: #155724 !important;
			}

			#wpadminbar .war-visibility-status--coming-soon {
				background: #f0f0f0 !important;
				color: #1e1e1e !important;
			}

			/* Separators */
			#wpadminbar #wp-admin-bar-war-store-sep,
			#wpadminbar #wp-admin-bar-war-store-sep-setup {
				height: 0;
				margin: 4px 12px;
				border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			}
			#wpadminbar #wp-admin-bar-war-store-sep > .ab-item,
			#wpadminbar #wp-admin-bar-war-store-sep-setup > .ab-item {
				height: 0;
				min-height: 0;
				padding: 0;
			}

			/* Inbox side panel (global) */
			.cdw-inbox-panel { position: fixed; inset: 0; z-index: 100000; }
			.cdw-inbox-panel[hidden] { display: none; }
			.cdw-inbox-panel-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); }
			.cdw-inbox-panel-drawer { position: absolute; top: 0; right: 0; bottom: 0; width: 400px; max-width: 100%; background: #fff; display: flex; flex-direction: column; box-shadow: -4px 0 24px rgba(0,0,0,0.12); transform: translateX(100%); transition: transform 0.25s ease; }
			.cdw-inbox-panel--open .cdw-inbox-panel-drawer { transform: translateX(0); }
			.cdw-inbox-panel-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #f0f0f1; flex-shrink: 0; }
			.cdw-inbox-panel-title { margin: 0; font-size: 15px; font-weight: 600; color: #1e1e1e; }
			.cdw-inbox-panel-header-actions { display: flex; align-items: center; gap: 4px; }
			.cdw-inbox-panel-close { color: #646970; display: flex; align-items: center; cursor: pointer; background: none; border: none; padding: 0; }
			.cdw-inbox-panel-close:hover { color: #1e1e1e; }
			.cdw-inbox-panel-body { flex: 1; overflow-y: auto; padding: 0 20px; }
			.cdw-inbox-panel-body .cdw-notes-list { margin: 0 -20px; }
			.cdw-inbox-panel-body .cdw-note { padding: 12px 20px; }
			.cdw-inbox-panel-body .cdw-note:first-child { padding-top: 12px; }
			.cdw-inbox-panel-loading { color: #646970; padding: 20px 0; margin: 0; }
		</style>
		<?php
	}

	/**
	 * Render the global inbox side panel in the footer.
	 */
	public static function render_inbox_panel() {
		if ( ! is_admin_bar_showing() || ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}
		?>
		<div class="cdw-inbox-panel" id="cdw-inbox-panel-global" hidden aria-modal="true" role="dialog" aria-label="<?php esc_attr_e( 'Inbox', 'woo-admin-revamp' ); ?>">
			<div class="cdw-inbox-panel-overlay"></div>
			<div class="cdw-inbox-panel-drawer">
				<div class="cdw-inbox-panel-header">
					<h3 class="cdw-inbox-panel-title"><?php esc_html_e( 'Store Inbox', 'woo-admin-revamp' ); ?></h3>
					<div class="cdw-inbox-panel-header-actions">
						<button class="cdw-inbox-panel-close button-link" type="button" aria-label="<?php esc_attr_e( 'Close', 'woo-admin-revamp' ); ?>">
							<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
								<path d="M13 11.8l6.1-6.3-1-1-6.1 6.2-6.1-6.2-1 1 6.1 6.3-6.5 6.7 1 1 6.5-6.7 6.5 6.7 1-1z"/>
							</svg>
						</button>
					</div>
				</div>
				<div class="cdw-inbox-panel-body" id="cdw-inbox-panel-global-body">
					<p class="cdw-inbox-panel-loading"><?php esc_html_e( 'Loading…', 'woo-admin-revamp' ); ?></p>
				</div>
			</div>
		</div>
		<script>
		(function() {
			var inboxLi = document.getElementById('wp-admin-bar-war-store-inbox');
			var inboxLink = inboxLi ? inboxLi.querySelector('a') : null;
			if ( ! inboxLink ) return;

			// Prevent navigation on the href.
			inboxLink.removeAttribute('href');
			inboxLink.style.cursor = 'pointer';

			function getPanel() {
				return document.getElementById('cdw-inbox-panel') || document.getElementById('cdw-inbox-panel-global');
			}

			function closePanel(panel) {
				panel.classList.remove('cdw-inbox-panel--open');
				setTimeout(function() { panel.setAttribute('hidden', ''); }, 250);
			}

			inboxLink.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();

				var panel = getPanel();
				if ( ! panel ) return;

				// Close admin bar dropdown.
				var storeMenu = document.getElementById('wp-admin-bar-war-store-menu');
				if ( storeMenu ) storeMenu.classList.remove('hover');

				if ( panel.classList.contains('cdw-inbox-panel--open') ) {
					closePanel(panel);
				} else {
					panel.removeAttribute('hidden');
					panel.offsetHeight;
					panel.classList.add('cdw-inbox-panel--open');

					if ( ! panel.dataset.loaded ) {
						jQuery.post(<?php echo wp_json_encode( admin_url( 'admin-ajax.php' ) ); ?>, {
							action: 'cdw_inbox_load_panel',
							nonce: <?php echo wp_json_encode( wp_create_nonce( 'cdw_nonce' ) ); ?>
						}).done(function(res) {
							if ( res.success ) {
								var body = panel.querySelector('.cdw-inbox-panel-body');
								if ( body ) body.innerHTML = res.data.html;
								panel.dataset.loaded = '1';
							}
						});
					}
				}
			});

			document.addEventListener('click', function(e) {
				if ( e.target.closest('.cdw-inbox-panel-overlay') || e.target.closest('.cdw-inbox-panel-close') ) {
					var panel = getPanel();
					if ( panel && panel.contains(e.target) ) {
						closePanel(panel);
					}
				}
			});

			document.addEventListener('keydown', function(e) {
				if ( e.key === 'Escape' ) {
					var panel = getPanel();
					if ( panel && panel.classList.contains('cdw-inbox-panel--open') ) {
						closePanel(panel);
					}
				}
			});
		})();
		</script>
		<?php
	}
}
