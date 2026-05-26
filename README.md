# Future Woo

> A designer's vision of where WooCommerce admin could go.
> Install one plugin on any WordPress + WooCommerce store and see the future of Woo holistically — redesigned dashboard, modern settings, reimagined order view, unified admin bar, with demo data primed for three store states.

> ⚠️ **This is a design prototype, not a production plugin.**
> It exists to demonstrate design ideas for a modernized WooCommerce admin experience. It is not actively maintained, has not been security-reviewed, and is **not safe for use on live stores**.

---

## What it demonstrates

- **Store Dashboard** — a WooCommerce-focused landing page with custom widgets (Store Status, Store Stats, Store Management, Store Inbox, Store Setup, What's Next) in a responsive column layout. Replaces the legacy WP Dashboard.
- **Redesigned Order view** — a card-based React UI replacing the default WooCommerce order edit form, with payment, products, customer, and activity timeline sections. Built on DataViews.
- **Orders list** — DataViews-powered list view replacing the default WC orders table.
- **Modern Settings pages** — General, Products, Account, Tax, Site Visibility, and Advanced rendered as React cards using `@wordpress/components` and `@wordpress/ui` instead of the legacy PHP forms. Some field types still fall back to legacy PHP — see [`docs/migration-map.md`](docs/migration-map.md) for the inventory.
- **Shipping setup** — a custom zones + pickup + operations UI replacing the WC Settings → Shipping tab.
- **Store admin bar menu** — a top-bar dropdown with Orders, Products, Inbox (side drawer), Store Setup progress, and a live / coming-soon toggle.
- **Global State Switcher** — a floating action button ("States") that toggles the entire admin between three demo states: *new store*, *store being set up*, *active store*. Switching creates / deletes demo products and orders and updates related settings so every screen reflects the chosen state consistently.

## Screenshots

<img width="1091" height="797" alt="image" src="https://github.com/user-attachments/assets/dd04a478-da97-452a-8cce-41aaf6fd281b" />

## Requirements

- WordPress **7.0+** (the plugin tracks the new Modern admin color scheme by default — see [Trac #64546](https://core.trac.wordpress.org/ticket/64546))
- WooCommerce 9.0+
- For the Order view on WooCommerce 9+: the [WooCommerce Legacy REST API](https://wordpress.org/plugins/woocommerce-legacy-rest-api/) plugin, since the `wc/v3/orders` endpoint was removed from core.
- PHP 7.4+

## Installation

See **[`INSTALL.md`](INSTALL.md)** for the step-by-step walkthrough. Two supported paths: **Studio** (macOS, polished GUI) and **wp-now** (any OS, fast and ephemeral). Both take ~10 minutes.

`INSTALL.md` is tool-agnostic — you can read it yourself, or hand it to any AI tool (Claude Code, Codex, Cursor, ChatGPT) and ask it to walk you through.

## Usage

Once activated the plugin takes over immediately — you'll see the redesigned dashboard, order view, and admin bar. Use the purple **States** floating button in the bottom-right corner to switch between demo states. On switch, all demo products and orders are recreated to match.

## Development

```bash
npm install                       # install pinned @wordpress/* deps
npm run build                     # one-shot build
npm run start                     # watch mode
npm run lint:js                   # lint src/
```

The React sources live in `src/`. Compiled output goes to `assets/js/`. PHP classes live in `includes/`.

## Contributing a new designed screen

If you're a designer (or anyone) adding to Future Woo:

1. Read [`docs/design-principles.md`](docs/design-principles.md) — the durable rules behind every screen (Modern admin blue, never Woo purple for admin UI, system fonts, 8 px grid, component package priority, etc.).
2. If you're using Claude Code, the [`SKILL.md`](SKILL.md) at the repo root briefs the AI on the codebase architecture, how to add a new surface, common pitfalls, and build commands. Type `/future-woo` (or just ask Claude Code to help you add a screen) and it'll consult the skill.
3. One surface per branch. Small, reviewable diffs.

## Design language

The plugin follows the WordPress admin design system, with WooCommerce purple reserved for brand moments only. Highlights:

- **Admin UI = Modern admin blue**, never Woo purple. CSS references `var(--wp-admin-theme-color, #3858e9)` so the plugin auto-tracks whatever scheme the merchant has selected.
- **System font stack only**, no webfonts.
- **8 px grid**, sentence case everywhere, flat / no glassmorphism / no gradients in admin chrome.
- **Iconography from `@wordpress/icons`**.

Full rules in [`docs/design-principles.md`](docs/design-principles.md).

## License

GPL-2.0-or-later — see [LICENSE](LICENSE). Same license as WooCommerce and WordPress.

## Disclaimer

This plugin is a design exploration. It overrides core admin pages, hides default UI, injects demo data, and makes destructive changes (e.g. deleting all orders and products when switching states). **Do not install it on a live store.**
