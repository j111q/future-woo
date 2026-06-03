<?php
/**
 * Navigation v2 bootstrap — Future Woo adaptation.
 *
 * Upstream (WC PR #64712) wires the feature behind a `navigation_v2` flag in
 * WooCommerce's FeaturesController. In Future Woo the feature is always-on
 * (the whole point of the prototype is to show this nav), so we drop:
 *  - the `woocommerce_register_feature_definitions` hook + register_feature()
 *  - the FeaturesController check inside boot_when_enabled()
 *  - the wc_get_container() DI calls (Future Woo doesn't share WC's container)
 *  - the Telemetry instantiation (no Tracks in the prototype)
 *
 * The `init` priority 20 hook is preserved — Menu_Reconciler needs its
 * admin_menu hook registered before WordPress fires admin_menu.
 */

declare( strict_types = 1 );

namespace FutureWoo\Vendor\NestedNav;

defined( 'ABSPATH' ) || exit;

/**
 * Bootstrap for the nested admin navigation feature.
 */
class Bootstrap {

	public const FEATURE_ID = 'navigation_v2';

	/**
	 * Wire the boot hook.
	 *
	 * `boot_when_enabled` runs on `init` (not `admin_init`) because WordPress
	 * fires `admin_menu` *before* `admin_init` in the admin request lifecycle.
	 * If we booted on admin_init, Menu_Reconciler would register its
	 * admin_menu hook after the hook had already fired, and the reconciler
	 * would never run.
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'boot_when_enabled' ), 20 );
	}

	/**
	 * Instantiate the reconciler, assets, section memory, and order badge.
	 * Each registers its own hooks. We use direct `new` instead of the WC DI
	 * container — these classes have no constructor dependencies that need
	 * injection.
	 *
	 * Spec §8: multisite network admin always uses the native rail — bail
	 * before any hook registration in that context.
	 */
	public function boot_when_enabled(): void {
		if ( ! is_admin() || is_network_admin() ) {
			return;
		}

		// Menu_Reconciler uses setter-injection for its splicer dep
		// (upstream wires this via WC's DI container).
		$reconciler = new Menu_Reconciler();
		$reconciler->init( new Native_Rail_Splicer() );

		new Assets();
		new Section_Memory();
		new Order_Badge();
	}
}
