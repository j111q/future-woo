<?php
/**
 * Development Tool: State Switcher FAB.
 *
 * Renders a floating action button on the Dashboard (visible only to admins)
 * that lets you quickly switch between the four widget states defined in the
 * PRD, without having to manually edit the database or place real orders.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CDW_State_Switcher {

	/** User-meta key that stores the active dev state override. */
	const DEV_STATE_KEY = 'cdw_dev_state';

	/** User-meta key that stores the redesign toggle. */
	const DEV_REDESIGN_KEY = 'cdw_dev_redesign';

	/** User-meta key that stores the modern-settings toggle. */
	const DEV_MODERN_SETTINGS_KEY = 'cdw_dev_modern_settings';

	public static function register() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		add_action( 'admin_footer',     array( __CLASS__, 'render_fab' ) );
		add_filter( 'admin_body_class', array( __CLASS__, 'add_body_class' ) );
	}

	public static function add_body_class( string $classes ): string {
		if ( self::get_redesign_active() ) {
			$classes .= ' cdw-redesign';
		}
		return $classes;
	}

	// -------------------------------------------------------------------------
	// Render
	// -------------------------------------------------------------------------

	public static function render_fab() {
		$screen = get_current_screen();
		if ( ! $screen || $screen->id !== 'dashboard' ) {
			return;
		}

		$current = self::get_current_state();

		$states = array(
			'new_store'           => __( 'New store', 'custom-dashboard-widgets' ),
			'setup_in_progress'   => __( 'Store setup (2/5 done)', 'custom-dashboard-widgets' ),
			'setup_complete'      => __( 'Store setup complete', 'custom-dashboard-widgets' ),
			'whats_next_complete' => __( 'Grow your store complete', 'custom-dashboard-widgets' ),
			'active_store'        => __( 'Active store', 'custom-dashboard-widgets' ),
		);
		?>
		<div id="cdw-state-fab" class="cdw-state-fab">

			<div id="cdw-state-menu" class="cdw-state-menu" hidden>
				<p class="cdw-state-menu-label">
					<?php esc_html_e( 'Widget state', 'custom-dashboard-widgets' ); ?>
				</p>
				<ul class="cdw-state-menu-list">
					<?php foreach ( $states as $key => $label ) : ?>
						<li>
							<button
								type="button"
								class="cdw-state-option <?php echo $key === $current ? 'cdw-state-option--active' : ''; ?>"
								data-state="<?php echo esc_attr( $key ); ?>"
							>
								<span class="cdw-state-option-dot" aria-hidden="true"></span>
								<?php echo esc_html( $label ); ?>
							</button>
						</li>
					<?php endforeach; ?>
				</ul>
				<div style="border-top:1px solid #f0f0f1;padding:8px 14px 8px;">
					<p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#757575;"><?php esc_html_e( 'Inbox', 'custom-dashboard-widgets' ); ?></p>
					<button id="cdw-restore-inbox-btn" type="button" class="button button-small" style="width:100%;">
						<?php esc_html_e( 'Restore all inbox notices', 'custom-dashboard-widgets' ); ?>
					</button>
				</div>
				<div style="border-top:1px solid #f0f0f1;padding:8px 14px;">
					<label class="cdw-toggle-row" for="cdw-redesign-toggle-btn">
						<span class="cdw-toggle-label"><?php esc_html_e( 'New design', 'custom-dashboard-widgets' ); ?></span>
						<span class="cdw-toggle-switch">
							<input
								type="checkbox"
								id="cdw-redesign-toggle-btn"
								class="cdw-toggle-input"
								<?php checked( self::get_redesign_active() ); ?>
							>
							<span class="cdw-toggle-track" aria-hidden="true"></span>
						</span>
					</label>
				</div>
				<div style="border-top:1px solid #f0f0f1;padding:8px 14px;">
					<label class="cdw-toggle-row" for="cdw-modern-settings-toggle-btn">
						<span class="cdw-toggle-label"><?php esc_html_e( 'Modern settings', 'custom-dashboard-widgets' ); ?></span>
						<span class="cdw-toggle-switch">
							<input
								type="checkbox"
								id="cdw-modern-settings-toggle-btn"
								class="cdw-toggle-input"
								<?php checked( self::get_modern_settings_active() ); ?>
							>
							<span class="cdw-toggle-track" aria-hidden="true"></span>
						</span>
					</label>
				</div>
			</div>

			<button id="cdw-state-fab-btn" class="cdw-state-fab-btn" type="button" aria-haspopup="true" aria-expanded="false">
				<!-- Gutenberg "beaker" / science icon -->
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
					<path d="M9 3v9.386l-3.846 5.24A1 1 0 006 19h12a1 1 0 00.846-1.374L15 12.387V3h-2v9.613l3 4.09-1.223.297H9.223L8 17.703l3-4.09V3H9zm-1.5-2h9A1.5 1.5 0 0118 2.5v.5H6v-.5A1.5 1.5 0 017.5 1z"/>
				</svg>
				<?php esc_html_e( 'States', 'custom-dashboard-widgets' ); ?>
			</button>

		</div>
		<?php
	}

	// -------------------------------------------------------------------------
	// AJAX
	// -------------------------------------------------------------------------

	public static function ajax_set_state() {
		check_ajax_referer( 'cdw_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Insufficient permissions.' ) );
		}

		$state   = isset( $_POST['state'] ) ? sanitize_key( $_POST['state'] ) : '';
		$allowed = array( 'new_store', 'setup_in_progress', 'setup_complete', 'whats_next_complete', 'active_store' );

		if ( ! in_array( $state, $allowed, true ) ) {
			wp_send_json_error( array( 'message' => 'Invalid state.' ) );
		}

		$user_id = get_current_user_id();

		// Always update the dev-state override so the Setup widget knows
		// whether to force tasks to appear incomplete.
		update_user_meta( $user_id, self::DEV_STATE_KEY, $state );

		switch ( $state ) {
			case 'new_store':
			case 'setup_in_progress':
				delete_user_meta( $user_id, CDW_Woo_Setup_Widget::NOTICE_SHOWN_KEY );
				delete_user_meta( $user_id, CDW_Whats_Next_Widget::DISMISSED_KEY );
				break;

			case 'setup_complete':
				update_user_meta( $user_id, CDW_Woo_Setup_Widget::NOTICE_SHOWN_KEY, '1' );
				delete_user_meta( $user_id, CDW_Whats_Next_Widget::DISMISSED_KEY );
				break;

			case 'whats_next_complete':
				update_user_meta( $user_id, CDW_Woo_Setup_Widget::NOTICE_SHOWN_KEY, '1' );
				$all_ids = wp_list_pluck( self::get_whats_next_tasks(), 'id' );
				update_user_meta( $user_id, CDW_Whats_Next_Widget::DISMISSED_KEY, $all_ids );
				break;

			case 'active_store':
				update_user_meta( $user_id, CDW_Woo_Setup_Widget::NOTICE_SHOWN_KEY, '1' );
				delete_user_meta( $user_id, CDW_Whats_Next_Widget::DISMISSED_KEY );
				break;
		}

		// Reset dashboard widget order so registration order takes effect.
		delete_user_meta( $user_id, 'meta-box-order_dashboard' );

		wp_send_json_success();
	}

	public static function ajax_toggle_redesign() {
		check_ajax_referer( 'cdw_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error();
		}

		$user_id = get_current_user_id();

		if ( self::get_redesign_active() ) {
			delete_user_meta( $user_id, self::DEV_REDESIGN_KEY );
		} else {
			update_user_meta( $user_id, self::DEV_REDESIGN_KEY, '1' );
		}

		wp_send_json_success();
	}

	public static function ajax_toggle_modern_settings() {
		check_ajax_referer( 'cdw_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error();
		}

		if ( CDW_WC_Settings_Modern::is_enabled() ) {
			CDW_WC_Settings_Modern::disable();
		} else {
			CDW_WC_Settings_Modern::enable();
		}

		wp_send_json_success();
	}

	// -------------------------------------------------------------------------
	// Helpers
	// -------------------------------------------------------------------------

	public static function get_current_state(): string {
		$state = get_user_meta( get_current_user_id(), self::DEV_STATE_KEY, true );
		return is_string( $state ) ? $state : '';
	}

	public static function get_redesign_active(): bool {
		return (bool) get_user_meta( get_current_user_id(), self::DEV_REDESIGN_KEY, true );
	}

	public static function get_modern_settings_active(): bool {
		return CDW_WC_Settings_Modern::is_enabled();
	}

	/**
	 * Hard-coded list of What's Next task IDs (mirrors CDW_Whats_Next_Widget).
	 */
	private static function get_whats_next_tasks(): array {
		return array(
			array( 'id' => 'grow_business' ),
			array( 'id' => 'extensions' ),
			array( 'id' => 'payment_options' ),
			array( 'id' => 'mobile_app' ),
			array( 'id' => 'shipping_options' ),
			array( 'id' => 'connect_paypal' ),
			array( 'id' => 'fraud_protection' ),
			array( 'id' => 'google' ),
			array( 'id' => 'pinterest' ),
			array( 'id' => 'activate_payments' ),
		);
	}
}
