# Vendored: nested admin navigation

These files are vendored from [woocommerce/woocommerce#64712](https://github.com/woocommerce/woocommerce/pull/64712) — Beau Lebens' "Add nested admin navigation behind `navigation_v2` feature flag" — at branch `feature/nested-admin-nav`, commit `110ef7c6` (May 28, 2026).

**Don't edit these PHP files directly** beyond the documented Future Woo adaptations (see below). When Beau's upstream PR merges into WC, we'll delete this vendor copy and just programmatically flip the `navigation_v2` flag instead.

## Future Woo adaptations applied

Three edits separate these vendored files from Beau's upstream:

1. **Namespace** renamed `Automattic\WooCommerce\Internal\Admin\Navigation` → `FutureWoo\Vendor\NestedNav` to avoid collision once upstream merges.
2. **`Bootstrap.php`** — feature-flag check removed (Future Woo = always-on), `wc_get_container()` calls replaced with direct `new` instantiation (no DI container outside WC), feature definition registration removed (no UI toggle).
3. **`Assets.php`** — `WC()->plugin_url()` replaced with `WAR_URL` so the JS/CSS resolve to Future Woo's plugin directory.
4. **`Telemetry.php`** — deleted entirely. The prototype doesn't need Tracks.

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
