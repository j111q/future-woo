<?php
/**
 * Customizes the vendored nested-nav tree (from WC PR #64712) to wire
 * Future Woo's surfaces into Beau's rail.
 *
 * Today this only does one thing: the rail's "Home" item (slug `wc-admin`)
 * is repointed from the legacy WC home (`admin.php?page=wc-admin`) to
 * Future Woo's redesigned Store Dashboard (`admin.php?page=war-store-dashboard`).
 * So clicking "Home" in the Woo rail opens the Future Woo dashboard with
 * all the Store widgets, not the legacy WC home.
 *
 * Other Future Woo surfaces (Order view redesign, modern Settings cards,
 * Shipping setup) already live at the WC slugs Beau's tree references
 * (`wc-orders`, `wc-settings`, etc.) so no rewiring is needed for those.
 *
 * When Beau's PR merges into WC trunk and we delete includes/vendor/nested-nav/,
 * this file's filter still works — the woocommerce_admin_menu_tree filter is
 * Beau's documented extension point and will continue to be supported.
 */

defined( 'ABSPATH' ) || exit;

class WAR_Nav_Tree_Customizer {

	public static function init() {
		add_filter( 'woocommerce_admin_menu_tree', array( __CLASS__, 'remap_home_to_store_dashboard' ), 10, 3 );
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
