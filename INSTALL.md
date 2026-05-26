# Install Future Woo locally

> Get the Future Woo prototype running on your machine in ~10 minutes. Pick the path that matches your setup.

This document is **tool-agnostic** — you can read it yourself, or hand it to any AI tool (Claude Code, Codex, Cursor, ChatGPT, Aider) and ask it to walk you through.

## Pick a path

| Path | Best for | OS |
|---|---|---|
| [Studio](#path-1-studio-macos) | Automatticians on Mac, the polished GUI experience | macOS only |
| [wp-now](#path-2-wp-now-any-os) | Anyone with Node installed, fast throwaway tests | Mac / Linux / Windows |

Don't have either? Install Studio if you're on Mac at Automattic ([download](https://developer.wordpress.com/studio/)). Otherwise wp-now is one `npx` call away — see below.

## Before you start

You'll need:

- **Git** (or a way to download a zip from GitHub)
- **Node.js 22 LTS** (Node 26 is too new — wp-scripts and some wp-now versions trip on it)
- **A WordPress + WooCommerce install** — either via Studio or wp-now, the next two sections walk through each

The plugin itself requires:

- WordPress **7.0+** (the plugin tracks the Modern admin color scheme by default — see [Trac #64546](https://core.trac.wordpress.org/ticket/64546))
- WooCommerce **9.0+**
- For the redesigned Order view, the [WooCommerce Legacy REST API](https://wordpress.org/plugins/woocommerce-legacy-rest-api/) plugin (the `wc/v3/orders` endpoint was removed from WC core)

---

## Path 1: Studio (macOS)

### Step 1 — Create a site

1. Open Studio.
2. **Add site** → give it any name (e.g. `future-woo`). Studio creates a fresh WP install. Confirm the WordPress version is 7.0 or newer (top of the site settings).
3. Open the site's WP admin (Studio shows the link).

### Step 2 — Install WooCommerce

1. In WP admin: **Plugins → Add New Plugin**.
2. Search for "WooCommerce". Install + Activate.
3. When WC's setup wizard opens, you can dismiss it — the State Switcher will prime demo data later.

### Step 3 — Install the Legacy REST API plugin

Required for the Order view on WooCommerce 9+:

1. **Plugins → Add New Plugin** → search "WooCommerce Legacy REST API". Install + Activate.

### Step 4 — Clone and build Future Woo

In Terminal:

```bash
# Find your Studio site path — Studio's site settings show it,
# usually under ~/Studio/<site-name>/. The plugins folder is:
cd ~/Studio/<site-name>/wp-content/plugins/

# Clone the repo
git clone https://github.com/j111q/future-woo.git
cd future-woo

# Install deps and build
npm install
npm run build
```

If you can't find the site path, Studio site settings → "Show in Finder" → look for `wp-content/plugins/`.

### Step 5 — Activate Future Woo

1. Back in WP admin: **Plugins → Installed Plugins**.
2. Find "Future Woo". Activate.
3. You're now looking at the redesigned dashboard.

### Step 6 — Pick a demo state

A purple **States** floating button sits in the bottom-right. Click it, pick **active store**. The plugin generates demo products and orders so every screen has something to look at. Switch states any time.

➡️ [Skip to "What to explore"](#what-to-explore)

---

## Path 2: wp-now (any OS)

wp-now runs WordPress in a temporary Node-based environment. It's fast (~10 seconds to a working WP install) but the site is local-only and doesn't persist unless you tell it to.

### Step 1 — Clone and build

```bash
git clone https://github.com/j111q/future-woo.git
cd future-woo
npm install
npm run build
```

### Step 2 — Start wp-now from the repo

```bash
npx @wp-now/wp-now start
```

wp-now detects that the current directory contains a plugin (via the `woo-admin-revamp.php` header) and auto-activates it on the temp WP site it spins up. It opens your browser at **`http://127.0.0.1:<port>`** (note: must be `127.0.0.1`, not `localhost` — some browsers and the WP installer behave differently between the two).

> 💡 The default wp-now username is `admin` / password `password`. Use them on the WP login screen.

### Step 3 — Install WooCommerce

Same as Studio Step 2 above. Inside wp-admin: **Plugins → Add New Plugin** → search "WooCommerce" → Install + Activate.

### Step 4 — Install Legacy REST API plugin

Same as Studio Step 3 above.

### Step 5 — Confirm Future Woo is active

`Plugins → Installed Plugins` — "Future Woo" should already be active (wp-now auto-activated it when you started from the repo dir).

### Step 6 — Pick a demo state

Same as Studio Step 6 above. Purple **States** FAB in the bottom-right → **active store**.

---

## What to explore

Once the demo state is primed:

- **Dashboard (WP home, `/wp-admin/`)** — the redesigned WP Dashboard with Store Status, Store Stats, Store Management, Inbox, Setup, and What's Next widgets.
- **Orders (`/wp-admin/edit.php?post_type=shop_order`)** — DataViews-powered list view, plus the redesigned card-based Order view when you click into one.
- **Settings → General / Products / Account / Tax / Site Visibility / Advanced** — React-card settings forms instead of the legacy PHP. (Some field types fall back to the old UI — see [`docs/migration-map.md`](docs/migration-map.md).)
- **Settings → Shipping** — a custom zones + pickup + operations UI.
- **Admin bar → Store menu** (top bar dropdown) — Orders, Products, Inbox (side drawer), Store Setup progress.
- **Purple States FAB** — switch between *new store*, *being set up*, *active store* to see how each screen reacts.

## Troubleshooting

- **The build fails on `npm install` or `npm run build`** — check `node --version`. Must be Node 22 LTS. If you have Node 26, downgrade (`nvm install 22 && nvm use 22`).
- **Studio: WP version is older than 7.0** — Studio uses the latest stable; check **Site Settings → WordPress version** and update if needed.
- **wp-now: `localhost` doesn't load anything** — use `127.0.0.1` instead. They're not equivalent for wp-now.
- **The plugin shows but the dashboard looks like default WP** — check that Future Woo is active (Plugins → Installed Plugins) and your WC version is 9.0+.
- **Clicking States deletes all my "real" data** — yes, that's the design. The State Switcher is destructive by design (creates / deletes demo products and orders to match the chosen state). Don't run on a real store. The README's Disclaimer says it plainly. ⚠️
- **Order view shows the old WC form, not the redesigned one** — install the [WooCommerce Legacy REST API](https://wordpress.org/plugins/woocommerce-legacy-rest-api/) plugin (Step 3 in either path).

## Uninstall

In WP admin: **Plugins → Installed Plugins** → deactivate "Future Woo" → Delete. The plugin cleans up its options on uninstall, but **demo products and orders it created remain** — delete those manually in **Products** and **Orders** if you want a clean slate.

For wp-now: just stop the `npx @wp-now/wp-now start` process; the WP site is ephemeral.

## Going further

- **Add a new designed screen?** Read [`docs/design-principles.md`](docs/design-principles.md) first, then [`SKILL.md`](SKILL.md) at the repo root briefs Claude Code on the architecture and how to contribute.
- **Found an issue?** Open one on [j111q/future-woo](https://github.com/j111q/future-woo/issues) (this fork) or upstream at [poligilad-auto/woo-admin-revamp](https://github.com/poligilad-auto/woo-admin-revamp/issues).
