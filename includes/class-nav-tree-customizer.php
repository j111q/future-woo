<?php
/**
 * Customizes the vendored nested-nav (from WC PR #64712) with Future Woo's
 * own preferences — kept here, outside includes/vendor/nested-nav/, so they
 * survive that dir being deleted when Beau's PR merges upstream.
 *
 * Four things:
 *
 * 1. Home: the rail's "Home" item (slug `wc-admin`) is repointed from the
 *    legacy WC home (`admin.php?page=wc-admin`) to Future Woo's redesigned
 *    Store Dashboard (`admin.php?page=war-store-dashboard`), via the
 *    `woocommerce_admin_menu_tree` filter (Beau's documented extension point).
 *
 * 1b. Marketing children: WC's React-registered marketing pages don't land as
 *    classic `$submenu['woocommerce-marketing']` entries in this WC build, so
 *    the vendored tree-builder's auto-attach hoists nothing and Marketing shows
 *    as a childless leaf — orphaning Future Woo's vendored Campaigns page. We
 *    declare the Marketing children explicitly in the same tree filter so the
 *    rail drills down to Overview / Campaigns / Channels / Coupons.
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
		add_filter( 'woocommerce_admin_menu_tree', array( __CLASS__, 'add_marketing_children' ), 10, 3 );
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

	/**
	 * Give the Marketing rail node its sub-items.
	 *
	 * The vendored tree-builder hoists a parent's children from
	 * `$submenu[<parent-slug>]` (see Tree_Builder::attach_rehomed_submenu_children).
	 * In this WC build the marketing pages register through wc-admin's React
	 * PageController and never populate `$submenu['woocommerce-marketing']` as
	 * classic entries, so nothing auto-attaches and Marketing renders as a
	 * childless leaf — leaving Future Woo's vendored Campaigns page unreachable
	 * from the rail. We declare the children explicitly here instead.
	 *
	 * Each child is a synthetic node (`url` set) so it survives the builder's
	 * registered-slug check regardless of how WC registered the underlying page.
	 * Positions order them Overview → Campaigns → Channels → Coupons.
	 *
	 * Channels has no standalone wc-admin route (it's a section on the Marketing
	 * Overview page), so for now it points at the overview. If a dedicated
	 * channels view lands, repoint its `url`.
	 *
	 * Idempotent: keyed by slug, and any pre-existing marketing child with a
	 * matching title is dropped first, so this stays correct if WC ever does
	 * start populating the classic submenu.
	 *
	 * @param array $tree    Tree keyed by slug.
	 * @param array $menu    WP's $menu.
	 * @param array $submenu WP's $submenu.
	 *
	 * @return array
	 */
	public static function add_marketing_children( array $tree, array $menu, array $submenu ): array {
		$parent = 'woocommerce-marketing';
		if ( ! isset( $tree[ $parent ] ) ) {
			return $tree;
		}

		$children = array(
			'wc-admin&path=/marketing'           => array(
				'title'    => __( 'Overview', 'woo-admin-revamp' ),
				'position' => 1,
				'url'      => 'admin.php?page=wc-admin&path=/marketing',
			),
			'wc-admin&path=/marketing/campaigns' => array(
				'title'    => __( 'Campaigns', 'woo-admin-revamp' ),
				'position' => 2,
				'url'      => 'admin.php?page=wc-admin&path=/marketing/campaigns',
			),
			// No standalone channels route yet — point at the overview, where the
			// channels card lives. Repoint if a dedicated view ships.
			'wc-admin&path=/marketing/channels'  => array(
				'title'    => __( 'Channels', 'woo-admin-revamp' ),
				'position' => 3,
				'url'      => 'admin.php?page=wc-admin&path=/marketing',
			),
			'edit.php?post_type=shop_coupon'     => array(
				'title'    => __( 'Coupons', 'woo-admin-revamp' ),
				'position' => 4,
				'url'      => 'edit.php?post_type=shop_coupon',
			),
		);

		// Drop any pre-existing marketing child that duplicates one of our titles,
		// so we don't double up if auto-attach ever starts working upstream.
		$our_titles = array();
		foreach ( $children as $node ) {
			$our_titles[ strtolower( $node['title'] ) ] = true;
		}
		foreach ( $tree as $slug => $node ) {
			if ( ( $node['parent'] ?? null ) !== $parent ) {
				continue;
			}
			if ( isset( $our_titles[ strtolower( (string) ( $node['title'] ?? '' ) ) ] ) ) {
				unset( $tree[ $slug ] );
			}
		}

		foreach ( $children as $slug => $node ) {
			$tree[ $slug ] = array_merge(
				$node,
				array(
					'parent'     => $parent,
					'capability' => 'manage_woocommerce',
					'source'     => 'future-woo',
				)
			);
		}

		return $tree;
	}
}
