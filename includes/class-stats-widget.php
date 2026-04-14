<?php
/**
 * Stats Overview dashboard widget.
 *
 * Shows Total sales, Net sales, Orders, and Visitors for the selected time
 * period (Today / Week to date / Month to date) with delta indicators vs the
 * previous equivalent period.
 *
 * Data is read from the wc_order_stats table (bundled with WooCommerce Admin
 * since WC 4.0).  A lightweight fallback queries the orders tables directly.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CDW_Stats_Widget {

	const META_HIDDEN_KEY = 'cdw_stats_hidden_metrics';

	/** All available metrics in display order. */
	const ALL_METRICS = array(
		'total_sales'   => 'Total sales',
		'net_sales'     => 'Net sales',
		'orders'        => 'Orders',
		'visitors'      => 'Visitors',
		'products_sold' => 'Products sold',
		'views'         => 'Views',
		'top_seller'    => 'Top seller this month',
	);

	/** Hidden by default (user can enable via settings). */
	const DEFAULT_HIDDEN = array( 'products_sold', 'views' );

	// -------------------------------------------------------------------------
	// Registration
	// -------------------------------------------------------------------------

	public static function register() {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}

		wp_add_dashboard_widget(
			'cdw_stats',
			__( 'Store Stats', 'custom-dashboard-widgets' ),
			array( __CLASS__, 'render' )
		);

	}

	// -------------------------------------------------------------------------
	// Render
	// -------------------------------------------------------------------------

	public static function render() {
		$hidden = self::get_hidden_metrics();
		$stats  = self::get_stats( 'today' );
		?>
		<div class="cdw-stats-widget" id="cdw-stats-widget">

			<!-- Period tabs -->
			<div class="cdw-stats-tabs" role="tablist">
				<button class="cdw-stats-tab cdw-stats-tab--active" data-period="today" role="tab" aria-selected="true" type="button">
					<?php esc_html_e( 'Today', 'custom-dashboard-widgets' ); ?>
				</button>
				<button class="cdw-stats-tab" data-period="week" role="tab" aria-selected="false" type="button">
					<?php esc_html_e( 'Week to date', 'custom-dashboard-widgets' ); ?>
				</button>
				<button class="cdw-stats-tab" data-period="month" role="tab" aria-selected="false" type="button">
					<?php esc_html_e( 'Month to date', 'custom-dashboard-widgets' ); ?>
				</button>
			</div>

			<!-- Metrics grid -->
			<div class="cdw-stats-grid" id="cdw-stats-grid">
				<?php self::render_metrics( $stats, $hidden ); ?>
			</div>

			<!-- Footer -->
			<div class="cdw-stats-footer">
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=wc-admin&path=/analytics/overview' ) ); ?>">
					<?php esc_html_e( 'View detailed stats', 'custom-dashboard-widgets' ); ?>
				</a>
			</div>

		</div>

		<!-- Settings panel (hidden; shown by JS) -->
		<div class="cdw-stats-settings" id="cdw-stats-settings" hidden>
			<h4 class="cdw-stats-settings-title">
				<?php esc_html_e( 'Choose metrics to display', 'custom-dashboard-widgets' ); ?>
			</h4>
			<ul class="cdw-stats-settings-list">
				<?php foreach ( self::ALL_METRICS as $key => $label ) : ?>
					<li>
						<label class="cdw-stats-settings-item">
							<input
								type="checkbox"
								name="cdw_metric"
								value="<?php echo esc_attr( $key ); ?>"
								<?php checked( ! in_array( $key, $hidden, true ) ); ?>
							>
							<?php echo esc_html( __( $label, 'custom-dashboard-widgets' ) ); ?>
						</label>
					</li>
				<?php endforeach; ?>
			</ul>
			<div class="cdw-stats-settings-actions">
				<button type="button" class="button button-primary" id="cdw-stats-settings-save">
					<?php esc_html_e( 'Save', 'custom-dashboard-widgets' ); ?>
				</button>
				<button type="button" class="button-link" id="cdw-stats-settings-cancel">
					<?php esc_html_e( 'Cancel', 'custom-dashboard-widgets' ); ?>
				</button>
			</div>
		</div>
		<?php
	}

	/**
	 * Render the metric cards for the given stats and hidden list.
	 */
	public static function render_metrics( array $stats, array $hidden ) {
		foreach ( self::ALL_METRICS as $key => $label ) {
			if ( in_array( $key, $hidden, true ) ) {
				continue;
			}
			if ( $key === 'top_seller' ) {
				continue; // Rendered separately below as a full-width row.
			}

			$current  = $stats[ $key ]['current']  ?? null;
			$previous = $stats[ $key ]['previous'] ?? null;

			$delta_pct = null;
			$direction = 'neutral';
			if ( $current !== null && $previous !== null && $previous != 0 ) {
				$delta_pct = round( ( ( $current - $previous ) / abs( $previous ) ) * 100, 1 );
				$direction = $delta_pct >= 0 ? 'up' : 'down';
			} elseif ( $current !== null && $previous === 0 && $current > 0 ) {
				$delta_pct = 100.0;
				$direction = 'up';
			} elseif ( $current !== null && $previous !== null ) {
				$delta_pct = 0;
				$direction = 'neutral';
			}

			$is_currency = in_array( $key, array( 'total_sales', 'net_sales' ), true );

			$display_value = $current === null
				? '&mdash;'
				: ( $is_currency ? wc_price( $current ) : number_format_i18n( $current ) );

			$prev_display = $previous === null
				? __( 'N/A', 'custom-dashboard-widgets' )
				: ( $is_currency ? wp_strip_all_tags( wc_price( $previous ) ) : number_format_i18n( $previous ) );

			$tooltip = sprintf(
				/* translators: %s: previous period value */
				esc_attr__( 'Previous period: %s', 'custom-dashboard-widgets' ),
				$prev_display
			);
			?>
			<div class="cdw-stat" data-metric="<?php echo esc_attr( $key ); ?>">
				<div class="cdw-stat-content">
					<span class="cdw-stat-label"><?php echo esc_html( __( $label, 'custom-dashboard-widgets' ) ); ?></span>
					<span class="cdw-stat-value"><?php echo wp_kses_post( $display_value ); ?></span>
				</div>
				<?php if ( $delta_pct !== null ) : ?>
					<span
						class="cdw-stat-delta cdw-stat-delta--<?php echo esc_attr( $direction ); ?>"
						data-tooltip="<?php echo $tooltip; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- already esc_attr'd above ?>"
					>
						<?php echo ( $delta_pct > 0 ? '+' : '' ) . esc_html( $delta_pct ) . '%'; ?>
					</span>
				<?php endif; ?>
			</div>
			<?php
		}

		// Top seller row (always month-based; hidden if user opted out).
		if ( in_array( 'top_seller', $hidden, true ) ) {
			return;
		}

		$top_seller = $stats['top_seller'] ?? null;
		$qty        = $top_seller['qty']      ?? 0;
		$prev_qty   = $top_seller['prev_qty'] ?? 0;
		$name       = $top_seller['name']     ?? '';
		$has_data   = $top_seller !== null && $name !== '';

		$delta_pct = null;
		$direction = 'neutral';
		if ( $has_data ) {
			if ( $prev_qty > 0 ) {
				$delta_pct = round( ( ( $qty - $prev_qty ) / $prev_qty ) * 100, 1 );
				$direction = $delta_pct >= 0 ? 'up' : 'down';
			} elseif ( $qty > 0 ) {
				$delta_pct = 100.0;
				$direction = 'up';
			} else {
				$delta_pct = 0;
			}
		}

		$tooltip = sprintf(
			esc_attr__( 'Previous period: %s', 'custom-dashboard-widgets' ),
			number_format_i18n( $prev_qty )
		);
		?>
		<div class="cdw-stat cdw-stat--full cdw-stat--top-seller" data-metric="top_seller">
			<div class="cdw-stat-content">
				<span class="cdw-stat-label">
					<?php if ( $has_data ) : ?>
						<?php printf(
							/* translators: %d: number of units sold */
							esc_html__( 'Top seller this month (sold %d)', 'custom-dashboard-widgets' ),
							$qty
						); ?>
					<?php else : ?>
						<?php esc_html_e( 'Top seller this month', 'custom-dashboard-widgets' ); ?>
					<?php endif; ?>
				</span>
				<span class="cdw-stat-value cdw-stat-value--product">
					<?php echo $has_data ? esc_html( $name ) : '&mdash;'; ?>
				</span>
			</div>
			<?php if ( $delta_pct !== null ) : ?>
				<span
					class="cdw-stat-delta cdw-stat-delta--<?php echo esc_attr( $direction ); ?>"
					data-tooltip="<?php echo $tooltip; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>"
				>
					<?php echo ( $delta_pct > 0 ? '+' : '' ) . esc_html( $delta_pct ) . '%'; ?>
				</span>
			<?php endif; ?>
		</div>
		<?php
	}

	// -------------------------------------------------------------------------
	// AJAX
	// -------------------------------------------------------------------------

	public static function ajax_get_stats() {
		check_ajax_referer( 'cdw_nonce', 'nonce' );

		$period  = isset( $_POST['period'] ) ? sanitize_key( $_POST['period'] ) : 'today';
		$allowed = array( 'today', 'week', 'month' );
		if ( ! in_array( $period, $allowed, true ) ) {
			wp_send_json_error();
		}

		$stats  = self::get_stats( $period );
		$hidden = self::get_hidden_metrics();

		ob_start();
		self::render_metrics( $stats, $hidden );
		$html = ob_get_clean();

		wp_send_json_success( array( 'html' => $html ) );
	}

	public static function ajax_save_settings() {
		check_ajax_referer( 'cdw_nonce', 'nonce' );

		$visible = isset( $_POST['metrics'] ) && is_array( $_POST['metrics'] )
			? array_map( 'sanitize_key', $_POST['metrics'] )
			: array();

		$hidden = array_values( array_diff( array_keys( self::ALL_METRICS ), $visible ) );
		update_user_meta( get_current_user_id(), self::META_HIDDEN_KEY, $hidden );

		$period = isset( $_POST['period'] ) ? sanitize_key( $_POST['period'] ) : 'today';
		if ( ! in_array( $period, array( 'today', 'week', 'month' ), true ) ) {
			$period = 'today';
		}

		$stats = self::get_stats( $period );

		ob_start();
		self::render_metrics( $stats, $hidden );
		$html = ob_get_clean();

		wp_send_json_success( array( 'html' => $html ) );
	}

	// -------------------------------------------------------------------------
	// Data
	// -------------------------------------------------------------------------

	private static function get_stats( string $period ): array {
		// Dev-state: return realistic mock data for "active store".
		if ( class_exists( 'CDW_State_Switcher' ) && CDW_State_Switcher::get_current_state() === 'active_store' ) {
			return self::get_mock_stats( $period );
		}

		list( $start, $end, $prev_start, $prev_end ) = self::get_date_ranges( $period );

		return array(
			'total_sales'   => array(
				'current'  => self::query_revenue( $start, $end, 'gross' ),
				'previous' => self::query_revenue( $prev_start, $prev_end, 'gross' ),
			),
			'net_sales'     => array(
				'current'  => self::query_revenue( $start, $end, 'net' ),
				'previous' => self::query_revenue( $prev_start, $prev_end, 'net' ),
			),
			'orders'        => array(
				'current'  => self::query_orders( $start, $end ),
				'previous' => self::query_orders( $prev_start, $prev_end ),
			),
			'visitors'      => array( 'current' => null, 'previous' => null ),
			'products_sold' => array(
				'current'  => self::query_products_sold( $start, $end ),
				'previous' => self::query_products_sold( $prev_start, $prev_end ),
			),
			'views'         => array( 'current' => null, 'previous' => null ),
			'top_seller'    => self::query_top_seller(),
		);
	}

	/**
	 * Returns [ start, end, prev_start, prev_end ] as UTC datetime strings.
	 */
	private static function get_date_ranges( string $period ): array {
		$tz  = new DateTimeZone( wp_timezone_string() );
		$now = new DateTime( 'now', $tz );
		$utc = new DateTimeZone( 'UTC' );

		switch ( $period ) {
			case 'week':
				$dow        = (int) $now->format( 'N' ); // 1 = Mon
				$start      = ( clone $now )->modify( '-' . ( $dow - 1 ) . ' days' )->setTime( 0, 0, 0 );
				$end        = clone $now;
				$prev_start = ( clone $start )->modify( '-7 days' );
				$prev_end   = ( clone $end )->modify( '-7 days' );
				break;

			case 'month':
				$start      = ( clone $now )->setDate( (int) $now->format( 'Y' ), (int) $now->format( 'm' ), 1 )->setTime( 0, 0, 0 );
				$end        = clone $now;
				$prev_start = ( clone $start )->modify( '-1 month' );
				$prev_end   = ( clone $end )->modify( '-1 month' );
				break;

			default: // today
				$start      = ( clone $now )->setTime( 0, 0, 0 );
				$end        = clone $now;
				$prev_start = ( clone $start )->modify( '-1 day' );
				$prev_end   = ( clone $end )->modify( '-1 day' );
				break;
		}

		// Convert to UTC for DB queries.
		foreach ( array( &$start, &$end, &$prev_start, &$prev_end ) as &$dt ) {
			$dt->setTimezone( $utc );
		}
		unset( $dt );

		return array(
			$start->format( 'Y-m-d H:i:s' ),
			$end->format( 'Y-m-d H:i:s' ),
			$prev_start->format( 'Y-m-d H:i:s' ),
			$prev_end->format( 'Y-m-d H:i:s' ),
		);
	}

	private static function query_revenue( string $start, string $end, string $type ): float {
		global $wpdb;

		$statuses     = wc_get_is_paid_statuses(); // e.g. ['processing','completed']
		$placeholders = implode( ', ', array_fill( 0, count( $statuses ), '%s' ) );
		$col          = $type === 'net' ? 'net_total' : 'gross_total';

		if ( self::wc_order_stats_exists() ) {
			$table = $wpdb->prefix . 'wc_order_stats';
			$sql   = $wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				"SELECT SUM({$col}) FROM {$table}
				 WHERE status IN ($placeholders)
				   AND date_created_gmt BETWEEN %s AND %s",
				array_merge( $statuses, array( $start, $end ) )
			);
		} elseif ( self::hpos_enabled() ) {
			$table  = $wpdb->prefix . 'wc_orders';
			$wc_st  = array_map( fn( $s ) => "wc-$s", $statuses );
			$ph     = implode( ', ', array_fill( 0, count( $wc_st ), '%s' ) );
			$col_hpos = $type === 'net'
				? 'total_amount - tax_amount - shipping_total'
				: 'total_amount';
			$sql = $wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				"SELECT SUM({$col_hpos}) FROM {$table}
				 WHERE type = 'shop_order'
				   AND status IN ($ph)
				   AND date_created_gmt BETWEEN %s AND %s",
				array_merge( $wc_st, array( $start, $end ) )
			);
		} else {
			$wc_st = array_map( fn( $s ) => "wc-$s", $statuses );
			$ph    = implode( ', ', array_fill( 0, count( $wc_st ), '%s' ) );
			if ( $type === 'net' ) {
				$sql = $wpdb->prepare(
					// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
					"SELECT SUM(pm.meta_value - COALESCE(ptax.meta_value,0) - COALESCE(pship.meta_value,0))
					 FROM {$wpdb->postmeta} pm
					 JOIN {$wpdb->posts} o ON o.ID = pm.post_id
					 LEFT JOIN {$wpdb->postmeta} ptax  ON ptax.post_id  = pm.post_id AND ptax.meta_key  = '_order_tax'
					 LEFT JOIN {$wpdb->postmeta} pship ON pship.post_id = pm.post_id AND pship.meta_key = '_order_shipping'
					 WHERE pm.meta_key = '_order_total'
					   AND o.post_type = 'shop_order'
					   AND o.post_status IN ($ph)
					   AND o.post_date_gmt BETWEEN %s AND %s",
					array_merge( $wc_st, array( $start, $end ) )
				);
			} else {
				$sql = $wpdb->prepare(
					// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
					"SELECT SUM(pm.meta_value)
					 FROM {$wpdb->postmeta} pm
					 JOIN {$wpdb->posts} o ON o.ID = pm.post_id
					 WHERE pm.meta_key = '_order_total'
					   AND o.post_type = 'shop_order'
					   AND o.post_status IN ($ph)
					   AND o.post_date_gmt BETWEEN %s AND %s",
					array_merge( $wc_st, array( $start, $end ) )
				);
			}
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQL.NotPrepared
		return (float) ( $wpdb->get_var( $sql ) ?? 0.0 );
	}

	private static function query_orders( string $start, string $end ): int {
		global $wpdb;

		$statuses = wc_get_is_paid_statuses();

		if ( self::wc_order_stats_exists() ) {
			$table        = $wpdb->prefix . 'wc_order_stats';
			$placeholders = implode( ', ', array_fill( 0, count( $statuses ), '%s' ) );
			$sql          = $wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				"SELECT COUNT(*) FROM {$table}
				 WHERE status IN ($placeholders)
				   AND date_created_gmt BETWEEN %s AND %s",
				array_merge( $statuses, array( $start, $end ) )
			);
		} elseif ( self::hpos_enabled() ) {
			$table    = $wpdb->prefix . 'wc_orders';
			$wc_st    = array_map( fn( $s ) => "wc-$s", $statuses );
			$ph       = implode( ', ', array_fill( 0, count( $wc_st ), '%s' ) );
			$sql      = $wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				"SELECT COUNT(*) FROM {$table}
				 WHERE type = 'shop_order'
				   AND status IN ($ph)
				   AND date_created_gmt BETWEEN %s AND %s",
				array_merge( $wc_st, array( $start, $end ) )
			);
		} else {
			$wc_st = array_map( fn( $s ) => "wc-$s", $statuses );
			$ph    = implode( ', ', array_fill( 0, count( $wc_st ), '%s' ) );
			$sql   = $wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				"SELECT COUNT(*) FROM {$wpdb->posts}
				 WHERE post_type = 'shop_order'
				   AND post_status IN ($ph)
				   AND post_date_gmt BETWEEN %s AND %s",
				array_merge( $wc_st, array( $start, $end ) )
			);
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQL.NotPrepared
		return (int) ( $wpdb->get_var( $sql ) ?? 0 );
	}

	private static function query_products_sold( string $start, string $end ): int {
		global $wpdb;

		$statuses = wc_get_is_paid_statuses();

		if ( self::wc_order_stats_exists() ) {
			$table        = $wpdb->prefix . 'wc_order_stats';
			$placeholders = implode( ', ', array_fill( 0, count( $statuses ), '%s' ) );
			$sql          = $wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				"SELECT SUM(num_items_sold) FROM {$table}
				 WHERE status IN ($placeholders)
				   AND date_created_gmt BETWEEN %s AND %s",
				array_merge( $statuses, array( $start, $end ) )
			);
		} elseif ( self::hpos_enabled() ) {
			$table = $wpdb->prefix . 'wc_orders';
			$wc_st = array_map( fn( $s ) => "wc-$s", $statuses );
			$ph    = implode( ', ', array_fill( 0, count( $wc_st ), '%s' ) );
			$sql   = $wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				"SELECT SUM(oim.meta_value)
				 FROM {$wpdb->prefix}woocommerce_order_items oi
				 JOIN {$wpdb->prefix}woocommerce_order_itemmeta oim
				      ON oim.order_item_id = oi.order_item_id AND oim.meta_key = '_qty'
				 JOIN {$table} o ON o.id = oi.order_id
				 WHERE oi.order_item_type = 'line_item'
				   AND o.type = 'shop_order'
				   AND o.status IN ($ph)
				   AND o.date_created_gmt BETWEEN %s AND %s",
				array_merge( $wc_st, array( $start, $end ) )
			);
		} else {
			$wc_st = array_map( fn( $s ) => "wc-$s", $statuses );
			$ph    = implode( ', ', array_fill( 0, count( $wc_st ), '%s' ) );
			$sql   = $wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				"SELECT SUM(oim.meta_value)
				 FROM {$wpdb->prefix}woocommerce_order_items oi
				 JOIN {$wpdb->prefix}woocommerce_order_itemmeta oim
				      ON oim.order_item_id = oi.order_item_id AND oim.meta_key = '_qty'
				 JOIN {$wpdb->posts} o ON o.ID = oi.order_id
				 WHERE oi.order_item_type = 'line_item'
				   AND o.post_type = 'shop_order'
				   AND o.post_status IN ($ph)
				   AND o.post_date_gmt BETWEEN %s AND %s",
				array_merge( $wc_st, array( $start, $end ) )
			);
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQL.NotPrepared
		return (int) ( $wpdb->get_var( $sql ) ?? 0 );
	}

	// -------------------------------------------------------------------------
	// Helpers
	// -------------------------------------------------------------------------

	private static function get_mock_stats( string $period ): array {
		$top_seller = array(
			'name'     => 'Blue waves t-shirt',
			'qty'      => 24,
			'prev_qty' => 19,
		);

		$data = array(
			'today' => array(
				'total_sales'   => array( 'current' => 1284.50, 'previous' => 1102.00 ),
				'net_sales'     => array( 'current' => 1089.75, 'previous' => 934.20 ),
				'orders'        => array( 'current' => 17,      'previous' => 14 ),
				'visitors'      => array( 'current' => 312,     'previous' => 289 ),
				'products_sold' => array( 'current' => 34,      'previous' => 29 ),
				'views'         => array( 'current' => 874,     'previous' => 910 ),
				'top_seller'    => $top_seller,
			),
			'week'  => array(
				'total_sales'   => array( 'current' => 8420.00, 'previous' => 7650.50 ),
				'net_sales'     => array( 'current' => 7140.80, 'previous' => 6490.00 ),
				'orders'        => array( 'current' => 104,     'previous' => 97 ),
				'visitors'      => array( 'current' => 2108,    'previous' => 1984 ),
				'products_sold' => array( 'current' => 218,     'previous' => 201 ),
				'views'         => array( 'current' => 5630,    'previous' => 5890 ),
				'top_seller'    => $top_seller,
			),
			'month' => array(
				'total_sales'   => array( 'current' => 32780.00, 'previous' => 29450.00 ),
				'net_sales'     => array( 'current' => 27860.50, 'previous' => 24980.00 ),
				'orders'        => array( 'current' => 389,      'previous' => 354 ),
				'visitors'      => array( 'current' => 8940,     'previous' => 8210 ),
				'products_sold' => array( 'current' => 812,      'previous' => 745 ),
				'views'         => array( 'current' => 23400,    'previous' => 22100 ),
				'top_seller'    => $top_seller,
			),
		);

		return $data[ $period ] ?? $data['today'];
	}

	private static function query_top_seller(): ?array {
		global $wpdb;

		$tz    = new DateTimeZone( wp_timezone_string() );
		$now   = new DateTime( 'now', $tz );
		$utc   = new DateTimeZone( 'UTC' );

		$month_start      = ( clone $now )->setDate( (int) $now->format( 'Y' ), (int) $now->format( 'm' ), 1 )->setTime( 0, 0, 0 )->setTimezone( $utc );
		$month_end        = ( clone $now )->setTimezone( $utc );
		$prev_month_start = ( clone $month_start )->modify( '-1 month' );
		$prev_month_end   = ( clone $month_start )->modify( '-1 second' );

		$statuses = wc_get_is_paid_statuses();
		$wc_st    = array_map( fn( $s ) => "wc-$s", $statuses );
		$ph       = implode( ', ', array_fill( 0, count( $wc_st ), '%s' ) );

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$row = $wpdb->get_row( $wpdb->prepare(
			"SELECT oim2.meta_value AS product_id, SUM(oim.meta_value) AS qty_sold
			 FROM {$wpdb->prefix}woocommerce_order_items oi
			 JOIN {$wpdb->prefix}woocommerce_order_itemmeta oim
			      ON oim.order_item_id = oi.order_item_id AND oim.meta_key = '_qty'
			 JOIN {$wpdb->prefix}woocommerce_order_itemmeta oim2
			      ON oim2.order_item_id = oi.order_item_id AND oim2.meta_key = '_product_id'
			 JOIN {$wpdb->posts} o ON o.ID = oi.order_id
			 WHERE oi.order_item_type = 'line_item'
			   AND o.post_type = 'shop_order'
			   AND o.post_status IN ($ph)
			   AND o.post_date_gmt BETWEEN %s AND %s
			 GROUP BY oim2.meta_value
			 ORDER BY qty_sold DESC
			 LIMIT 1",
			array_merge( $wc_st, array( $month_start->format( 'Y-m-d H:i:s' ), $month_end->format( 'Y-m-d H:i:s' ) ) )
		) );

		if ( ! $row ) {
			return null;
		}

		$product = wc_get_product( (int) $row->product_id );
		if ( ! $product ) {
			return null;
		}

		// Previous month qty for same product.
		$prev_qty = (int) $wpdb->get_var( $wpdb->prepare(
			"SELECT SUM(oim.meta_value)
			 FROM {$wpdb->prefix}woocommerce_order_items oi
			 JOIN {$wpdb->prefix}woocommerce_order_itemmeta oim
			      ON oim.order_item_id = oi.order_item_id AND oim.meta_key = '_qty'
			 JOIN {$wpdb->prefix}woocommerce_order_itemmeta oim2
			      ON oim2.order_item_id = oi.order_item_id AND oim2.meta_key = '_product_id'
			 JOIN {$wpdb->posts} o ON o.ID = oi.order_id
			 WHERE oi.order_item_type = 'line_item'
			   AND o.post_type = 'shop_order'
			   AND o.post_status IN ($ph)
			   AND oim2.meta_value = %d
			   AND o.post_date_gmt BETWEEN %s AND %s",
			array_merge( $wc_st, array( (int) $row->product_id, $prev_month_start->format( 'Y-m-d H:i:s' ), $prev_month_end->format( 'Y-m-d H:i:s' ) ) )
		) );
		// phpcs:enable

		return array(
			'name'     => $product->get_name(),
			'qty'      => (int) $row->qty_sold,
			'prev_qty' => $prev_qty,
		);
	}

	private static function get_hidden_metrics(): array {
		$hidden = get_user_meta( get_current_user_id(), self::META_HIDDEN_KEY, true );
		return is_array( $hidden ) ? $hidden : self::DEFAULT_HIDDEN;
	}

	private static function wc_order_stats_exists(): bool {
		global $wpdb;
		static $exists = null;
		if ( $exists === null ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$exists = (bool) $wpdb->get_var(
				$wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->prefix . 'wc_order_stats' )
			);
		}
		return $exists;
	}

	private static function hpos_enabled(): bool {
		return class_exists( '\Automattic\WooCommerce\Utilities\OrderUtil' )
			&& \Automattic\WooCommerce\Utilities\OrderUtil::custom_orders_table_usage_is_enabled();
	}
}
