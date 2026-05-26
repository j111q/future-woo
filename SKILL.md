---
name: future-woo
description: Use this skill when adding a new designed screen, modernizing an existing one, or polishing the Future Woo WordPress plugin. The plugin is a designer's vision of where WooCommerce admin could go — install it on any WP store and see a redesigned dashboard, order view, settings, and admin bar. Read `docs/design-principles.md` first for the durable rules, then `docs/migration-map.md` for the WC Settings field-type mapping. Triggers: "add a new screen to Future Woo", "redesign the products page", "modernize the marketing tab", "tweak the dashboard widgets", "what's the right way to add X to woo-admin-revamp".
---

# Future Woo — contribution skill

You're being asked to add to or modify the Future Woo plugin (this repo, `woo-admin-revamp`). This is a designer-led prototype, not a production plugin. It demonstrates the future of WooCommerce admin holistically — anyone can install it on a basic WordPress + WooCommerce store and see a coherent redesigned experience.

## Read first

1. **`docs/design-principles.md`** — durable rules: Modern admin blue (not Woo purple), system fonts, 8 px grid, sentence case, no glassmorphism, component package priority. Don't skip this.
2. **`docs/migration-map.md`** — the WC Settings field-type → React component mapping. Read if you're touching anything in `src/settings/`.
3. **`README.md`** — vision, install instructions, what surfaces are covered.
4. **`woo-admin-revamp.php`** — the plugin entry. Skim to see how surfaces are registered.

## Architecture cheat sheet

- **PHP layer** (`includes/`, 28 classes, ~7 K LOC): hooks into WP/WC, registers admin pages, handles AJAX, runs the State Switcher backend, creates/deletes demo data.
- **React/JS layer** (`src/`, `client/`, `assets/js/`): self-contained bundles per surface. Order view is React + DataViews. Settings uses `@wordpress/components` and `@wordpress/ui`. Built with `@wordpress/scripts`.
- **State Switcher** (`includes/class-unified-state-switcher.php` + `assets/js/unified-state-switcher.js`): the floating "States" button. Toggles between *new store*, *being set up*, *active store*. On switch, it fires AJAX → backend deletes existing demo data, creates new demo data for the chosen state, reloads.

## Surfaces this plugin replaces or adds

| Surface | Files |
|---|---|
| WP Dashboard widgets | `includes/class-store-status-widget.php`, `class-store-stats-widget.php`, `class-store-management-widget.php`, `class-store-inbox-widget.php`, `class-store-setup-widget.php`, `class-whats-next-widget.php` |
| Store Dashboard (alt landing) | `includes/class-store-dashboard.php` |
| Order edit | `includes/class-order-page.php` + `src/order-view/` |
| Orders list | `includes/class-orders-list-page.php` + `client/dataviews-tables/` |
| Settings tabs (General, Products, Account, Tax, Site Visibility, Advanced) | `includes/class-modern-settings-*.php` + `src/settings/` |
| Shipping setup | `includes/class-shipping-setup-page.php` + `assets/css/shipping-setup.css` |
| Admin bar Store menu | `includes/class-store-admin-bar-menu.php` |
| State Switcher FAB | `includes/class-unified-state-switcher.php` + `assets/js/unified-state-switcher.js` |

## How to add a new designed screen

1. **Decide where it lives.** A new admin submenu page? An override of an existing WC page? A new dashboard widget?
2. **Create a PHP class in `includes/`.** Follow the naming `class-<surface>-page.php` or `class-<surface>-widget.php`. Hook in via the plugin entry point (`woo-admin-revamp.php`).
3. **If React:** add an entry in `src/<surface>/index.js`, update `package.json` build script to emit it, and enqueue the compiled bundle conditionally (only on the page that needs it).
4. **Style it** per `docs/design-principles.md`. Don't hardcode admin-blue literals — use `var(--wp-admin-theme-color, #3858e9)`. Use `@wordpress/ui` components first, falling back as documented.
5. **Wire it into the State Switcher** if the screen has demo data. The pattern: read `get_option('war_global_state')`, render different content per state. Optionally add per-screen toggles in your class if the screen has its own iteration variants.
6. **Update the README's "What it demonstrates" list** so anyone scanning the repo knows the surface exists.

## How to redesign an existing surface

1. Find the surface in the table above. Read the PHP class + any associated React entry.
2. Branch off `main`. Smallest sane diff. One surface per branch.
3. Don't hide UI with `display: none !important` unless you're prototyping. If the change should ship to production Woo, use conditional rendering / `remove_action` / `remove_filter` — see `docs/design-principles.md` § "This is a prototype" for the chrome-hiding rule.
4. Run `npm run build` after touching anything in `src/` or `client/`.
5. Test against all three demo states via the State Switcher.

## Build & test

```bash
npm install                       # install pinned @wordpress/* deps
npm run build                     # build src/settings/index.js → assets/js/settings/
npm run start                     # watch mode
npm run lint:js                   # lint src/
```

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

## When you finish

- Commit per change, conventional message.
- Update `README.md` if you added a new surface or capability.
- If you discovered a missing `@wordpress/ui` component, add a row to `docs/migration-map.md` so it's tracked for upstream.
