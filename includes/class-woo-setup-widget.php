<?php
/**
 * WooCommerce Store Setup dashboard widget.
 *
 * Mirrors the collapsible checklist style of the WordPress.com "Site Setup"
 * widget but is driven entirely by WooCommerce's own onboarding task list
 * (the same data that powers WooCommerce > My Home).
 *
 * Requires WooCommerce 6.0+ (uses Automattic\WooCommerce\Admin\Features\OnboardingTasks\TaskLists).
 * Falls back gracefully when WooCommerce is absent or older.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CDW_Woo_Setup_Widget {

	const NOTICE_SHOWN_KEY = 'cdw_setup_complete_notice_shown';

	public static function register() {
		if ( ! self::is_supported() ) {
			return;
		}

		// Dev-state: hide Setup widget when a post-setup state is active.
		if ( class_exists( 'CDW_State_Switcher' ) ) {
			$state = CDW_State_Switcher::get_current_state();
			if ( in_array( $state, array( 'setup_complete', 'whats_next_complete', 'active_store' ), true ) ) { // phpcs:ignore WordPress.PHP.StrictInArray.MissingTrueStrict
				// Show the celebratory notice for the "setup complete" state.
				if ( $state === 'setup_complete' ) {
					add_action( 'admin_notices', array( __CLASS__, 'render_complete_notice' ) );
				}
				return;
			}
		}

		$tasks    = self::get_tasks();
		$total    = count( $tasks );
		$done     = count( array_filter( $tasks, fn( $t ) => $t['complete'] ) );
		$all_done = ( $total > 0 && $done === $total );

		// Dev-state override: force the Setup widget to appear even if all real
		// tasks are complete, so QA can inspect the "new store" state.
		if ( class_exists( 'CDW_State_Switcher' ) && CDW_State_Switcher::get_current_state() === 'new_store' ) {
			$all_done = false;
		}

		if ( $all_done ) {
			// Show a one-time celebratory notice on the first visit after completion.
			$notice_shown = get_user_meta( get_current_user_id(), self::NOTICE_SHOWN_KEY, true );
			if ( ! $notice_shown ) {
				add_action( 'admin_notices', array( __CLASS__, 'render_complete_notice' ) );
				update_user_meta( get_current_user_id(), self::NOTICE_SHOWN_KEY, '1' );
			}
			// Don't register Store Setup — What's Next widget takes over.
			return;
		}

		$title = sprintf(
			/* translators: 1: completed task count, 2: total task count */
			'Store Setup <span class="cdw-setup-progress">%1$d/%2$d completed</span>',
			$done,
			$total
		);

		wp_add_dashboard_widget(
			'cdw_woo_setup',
			$title,
			array( __CLASS__, 'render' )
		);
	}

	// -------------------------------------------------------------------------
	// Celebratory notice
	// -------------------------------------------------------------------------

	public static function render_complete_notice() {
		?>
		<div class="notice notice-success is-dismissible">
			<p>
				<strong><?php esc_html_e( 'You\'ve completed your store setup!', 'custom-dashboard-widgets' ); ?></strong>
				<?php esc_html_e( 'Your store is ready. Check out What\'s Next to keep growing.', 'custom-dashboard-widgets' ); ?>
			</p>
		</div>
		<?php
	}

	// -------------------------------------------------------------------------
	// Render
	// -------------------------------------------------------------------------

	public static function render() {
		$tasks = self::get_tasks();

		if ( empty( $tasks ) ) {
			echo '<p class="cdw-setup-empty">' . esc_html__( 'No setup tasks found.', 'custom-dashboard-widgets' ) . '</p>';
			return;
		}
		?>
		<div class="cdw-setup-widget" id="cdw-setup-widget">
			<ul class="cdw-setup-list">
				<?php foreach ( $tasks as $task ) : ?>
					<?php self::render_task( $task ); ?>
				<?php endforeach; ?>
			</ul>
		</div>
		<?php
	}

	private static function render_task( array $task ) {
		$complete      = $task['complete'];
		$half_complete = ! $complete && ! empty( $task['half_complete'] );

		$item_class = 'cdw-setup-item';
		if ( $complete ) {
			$item_class .= ' cdw-setup-item--done';
		} elseif ( $half_complete ) {
			$item_class .= ' cdw-setup-item--half';
		}
		?>
		<li class="<?php echo esc_attr( $item_class ); ?>" data-id="<?php echo esc_attr( $task['id'] ); ?>">

			<button
				class="cdw-setup-item-toggle"
				aria-expanded="false"
				type="button"
			>
				<span class="cdw-setup-item-icon" aria-hidden="true">
					<?php if ( $complete ) : ?>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M16.7 7.10001L10.4 15.6L7.1 13.1L6.2 14.3L10.7 17.7L17.9 8.00001L16.7 7.10001Z" fill="#4AB866"/>
						</svg>
					<?php elseif ( $half_complete ) : ?>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path fill-rule="evenodd" clip-rule="evenodd" d="M12 18.5C10.2761 18.5 8.62279 17.8152 7.40381 16.5962C6.18482 15.3772 5.5 13.7239 5.5 12C5.5 10.2761 6.18482 8.62279 7.40381 7.40381C8.62279 6.18482 10.2761 5.5 12 5.5C13.7239 5.5 15.3772 6.18482 16.5962 7.40381C17.8152 8.62279 18.5 10.2761 18.5 12C18.5 13.7239 17.8152 15.3772 16.5962 16.5962C15.3772 17.8152 13.7239 18.5 12 18.5ZM4 12C4 9.87827 4.84285 7.84344 6.34315 6.34315C7.84344 4.84285 9.87827 4 12 4C14.1217 4 16.1566 4.84285 17.6569 6.34315C19.1571 7.84344 20 9.87827 20 12C20 14.1217 19.1571 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20C9.87827 20 7.84344 19.1571 6.34315 17.6569C4.84285 16.1566 4 14.1217 4 12ZM12 16C13.0609 16 14.0783 15.5786 14.8284 14.8284C15.5786 14.0783 16 13.0609 16 12H8C8 13.0609 8.42143 14.0783 9.17157 14.8284C9.92172 15.5786 10.9391 16 12 16Z" fill="#1E1E1E"/>
						</svg>
					<?php else : ?>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M6.6 15.6L5.4 16.4C6 17.3 6.7 18 7.6 18.6L8.4 17.4C7.7 16.9 7.1 16.3 6.6 15.6ZM5.5 12C5.5 11.6 5.5 11.1 5.6 10.7L4.1 10.4C4.1 10.9 4 11.5 4 12C4 12.5 4.1 13.1 4.2 13.6L5.7 13.3C5.5 12.9 5.5 12.4 5.5 12ZM17.4 8.4L18.6 7.6C18 6.7 17.3 6 16.4 5.4L15.6 6.6C16.3 7.1 16.9 7.7 17.4 8.4ZM5.3 7.6L6.5 8.4C7 7.7 7.6 7.1 8.3 6.6L7.6 5.3C6.7 5.9 5.9 6.7 5.3 7.6ZM19.8 10.4L18.3 10.7C18.4 11.1 18.4 11.5 18.4 12C18.4 12.5 18.4 12.9 18.3 13.3L19.8 13.6C19.9 13.1 20 12.6 20 12C20 11.4 19.9 10.9 19.8 10.4ZM12 18.5C11.6 18.5 11.1 18.5 10.7 18.4L10.4 19.9C10.9 20 11.4 20.1 12 20.1C12.6 20.1 13.1 20 13.6 19.9L13.3 18.4C12.9 18.5 12.4 18.5 12 18.5ZM15.6 17.4L16.4 18.6C17.3 18 18 17.3 18.6 16.4L17.4 15.6C16.9 16.3 16.3 16.9 15.6 17.4ZM10.4 4.2L10.7 5.7C11.1 5.6 11.5 5.6 12 5.6C12.5 5.6 12.9 5.6 13.3 5.7L13.6 4.2C13.1 4.1 12.5 4 12 4C11.5 4 10.9 4.1 10.4 4.2Z" fill="#1E1E1E"/>
						</svg>
					<?php endif; ?>
				</span>

				<span class="cdw-setup-item-title">
					<?php echo esc_html( $task['title'] ); ?>
					<?php if ( $half_complete && ! empty( $task['badge'] ) ) : ?>
						<span class="cdw-setup-item-badge"><?php echo esc_html( $task['badge'] ); ?></span>
					<?php endif; ?>
				</span>

				<span class="cdw-setup-item-chevron" aria-hidden="true">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</span>
			</button>

			<div class="cdw-setup-item-body" hidden>
				<?php if ( ! empty( $task['content'] ) ) : ?>
					<p class="cdw-setup-item-desc"><?php echo wp_kses_post( $task['content'] ); ?></p>
				<?php endif; ?>

				<?php if ( ! empty( $task['url'] ) ) : ?>
					<a
						href="<?php echo esc_url( $task['url'] ); ?>"
						class="button button-primary"
					>
						<?php echo esc_html( $task['action_label'] ); ?>
					</a>
				<?php endif; ?>
			</div>

		</li>
		<?php
	}

	// -------------------------------------------------------------------------
	// Task data
	// -------------------------------------------------------------------------

	/**
	 * Our custom text overrides for each task.
	 */
	private static function get_task_overrides(): array {
		return array(
			'products' => array(
				'title'        => __( 'Add your products', 'custom-dashboard-widgets' ),
				'content'      => __( 'Start selling by adding products or services to your store. Choose to list products manually, or import them from a different store.', 'custom-dashboard-widgets' ),
				'action_label' => __( 'Add products', 'custom-dashboard-widgets' ),
			),
			'payments' => array(
				'title'        => __( 'Set up payments', 'custom-dashboard-widgets' ),
				'content'      => __( 'Give your customers an easy and convenient way to pay! Set up one (or more!) of our fast and secure online or in person payment methods.', 'custom-dashboard-widgets' ),
				'action_label' => __( 'Get paid', 'custom-dashboard-widgets' ),
			),
			'appearance' => array(
				'title'        => __( 'Customize your store', 'custom-dashboard-widgets' ),
				'content'      => __( 'Quickly create a beautiful looking store using our built-in store designer, or select a pre-built theme and customize it to fit your brand.', 'custom-dashboard-widgets' ),
				'action_label' => __( 'Start customizing', 'custom-dashboard-widgets' ),
			),
			'customize-store' => array(
				'title'        => __( 'Customize your store', 'custom-dashboard-widgets' ),
				'content'      => __( 'Quickly create a beautiful looking store using our built-in store designer, or select a pre-built theme and customize it to fit your brand.', 'custom-dashboard-widgets' ),
				'action_label' => __( 'Start customizing', 'custom-dashboard-widgets' ),
			),
			'tax' => array(
				'title'        => __( 'Collect sales tax', 'custom-dashboard-widgets' ),
				'content'      => __( 'Choose to set up your tax rates manually, or use one of our tax automation tools.', 'custom-dashboard-widgets' ),
				'action_label' => __( 'Get started', 'custom-dashboard-widgets' ),
			),
			'shipping' => array(
				'title'        => __( 'Select your shipping options', 'custom-dashboard-widgets' ),
				'content'      => __( "Choose where and how you'd like to ship your products, along with any fixed or calculated rates.", 'custom-dashboard-widgets' ),
				'action_label' => __( 'Start shipping', 'custom-dashboard-widgets' ),
			),
			'launch-your-store' => array(
				'title'        => __( 'Launch your store', 'custom-dashboard-widgets' ),
				'content'      => __( "It's time to celebrate – you're ready to launch your store! Woo! Hit the button to preview your store and make it public.", 'custom-dashboard-widgets' ),
				'action_label' => __( 'Launch store', 'custom-dashboard-widgets' ),
			),
			'launch' => array(
				'title'        => __( 'Launch your store', 'custom-dashboard-widgets' ),
				'content'      => __( "It's time to celebrate – you're ready to launch your store! Woo! Hit the button to preview your store and make it public.", 'custom-dashboard-widgets' ),
				'action_label' => __( 'Launch store', 'custom-dashboard-widgets' ),
			),
		);
	}

	/**
	 * Public accessor for tasks (used by admin bar menu).
	 */
	public static function get_tasks_public() {
		return self::get_tasks();
	}

	private static function get_tasks() {
		if ( class_exists( '\Automattic\WooCommerce\Admin\Features\OnboardingTasks\TaskLists' ) ) {
			$tasks = self::get_tasks_from_api();
		} else {
			$tasks = self::get_tasks_fallback();
		}

		// Apply our custom text overrides.
		$overrides = self::get_task_overrides();
		foreach ( $tasks as &$task ) {
			if ( isset( $overrides[ $task['id'] ] ) ) {
				$o = $overrides[ $task['id'] ];
				$task['title']        = $o['title'];
				$task['content']      = $o['content'];
				$task['action_label'] = $o['action_label'];
			}
		}
		unset( $task );

		// Dev-state overrides.
		if ( class_exists( 'CDW_State_Switcher' ) ) {
			$dev_state = CDW_State_Switcher::get_current_state();

			if ( $dev_state === 'new_store' ) {
				// All tasks incomplete.
				foreach ( $tasks as &$task ) {
					$task['complete']      = false;
					$task['half_complete'] = false;
					$task['badge']         = '';
				}
				unset( $task );
			} elseif ( $dev_state === 'setup_in_progress' ) {
				// First 2 complete, payments half-complete, rest incomplete.
				$completed_count = 0;
				foreach ( $tasks as &$task ) {
					if ( $task['id'] === 'payments' ) {
						$task['complete']      = false;
						$task['half_complete'] = true;
						$task['badge']         = __( 'Test account', 'custom-dashboard-widgets' );
					} elseif ( $completed_count < 2 ) {
						$task['complete']      = true;
						$task['half_complete'] = false;
						$task['badge']         = '';
						$completed_count++;
					} else {
						$task['complete']      = false;
						$task['half_complete'] = false;
						$task['badge']         = '';
					}
				}
				unset( $task );
			}
		}

		return $tasks;
	}

	/**
	 * Pull tasks from WooCommerce's TaskLists API (WC 6+).
	 */
	private static function get_tasks_from_api() {
		$list = \Automattic\WooCommerce\Admin\Features\OnboardingTasks\TaskLists::get_list( 'setup' );

		if ( ! $list ) {
			return array();
		}

		$out = array();

		// Tasks we always want to include even if WC hides them.
		$force_include = array( 'shipping' );

		foreach ( $list->tasks as $task ) {
			if ( $task->get_id() === 'store_details' ) {
				continue;
			}
			if ( method_exists( $task, 'can_view' ) && ! $task->can_view() && ! in_array( $task->get_id(), $force_include, true ) ) {
				continue;
			}

			$is_complete = (bool) $task->is_complete();

			$action_label = method_exists( $task, 'get_action_label' )
				? $task->get_action_label()
				: __( 'Complete task', 'custom-dashboard-widgets' );

			if ( $is_complete && $action_label === __( 'Complete task', 'custom-dashboard-widgets' ) ) {
				$action_label = __( 'Review', 'custom-dashboard-widgets' );
			}

			$half_complete = false;
			$badge         = '';

			if ( $task->get_id() === 'payments' && ! $is_complete && self::is_payments_half_complete() ) {
				$half_complete = true;
				$badge         = __( 'Test account', 'custom-dashboard-widgets' );
			}

			$url = method_exists( $task, 'get_action_url' ) ? $task->get_action_url() : '';

			// Some tasks return empty URLs because they open inside the WC Admin React
			// app. Provide direct fallback URLs so the CTA always works.
			if ( empty( $url ) ) {
				$url = self::fallback_url( $task->get_id() );
			}

			$out[] = array(
				'id'            => $task->get_id(),
				'title'         => $task->get_title(),
				'content'       => method_exists( $task, 'get_content' ) ? $task->get_content() : '',
				'url'           => $url,
				'action_label'  => $action_label,
				'complete'      => $is_complete,
				'half_complete' => $half_complete,
				'badge'         => $badge,
			);
		}

		return $out;
	}

	/**
	 * Fallback for WooCommerce < 6 or installs without wc-admin.
	 */
	private static function get_tasks_fallback() {
		$payments_half = self::is_payments_half_complete();

		return array(
			array(
				'id'            => 'products',
				'title'         => __( 'Add your products', 'custom-dashboard-widgets' ),
				'content'       => __( 'Start selling by adding products or services to your store. Choose to list products manually, or import them from a different store.', 'custom-dashboard-widgets' ),
				'url'           => admin_url( 'post-new.php?post_type=product' ),
				'action_label'  => __( 'Add products', 'custom-dashboard-widgets' ),
				'complete'      => self::has_products(),
				'half_complete' => false,
				'badge'         => '',
			),
			array(
				'id'            => 'payments',
				'title'         => __( 'Set up payments', 'custom-dashboard-widgets' ),
				'content'       => __( 'Give your customers an easy and convenient way to pay! Set up one (or more!) of our fast and secure online or in person payment methods.', 'custom-dashboard-widgets' ),
				'url'           => admin_url( 'admin.php?page=wc-settings&tab=checkout' ),
				'action_label'  => __( 'Get paid', 'custom-dashboard-widgets' ),
				'complete'      => self::has_enabled_payment_gateway() && ! $payments_half,
				'half_complete' => $payments_half,
				'badge'         => $payments_half ? __( 'Test account', 'custom-dashboard-widgets' ) : '',
			),
			array(
				'id'            => 'customize',
				'title'         => __( 'Customize your store', 'custom-dashboard-widgets' ),
				'content'       => __( 'Quickly create a beautiful looking store using our built-in store designer, or select a pre-built theme and customize it to fit your brand.', 'custom-dashboard-widgets' ),
				'url'           => admin_url( 'customize.php' ),
				'action_label'  => __( 'Start customizing', 'custom-dashboard-widgets' ),
				'complete'      => false,
				'half_complete' => false,
				'badge'         => '',
			),
			array(
				'id'            => 'tax',
				'title'         => __( 'Collect sales tax', 'custom-dashboard-widgets' ),
				'content'       => __( 'Choose to set up your tax rates manually, or use one of our tax automation tools.', 'custom-dashboard-widgets' ),
				'url'           => admin_url( 'admin.php?page=wc-settings&tab=tax' ),
				'action_label'  => __( 'Get started', 'custom-dashboard-widgets' ),
				'complete'      => ( get_option( 'woocommerce_calc_taxes' ) === 'yes' ),
				'half_complete' => false,
				'badge'         => '',
			),
			array(
				'id'            => 'shipping',
				'title'         => __( 'Select your shipping options', 'custom-dashboard-widgets' ),
				'content'       => __( "Choose where and how you'd like to ship your products, along with any fixed or calculated rates.", 'custom-dashboard-widgets' ),
				'url'           => admin_url( 'admin.php?page=wc-settings&tab=shipping' ),
				'action_label'  => __( 'Start shipping', 'custom-dashboard-widgets' ),
				'complete'      => self::has_shipping_zone(),
				'half_complete' => false,
				'badge'         => '',
			),
			array(
				'id'            => 'launch',
				'title'         => __( 'Launch your store', 'custom-dashboard-widgets' ),
				'content'       => __( "It's time to celebrate – you're ready to launch your store! Woo! Hit the button to preview your store and make it public.", 'custom-dashboard-widgets' ),
				'url'           => admin_url( 'admin.php?page=wc-settings&tab=site-visibility' ),
				'action_label'  => __( 'Launch store', 'custom-dashboard-widgets' ),
				'complete'      => ( get_option( 'woocommerce_coming_soon' ) !== 'yes' ),
				'half_complete' => false,
				'badge'         => '',
			),
		);
	}

	// -------------------------------------------------------------------------
	// Completion checks (fallback only)
	// -------------------------------------------------------------------------

	private static function has_products() {
		$counts = wp_count_posts( 'product' );
		return isset( $counts->publish ) && (int) $counts->publish > 0;
	}

	private static function has_enabled_payment_gateway() {
		if ( ! function_exists( 'WC' ) ) {
			return false;
		}
		$gateways = WC()->payment_gateways()->get_available_payment_gateways();
		return ! empty( $gateways );
	}

	private static function has_shipping_zone() {
		if ( ! class_exists( 'WC_Shipping_Zones' ) ) {
			return false;
		}
		$zones = \WC_Shipping_Zones::get_zones();
		return ! empty( $zones );
	}

	/**
	 * Returns true when WooCommerce Payments has a test/sandbox account configured
	 * but live payments are not yet enabled.
	 */
	private static function is_payments_half_complete() {
		if ( class_exists( 'WC_Payments' ) ) {
			$settings = get_option( 'woocommerce_woocommerce_payments_settings', array() );
			return ! empty( $settings['test_mode'] ) && 'yes' === $settings['test_mode'];
		}
		return false;
	}

	// -------------------------------------------------------------------------
	// Utility
	// -------------------------------------------------------------------------

	/**
	 * Direct fallback URLs for tasks whose get_action_url() returns empty
	 * because they normally open inside the WC Admin React app.
	 */
	private static function fallback_url( $task_id ) {
		$map = array(
			'products'         => admin_url( 'post-new.php?post_type=product' ),
			'appearance'       => admin_url( 'customize.php' ),
			'tax'              => admin_url( 'admin.php?page=wc-settings&tab=tax' ),
			'shipping'         => admin_url( 'admin.php?page=wc-settings&tab=shipping' ),
			'payments'         => admin_url( 'admin.php?page=wc-settings&tab=checkout' ),
			'launch_your_store' => admin_url( 'admin.php?page=wc-settings' ),
		);

		return $map[ $task_id ] ?? '';
	}

	private static function is_supported() {
		return class_exists( 'WooCommerce' );
	}
}
