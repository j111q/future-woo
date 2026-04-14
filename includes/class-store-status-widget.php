<?php
/**
 * WooCommerce Store Status dashboard widget.
 *
 * Displays a 2×2 grid of key store counts: orders awaiting processing,
 * orders on hold, products low in stock, and products out of stock.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CDW_Store_Status_Widget {

	public static function register() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}

		if ( ! get_user_meta( get_current_user_id(), CDW_Woo_Setup_Widget::NOTICE_SHOWN_KEY, true ) ) {
			return;
		}

		wp_add_dashboard_widget(
			'cdw_store_status',
			__( 'Store Status', 'custom-dashboard-widgets' ),
			array( __CLASS__, 'render' )
		);
	}

	// -------------------------------------------------------------------------
	// Render
	// -------------------------------------------------------------------------

	public static function render() {
		// Dev-state: return mock counts.
		if ( class_exists( 'CDW_State_Switcher' ) && CDW_State_Switcher::get_current_state() === 'active_store' ) {
			$counts = array( 'processing' => 2, 'onhold' => 0, 'low_stock' => 0, 'out_of_stock' => 0 );
		} else {
			$counts = self::get_counts();
		}

		$items = array(
			array(
				'count'  => $counts['processing'],
				'noun'   => 'order',
				'label'  => __( 'Awaiting processing', 'custom-dashboard-widgets' ),
				'url'    => self::get_orders_url( 'processing' ),
				'icon'   => self::icon_awaiting_processing(),
			),
			array(
				'count'  => $counts['onhold'],
				'noun'   => 'order',
				'label'  => __( 'On-hold', 'custom-dashboard-widgets' ),
				'url'    => self::get_orders_url( 'on-hold' ),
				'icon'   => self::icon_onhold(),
			),
			array(
				'count'  => $counts['low_stock'],
				'noun'   => 'product',
				'label'  => __( 'Low in stock', 'custom-dashboard-widgets' ),
				'url'    => admin_url( 'edit.php?post_type=product&filter_stock_status=instock&_stock_status=instock' ),
				'icon'   => self::icon_low_stock(),
			),
			array(
				'count'  => $counts['out_of_stock'],
				'noun'   => 'product',
				'label'  => __( 'Out of stock', 'custom-dashboard-widgets' ),
				'url'    => admin_url( 'edit.php?post_type=product&filter_stock_status=outofstock' ),
				'icon'   => self::icon_out_of_stock(),
			),
		);
		?>
		<div class="cdw-store-status">
			<div class="cdw-store-status-grid">
				<?php foreach ( $items as $item ) : ?>
					<div class="cdw-store-status-cell">
						<span class="cdw-store-status-icon" aria-hidden="true">
							<?php echo $item['icon']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</span>
						<div class="cdw-store-status-info">
							<a href="<?php echo esc_url( $item['url'] ); ?>" class="cdw-store-status-count">
								<?php
								echo esc_html( sprintf(
									/* translators: 1: count, 2: noun (order/product) */
									_n( '%1$s %2$s', '%1$s %2$ss', $item['count'], 'custom-dashboard-widgets' ),
									number_format_i18n( $item['count'] ),
									$item['noun']
								) );
								?>
							</a>
							<span class="cdw-store-status-label"><?php echo esc_html( $item['label'] ); ?></span>
						</div>
					</div>
				<?php endforeach; ?>
			</div>
		</div>
		<?php
	}

	// -------------------------------------------------------------------------
	// Data
	// -------------------------------------------------------------------------

	private static function get_counts(): array {
		// Orders.
		if ( function_exists( 'wc_orders_count' ) ) {
			$processing = (int) wc_orders_count( 'processing' );
			$onhold     = (int) wc_orders_count( 'on-hold' );
		} else {
			$counts     = wp_count_posts( 'shop_order' );
			$processing = isset( $counts->{'wc-processing'} ) ? (int) $counts->{'wc-processing'} : 0;
			$onhold     = isset( $counts->{'wc-on-hold'} ) ? (int) $counts->{'wc-on-hold'} : 0;
		}

		// Stock.
		global $wpdb;

		$low_stock_amount = absint( get_option( 'woocommerce_notify_low_stock_amount', 2 ) );

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$low_in_stock = (int) $wpdb->get_var( $wpdb->prepare(
			"SELECT COUNT(DISTINCT p.ID)
			 FROM {$wpdb->posts} p
			 JOIN {$wpdb->postmeta} pm_status ON pm_status.post_id = p.ID AND pm_status.meta_key = '_stock_status'
			 JOIN {$wpdb->postmeta} pm_manage ON pm_manage.post_id = p.ID AND pm_manage.meta_key = '_manage_stock'
			 JOIN {$wpdb->postmeta} pm_stock  ON pm_stock.post_id  = p.ID AND pm_stock.meta_key  = '_stock'
			 WHERE p.post_type IN ('product','product_variation')
			   AND p.post_status = 'publish'
			   AND pm_status.meta_value = 'instock'
			   AND pm_manage.meta_value = 'yes'
			   AND CAST(pm_stock.meta_value AS DECIMAL) <= %d
			   AND CAST(pm_stock.meta_value AS DECIMAL) > 0",
			$low_stock_amount
		) );

		$out_of_stock = (int) $wpdb->get_var(
			"SELECT COUNT(DISTINCT p.ID)
			 FROM {$wpdb->posts} p
			 JOIN {$wpdb->postmeta} pm ON pm.post_id = p.ID AND pm.meta_key = '_stock_status'
			 WHERE p.post_type IN ('product','product_variation')
			   AND p.post_status = 'publish'
			   AND pm.meta_value = 'outofstock'"
		);
		// phpcs:enable

		return array(
			'processing'   => $processing,
			'onhold'       => $onhold,
			'low_stock'    => $low_in_stock,
			'out_of_stock' => $out_of_stock,
		);
	}

	private static function get_orders_url( string $status ): string {
		if ( class_exists( '\Automattic\WooCommerce\Utilities\OrderUtil' )
			&& \Automattic\WooCommerce\Utilities\OrderUtil::custom_orders_table_usage_is_enabled() ) {
			return admin_url( 'admin.php?page=wc-orders&status=wc-' . $status );
		}
		return admin_url( 'edit.php?post_type=shop_order&post_status=wc-' . $status );
	}

	// -------------------------------------------------------------------------
	// Icons
	// -------------------------------------------------------------------------

	private static function icon_awaiting_processing(): string {
		return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">'
			. '<path fill-rule="evenodd" clip-rule="evenodd" d="M16.83 6.342L17.432 6.642L18.057 6.392L18.5 6.216V18.785L18.057 18.607L17.432 18.357L16.829 18.658L15.385 19.381L12.975 18.577L12.5 18.419L12.026 18.577L9.616 19.38L8.171 18.658L7.568 18.358L6.943 18.608L6.5 18.785V6.215L6.943 6.393L7.568 6.643L8.171 6.342L9.615 5.62L12.025 6.423L12.5 6.581L12.974 6.423L15.384 5.62L16.83 6.342ZM20 4L18.5 4.6L17.5 5L15.5 4L12.5 5L9.5 4L7.5 5L6.5 4.6L5 4V21L6.5 20.4L7.5 20L9.5 21L12.5 20L15.5 21L17.5 20L18.5 20.4L20 21V4ZM16.5 10.25V8.75H8.5V10.25H16.5ZM16.5 13.25V11.75H8.5V13.25H16.5ZM8.5 16.25V14.75H16.5V16.25H8.5Z" fill="currentColor"/>'
			. '</svg>';
	}

	private static function icon_onhold(): string {
		return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">'
			. '<path fill-rule="evenodd" clip-rule="evenodd" d="M12 18.5C10.7746 18.5002 9.57409 18.154 8.53695 17.5014C7.49981 16.8487 6.66828 15.9162 6.13828 14.8113C5.60827 13.7065 5.40138 12.4743 5.54146 11.2569C5.68154 10.0396 6.1629 8.8866 6.93 7.931L16.069 17.069C14.9162 17.9972 13.48 18.5022 12 18.5ZM17.123 16.002C18.1001 14.7517 18.5861 13.1871 18.4893 11.6032C18.3925 10.0193 17.7197 8.52548 16.5976 7.40341C15.4755 6.28133 13.9817 5.60849 12.3978 5.5117C10.8139 5.41492 9.24934 5.90089 7.999 6.878L17.123 16.002ZM4 12C4 9.87827 4.84285 7.84344 6.34315 6.34315C7.84344 4.84285 9.87827 4 12 4C14.1217 4 16.1566 4.84285 17.6569 6.34315C19.1571 7.84344 20 9.87827 20 12C20 14.1217 19.1571 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20C9.87827 20 7.84344 19.1571 6.34315 17.6569C4.84285 16.1566 4 14.1217 4 12Z" fill="currentColor"/>'
			. '</svg>';
	}

	private static function icon_low_stock(): string {
		return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">'
			. '<path fill-rule="evenodd" clip-rule="evenodd" d="M12 18.5C10.2761 18.5 8.62279 17.8152 7.40381 16.5962C6.18482 15.3772 5.5 13.7239 5.5 12C5.5 10.2761 6.18482 8.62279 7.40381 7.40381C8.62279 6.18482 10.2761 5.5 12 5.5C13.7239 5.5 15.3772 6.18482 16.5962 7.40381C17.8152 8.62279 18.5 10.2761 18.5 12C18.5 13.7239 17.8152 15.3772 16.5962 16.5962C15.3772 17.8152 13.7239 18.5 12 18.5ZM4 12C4 9.87827 4.84285 7.84344 6.34315 6.34315C7.84344 4.84285 9.87827 4 12 4C14.1217 4 16.1566 4.84285 17.6569 6.34315C19.1571 7.84344 20 9.87827 20 12C20 14.1217 19.1571 16.1566 17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20C9.87827 20 7.84344 19.1571 6.34315 17.6569C4.84285 16.1566 4 14.1217 4 12ZM12 16C13.0609 16 14.0783 15.5786 14.8284 14.8284C15.5786 14.0783 16 13.0609 16 12H8C8 13.0609 8.42143 14.0783 9.17157 14.8284C9.92172 15.5786 10.9391 16 12 16Z" fill="currentColor"/>'
			. '</svg>';
	}

	private static function icon_out_of_stock(): string {
		return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">'
			. '<path d="M11.25 16V14.5H12.75V16H11.25Z" fill="currentColor"/>'
			. '<path d="M11.25 8L11.25 13H12.75V8L11.25 8Z" fill="currentColor"/>'
			. '<path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM5.5 12C5.5 15.5899 8.41015 18.5 12 18.5C15.5899 18.5 18.5 15.5899 18.5 12C18.5 8.41015 15.5899 5.5 12 5.5C8.41015 5.5 5.5 8.41015 5.5 12Z" fill="currentColor"/>'
			. '</svg>';
	}
}
