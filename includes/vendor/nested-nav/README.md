# Vendored: nested admin navigation

These files are vendored from [woocommerce/woocommerce#64712](https://github.com/woocommerce/woocommerce/pull/64712) — Beau Lebens' "Add nested admin navigation behind `navigation_v2` feature flag" — at branch `feature/nested-admin-nav`, commit `110ef7c6` (May 28, 2026).

**Don't edit these PHP files directly** beyond the documented Future Woo adaptations (see below). When Beau's upstream PR merges into WC, we'll delete this vendor copy and just programmatically flip the `navigation_v2` flag instead.

## Future Woo adaptations applied

Five edits separate these vendored files from Beau's upstream:

1. **Namespace** renamed `Automattic\WooCommerce\Internal\Admin\Navigation` → `FutureWoo\Vendor\NestedNav` to avoid collision once upstream merges.
2. **`Bootstrap.php`** — feature-flag check removed (Future Woo = always-on), `wc_get_container()` calls replaced with direct `new` instantiation (no DI container outside WC), feature definition registration removed (no UI toggle). Also: Menu_Reconciler's setter-injected dependency is wired manually (`$reconciler->init( new Native_Rail_Splicer() )`).
3. **`Assets.php`** — `WC()->plugin_url()` replaced with `WAR_URL` so the JS/CSS resolve to Future Woo's plugin directory.
4. **`Telemetry.php`** — deleted entirely. The prototype doesn't need Tracks.
5. **`Native_Rail_Splicer.php::insert_woo_roots` + `::mark_root_current`** — respect the `url` override on tree nodes when writing `$menu[$key][2]`. Upstream uses the slug directly (yielding `admin.php?page=<slug>`), which means the `woocommerce_admin_menu_tree` filter's `url` override is consulted for some code paths but NOT for top-level rail item hrefs. The fix is a `$url = $node['url'] ?? $slug;` swap in `insert_woo_roots`, plus a companion change in `mark_root_current` (which compares `$entry[2]` to the slug to apply the active-highlight class — now needs to compare against the same `url ?? slug` target so overridden rail-roots still get highlighted). Required so Future Woo can wire its own surfaces (the Store Dashboard at `war-store-dashboard`, etc.) into Beau's rail via the documented filter — and so the active rail item still highlights correctly. Worth raising upstream as a small consistency fix.

## Companion assets

- `assets/js/nested-nav.js` — vendored from `plugins/woocommerce/client/legacy/js/admin/admin-navigation-v2.js` (unchanged)
- `assets/css/nested-nav.css` — compiled from `plugins/woocommerce/client/legacy/css/admin-navigation-v2.scss` via `npx -p sass sass`
- `docs/vendor/nested-admin-navigation.md` — vendored architecture doc

## Re-syncing with upstream

When Beau ships new commits to his branch (or merges to trunk), re-sync this directory:

```bash
# In a temp dir, fetch latest of his branch
git clone --depth=1 --branch=feature/nested-admin-nav --single-branch https://github.com/woocommerce/woocommerce.git /tmp/wc-beau-nav

# Re-copy + re-apply the 4 adaptations above (or write a tiny sync script)
```

This is throwaway code. The real path is: Beau's PR merges, we delete `includes/vendor/nested-nav/`, and Future Woo just flips the WC feature flag at activation time.
