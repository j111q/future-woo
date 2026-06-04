<?php
/**
 * Customizes the vendored nested-nav (from WC PR #64712) with Future Woo's
 * own preferences — kept here, outside includes/vendor/nested-nav/, so they
 * survive that dir being deleted when Beau's PR merges upstream.
 *
 * Three things:
 *
 * 1. Home: the rail's "Home" item (slug `wc-admin`) is repointed from the
 *    legacy WC home (`admin.php?page=wc-admin`) to Future Woo's redesigned
 *    Store Dashboard (`admin.php?page=war-store-dashboard`), via the
 *    `woocommerce_admin_menu_tree` filter (Beau's documented extension point).
 *
 * 2. Back link: the vendored splicer relabels WP's `index.php` entry to
 *    "Dashboard" and gives it a left-arrow icon, turning it into a back-to-WP
 *    affordance. Future Woo relabels it to "Back" — clearer that it leaves the
 *    store, and not confusable with the redesigned "Home" dashboard. Done on
 *    `admin_init` so it runs after the splicer (which fires on `admin_menu` at
 *    PHP_INT_MAX); works the same once the vendor is gone.
 *
 * 3. Styling: assets/css/nav-customizations.css sets the back link apart from
 *    the store menu items so it doesn't read as a peer of Home / Orders.
 *
 * Other Future Woo surfaces (Order view redesign, modern Settings cards,
 * Shipping setup) already live at the WC slugs Beau's tree references
 * (`wc-orders`, `wc-settings`, etc.) so no rewiring is needed for those.
 */

defined( 'ABSPATH' ) || exit;

class WAR_Nav_Tree_Customizer {

	public static function init() {
		add_filter( 'woocommerce_admin_menu_tree', array( __CLASS__, 'remap_home_to_store_dashboard' ), 10, 3 );
		add_action( 'admin_init', array( __CLASS__, 'relabel_back_link' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_nav_css' ) );
		// Priority 9999: after WP/plugins register menus, but before the vendored
		// nested-nav reconciler (admin_menu @ PHP_INT_MAX) snapshots the menu, so
		// the item is gone from both the native menu and the Woo overlay panel.
		add_action( 'admin_menu', array( __CLASS__, 'hide_inaccessible_link_manager' ), 9999 );
	}

	/**
	 * Relabel WP's `index.php` rail entry from "Dashboard" to "Back" — but ONLY
	 * when the rail is actually spliced (i.e. you're inside the Woo experience).
	 *
	 * The vendored splicer only runs on Woo pages: Native_Rail_Splicer::splice()
	 * bails when Context::resolve_current_slug() is null, so off a Woo page the
	 * full WP menu shows and the Dashboard stays a normal top-level item. On Woo
	 * pages, relabel_dashboard() turns it into the rail's back affordance and
	 * swaps its icon to `dashicons-arrow-left-alt`. That icon is the signal we
	 * gate on — it lets us match the splicer's own "is the rail active?" decision
	 * without coupling to the vendored Context class (so nothing fatals once the
	 * vendor dir is deleted; the relabel simply stops applying, which is correct).
	 *
	 * Runs on `admin_init`, which fires after all of `admin_menu` (the splicer is
	 * at PHP_INT_MAX) and before the menu renders, so our $menu write wins.
	 *
	 * No-op if WP's Dashboard entry isn't present (e.g. user lacks `read`, or on
	 * requests that never build the admin menu).
	 */
	public static function relabel_back_link(): void {
		global $menu;

		if ( ! is_array( $menu ) ) {
			return;
		}

		foreach ( $menu as $key => $entry ) {
			if ( ! isset( $entry[2] ) || 'index.php' !== $entry[2] ) {
				continue;
			}

			// Gate: only when the splicer has already turned this into the rail's
			// back affordance. Otherwise it's the plain WP Dashboard — leave it.
			if ( ! isset( $entry[6] ) || 'dashicons-arrow-left-alt' !== $entry[6] ) {
				continue;
			}

			$menu[ $key ][0] = __( 'Back', 'woo-admin-revamp' );
			$menu[ $key ][3] = __( 'Back', 'woo-admin-revamp' );

			// Tag the <li> (field 4 is its CSS class) so nav-customizations.css
			// styles ONLY the back affordance, never the plain Dashboard item.
			$classes = isset( $menu[ $key ][4] ) ? $menu[ $key ][4] : '';
			if ( false === strpos( $classes, 'war-rail-back' ) ) {
				$menu[ $key ][4] = trim( $classes . ' war-rail-back' );
			}
		}
	}

	/**
	 * Load the nav override styles. Enqueued on every admin page because the
	 * rail is global — not gated to Woo pages.
	 */
	public static function enqueue_nav_css(): void {
		wp_enqueue_style(
			'war-nav-customizations',
			WAR_URL . 'assets/css/nav-customizations.css',
			array(),
			WAR_VERSION
		);
	}

	/**
	 * Hide the legacy Link Manager ("Links") menu from users who can't use it.
	 *
	 * The `link_category` taxonomy registers a top-level "Links" menu whose
	 * display capability is looser than the `manage_links` cap its page actually
	 * enforces — so it renders in the menu for users who then get a 403 ("not
	 * allowed to manage terms in this taxonomy") on click. We remove it for
	 * anyone lacking `manage_links`, which exactly matches who'd hit the 403,
	 * and leave it intact for users who can genuinely manage links.
	 *
	 * Not nested-nav-specific — general admin-menu hygiene for the prototype.
	 */
	public static function hide_inaccessible_link_manager(): void {
		if ( current_user_can( 'manage_links' ) ) {
			return;
		}
		remove_menu_page( 'edit-tags.php?taxonomy=link_category' );
	}

	/**
	 * Replace the "Home" entry's URL with the Future Woo Store Dashboard.
	 *
	 * The tree is keyed by slug. Beau's default tree has the "Home" entry
	 * under the `wc-admin` slug. We add a `url` override (a feature
	 * supported by Native_Rail_Splicer for synthetic / overridden nodes)
	 * to repoint it.
	 *
	 * @param array $tree    Tree keyed by slug.
	 * @param array $menu    WP's $menu.
	 * @param array $submenu WP's $submenu.
	 *
	 * @return array
	 */
	public static function remap_home_to_store_dashboard( array $tree, array $menu, array $submenu ): array {
		if ( isset( $tree['wc-admin'] ) ) {
			$tree['wc-admin']['url'] = 'admin.php?page=war-store-dashboard';
		}
		return $tree;
	}
}
