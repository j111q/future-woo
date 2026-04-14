<?php
/**
 * WooCommerce What's Next dashboard widget.
 *
 * Appears after the Store Setup widget is completed. Surfaces recommended
 * next steps to grow and manage the store.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CDW_Whats_Next_Widget {

	const DISMISSED_KEY = 'cdw_whats_next_dismissed';

	public static function register() {
		if ( ! self::should_show() ) {
			return;
		}

		$tasks     = self::get_tasks();
		$total     = count( self::get_all_tasks() );
		$dismissed = $total - count( $tasks );
		$all_done  = ( $total > 0 && count( $tasks ) === 0 );
		$title     = "Grow your store";

		wp_add_dashboard_widget(
			'cdw_whats_next',
			$title,
			array( __CLASS__, 'render' )
		);

	}

	// -------------------------------------------------------------------------
	// Render
	// -------------------------------------------------------------------------

	public static function render() {
		$tasks = self::get_tasks();
		?>
		<div class="cdw-whats-next-widget" id="cdw-whats-next-widget">
			<?php if ( empty( $tasks ) ) : ?>
				<?php self::render_empty_state(); ?>
			<?php else : ?>
				<ul class="cdw-setup-list">
					<?php foreach ( $tasks as $task ) : ?>
						<?php self::render_task( $task ); ?>
					<?php endforeach; ?>
				</ul>
			<?php endif; ?>
		</div>
		<?php
	}

	private static function render_task( array $task ) {
		?>
		<li class="cdw-setup-item" data-id="<?php echo esc_attr( $task['id'] ); ?>">

			<button class="cdw-setup-item-toggle" aria-expanded="false" type="button">
				<span class="cdw-setup-item-icon" aria-hidden="true">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M6.6 15.6L5.4 16.4C6 17.3 6.7 18 7.6 18.6L8.4 17.4C7.7 16.9 7.1 16.3 6.6 15.6ZM5.5 12C5.5 11.6 5.5 11.1 5.6 10.7L4.1 10.4C4.1 10.9 4 11.5 4 12C4 12.5 4.1 13.1 4.2 13.6L5.7 13.3C5.5 12.9 5.5 12.4 5.5 12ZM17.4 8.4L18.6 7.6C18 6.7 17.3 6 16.4 5.4L15.6 6.6C16.3 7.1 16.9 7.7 17.4 8.4ZM5.3 7.6L6.5 8.4C7 7.7 7.6 7.1 8.3 6.6L7.6 5.3C6.7 5.9 5.9 6.7 5.3 7.6ZM19.8 10.4L18.3 10.7C18.4 11.1 18.4 11.5 18.4 12C18.4 12.5 18.4 12.9 18.3 13.3L19.8 13.6C19.9 13.1 20 12.6 20 12C20 11.4 19.9 10.9 19.8 10.4ZM12 18.5C11.6 18.5 11.1 18.5 10.7 18.4L10.4 19.9C10.9 20 11.4 20.1 12 20.1C12.6 20.1 13.1 20 13.6 19.9L13.3 18.4C12.9 18.5 12.4 18.5 12 18.5ZM15.6 17.4L16.4 18.6C17.3 18 18 17.3 18.6 16.4L17.4 15.6C16.9 16.3 16.3 16.9 15.6 17.4ZM10.4 4.2L10.7 5.7C11.1 5.6 11.5 5.6 12 5.6C12.5 5.6 12.9 5.6 13.3 5.7L13.6 4.2C13.1 4.1 12.5 4 12 4C11.5 4 10.9 4.1 10.4 4.2Z" fill="#1E1E1E"/>
					</svg>
				</span>

				<span class="cdw-setup-item-title"><?php echo esc_html( $task['title'] ); ?></span>

				<span class="cdw-setup-item-chevron" aria-hidden="true">
					<!-- Gutenberg "chevronDown" icon -->
					<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
						<path d="M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z"/>
					</svg>
				</span>
			</button>

			<div class="cdw-setup-item-body cdw-whats-next-body" hidden>
				<?php if ( ! empty( $task['content'] ) ) : ?>
					<p class="cdw-setup-item-desc"><?php echo wp_kses_post( $task['content'] ); ?></p>
				<?php endif; ?>

				<div class="cdw-whats-next-actions">
					<?php if ( ! empty( $task['url'] ) ) : ?>
						<a href="<?php echo esc_url( $task['url'] ); ?>" class="button button-primary">
							<?php echo esc_html( $task['action_label'] ); ?>
						</a>
					<?php endif; ?>
					<button
						type="button"
						class="button-link cdw-whats-next-dismiss"
						data-id="<?php echo esc_attr( $task['id'] ); ?>"
					>
						<?php esc_html_e( 'Dismiss', 'custom-dashboard-widgets' ); ?>
					</button>
				</div>
			</div>

		</li>
		<?php
	}

	private static function render_empty_state() {
		?>
		<div class="cdw-whats-next-empty">
			<img
				src="<?php echo esc_url( WAR_URL . 'assets/images/check-list.svg' ); ?>"
				alt=""
				aria-hidden="true"
				class="cdw-whats-next-empty-illustration"
			/>
			<p class="cdw-whats-next-empty-text">
				<?php esc_html_e( "You're all caught up! Check back later for new recommendations.", 'custom-dashboard-widgets' ); ?>
			</p>
		</div>
		<?php
	}

	// -------------------------------------------------------------------------
	// AJAX handlers
	// -------------------------------------------------------------------------

	public static function ajax_dismiss_task() {
		check_ajax_referer( 'cdw_nonce', 'nonce' );

		$id = isset( $_POST['id'] ) ? sanitize_text_field( wp_unslash( $_POST['id'] ) ) : '';
		if ( ! $id ) {
			wp_send_json_error( array( 'message' => 'Invalid task ID.' ) );
		}

		$dismissed   = self::get_dismissed_ids();
		$dismissed[] = $id;
		update_user_meta( get_current_user_id(), self::DISMISSED_KEY, array_unique( $dismissed ) );

		$remaining = count( self::get_tasks() );
		wp_send_json_success( array( 'remaining' => $remaining ) );
	}

	public static function ajax_dismiss_all() {
		check_ajax_referer( 'cdw_nonce', 'nonce' );

		$all_ids = wp_list_pluck( self::get_all_tasks(), 'id' );
		update_user_meta( get_current_user_id(), self::DISMISSED_KEY, $all_ids );

		wp_send_json_success();
	}

	// -------------------------------------------------------------------------
	// Task data
	// -------------------------------------------------------------------------

	private static function get_tasks() {
		$dismissed = self::get_dismissed_ids();
		return array_values( array_filter(
			self::get_all_tasks(),
			fn( $t ) => ! in_array( $t['id'], $dismissed, true )
		) );
	}

	private static function get_all_tasks() {
		return array(
			array(
				'id'           => 'grow_business',
				'title'        => __( 'Grow your business', 'custom-dashboard-widgets' ),
				'content'      => __( 'Reach new customers and increase revenue with built-in marketing tools and insights tailored to your store.', 'custom-dashboard-widgets' ),
				'url'          => admin_url( 'admin.php?page=wc-admin&path=/marketing' ),
				'action_label' => __( 'Explore growth tools', 'custom-dashboard-widgets' ),
			),
			array(
				'id'           => 'extensions',
				'title'        => __( 'Enhance your store with extensions', 'custom-dashboard-widgets' ),
				'content'      => __( 'Add powerful features like subscriptions, bookings, and more with WooCommerce extensions.', 'custom-dashboard-widgets' ),
				'url'          => admin_url( 'admin.php?page=wc-addons' ),
				'action_label' => __( 'Browse extensions', 'custom-dashboard-widgets' ),
			),
			array(
				'id'           => 'payment_options',
				'title'        => __( 'Set up additional payment options', 'custom-dashboard-widgets' ),
				'content'      => __( 'Give customers more ways to pay and reduce cart abandonment at checkout.', 'custom-dashboard-widgets' ),
				'url'          => admin_url( 'admin.php?page=wc-settings&tab=checkout' ),
				'action_label' => __( 'Add payment methods', 'custom-dashboard-widgets' ),
			),
			array(
				'id'           => 'mobile_app',
				'title'        => __( 'Get the free WooCommerce mobile app', 'custom-dashboard-widgets' ),
				'content'      => __( 'Manage orders, track sales, and stay on top of your store from anywhere.', 'custom-dashboard-widgets' ),
				'url'          => 'https://woo.com/mobile/',
				'action_label' => __( 'Download the app', 'custom-dashboard-widgets' ),
			),
			array(
				'id'           => 'shipping_options',
				'title'        => __( 'Review shipping options', 'custom-dashboard-widgets' ),
				'content'      => __( 'Make sure your shipping zones, rates, and methods are configured so orders reach customers smoothly.', 'custom-dashboard-widgets' ),
				'url'          => admin_url( 'admin.php?page=wc-settings&tab=shipping' ),
				'action_label' => __( 'Review shipping', 'custom-dashboard-widgets' ),
			),
			array(
				'id'           => 'connect_paypal',
				'title'        => __( 'Connect PayPal to complete setup', 'custom-dashboard-widgets' ),
				'content'      => __( 'PayPal Payments is almost ready — link your account to start accepting payments instantly.', 'custom-dashboard-widgets' ),
				'url'          => admin_url( 'admin.php?page=wc-settings&tab=checkout&section=ppcp-gateway' ),
				'action_label' => __( 'Activate PayPal', 'custom-dashboard-widgets' ),
			),
			array(
				'id'           => 'fraud_protection',
				'title'        => __( 'Enable required fraud protection for PayPal Payments', 'custom-dashboard-widgets' ),
				'content'      => __( 'Keep your store secure and stay compliant with PayPal\'s built-in fraud detection tools.', 'custom-dashboard-widgets' ),
				'url'          => admin_url( 'admin.php?page=wc-settings&tab=checkout&section=ppcp-gateway' ),
				'action_label' => __( 'Enable protection', 'custom-dashboard-widgets' ),
			),
			array(
				'id'           => 'google',
				'title'        => __( 'Set up Google for WooCommerce', 'custom-dashboard-widgets' ),
				'content'      => __( 'Sync your products with Google and get discovered by shoppers searching across Google surfaces.', 'custom-dashboard-widgets' ),
				'url'          => admin_url( 'admin.php?page=wc-admin&path=/google/start' ),
				'action_label' => __( 'Connect Google', 'custom-dashboard-widgets' ),
			),
			array(
				'id'           => 'pinterest',
				'title'        => __( 'Get your products in front of engaged shoppers with Pinterest for WooCommerce', 'custom-dashboard-widgets' ),
				'content'      => __( 'Turn your product catalog into shoppable Pins and reach millions of motivated buyers.', 'custom-dashboard-widgets' ),
				'url'          => admin_url( 'admin.php?page=wc-admin&path=/pinterest/start' ),
				'action_label' => __( 'Connect Pinterest', 'custom-dashboard-widgets' ),
			),
			array(
				'id'           => 'activate_payments',
				'title'        => __( 'Activate payments', 'custom-dashboard-widgets' ),
				'content'      => __( 'Start accepting payments from customers and get your store ready to sell.', 'custom-dashboard-widgets' ),
				'url'          => admin_url( 'admin.php?page=wc-settings&tab=checkout' ),
				'action_label' => __( 'Activate now', 'custom-dashboard-widgets' ),
			),
		);
	}

	private static function get_dismissed_ids() {
		$dismissed = get_user_meta( get_current_user_id(), self::DISMISSED_KEY, true );
		return is_array( $dismissed ) ? $dismissed : array();
	}

	// -------------------------------------------------------------------------
	// Visibility check
	// -------------------------------------------------------------------------

	private static function should_show() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return false;
		}

		// Show only after Store Setup has been completed (meta set on first post-completion visit).
		return (bool) get_user_meta( get_current_user_id(), CDW_Woo_Setup_Widget::NOTICE_SHOWN_KEY, true );
	}
}
