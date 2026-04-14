<?php
/**
 * Unified State Switcher FAB.
 *
 * A single purple floating button on all admin pages. Shows relevant state
 * options depending on the current page. Appears grey and disabled on pages
 * that have no states.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WAR_Unified_State_Switcher {

	public static function register() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		add_action( 'admin_footer', array( __CLASS__, 'render_fab' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
	}

	public static function enqueue() {
		wp_enqueue_script(
			'war-unified-state-switcher',
			WAR_URL . 'assets/js/unified-state-switcher.js',
			array(),
			WAR_VERSION,
			true
		);

		wp_localize_script( 'war-unified-state-switcher', 'warUnifiedData', array(
			'ajaxUrl' => admin_url( 'admin-ajax.php' ),
			'nonce'   => wp_create_nonce( 'war_nonce' ),
			'cdwNonce' => wp_create_nonce( 'cdw_nonce' ),
		) );
	}

	/**
	 * Determine which state group applies to the current page.
	 * Returns: 'dashboard', 'orders', 'order_page', or '' (no states).
	 */
	private static function get_current_context(): string {
		$screen = get_current_screen();
		if ( ! $screen ) {
			return '';
		}

		// Dashboard (WP dashboard, WooCommerce Home, or Store Dashboard).
		if (
			$screen->id === 'dashboard'
			|| $screen->id === 'woocommerce_page_wc-admin'
			|| false !== strpos( $screen->id, 'war-store-dashboard' )
		) {
			return 'dashboard';
		}

		// Orders list page (not individual order edit).
		if ( $screen->id === 'woocommerce_page_wc-orders' ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$action = isset( $_GET['action'] ) ? sanitize_key( $_GET['action'] ) : '';
			if ( $action !== 'edit' ) {
				return 'orders';
			}
			return '';
		}

		// Products list page.
		if ( $screen->id === 'edit-product' || ( $screen->base === 'edit' && $screen->post_type === 'product' ) ) {
			return 'products';
		}

		return '';
	}

	public static function render_fab() {
		$context = self::get_current_context();
		$global_state = WAR_Global_State_Manager::get_state();
		$is_dashboard = ( $context === 'dashboard' );

		$plugin_enabled = get_user_meta( get_current_user_id(), 'war_plugin_enabled', true );
		if ( $plugin_enabled === '' ) {
			$plugin_enabled = '1';
		}
		$is_enabled = ( $plugin_enabled === '1' );

		// Global states with descriptions.
		$global_states = array(
			'new_store'    => array(
				'label' => __( 'New store', 'woo-admin-revamp' ),
				'desc'  => __( 'Empty dashboard with setup widget. No products, no orders.', 'woo-admin-revamp' ),
			),
			'setting_up'   => array(
				'label' => __( 'Store being set up', 'woo-admin-revamp' ),
				'desc'  => __( 'Setup checklist 2/5 done. Ceramic products added, no orders yet.', 'woo-admin-revamp' ),
			),
			'active_store' => array(
				'label' => __( 'Active store', 'woo-admin-revamp' ),
				'desc'  => __( 'Setup complete. Products and orders populated with realistic data.', 'woo-admin-revamp' ),
			),
		);


		?>
		<div id="war-unified-fab" class="war-state-fab">
			<div id="war-unified-menu" class="war-state-menu" hidden>
				<!-- Plugin toggle -->
				<div style="padding:12px 16px;border-bottom:1px solid #f0f0f1;">
					<label class="war-toggle-row" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;">
						<span style="font-size:13px;font-weight:600;color:#1d2327;"><?php esc_html_e( 'Admin revamp', 'woo-admin-revamp' ); ?></span>
						<span class="war-toggle-switch">
							<input type="checkbox" id="war-plugin-toggle" class="war-toggle-input"
								<?php checked( $is_enabled ); ?>>
							<span class="war-toggle-track" aria-hidden="true"></span>
						</span>
					</label>
				</div>

				<!-- Global store state -->
				<p class="war-state-menu-label"><?php esc_html_e( 'Store state', 'woo-admin-revamp' ); ?></p>
				<ul class="war-state-menu-list">
					<?php foreach ( $global_states as $key => $info ) : ?>
						<li>
							<button type="button"
								class="war-state-option <?php echo $key === $global_state ? 'war-state-option--active' : ''; ?>"
								data-ajax-action="war_global_set_state"
								data-nonce="<?php echo esc_attr( wp_create_nonce( 'war_nonce' ) ); ?>"
								data-state="<?php echo esc_attr( $key ); ?>">
								<span class="war-state-option-dot" aria-hidden="true"></span>
								<span class="war-state-option-content">
									<span class="war-state-option-label"><?php echo esc_html( $info['label'] ); ?></span>
									<span class="war-state-option-desc"><?php echo esc_html( $info['desc'] ); ?></span>
								</span>
							</button>
						</li>
					<?php endforeach; ?>
				</ul>

				<!-- Admin experience toggles -->
				<div style="border-top:1px solid #f0f0f1;padding:4px 0;">
					<p class="war-state-menu-label"><?php esc_html_e( 'Admin experience', 'woo-admin-revamp' ); ?></p>
					<div style="padding:4px 16px 8px;">
						<label style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;margin-bottom:8px;" for="war-default-store-toggle">
							<span>
								<span style="font-size:13px;display:block;"><?php esc_html_e( 'Open WooCommerce by default', 'woo-admin-revamp' ); ?></span>
								<span style="font-size:11px;color:#757575;display:block;"><?php esc_html_e( 'Open admin into a WooCommerce dashboard with store widgets.', 'woo-admin-revamp' ); ?></span>
							</span>
							<span class="war-toggle-switch">
								<input type="checkbox" id="war-default-store-toggle" class="war-toggle-input"
									<?php checked( WAR_Admin_Experience_API::is_default_to_store() ); ?>>
								<span class="war-toggle-track" aria-hidden="true"></span>
							</span>
						</label>
						<label style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;" for="war-store-menu-toggle">
							<span>
								<span style="font-size:13px;display:block;"><?php esc_html_e( 'Show Store menu in top bar', 'woo-admin-revamp' ); ?></span>
								<span style="font-size:11px;color:#757575;display:block;"><?php esc_html_e( 'Quick access to orders, products, and inbox.', 'woo-admin-revamp' ); ?></span>
							</span>
							<span class="war-toggle-switch">
								<input type="checkbox" id="war-store-menu-toggle" class="war-toggle-input"
									<?php checked( WAR_Admin_Experience_API::is_store_menu_enabled() ); ?>>
								<span class="war-toggle-track" aria-hidden="true"></span>
							</span>
						</label>
					</div>
				</div>

				<?php if ( $is_dashboard ) : ?>
				<!-- Dashboard-specific options -->
				<div style="border-top:1px solid #f0f0f1;padding:4px 0;">
					<p class="war-state-menu-label"><?php esc_html_e( 'Dashboard', 'woo-admin-revamp' ); ?></p>
					<div style="padding:4px 16px 8px;">
						<label style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;margin-bottom:8px;" for="war-redesign-toggle">
							<span>
								<span style="font-size:13px;display:block;"><?php esc_html_e( 'New design', 'woo-admin-revamp' ); ?></span>
								<span style="font-size:11px;color:#757575;display:block;"><?php esc_html_e( 'Switch to the redesigned dashboard layout.', 'woo-admin-revamp' ); ?></span>
							</span>
							<span class="war-toggle-switch">
								<input type="checkbox" id="war-redesign-toggle" class="war-toggle-input"
									<?php checked( CDW_State_Switcher::get_redesign_active() ); ?>>
								<span class="war-toggle-track" aria-hidden="true"></span>
							</span>
						</label>

					</div>
				</div>
				<?php endif; ?>
			</div>

			<button id="war-unified-fab-btn"
				class="war-state-fab-btn"
				type="button"
				aria-haspopup="true"
				aria-expanded="false">
				<?php esc_html_e( 'States', 'woo-admin-revamp' ); ?>
			</button>
		</div>

		<script>
		document.getElementById('war-unified-fab').addEventListener('change', function(e) {
			var t = e.target;
			if (!t.id) return;

			var fab = document.getElementById('war-unified-fab-btn');
			function loading() {
				fab.classList.add('war-state-fab-btn--loading');
				fab.disabled = true;
				fab.innerHTML = '<span class="war-fab-spinner"></span> Loading\u2026';
				document.getElementById('war-unified-menu').hidden = true;
			}
			function done() {
				fab.classList.remove('war-state-fab-btn--loading');
				fab.disabled = false;
				fab.textContent = 'States';
			}
			function post(data) {
				loading();
				jQuery.post(<?php echo wp_json_encode( admin_url( 'admin-ajax.php' ) ); ?>, data)
					.done(function(res){ if(res.success) window.location.reload(); else done(); })
					.fail(function(){ done(); });
			}

			if (t.id === 'war-redesign-toggle') {
				post({action:'cdw_toggle_redesign', nonce:<?php echo wp_json_encode( wp_create_nonce( 'cdw_nonce' ) ); ?>});
			} else if (t.id === 'war-plugin-toggle') {
				post({action:'war_toggle_plugin', nonce:<?php echo wp_json_encode( wp_create_nonce( 'war_nonce' ) ); ?>, enabled: t.checked ? '1' : '0'});
			} else if (t.id === 'war-default-store-toggle' || t.id === 'war-store-menu-toggle') {
				var map = {'war-default-store-toggle':'war_default_to_store','war-store-menu-toggle':'war_show_store_menu'};
				post({action:'war_toggle_admin_experience', nonce:<?php echo wp_json_encode( wp_create_nonce( 'war_nonce' ) ); ?>, option: map[t.id], value: t.checked ? 'yes' : 'no'});
			}
		});
		</script>
		<?php
	}

	/**
	 * AJAX handler: toggle plugin enabled/disabled.
	 */
	public static function ajax_toggle_plugin() {
		check_ajax_referer( 'war_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error();
		}

		$enabled = isset( $_POST['enabled'] ) ? sanitize_key( $_POST['enabled'] ) : '1';
		update_user_meta( get_current_user_id(), 'war_plugin_enabled', $enabled );
		wp_send_json_success();
	}

	/**
	 * Check if the plugin is enabled for the current user.
	 */
	public static function is_plugin_enabled(): bool {
		$val = get_user_meta( get_current_user_id(), 'war_plugin_enabled', true );
		// Default to enabled if never set.
		return ( $val === '' || $val === '1' );
	}

	/**
	 * AJAX handler: toggle admin experience options.
	 */
	public static function ajax_toggle_admin_experience() {
		check_ajax_referer( 'war_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error();
		}

		$option = isset( $_POST['option'] ) ? sanitize_key( $_POST['option'] ) : '';
		$value  = isset( $_POST['value'] ) ? sanitize_key( $_POST['value'] ) : 'no';
		$allowed = array( 'war_default_to_store', 'war_show_store_menu' );

		if ( ! in_array( $option, $allowed, true ) ) {
			wp_send_json_error( array( 'message' => 'Invalid option.' ) );
		}

		update_option( $option, $value );
		wp_send_json_success();
	}
}
