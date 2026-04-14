# WooCommerce Admin Revamp

> ⚠️ **This is a design prototype, not a production plugin.**
> It exists to demonstrate design ideas for a modernized WooCommerce admin
> experience. It is not actively maintained, has not been security-reviewed,
> and is not safe for use on live stores.

A WordPress plugin that reimagines the WooCommerce admin as a single,
opinionated experience — replacing the default WP dashboard with a
store-focused one, redesigning the order view, adding a modern settings UI,
and unifying the admin bar navigation.

## What it demonstrates

- **Store Dashboard** — a WooCommerce-focused landing page with custom
  widgets (Store Status, Store Stats, Store Management, Store Inbox,
  Store Setup, What's Next) arranged in a responsive column layout.
- **Redesigned Order view** — a card-based React UI replacing the default
  WooCommerce order edit form, with payment, products, customer, and
  activity timeline sections.
- **Modern Settings pages** — the WooCommerce Settings tabs
  (General, Products, Account, Tax, Site Visibility, Advanced) rendered
  as React cards using the `@wordpress/components` design system instead
  of the legacy PHP forms.
- **Store admin bar menu** — a top-bar dropdown with Orders, Products,
  Inbox (side drawer), Store Setup progress, and live/coming-soon status.
- **Global state switcher** — a floating action button ("States") that
  lets you toggle the entire admin between three demo states:
  _new store_, _store being set up_, and _active store_. Switching
  creates/deletes demo products and orders and updates related settings
  so every screen reflects the chosen state consistently.

## Screenshots

<img width="1091" height="797" alt="image" src="https://github.com/user-attachments/assets/dd04a478-da97-452a-8cce-41aaf6fd281b" />


## Requirements

- WordPress 6.5+
- WooCommerce 9.0+
- For the Order view on WooCommerce 9+: the
  [WooCommerce Legacy REST API](https://wordpress.org/plugins/woocommerce-legacy-rest-api/)
  plugin, since the `wc/v3/orders` endpoint was removed from core.
- PHP 7.4+

## Installation

1. Download the latest zip from the
   [Releases page](../../releases).
2. In your WordPress admin, go to **Plugins → Add New → Upload Plugin**
   and upload the zip.
3. Activate the plugin.

## Usage

Once activated the plugin takes over immediately — you'll see the
redesigned dashboard, order view, and admin bar. Use the purple
**States** floating button in the bottom-right corner to switch
between demo states.

## Development

```bash
# Install dependencies
npm install

# Build assets
npm run build

# Watch for changes
npm run start
```

The React sources live in `src/`, built output goes to
`assets/js/`. PHP classes live in `includes/`.

## License

GPL-2.0-or-later — see [LICENSE](LICENSE). Same license as WooCommerce
and WordPress.

## Disclaimer

This plugin is a design exploration. It overrides core admin pages,
hides default UI, injects demo data, and makes destructive changes
(e.g. deleting all orders and products when switching states).
**Do not install it on a live store.**
