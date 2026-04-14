<?php
/**
 * Replaces the WooCommerce order edit page with a modern
 * React card-based layout. Fully self-contained — no modifications
 * to WooCommerce core files needed.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WAR_Order_Page {

	public function __construct() {
		add_action( 'current_screen', array( $this, 'maybe_intercept' ) );
	}

	/**
	 * Check if we're editing an existing order and take over the page.
	 */
	public function maybe_intercept() {
		if ( ! $this->is_order_edit() ) {
			return;
		}

		// Enqueue our React bundle.
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );

		// Try hooking into WooCommerce's form action first.
		add_action( 'woocommerce_order_edit_form_top', array( $this, 'render_react_mount' ), 1 );

		// Fallback: render mount point early in admin_footer before scripts execute.
		add_action( 'admin_footer', array( $this, 'render_react_mount_fallback' ), 1 );

		// Hide all the default meta-boxes via CSS.
		add_action( 'admin_head', array( $this, 'hide_default_metaboxes' ) );
	}

	/**
	 * Check if we're on the order edit screen.
	 */
	private function is_order_edit() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$page   = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$action = isset( $_GET['action'] ) ? sanitize_text_field( wp_unslash( $_GET['action'] ) ) : '';
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$id     = isset( $_GET['id'] ) ? absint( $_GET['id'] ) : 0;

		return 'wc-orders' === $page && 'edit' === $action && $id > 0;
	}

	/**
	 * Render the React mount point inside the order form.
	 */
	public function render_react_mount() {
		echo '<div id="wc-order-view-root"></div>';
	}

	/**
	 * Fallback: inject mount point via admin_footer if the primary hook didn't fire.
	 */
	public function render_react_mount_fallback() {
		?>
		<script>
		(function() {
			// Create or find the mount point.
			var mount = document.getElementById( 'wc-order-view-root' );
			if ( ! mount ) {
				mount = document.createElement( 'div' );
				mount.id = 'wc-order-view-root';
			}

			// Always move it to right after the header for correct positioning.
			var wrap = document.querySelector( '#wpbody-content' ) || document.querySelector( '.wrap' );
			var header = wrap ? wrap.querySelector( '.war-page-header' ) : null;
			if ( header && header.nextSibling ) {
				wrap.insertBefore( mount, header.nextSibling );
			} else if ( wrap ) {
				wrap.insertBefore( mount, wrap.firstChild );
			}
		})();
		</script>
		<?php
	}

	/**
	 * Hide all default WooCommerce meta-boxes so only our React UI shows.
	 */
	public function hide_default_metaboxes() {
		?>
		<style>
			/* Hide all default order meta-boxes */
			#woocommerce-order-data,
			#woocommerce-order-items,
			#woocommerce-order-downloads,
			#woocommerce-order-actions,
			#woocommerce-order-notes,
			#postcustom,
			#order_custom,
			.woocommerce-order-attribution-metabox,
			#woocommerce-customer-history,
			/* Hide the form's own heading and submit row */
			.wrap > h1.wp-heading-inline,
			.wrap > .page-title-action,
			.wrap > hr.wp-header-end,
			/* Hide the normal/side meta-box containers but keep the form */
			#order .postbox-container #normal-sortables > .postbox,
			#order .postbox-container #side-sortables > .postbox,
			#order #poststuff #post-body-content > .postbox {
				display: none !important;
			}

			/* Also hide the WooCommerce order data header */
			#order_data.postbox {
				display: none !important;
			}

			/* Keep the React mount visible */
			#wc-order-view-root {
				display: block !important;
			}
		</style>
		<?php
	}

	/**
	 * Enqueue the React order view bundle.
	 */
	public function enqueue_assets() {
		$asset_path = WAR_PATH . 'assets/js/order-view/index.asset.php';
		$asset      = file_exists( $asset_path )
			? require $asset_path
			: array(
				'dependencies' => array( 'wp-element', 'wp-components', 'wp-api-fetch', 'wp-i18n' ),
				'version'      => WAR_VERSION,
			);

		wp_enqueue_script(
			'war-order-view',
			WAR_URL . 'assets/js/order-view/index.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'war-order-view',
			WAR_URL . 'assets/js/order-view/style.css',
			array( 'wp-components' ),
			$asset['version']
		);

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$order_id = isset( $_GET['id'] ) ? absint( $_GET['id'] ) : 0;

		wp_localize_script( 'war-order-view', 'wcOrderView', array(
			'orderId'        => $order_id,
			'restNonce'      => wp_create_nonce( 'wp_rest' ),
			'restUrl'        => rest_url(),
			'currencySymbol' => function_exists( 'get_woocommerce_currency_symbol' )
				? get_woocommerce_currency_symbol()
				: '$',
		) );
	}
}

new WAR_Order_Page();
