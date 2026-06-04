---
name: future-woo
description: Use this skill when adding a new designed screen, modernizing an existing one, or polishing the Future Woo WordPress plugin. The plugin is a designer's vision of where WooCommerce admin could go — install it on any WP store and see a redesigned dashboard, order view, settings, and admin bar. Read `docs/design-principles.md` first for the durable rules, then `docs/migration-map.md` for the WC Settings field-type mapping. Triggers: "add a new screen to Future Woo", "redesign the products page", "modernize the marketing tab", "tweak the dashboard widgets", "what's the right way to add X to future-woo".
---

# Future Woo — contribution skill

You're being asked to add to or modify the Future Woo plugin (this repo, `future-woo`). This is a designer-led prototype, not a production plugin. It demonstrates the future of WooCommerce admin holistically — anyone can install it on a basic WordPress + WooCommerce store and see a coherent redesigned experience.

> Note: the plugin's main PHP file is still `woo-admin-revamp.php`, and internal symbols use the `WAR_` / `war_` prefix, for historical reasons (the repo was renamed from `woo-admin-revamp`). Don't rename them — it'd be a big refactor with translation and install-slug fallout.

## Read first

1. **`docs/design-principles.md`** — durable rules: Modern admin blue (not Woo purple), system fonts, 8 px grid, sentence case, no glassmorphism, component package priority. Don't skip this.
2. **`docs/migration-map.md`** — the WC Settings field-type → React component mapping. Read if you're touching anything in `src/settings/`.
3. **`README.md`** — vision, install instructions, what surfaces are covered.
4. **`woo-admin-revamp.php`** — the plugin entry. Skim to see how surfaces are registered.

## Architecture cheat sheet

