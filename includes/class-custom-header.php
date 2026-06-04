<?php
/**
 * Custom Header — replaces the WooCommerce page-level header
 * (Screen Options, Help, Activity, Finish setup) with a clean
 * CIAB-style page header showing breadcrumb, status badge, and
 * customer info.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WAR_Custom_Header {

	private static $woo_post_types = array( 'product', 'shop_order', 'shop_coupon' );

	public static function register() {
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'maybe_enqueue' ) );
		add_action( 'in_admin_header', array( __CLASS__, 'maybe_render_header' ), 100 );
	}

	private static function is_woo_page() {
		$screen = get_current_screen();

		if ( ! $screen ) {
			return false;
		}

		if ( in_array( $screen->post_type, self::$woo_post_types, true ) ) {
			return true;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';
		// `wc-*` / `woocommerce` are core WooCommerce pages; `war-*` are Future Woo's
		// own surfaces (e.g. war-store-dashboard) — all share this page header.
		if ( $page && ( strpos( $page, 'wc-' ) === 0 || strpos( $page, 'war-' ) === 0 || $page === 'woocommerce' ) ) {
			return true;
		}

		if ( strpos( $screen->id, 'woocommerce' ) !== false ) {
			return true;
		}

		return false;
	}

	/**
	 * Check if we're editing an order.
	 */
	private static function is_order_edit() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$page   = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$action = isset( $_GET['action'] ) ? sanitize_text_field( wp_unslash( $_GET['action'] ) ) : '';
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$id     = isset( $_GET['id'] ) ? absint( $_GET['id'] ) : 0;

		return 'wc-orders' === $page && 'edit' === $action && $id > 0;
	}

	public static function maybe_enqueue() {
		if ( ! self::is_woo_page() ) {
			return;
		}

		wp_enqueue_style( 'wp-components' );

		wp_enqueue_style(
			'war-custom-header',
			WAR_URL . 'assets/css/custom-header.css',
			array( 'wp-components' ),
			WAR_VERSION
		);

		// Add inline JS to reposition header and update title on SPA navigation.
		wp_add_inline_script( 'wp-hooks', self::get_header_reposition_script() );
		wp_add_inline_script( 'wp-hooks', self::get_spa_title_script() );

	}

	/**
	 * JS that moves the header inside #wpbody-content so sticky works.
	 */
	private static function get_header_reposition_script() {
		return "
		(function() {
			function moveHeader() {
				var header = document.querySelector('.war-page-header');
				var target = document.querySelector('#wpbody-content');
				if (header && target && header.parentElement !== target) {
					target.insertBefore(header, target.firstChild);
				}
			}
			function fixOverflow() {
				['#wpbody-content', '#wpcontent'].forEach(function(sel) {
					var el = document.querySelector(sel);
					if (el) {
						el.style.setProperty('overflow', 'visible', 'important');
						el.style.setProperty('overflow-x', 'visible', 'important');
						el.style.setProperty('overflow-y', 'visible', 'important');
					}
				});
			}
			function init() {
				moveHeader();
				fixOverflow();
				// WooCommerce re-applies overflow via JS, so keep fixing it
				var observer = new MutationObserver(function(mutations) {
					mutations.forEach(function(m) {
						if (m.attributeName === 'style') fixOverflow();
					});
				});
				['#wpbody-content', '#wpcontent'].forEach(function(sel) {
					var el = document.querySelector(sel);
					if (el) observer.observe(el, { attributes: true });
				});
			}
			if (document.readyState === 'loading') {
				document.addEventListener('DOMContentLoaded', init);
			} else {
				init();
			}
		})();
		";
	}

	/**
	 * JS that watches for SPA navigation and updates the header title.
	 */
	private static function get_spa_title_script() {
		return "
		(function() {
			var pathTitles = {
				'/customers': 'Customers',
				'/marketing': 'Marketing',
				'/analytics': 'Analytics',
				'/extensions': 'Extensions',
				'/payments': 'Payments',
				'/bookings': 'Bookings',
			};

			function getTitleFromPath() {
				var params = new URLSearchParams(window.location.search);
				var path = params.get('path') || '';
				for (var prefix in pathTitles) {
					if (path.indexOf(prefix) === 0) return pathTitles[prefix];
				}
				var page = params.get('page') || '';
				if (page === 'wc-admin') return 'Dashboard';
				if (page === 'wc-orders') return 'Orders';
				if (page === 'wc-settings') {
					var tab = params.get('tab') || 'general';
					var tabTitles = {
						general: 'General',
						products: 'Products',
						shipping: 'Shipping',
						checkout: 'Payments',
						account: 'Accounts & Privacy',
						email: 'Emails',
						integration: 'Integration',
						tax: 'Tax',
						'site-visibility': 'Site visibility',
						advanced: 'Advanced'
					};
					return tabTitles[tab] || 'Settings';
				}
				return '';
			}

			function updateHeader() {
				var params = new URLSearchParams(window.location.search);
				// Skip on shipping pages — Shipping_Setup_Admin manages its own breadcrumb.
				if (params.get('page') === 'wc-settings' && params.get('tab') === 'shipping') return;
				// Skip on order edit pages — render_order_header manages its own breadcrumb.
				if (params.get('page') === 'wc-orders' && params.get('action') === 'edit') return;

				var el = document.querySelector('.war-page-header__breadcrumb');
				if (!el) return;
				var title = getTitleFromPath();
				if (title && el.textContent.trim() !== title) {
					el.textContent = title;
				}
			}

			// Watch for URL changes (SPA navigation).
			var lastUrl = window.location.href;
			setInterval(function() {
				if (window.location.href !== lastUrl) {
					lastUrl = window.location.href;
					updateHeader();
				}
			}, 200);

			// Also run on DOM ready.
			document.addEventListener('DOMContentLoaded', updateHeader);
		})();
		";
	}

	public static function maybe_render_header() {
		if ( ! self::is_woo_page() ) {
			return;
		}

		// For order edit pages, render order-specific header.
		if ( self::is_order_edit() ) {
			self::render_order_header();
			return;
		}

		// For shipping settings pages, render the shipping header.
		if ( self::is_shipping_settings() ) {
			self::render_shipping_header();
			return;
		}

		// For tax settings pages, render the tax header with tabs.
		if ( self::is_tax_settings() ) {
			self::render_tax_header();
			return;
		}

		// For product pages, render breadcrumb header.
		if ( self::is_product_page() ) {
			self::render_product_header();
			return;
		}

		// For other WooCommerce pages, render a generic header.
		self::render_generic_header();
	}

	/**
	 * Check if we're on a product page.
	 */
	private static function is_product_page() {
		$screen = get_current_screen();
		return $screen && $screen->post_type === 'product';
	}

	/**
	 * Render the shipping page header with tabs.
	 */
	private static function render_shipping_header() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$section        = isset( $_GET['section'] ) ? sanitize_key( $_GET['section'] ) : '';
		$is_operations  = ( 'operations' === $section );
		$zones_url      = admin_url( 'admin.php?page=wc-settings&tab=shipping' );
		$operations_url = admin_url( 'admin.php?page=wc-settings&tab=shipping&section=operations' );
		?>
		<div class="war-page-header war-page-header--shipping" id="wss-page-header">
			<div class="war-page-header__top">
				<div class="war-page-header__left">
					<h1 class="war-page-header__breadcrumb" id="wss-breadcrumb">
						<?php esc_html_e( 'Shipping', 'woo-admin-revamp' ); ?>
						<span id="wss-breadcrumb-extra"></span>
					</h1>
				</div>
				<div class="war-page-header__actions">
					<div id="wss-header-actions"></div>
				</div>
			</div>
			<div class="war-page-header__subtitle">
				<?php esc_html_e( 'Manage shipping zones, methods, and delivery options for your store.', 'woo-admin-revamp' ); ?>
			</div>
			<nav class="war-page-header__tabs" id="wss-tabs" aria-label="<?php esc_attr_e( 'Shipping sections', 'woo-admin-revamp' ); ?>">
				<a href="<?php echo esc_url( $zones_url ); ?>"
				   class="war-page-header__tab <?php echo ! $is_operations ? 'war-page-header__tab--active' : ''; ?>">
					<?php esc_html_e( 'Zones', 'woo-admin-revamp' ); ?>
				</a>
				<a href="<?php echo esc_url( $operations_url ); ?>"
				   class="war-page-header__tab <?php echo $is_operations ? 'war-page-header__tab--active' : ''; ?>">
					<?php esc_html_e( 'Operations', 'woo-admin-revamp' ); ?>
				</a>
			</nav>
		</div>
		<?php
	}

	/**
	 * Check if we're on WC Settings → Shipping tab.
	 */
	private static function is_shipping_settings() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$tab  = isset( $_GET['tab'] ) ? sanitize_text_field( wp_unslash( $_GET['tab'] ) ) : '';

		return 'wc-settings' === $page && 'shipping' === $tab;
	}

	/**
	 * Check if we're on WC Settings → Tax tab.
	 */
	private static function is_tax_settings() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$tab  = isset( $_GET['tab'] ) ? sanitize_text_field( wp_unslash( $_GET['tab'] ) ) : '';

		return 'wc-settings' === $page && 'tax' === $tab;
	}

	/**
	 * Render the tax page header with tabs.
	 */
	private static function render_tax_header() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$section = isset( $_GET['section'] ) ? sanitize_key( $_GET['section'] ) : '';

		// Build tabs from WooCommerce's tax sections.
		$tabs = array(
			array( 'slug' => '',         'label' => __( 'Tax options', 'woo-admin-revamp' ) ),
			array( 'slug' => 'standard', 'label' => __( 'Standard rates', 'woo-admin-revamp' ) ),
		);

		// Add custom tax classes.
		if ( class_exists( 'WC_Tax' ) ) {
			foreach ( WC_Tax::get_tax_classes() as $class ) {
				$tabs[] = array(
					'slug'  => sanitize_title( $class ),
					/* translators: %s: tax class name */
					'label' => sprintf( __( '%s rates', 'woo-admin-revamp' ), $class ),
				);
			}
		}

		?>
		<div class="war-page-header war-page-header--shipping" id="wss-page-header">
			<div class="war-page-header__top">
				<div class="war-page-header__left">
					<h1 class="war-page-header__breadcrumb" id="wss-breadcrumb">
						<?php esc_html_e( 'Tax', 'woo-admin-revamp' ); ?>
						<span id="wss-breadcrumb-extra"></span>
					</h1>
				</div>
				<div class="war-page-header__actions">
					<div id="wss-header-actions"></div>
				</div>
			</div>
			<div class="war-page-header__subtitle">
				<?php esc_html_e( 'Configure how taxes are calculated and displayed in your store.', 'woo-admin-revamp' ); ?>
			</div>
			<nav class="war-page-header__tabs" id="wss-tabs" aria-label="<?php esc_attr_e( 'Tax sections', 'woo-admin-revamp' ); ?>">
				<?php foreach ( $tabs as $tab ) :
					$url = admin_url( 'admin.php?page=wc-settings&tab=tax' . ( $tab['slug'] ? '&section=' . $tab['slug'] : '' ) );
					$active = ( $section === $tab['slug'] ) ? 'war-page-header__tab--active' : '';
				?>
					<a href="<?php echo esc_url( $url ); ?>"
					   class="war-page-header__tab <?php echo esc_attr( $active ); ?>">
						<?php echo esc_html( $tab['label'] ); ?>
					</a>
				<?php endforeach; ?>
			</nav>
		</div>
		<style>.wrap.woocommerce > form > p.submit { display: none !important; }</style>
		<?php if ( '' !== $section ) : ?>
		<script>
		document.addEventListener('DOMContentLoaded', function() {
			var target = document.getElementById('wss-header-actions');
			var form = document.querySelector('.wrap.woocommerce form');
			if ( ! target || ! form ) return;

			var btn = document.createElement('button');
			btn.type = 'submit';
			btn.className = 'components-button is-primary is-compact';
			btn.textContent = 'Save';
			btn.addEventListener('click', function() {
				form.submit();
			});
			target.appendChild( btn );
		});
		</script>
		<?php endif; ?>
		<?php
	}

	/**
	 * Render the order-specific page header.
	 */
	private static function render_order_header() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$order_id = isset( $_GET['id'] ) ? absint( $_GET['id'] ) : 0;
		$order    = wc_get_order( $order_id );

		if ( ! $order ) {
			return;
		}

		$status       = $order->get_status();
		$order_number = $order->get_order_number();
		$first_name   = $order->get_billing_first_name();
		$last_name    = $order->get_billing_last_name();
		$customer     = trim( $first_name . ' ' . $last_name );
		if ( empty( $customer ) ) {
			$customer = __( 'Guest', 'woo-admin-revamp' );
		}
		$date = $order->get_date_created() ? $order->get_date_created()->format( 'Y/m/d' ) : '';

		// Map status to payment badge.
		$payment_badge_map = array(
			'pending'    => array( 'label' => __( 'Unpaid', 'woo-admin-revamp' ), 'class' => 'unpaid' ),
			'processing' => array( 'label' => __( 'Paid', 'woo-admin-revamp' ), 'class' => 'paid' ),
			'on-hold'    => array( 'label' => __( 'On hold', 'woo-admin-revamp' ), 'class' => 'unpaid' ),
			'completed'  => array( 'label' => __( 'Paid', 'woo-admin-revamp' ), 'class' => 'paid' ),
			'cancelled'  => array( 'label' => __( 'Cancelled', 'woo-admin-revamp' ), 'class' => 'cancelled' ),
			'refunded'   => array( 'label' => __( 'Refunded', 'woo-admin-revamp' ), 'class' => 'refunded' ),
			'failed'     => array( 'label' => __( 'Failed', 'woo-admin-revamp' ), 'class' => 'cancelled' ),
		);

		$badge = isset( $payment_badge_map[ $status ] ) ? $payment_badge_map[ $status ] : array( 'label' => ucfirst( $status ), 'class' => 'unpaid' );

		// Map status to fulfillment badge.
		$fulfillment_badge_map = array(
			'pending'    => array( 'label' => __( 'Unfulfilled', 'woo-admin-revamp' ), 'class' => 'unfulfilled' ),
			'processing' => array( 'label' => __( 'Unfulfilled', 'woo-admin-revamp' ), 'class' => 'unfulfilled' ),
			'on-hold'    => array( 'label' => __( 'Unfulfilled', 'woo-admin-revamp' ), 'class' => 'unfulfilled' ),
			'completed'  => array( 'label' => __( 'Fulfilled', 'woo-admin-revamp' ), 'class' => 'fulfilled' ),
			'cancelled'  => null,
			'refunded'   => null,
			'failed'     => null,
		);

		$fulfillment = isset( $fulfillment_badge_map[ $status ] ) ? $fulfillment_badge_map[ $status ] : null;
		$orders_url = admin_url( 'admin.php?page=wc-orders' );

		?>
		<div class="war-page-header">
			<div class="war-page-header__top">
				<div class="war-page-header__left">
					<h1 class="war-page-header__breadcrumb">
						<a href="<?php echo esc_url( $orders_url ); ?>"><?php esc_html_e( 'Orders', 'woo-admin-revamp' ); ?></a>
						<span class="war-page-header__breadcrumb-sep">/</span>
						<span>#<?php echo esc_html( $order_number ); ?></span>
						<span class="war-page-header__badge war-page-header__badge--<?php echo esc_attr( $badge['class'] ); ?>">
							<?php echo esc_html( $badge['label'] ); ?>
						</span>
						<?php if ( $fulfillment ) : ?>
						<span class="war-page-header__badge war-page-header__badge--<?php echo esc_attr( $fulfillment['class'] ); ?>">
							<?php echo esc_html( $fulfillment['label'] ); ?>
						</span>
						<?php endif; ?>
					</h1>
				</div>
				<div class="war-page-header__actions">
					<button type="button" class="war-page-header__menu-btn" title="<?php esc_attr_e( 'More actions', 'woo-admin-revamp' ); ?>">
						&#8942;
					</button>
				</div>
			</div>
			<div class="war-page-header__subtitle">
				<?php echo esc_html( $customer ); ?> &middot; <?php echo esc_html( $date ); ?>
			</div>
		</div>
		<?php
	}

	/**
	 * Render the product page header with breadcrumb.
	 */
	private static function render_product_header() {
		$screen       = get_current_screen();
		$products_url = admin_url( 'edit.php?post_type=product' );

		if ( $screen->base === 'edit' ) {
			// Products list page.
			$add_url = admin_url( 'post-new.php?post_type=product' );
			?>
			<div class="war-page-header">
				<div class="war-page-header__top">
					<div class="war-page-header__left">
						<h1 class="war-page-header__breadcrumb">
							<?php esc_html_e( 'Products', 'woo-admin-revamp' ); ?>
						</h1>
					</div>
					<div class="war-page-header__actions">
						<a href="<?php echo esc_url( $add_url ); ?>" class="components-button is-primary is-compact">
							<?php esc_html_e( 'Add product', 'woo-admin-revamp' ); ?>
						</a>
					</div>
				</div>
			</div>
			<?php
		} elseif ( $screen->base === 'post' ) {
			// Single product edit or add new.
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$post_id      = isset( $_GET['post'] ) ? absint( $_GET['post'] ) : 0;
			$product_name = $post_id ? get_the_title( $post_id ) : '';
			$page_label   = $product_name ? $product_name : __( 'Add New', 'woo-admin-revamp' );

			?>
			<div class="war-page-header">
				<div class="war-page-header__top">
					<div class="war-page-header__left">
						<h1 class="war-page-header__breadcrumb">
							<a href="<?php echo esc_url( $products_url ); ?>"><?php esc_html_e( 'Products', 'woo-admin-revamp' ); ?></a>
							<span class="war-page-header__breadcrumb-sep">/</span>
							<span><?php echo esc_html( $page_label ); ?></span>
						</h1>
					</div>
				</div>
			</div>
			<?php
		} elseif ( $screen->base === 'edit-tags' || $screen->base === 'term' ) {
			// Taxonomy pages (Categories, Tags, Brands, Attributes).
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$taxonomy = isset( $_GET['taxonomy'] ) ? sanitize_key( $_GET['taxonomy'] ) : $screen->taxonomy;
			$tax_obj  = get_taxonomy( $taxonomy );
			$tax_name = $tax_obj ? $tax_obj->labels->name : __( 'Taxonomy', 'woo-admin-revamp' );

			?>
			<div class="war-page-header">
				<div class="war-page-header__top">
					<div class="war-page-header__left">
						<h1 class="war-page-header__breadcrumb">
							<a href="<?php echo esc_url( $products_url ); ?>"><?php esc_html_e( 'Products', 'woo-admin-revamp' ); ?></a>
							<span class="war-page-header__breadcrumb-sep">/</span>
							<span><?php echo esc_html( $tax_name ); ?></span>
						</h1>
					</div>
				</div>
			</div>
			<?php
		}
	}

	/**
	 * Render a generic header for other WooCommerce pages.
	 */
	private static function render_generic_header() {
		$screen = get_current_screen();
		$title  = '';

		if ( $screen ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';

			// For wc-admin pages, check the path first (Customers, Marketing, etc.)
			// before falling back to "Dashboard".
			if ( $page === 'wc-admin' ) {
				// phpcs:ignore WordPress.Security.NonceVerification.Recommended
				$path = isset( $_GET['path'] ) ? sanitize_text_field( wp_unslash( $_GET['path'] ) ) : '';
				$path_titles = array(
					'/customers'          => __( 'Customers', 'woo-admin-revamp' ),
					'/marketing'          => __( 'Marketing', 'woo-admin-revamp' ),
					'/analytics'          => __( 'Analytics', 'woo-admin-revamp' ),
					'/extensions'         => __( 'Extensions', 'woo-admin-revamp' ),
					'/payments'           => __( 'Payments', 'woo-admin-revamp' ),
					'/bookings'           => __( 'Bookings', 'woo-admin-revamp' ),
				);
				foreach ( $path_titles as $prefix => $label ) {
					if ( strpos( $path, $prefix ) === 0 ) {
						$title = $label;
						break;
					}
				}
				if ( ! $title ) {
					$title = __( 'Dashboard', 'woo-admin-revamp' );
				}
			}

			// Other known page slugs.
			if ( ! $title ) {
				if ( $page === 'wc-settings' ) {
					// phpcs:ignore WordPress.Security.NonceVerification.Recommended
					$tab = isset( $_GET['tab'] ) ? sanitize_key( $_GET['tab'] ) : 'general';
					$tab_titles = array(
						'general'     => __( 'General', 'woo-admin-revamp' ),
						'products'    => __( 'Products', 'woo-admin-revamp' ),
						'shipping'    => __( 'Shipping', 'woo-admin-revamp' ),
						'checkout'    => __( 'Payments', 'woo-admin-revamp' ),
						'account'     => __( 'Accounts & Privacy', 'woo-admin-revamp' ),
						'email'       => __( 'Emails', 'woo-admin-revamp' ),
						'integration' => __( 'Integration', 'woo-admin-revamp' ),
						'tax'         => __( 'Tax', 'woo-admin-revamp' ),
						'site-visibility' => __( 'Site Visibility', 'woo-admin-revamp' ),
						'advanced'    => __( 'Advanced', 'woo-admin-revamp' ),
					);
					$title = isset( $tab_titles[ $tab ] ) ? $tab_titles[ $tab ] : __( 'Settings', 'woo-admin-revamp' );
				}

				$other_titles = array(
					'wc-orders'           => __( 'Orders', 'woo-admin-revamp' ),
					'wc-reports'          => __( 'Reports', 'woo-admin-revamp' ),
					'wc-status'           => __( 'Status', 'woo-admin-revamp' ),
					'wc-addons'           => __( 'Extensions', 'woo-admin-revamp' ),
					'war-store-dashboard' => __( 'Dashboard', 'woo-admin-revamp' ),
				);

				if ( ! $title && isset( $other_titles[ $page ] ) ) {
					$title = $other_titles[ $page ];
				}
			}

			// Product post type pages.
			if ( ! $title && $screen->post_type === 'product' ) {
				if ( $screen->base === 'edit' ) {
					$title = __( 'Products', 'woo-admin-revamp' );
				} elseif ( $screen->base === 'post' ) {
					// phpcs:ignore WordPress.Security.NonceVerification.Recommended
					$post_id = isset( $_GET['post'] ) ? absint( $_GET['post'] ) : 0;
					if ( $post_id ) {
						$product_name = get_the_title( $post_id );
						$title = $product_name ? $product_name : __( 'Edit Product', 'woo-admin-revamp' );
					} else {
						$title = __( 'Add New Product', 'woo-admin-revamp' );
					}
				}
			}

			// Shop order pages (legacy CPT).
			if ( ! $title && $screen->post_type === 'shop_order' ) {
				$title = __( 'Orders', 'woo-admin-revamp' );
			}

			// Coupon pages.
			if ( ! $title && $screen->post_type === 'shop_coupon' ) {
				$title = __( 'Coupons', 'woo-admin-revamp' );
			}
		}

		if ( ! $title ) {
			return;
		}

		?>
		<?php
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$tab  = isset( $_GET['tab'] ) ? sanitize_key( $_GET['tab'] ) : 'general';
		$is_modern_settings = ( $page === 'wc-settings' && CDW_WC_Settings_Modern::is_enabled() );

		$tab_descriptions = array(
			'general'     => __( "Manage your store's basic details, display settings, and format preferences.", 'woo-admin-revamp' ),
			'products'    => __( 'Configure product display, inventory, and downloadable product settings.', 'woo-admin-revamp' ),
			'account'     => __( 'Manage account registration, privacy policy, and personal data settings.', 'woo-admin-revamp' ),
			'integration' => __( 'Configure third-party integrations for your store.', 'woo-admin-revamp' ),
			'tax'         => __( 'Configure how taxes are calculated and displayed in your store.', 'woo-admin-revamp' ),
			'site-visibility' => __( 'Control whether your store is visible to the public or in coming soon mode.', 'woo-admin-revamp' ),
			'advanced'    => __( 'Advanced settings for pages, REST API, and other features.', 'woo-admin-revamp' ),
		);
		$description = isset( $tab_descriptions[ $tab ] ) ? $tab_descriptions[ $tab ] : '';
		?>
		<div class="war-page-header">
			<div class="war-page-header__top">
				<div class="war-page-header__left">
					<h1 class="war-page-header__breadcrumb">
						<?php echo esc_html( $title ); ?>
					</h1>
				</div>
				<?php if ( $is_modern_settings ) : ?>
				<div class="war-page-header__actions">
					<div id="war-settings-header-actions"></div>
				</div>
				<?php endif; ?>
			</div>
			<?php if ( $is_modern_settings && $description ) : ?>
			<div class="war-page-header__subtitle">
				<?php echo esc_html( $description ); ?>
			</div>
			<?php endif; ?>
		</div>
		<?php
	}
}

add_action( 'admin_init', array( 'WAR_Custom_Header', 'register' ) );
