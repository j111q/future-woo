<?php
/**
 * WooCommerce Inbox dashboard widget.
 *
 * Shows 3 messages by default. A "Show more" button opens a side panel
 * with the full message list. Messages longer than 4 lines are truncated
 * with a "Read more" link that also opens the side panel.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CDW_Woo_Inbox_Widget {

	const PER_PAGE = 3;

	public static function register() {
		if ( ! self::woocommerce_active() ) {
			return;
		}

		wp_add_dashboard_widget(
			'cdw_woo_inbox',
			__( 'Store Inbox', 'custom-dashboard-widgets' ),
			array( __CLASS__, 'render' )
		);

	}

	// -------------------------------------------------------------------------
	// Render
	// -------------------------------------------------------------------------

	public static function render() {
		// Dev-state: use mock messages so inbox is always populated during QA.
		if ( class_exists( 'CDW_State_Switcher' ) && CDW_State_Switcher::get_current_state() !== '' ) {
			self::render_mock();
			return;
		}

		$notes = self::get_notes( self::PER_PAGE, 0 );
		$total = self::count_notes();
		?>
		<div class="cdw-woo-inbox" id="cdw-woo-inbox">

			<?php if ( empty( $notes ) ) : ?>
				<p class="cdw-no-notes">
					<?php esc_html_e( 'Your inbox is empty.', 'custom-dashboard-widgets' ); ?>
				</p>
			<?php else : ?>
				<ul class="cdw-notes-list" id="cdw-notes-list">
					<?php foreach ( $notes as $note ) : ?>
						<?php self::render_note( $note, true ); ?>
					<?php endforeach; ?>
				</ul>

				<button class="button-link cdw-show-more" id="cdw-show-more">
					<?php
					printf(
						/* translators: %d: total number of messages */
						esc_html__( 'View all (%d)', 'custom-dashboard-widgets' ),
						$total
					);
					?>
				</button>
			<?php endif; ?>

		</div>

		<!-- Side panel (rendered once, moved to <body> by JS) -->
		<div class="cdw-inbox-panel" id="cdw-inbox-panel" hidden aria-modal="true" role="dialog" aria-label="<?php esc_attr_e( 'Inbox', 'custom-dashboard-widgets' ); ?>">
			<div class="cdw-inbox-panel-overlay"></div>
			<div class="cdw-inbox-panel-drawer">
				<div class="cdw-inbox-panel-header">
					<h3 class="cdw-inbox-panel-title"><?php esc_html_e( 'Store Inbox', 'custom-dashboard-widgets' ); ?></h3>
					<div class="cdw-inbox-panel-header-actions">
						<div style="position:relative;display:inline-flex;">
							<button class="cdw-inbox-panel-ellipsis-btn button-link" type="button" aria-haspopup="true" aria-expanded="false" aria-label="<?php esc_attr_e( 'More options', 'custom-dashboard-widgets' ); ?>">
								<!-- Gutenberg "more-vertical" icon -->
								<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">
									<path d="M13 19h-2v-2h2v2zm0-6h-2v-2h2v2zm0-6h-2V5h2v2z"/>
								</svg>
							</button>
							<div class="cdw-whats-next-dropdown cdw-inbox-panel-dropdown" hidden>
								<button class="cdw-panel-dismiss-all" type="button"><?php esc_html_e( 'Dismiss all', 'custom-dashboard-widgets' ); ?></button>
							</div>
						</div>
						<button class="cdw-inbox-panel-close button-link" aria-label="<?php esc_attr_e( 'Close', 'custom-dashboard-widgets' ); ?>">
							<!-- Gutenberg "closeSmall" icon -->
							<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
								<path d="M13 11.8l6.1-6.3-1-1-6.1 6.2-6.1-6.2-1 1 6.1 6.3-6.5 6.7 1 1 6.5-6.7 6.5 6.7 1-1z"/>
							</svg>
						</button>
					</div>
				</div>
				<div class="cdw-inbox-panel-body" id="cdw-inbox-panel-body">
					<p class="cdw-inbox-panel-loading"><?php esc_html_e( 'Loading…', 'custom-dashboard-widgets' ); ?></p>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Public method to get the inbox note count (for admin bar menu).
	 */
	public static function get_note_count(): int {
		// Use mock notes count for the prototype.
		$dismissed = get_user_meta( get_current_user_id(), 'cdw_dismissed_notes', true );
		$dismissed = is_array( $dismissed ) ? $dismissed : array();
		$mock      = self::get_mock_notes();
		$count     = 0;
		foreach ( $mock as $note ) {
			if ( ! in_array( $note->note_id, $dismissed, true ) ) {
				$count++;
			}
		}
		return $count;
	}

	private static function get_mock_notes(): array {
		return array(
			(object) array(
				'note_id'      => 1,
				'title'        => __( 'Get your store ready for the holidays', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'The holiday season is your biggest sales opportunity. Make sure your store is prepared with the right products, promotions, and shipping settings.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'unread',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-3 hours' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Set up promotions', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 2,
				'title'        => __( 'New payment gateway available: WooPayments', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'WooPayments is now available in your region. Accept credit cards, Apple Pay, Google Pay, and more — all from your dashboard without any transaction fees.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-2 days' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Learn more', 'custom-dashboard-widgets' ), 'url' => '#' ),
					(object) array( 'label' => __( 'Set up WooPayments', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 3,
				'title'        => __( 'WooCommerce 9.4 is now available', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'This release includes performance improvements, new block patterns, and bug fixes. Update now to get the latest features.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-1 week' ) ),
				'actions'      => array(
					(object) array( 'label' => __( "See what's new", 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 4,
				'title'        => __( 'Your first sale is closer than you think', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Drive traffic to your store with a limited-time discount. Create a coupon to encourage first-time buyers.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'unread',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-10 days' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Create a coupon', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 5,
				'title'        => __( 'Add a shipping zone to reach more customers', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Set up shipping zones to define delivery areas and rates, so customers know exactly what to expect at checkout.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-2 weeks' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Set up shipping', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 6,
				'title'        => __( 'Connect your store to social media', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Reach millions of shoppers on Facebook and Instagram. Sync your product catalog and run ads directly from your store.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-3 weeks' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Connect Facebook', 'custom-dashboard-widgets' ), 'url' => '#' ),
					(object) array( 'label' => __( 'Connect Instagram', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 7,
				'title'        => __( 'Enable reviews to build trust', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Product reviews help shoppers make confident buying decisions. Enable reviews on your products to build credibility.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-1 month' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Enable reviews', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 8,
				'title'        => __( 'Offer free shipping to increase conversions', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Free shipping is one of the top reasons customers complete a purchase. Set a minimum order threshold to protect your margins.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-5 weeks' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Set up free shipping', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 9,
				'title'        => __( 'Boost revenue with upsells and cross-sells', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Suggest related products at checkout to increase your average order value with minimal effort.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-6 weeks' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Learn how', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 10,
				'title'        => __( 'Tax settings need your attention', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Make sure your tax configuration is correct for your business location. Incorrect tax settings can cause compliance issues.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'unread',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-7 weeks' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Review tax settings', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 11,
				'title'        => __( 'Add a return policy to reduce friction', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'A clear return policy increases buyer confidence. Add it to your store pages and checkout to reduce cart abandonment.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-8 weeks' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Add policy', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 12,
				'title'        => __( 'Set up abandoned cart recovery', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Recover lost revenue by automatically emailing customers who left items in their cart without completing checkout.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-9 weeks' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Set up recovery emails', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 13,
				'title'        => __( 'WooCommerce Subscriptions is now available', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Sell products and services on a recurring basis with WooCommerce Subscriptions — perfect for boxes, memberships, and services.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-10 weeks' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Learn more', 'custom-dashboard-widgets' ), 'url' => '#' ),
					(object) array( 'label' => __( 'Get Subscriptions', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 14,
				'title'        => __( 'Customize your email notifications', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Add your logo and brand colors to order confirmation emails to create a professional, consistent experience for customers.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-11 weeks' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Customize emails', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 15,
				'title'        => __( 'Add live chat to support customers in real time', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Stores with live chat see higher conversion rates. Connect a support tool to answer questions before customers leave.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-3 months' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Explore options', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 16,
				'title'        => __( 'Use product bundles to increase order value', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Bundle complementary products together at a slight discount to encourage larger purchases and clear slow-moving inventory.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-14 weeks' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Get Product Bundles', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 17,
				'title'        => __( 'Enable Google Analytics for your store', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Understand where your customers come from and what they buy. Connect Google Analytics to track store performance.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-4 months' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Connect Analytics', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 18,
				'title'        => __( 'Run a flash sale this weekend', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Create urgency with a time-limited offer. Use WooCommerce sale prices and countdown timers to drive conversions.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-17 weeks' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Set sale prices', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 19,
				'title'        => __( 'Improve your store speed for better rankings', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Page speed affects both SEO rankings and conversion rates. Optimize images and enable caching to make your store faster.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-5 months' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Optimize now', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 20,
				'title'        => __( 'Add a loyalty program to retain customers', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Reward repeat purchases with points, discounts, or perks. Loyalty programs increase customer lifetime value significantly.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-22 weeks' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Explore loyalty tools', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 21,
				'title'        => __( 'Sell gift cards to grow your revenue', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Gift cards are a great way to attract new customers and generate upfront revenue. Add them to your store with a simple extension.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-6 months' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Get Gift Cards', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 22,
				'title'        => __( 'WooCommerce 9.3 changelog', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Version 9.3 shipped with improved block editor support, better REST API pagination, and several bug fixes across checkout flows.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-7 months' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Read changelog', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
			(object) array(
				'note_id'      => 23,
				'title'        => __( 'Back up your store data regularly', 'custom-dashboard-widgets' ),
				'content'      => '<p>' . __( 'Regular backups protect your store from data loss. Set up automated backups with a trusted WordPress backup plugin.', 'custom-dashboard-widgets' ) . '</p>',
				'status'       => 'read',
				'date_created' => gmdate( 'Y-m-d H:i:s', strtotime( '-8 months' ) ),
				'actions'      => array(
					(object) array( 'label' => __( 'Set up backups', 'custom-dashboard-widgets' ), 'url' => '#' ),
				),
			),
		);
	}

	private static function render_mock() {
		$all_notes = self::get_mock_notes();
		$notes     = array_slice( $all_notes, 0, self::PER_PAGE );
		$total     = count( $all_notes );
		?>
		<div class="cdw-woo-inbox" id="cdw-woo-inbox">
			<ul class="cdw-notes-list" id="cdw-notes-list">
				<?php foreach ( $notes as $note ) : ?>
					<?php self::render_mock_note( $note ); ?>
				<?php endforeach; ?>
			</ul>
			<button class="button-link cdw-show-more" id="cdw-show-more">
				<?php
				printf(
					/* translators: %d: total number of messages */
					esc_html__( 'View all (%d)', 'custom-dashboard-widgets' ),
					$total
				);
				?>
			</button>
		</div>

		<div class="cdw-inbox-panel" id="cdw-inbox-panel" hidden aria-modal="true" role="dialog" aria-label="<?php esc_attr_e( 'Inbox', 'custom-dashboard-widgets' ); ?>">
			<div class="cdw-inbox-panel-overlay"></div>
			<div class="cdw-inbox-panel-drawer">
				<div class="cdw-inbox-panel-header">
					<h3 class="cdw-inbox-panel-title"><?php esc_html_e( 'Store Inbox', 'custom-dashboard-widgets' ); ?></h3>
					<div class="cdw-inbox-panel-header-actions">
						<div style="position:relative;display:inline-flex;">
							<button class="cdw-inbox-panel-ellipsis-btn button-link" type="button" aria-haspopup="true" aria-expanded="false" aria-label="<?php esc_attr_e( 'More options', 'custom-dashboard-widgets' ); ?>">
								<!-- Gutenberg "more-vertical" icon -->
								<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">
									<path d="M13 19h-2v-2h2v2zm0-6h-2v-2h2v2zm0-6h-2V5h2v2z"/>
								</svg>
							</button>
							<div class="cdw-whats-next-dropdown cdw-inbox-panel-dropdown" hidden>
								<button class="cdw-panel-dismiss-all" type="button"><?php esc_html_e( 'Dismiss all', 'custom-dashboard-widgets' ); ?></button>
							</div>
						</div>
						<button class="cdw-inbox-panel-close button-link" aria-label="<?php esc_attr_e( 'Close', 'custom-dashboard-widgets' ); ?>">
							<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
								<path d="M13 11.8l6.1-6.3-1-1-6.1 6.2-6.1-6.2-1 1 6.1 6.3-6.5 6.7 1 1 6.5-6.7 6.5 6.7 1-1z"/>
							</svg>
						</button>
					</div>
				</div>
				<div class="cdw-inbox-panel-body" id="cdw-inbox-panel-body">
					<p class="cdw-inbox-panel-loading"><?php esc_html_e( 'Loading…', 'custom-dashboard-widgets' ); ?></p>
				</div>
			</div>
		</div>
		<?php
	}

	private static function render_mock_note( object $note ) {
		$is_unread = ( $note->status === 'unread' );
		$date      = sprintf(
			/* translators: %s: human-readable time difference */
			__( '%s ago', 'custom-dashboard-widgets' ),
			human_time_diff( strtotime( $note->date_created ), current_time( 'timestamp' ) )
		);
		?>
		<li class="cdw-note <?php echo $is_unread ? 'cdw-note--unread' : ''; ?>" data-id="<?php echo esc_attr( $note->note_id ); ?>">
			<span class="cdw-note-date"><?php echo esc_html( $date ); ?></span>
			<strong class="cdw-note-title"><?php echo esc_html( $note->title ); ?></strong>
			<div class="cdw-note-body cdw-note-body--clamp">
				<?php echo wp_kses_post( $note->content ); ?>
			</div>
			<div class="cdw-note-ctas">
				<?php foreach ( $note->actions as $action ) : ?>
					<a href="<?php echo esc_url( $action->url ); ?>" class="button cdw-note-action-btn">
						<?php echo esc_html( $action->label ); ?>
					</a>
				<?php endforeach; ?>
				<button class="button-link cdw-dismiss-note" data-id="<?php echo esc_attr( $note->note_id ); ?>" type="button">
					<?php esc_html_e( 'Dismiss', 'custom-dashboard-widgets' ); ?>
				</button>
			</div>
		</li>
		<?php
	}

	/**
	 * Render a single note. When $truncate is true, the body gets the
	 * clamping class so JS can detect overflow and append "Read more".
	 */
	private static function render_note( $note, $truncate = false ) {
		$is_unread = ( $note->status === 'unread' );
		$date      = sprintf(
			/* translators: %s: human-readable time difference */
			__( '%s ago', 'custom-dashboard-widgets' ),
			human_time_diff( strtotime( $note->date_created ), current_time( 'timestamp' ) )
		);
		$actions = self::get_note_actions( $note->note_id );
		?>
		<li
			class="cdw-note <?php echo $is_unread ? 'cdw-note--unread' : ''; ?>"
			data-id="<?php echo esc_attr( $note->note_id ); ?>"
		>
			<span class="cdw-note-date"><?php echo esc_html( $date ); ?></span>

			<strong class="cdw-note-title"><?php echo esc_html( $note->title ); ?></strong>

			<div class="cdw-note-body <?php echo $truncate ? 'cdw-note-body--clamp' : ''; ?>">
				<?php echo wp_kses_post( $note->content ); ?>
			</div>

			<div class="cdw-note-ctas">
				<?php foreach ( $actions as $action ) : ?>
					<a href="<?php echo esc_url( $action->url ); ?>" class="button cdw-note-action-btn">
						<?php echo esc_html( $action->label ); ?>
					</a>
				<?php endforeach; ?>
				<button
					class="button-link cdw-dismiss-note"
					data-id="<?php echo esc_attr( $note->note_id ); ?>"
					type="button"
				>
					<?php esc_html_e( 'Dismiss', 'custom-dashboard-widgets' ); ?>
				</button>
			</div>
		</li>
		<?php
	}

	// -------------------------------------------------------------------------
	// AJAX handlers
	// -------------------------------------------------------------------------

	public static function ajax_dismiss_note() {
		check_ajax_referer( 'cdw_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => 'Insufficient permissions.' ) );
		}

		$id = isset( $_POST['id'] ) ? absint( $_POST['id'] ) : 0;
		if ( ! $id ) {
			wp_send_json_error( array( 'message' => 'Invalid note ID.' ) );
		}

		self::dismiss_note( $id );
		wp_send_json_success();
	}

	public static function ajax_dismiss_all() {
		check_ajax_referer( 'cdw_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => 'Insufficient permissions.' ) );
		}

		global $wpdb;
		$table = self::get_table_name();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query( "UPDATE {$table} SET status = 'dismissed' WHERE status != 'dismissed'" );

		wp_send_json_success();
	}

	/**
	 * Load all notes for the side panel.
	 */
	public static function ajax_load_panel() {
		check_ajax_referer( 'cdw_nonce', 'nonce' );

		// Dev-state: return full mock list so the panel shows all messages with CTAs.
		if ( class_exists( 'CDW_State_Switcher' ) && CDW_State_Switcher::get_current_state() !== '' ) {
			$notes = self::get_mock_notes();
			ob_start();
			echo '<ul class="cdw-notes-list cdw-notes-list--panel">';
			foreach ( $notes as $note ) {
				self::render_mock_note( $note );
			}
			echo '</ul>';
			wp_send_json_success( array( 'html' => ob_get_clean() ) );
			return;
		}

		$notes = self::get_notes( 999, 0 );

		ob_start();
		if ( empty( $notes ) ) {
			echo '<p class="cdw-no-notes">' . esc_html__( 'Your inbox is empty.', 'custom-dashboard-widgets' ) . '</p>';
		} else {
			echo '<ul class="cdw-notes-list cdw-notes-list--panel">';
			foreach ( $notes as $note ) {
				self::render_note( $note, false ); // no truncation in panel
			}
			echo '</ul>';
		}
		$html = ob_get_clean();

		wp_send_json_success( array( 'html' => $html ) );
	}

	public static function ajax_restore_inbox() {
		check_ajax_referer( 'cdw_nonce', 'nonce' );

		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => 'Insufficient permissions.' ) );
		}

		global $wpdb;
		$table = self::get_table_name();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query( "UPDATE {$table} SET status = 'unread' WHERE status = 'dismissed'" );

		wp_send_json_success();
	}

	// -------------------------------------------------------------------------
	// Database helpers
	// -------------------------------------------------------------------------

	private static function get_table_name() {
		global $wpdb;
		$table  = $wpdb->prefix . 'wc_admin_notes';
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) );
		return $exists ? $table : $wpdb->prefix . 'woocommerce_admin_notes';
	}

	private static function get_notes( $limit, $offset ) {
		global $wpdb;
		$table = self::get_table_name();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return $wpdb->get_results( $wpdb->prepare(
			"SELECT note_id, title, content, status, type, date_created
			 FROM {$table}
			 WHERE status != 'dismissed'
			 ORDER BY date_created DESC
			 LIMIT %d OFFSET %d",
			$limit,
			$offset
		) );
	}

	private static function count_notes() {
		global $wpdb;
		$table = self::get_table_name();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		return (int) $wpdb->get_var(
			"SELECT COUNT(*) FROM {$table} WHERE status != 'dismissed'"
		);
	}

	private static function get_note_actions( $note_id ) {
		global $wpdb;
		$actions_table = $wpdb->prefix . 'wc_admin_note_actions';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $actions_table ) );
		if ( ! $exists ) {
			return array();
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		return $wpdb->get_results( $wpdb->prepare(
			"SELECT label, url, is_primary FROM {$actions_table} WHERE note_id = %d ORDER BY is_primary DESC",
			$note_id
		) );
	}

	private static function dismiss_note( $note_id ) {
		global $wpdb;
		$table = self::get_table_name();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->update(
			$table,
			array( 'status' => 'dismissed' ),
			array( 'note_id' => $note_id ),
			array( '%s' ),
			array( '%d' )
		);
	}

	// -------------------------------------------------------------------------
	// Utility
	// -------------------------------------------------------------------------

	private static function woocommerce_active() {
		return class_exists( 'WooCommerce' );
	}
}