- **PHP layer** (`includes/`, 28 classes, ~7 K LOC): hooks into WP/WC, registers admin pages, handles AJAX, runs the State Switcher backend, creates/deletes demo data.
- **React/JS layer** (`src/`, `client/`, `assets/js/`): self-contained bundles per surface. Order view is React + DataViews. Settings uses `@wordpress/components` and `@wordpress/ui`. Built with `@wordpress/scripts`.
- **Configure-prototype FAB** (`includes/class-unified-state-switcher.php` + `assets/js/unified-state-switcher.js`): the floating "Configure prototype" button (gear icon). Switches demo store-states (*new store* / *being set up* / *active store*) via AJAX → backend swaps demo data → reload. **Two-FAB gotcha:** `includes/class-dashboard-state-switcher.php` (`CDW_State_Switcher`) is legacy and is NOT rendered — only its AJAX + state-helper methods are still wired. Put any FAB UI in the *unified* switcher, never there. (Two scripts drive the FAB: the inline `<script>` in `render_fab()` and the enqueued JS — keep both in sync.)
- **Shared page header** (`includes/class-custom-header.php` + `assets/css/custom-header.css`): `WAR_Custom_Header` renders the `.war-page-header` bar on all Woo pages, gated by `is_woo_page()` — which matches `wc-*`, `woocommerce`, **and** Future Woo's own `war-*` page slugs (so the Store Dashboard gets it too). JS moves the bar into `#wpbody-content` so `position: sticky` works.
- **Nav rail** is vendored (`includes/vendor/nested-nav/`, WC PR #64712). Future Woo's customizations live in `includes/class-nav-tree-customizer.php` — the **durable FW layer that survives the vendor dir being deleted** when the PR merges upstream. Put nav tweaks there (Home → Store Dashboard remap, the "Back" relabel + styling, hiding stray menus, the Marketing sub-items Overview/Campaigns/Channels/Coupons), NOT in the vendored files. It gates on the splicer's own signals (e.g. the back link's arrow icon) so it only acts when the rail is actually spliced (inside Woo), matching the splicer's "is this a Woo page?" decision without coupling to its internals.

## Surfaces this plugin replaces or adds

| Surface | Files |
|---|---|
| Shared page header | `includes/class-custom-header.php` + `assets/css/custom-header.css` (`WAR_Custom_Header`; on Woo pages via `is_woo_page()`, incl. `war-*` slugs) |
| Nav rail (vendored) + FW tweaks | `includes/vendor/nested-nav/` (WC PR #64712) + `includes/class-nav-tree-customizer.php` (durable FW layer) + `assets/css/nav-customizations.css` |
| Store Dashboard ("Home" — rail's Home item points here) | `includes/class-store-dashboard.php` |
| WP Dashboard widgets | `includes/class-store-status-widget.php`, `class-stats-widget.php`, `class-store-management-widget.php`, `class-woo-inbox-widget.php`, `class-woo-setup-widget.php`, `class-whats-next-widget.php` |
| Order edit | `includes/class-order-page.php` + `src/order-view/` |
| Orders list | `includes/class-orders-list-page.php` + `client/dataviews-tables/` |
| Settings tabs (General, Products, Account, Tax, Site Visibility, Advanced) | `includes/class-wc-settings-modern.php` + `src/settings/` |
| Shipping setup | `includes/class-shipping-setup-admin.php` + `assets/css/shipping-setup.css` |
| Multichannel Campaigns (Marketing → Campaigns) | `includes/class-mcc-admin-page.php` (registration + enqueue) + `includes/class-mcc-rest.php` (`/mcc/v1/` routes) + `includes/class-mcc-data.php` (static demo data) + `src/campaigns/` → built to `assets/js/campaigns/`. Vendored from the standalone `multichannel-campaigns` prototype; a wc-admin React extension page, not a native FW PHP page. |
| Admin bar Store menu | `includes/class-admin-bar-menu.php` |
| Configure-prototype FAB | `includes/class-unified-state-switcher.php` + `assets/js/unified-state-switcher.js` |

## How to add a new designed screen

1. **Decide where it lives.** A new admin submenu page? An override of an existing WC page? A new dashboard widget?
2. **Create a PHP class in `includes/`.** Follow the naming `class-<surface>-page.php` or `class-<surface>-widget.php`. Hook in via the plugin entry point (`woo-admin-revamp.php`).
3. **If React:** add the source under `src/<surface>/`, add an entry object to the array in `webpack.config.js` (output to `assets/js/<surface>/`), and enqueue the compiled bundle conditionally (only on the page that needs it). See the `campaigns` entry for the pattern, including the WooCommerce dependency-extraction setup if you import `@woocommerce/*`.
4. **Style it** per `docs/design-principles.md`. Don't hardcode admin-blue literals — use `var(--wp-admin-theme-color, #3858e9)`. Use `@wordpress/ui` components first, falling back as documented.
5. **Wire it into the State Switcher** if the screen has demo data. The pattern: read `get_option('war_global_state')`, render different content per state. Optionally add per-screen toggles in your class if the screen has its own iteration variants.
6. **Update the README's "What it demonstrates" list** so anyone scanning the repo knows the surface exists.

## Vendoring upstream WC design work

When you're integrating an in-flight design project from `woocommerce/woocommerce` (or any other Woo plugin) into Future Woo — e.g. an open PR you want to preview, a branch with a new UI experiment — follow these four rules. Each one is here because skipping it caused a real bug during the WC PR #64712 ("nested admin nav") integration.

### 1. Grep for pre-existing implementations first

Before you copy a single file, search the plugin for existing implementations of the same pattern. Open `includes/` and `assets/` and grep for the most obvious terms — for a nav project, that's `nav`, `rail`, `drilldown`, `menu_order`, `parent_file`, `admin_menu`. For a settings project: `settings`, `tabs`, `fields`. For a dashboard project: `wp_dashboard_setup`, `wp_add_dashboard_widget`.

If you find an existing mechanism that does roughly what you're vendoring: surface it explicitly. **Don't layer.** Two parallel implementations of the same thing on the same page produces invisible bugs (one wins visually, the other is silently loaded and does invisible work). Either retire the existing one in the same commit, or pick a different integration approach.

Precedent: WC PR #64712 vendoring shipped on top of an undocumented `cdw_*` Woo-rail drilldown already in the plugin. The two coexisted invisibly until a toggle-off test exposed it. ~375 lines of dead code stayed live for hours.

### 2. Test in isolation before claiming success

After wiring up the vendored code, **disable it temporarily** and reload the page. If the page looks the same, the vendored code is doing nothing visible — your "success" is something else doing the work.

Concretely: comment out the bootstrap call (`new \FutureWoo\Vendor\X\Bootstrap();`), reload, screenshot. Then uncomment, reload, screenshot. Diff the screenshots. If they're identical, debug before celebrating.

This is non-negotiable for any vendored integration. The lure of "the CSS/JS file is loading, so it must be working" is strong and wrong.

### 3. DI-injected dependencies don't survive naïve `new`

WC's container instantiates classes and injects dependencies via setter methods. When you replace `wc_get_container()->get(Foo::class)` with plain `new Foo()`, you skip the setter injection. The class may load without error and only crash later when an injected property is dereferenced.

Audit signal: any class with a `final public function init( SomeDep $dep )` (or similar) is using setter injection. Replicate the wiring manually in Bootstrap:

```php
$foo = new Foo();
$foo->init( new SomeDep() );
```

Precedent: `Menu_Reconciler->init( Native_Rail_Splicer $splicer )` in PR #64712. Skipping the setter caused a fatal on plugin activation that only fired when the `admin_menu` action ran — three layers removed from the initial bootstrap.

### 4. Tree-data overrides aren't always honored at every render point

Some upstream extension points are advertised as supporting overrides (a `url` field on a tree node, a `capability` filter, etc.) but the implementation only respects the override in *some* code paths, not all. When extending an upstream system: probe the actual rendered output with `evaluate_script` (or browser DevTools) to confirm your override survived all the way to the DOM.

If a documented override doesn't work at one render point, a 1-line vendored-code edit is acceptable. Document it in `includes/vendor/<name>/README.md` as a numbered adaptation, and consider raising it upstream as a small consistency fix.

**Sub-rule: when you patch vendored code, grep the same file for every other consumer of the data path you just changed.** Vendored systems have internal invariants — multiple methods often read or compare the same global / array slot in lockstep. If you mutate that slot in one place to fix symptom A, you may silently break consumers that still expect the old shape. The cost of the grep is seconds; the cost of a second-order bug is hours.

Precedent: Beau's `woocommerce_admin_menu_tree` filter respected `url` overrides for child entries and current-page highlighting, but `insert_woo_roots()` ignored it for top-level rail items. Adaptation #5's first half changed `$menu[$key][2]` from `$slug` to `$node['url'] ?? $slug`. That fixed the href, but silently broke `mark_root_current()` two methods down — which compared `$entry[2] !== $root` (the raw slug) and stopped matching once the slot held the URL. Result: the active rail item didn't highlight on URL-overridden pages. A `grep` for `$entry[2]` after applying the first half would have surfaced `mark_root_current` immediately. Companion fix landed as part of adaptation #5.

## How to redesign an existing surface

1. Find the surface in the table above. Read the PHP class + any associated React entry.
2. Branch off `main`. Smallest sane diff. One surface per branch.
3. Don't hide UI with `display: none !important` unless you're prototyping. If the change should ship to production Woo, use conditional rendering / `remove_action` / `remove_filter` — see `docs/design-principles.md` § "This is a prototype" for the chrome-hiding rule.
4. Run `npm run build` after touching anything in `src/` or `client/`.
5. Test against all three demo states via the State Switcher.

## Build & test

```bash
npm install                       # install pinned @wordpress/* deps
npm run build                     # build all surfaces (see webpack.config.js)
npm run start                     # watch mode
npm run lint:js                   # lint src/
npm run ts:check                  # type-check the TypeScript surfaces (src/campaigns/)
```

The build is a webpack **array (multi-compiler)** config (`webpack.config.js`), one entry per
self-contained surface, so `npm run build` emits every bundle in one pass:

- `src/settings/index.js` → `assets/js/settings/settings-general.js` (default `@wordpress/scripts` config)
- `src/campaigns/index.tsx` → `assets/js/campaigns/index.js` (WooCommerce dependency-extraction
  plugin + `BUNDLED_PACKAGES` for `@wordpress/ui` and `@wordpress/dataviews`, which aren't script
  handles on this WP/Gutenberg yet — drop them from the set as the handles ship upstream)

To add another React surface, add an entry object to the array rather than changing the build
script. TypeScript surfaces transpile via Babel (no type-check at build time); run `npm run ts:check`
for types.

After PHP changes: just reload the admin page (no build step needed).

After CSS changes in `assets/css/`: also just reload.

## Common pitfalls

- **Hardcoded admin-blue literals.** Don't. Use `var(--wp-admin-theme-color, #3858e9)` so the plugin follows the merchant's scheme. WP 7.0 made Modern the default ([Trac #64546](https://core.trac.wordpress.org/ticket/64546)).
- **Using Woo purple (`#873EFF`) for any admin control.** Don't. It's brand-only — wordmark, marketing hero gradient, Marketplace banner. Use admin blue.
- **Webfont imports.** Don't. System font stack only.
- **Emoji as icons.** Don't. Use `@wordpress/icons` or label-only.
- **Hand-drawn SVG icons.** Don't. Won't match the system. If `@wordpress/icons` doesn't have it, flag it and propose adding upstream.
- **Adding new `*` versions to package.json deps.** Don't. We pin to caret ranges so the build is reproducible. Match an existing pinned version pattern.
- **Touching production-code patterns.** This is a prototype — the rules here are looser than what would ship in production Woo. If you find yourself thinking "this would never pass code review in `woocommerce/woocommerce`," that's expected. The reverse is *not* true: anything you copy from here into production needs the rules in `docs/design-principles.md` § "This is a prototype" applied.
- **Vendoring upstream without auditing first.** See the four-rule section above. The shortest version: (1) grep for pre-existing implementations, (2) toggle-test before celebrating, (3) replicate DI setter chains, (4) probe the rendered DOM to confirm overrides survived.
- **Skipping the verify step.** "I shipped it, didn't get a 500" is not verification. Open the page, screenshot it, and compare to what you expected. For React or DOM-injection work, also check `evaluate_script` output for the markers your code should produce.

## When you finish

- Commit per change, conventional message.
- Update `README.md` if you added a new surface or capability.
- If you discovered a missing `@wordpress/ui` component, add a row to `docs/migration-map.md` so it's tracked for upstream.
