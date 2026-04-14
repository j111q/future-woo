<?php
/**
 * State Switcher FAB — floating action button visible to admins on all
 * WooCommerce admin pages. Lets designers/QA quickly switch between
 * different UI states without manually editing the database.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WAR_State_Switcher {

	const STATE_KEY = 'war_dev_state';

	/**
	 * Boot the state switcher on WooCommerce admin pages.
	 */
	public static function register() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		add_action( 'admin_footer', array( __CLASS__, 'render_fab' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
	}

	/**
	 * Enqueue CSS/JS on all admin pages.
	 */
	public static function enqueue() {
		wp_enqueue_style(
			'war-state-switcher',
			WAR_URL . 'assets/css/state-switcher.css',
			array(),
			WAR_VERSION
		);

		wp_enqueue_script(
			'war-state-switcher',
			WAR_URL . 'assets/js/state-switcher.js',
			array(),
			WAR_VERSION,
			true
		);

		wp_localize_script( 'war-state-switcher', 'warStateData', array(
			'ajaxUrl' => admin_url( 'admin-ajax.php' ),
			'nonce'   => wp_create_nonce( 'war_nonce' ),
		) );
	}

	/**
	 * Render the floating action button.
	 */
	public static function render_fab() {
		$current = self::get_current_state();

		$states = array(
			''                => __( 'Default (live data)', 'woo-admin-revamp' ),
			'empty_store'     => __( 'Empty store (no orders)', 'woo-admin-revamp' ),
			'new_order'       => __( 'New order (pending)', 'woo-admin-revamp' ),
			'paid_order'      => __( 'Paid order (processing)', 'woo-admin-revamp' ),
			'completed_order' => __( 'Completed order (fulfilled)', 'woo-admin-revamp' ),
			'refunded_order'  => __( 'Refunded order', 'woo-admin-revamp' ),
		);
		?>
		<div id="war-state-fab" class="war-state-fab">
			<div id="war-state-menu" class="war-state-menu" hidden>
				<p class="war-state-menu-label">
					<?php esc_html_e( 'Order page state', 'woo-admin-revamp' ); ?>
				</p>
				<ul class="war-state-menu-list">
					<?php foreach ( $states as $key => $label ) : ?>
						<li>
							<button
								type="button"
								class="war-state-option <?php echo $key === $current ? 'war-state-option--active' : ''; ?>"
								data-state="<?php echo esc_attr( $key ); ?>"
							>
								<span class="war-state-option-dot" aria-hidden="true"></span>
								<?php echo esc_html( $label ); ?>
							</button>
						</li>
					<?php endforeach; ?>
				</ul>
			</div>

			<button id="war-state-fab-btn" class="war-state-fab-btn" type="button" aria-haspopup="true" aria-expanded="false">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
					<path d="M9 3v9.386l-3.846 5.24A1 1 0 006 19h12a1 1 0 00.846-1.374L15 12.387V3h-2v9.613l3 4.09-1.223.297H9.223L8 17.703l3-4.09V3H9zm-1.5-2h9A1.5 1.5 0 0118 2.5v.5H6v-.5A1.5 1.5 0 017.5 1z"/>
				</svg>
				<?php esc_html_e( 'States', 'woo-admin-revamp' ); ?>
			</button>
		</div>
		<?php
	}

	/**
	 * AJAX handler: save the selected state.
	 */
	public static function ajax_set_state() {
		check_ajax_referer( 'war_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Insufficient permissions.' ) );
		}

		$state   = isset( $_POST['state'] ) ? sanitize_key( $_POST['state'] ) : '';
		$allowed = array( '', 'empty_store', 'new_order', 'paid_order', 'completed_order', 'refunded_order' );

		if ( ! in_array( $state, $allowed, true ) ) {
			wp_send_json_error( array( 'message' => 'Invalid state.' ) );
		}

		update_user_meta( get_current_user_id(), self::STATE_KEY, $state );
		wp_send_json_success();
	}

	/**
	 * Get the currently active state override.
	 */
	public static function get_current_state(): string {
		$state = get_user_meta( get_current_user_id(), self::STATE_KEY, true );
		return is_string( $state ) ? $state : '';
	}
}

// WAR_State_Switcher no longer self-registers its FAB — the unified switcher handles UI.
// AJAX handler and state getter are still used.
// Enqueue CSS on all admin pages for the unified FAB styling.
add_action( 'admin_enqueue_scripts', array( 'WAR_State_Switcher', 'enqueue' ) );
