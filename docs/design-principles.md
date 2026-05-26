# Design Principles

The durable rules behind every screen in this plugin. Read this before adding a new designed surface, modernizing an existing one, or porting any of these patterns back into production Woo.

## TL;DR

The WooCommerce admin UI **always** uses WordPress' admin color scheme. As of [WordPress 7.0](https://make.wordpress.org/core/2026/05/14/wordpress-7-0-field-guide/) (May 2026), the default is the **Modern** scheme — primary `#3858e9`, hover `#2145e6`, active `#183ad6` ([Trac #64546](https://core.trac.wordpress.org/ticket/64546)).

**Never** use Woo purple (`#873EFF`) for buttons, tabs, links, focus rings, or any admin UI control. Woo purple is reserved for the wordmark, marketing pages, the onboarding hero, and the Marketplace banner.

---

## Color

- **Use CSS variables, not literals.** Reference the admin scheme via `var(--wp-admin-theme-color, #3858e9)` and `var(--wp-admin-theme-color-darker-10, #2145e6)`. The fallback should be Modern. This lets the plugin follow whatever scheme the merchant has selected — Modern, Fresh, Coffee, Midnight, Ocean, Sunrise, Ectoplasm, Light, Blue.
- **Neutrals** — `gray-100` through `gray-900` from `@wordpress/base-styles`. Page background is `#f6f7f7`; cards and surfaces are pure white; default text is `#1e1e1e`; secondary text is `#757575`.
- **Borders** — `1px solid #ddd` (`gray-300`) for everything: card edges, input borders, table cell rules, panel separators.
- **Semantic alerts** — flat fills, no decoration. Red `#cc1818`, green `#4ab866`, yellow `#f0b849`. Notice components pair a tinted background (`#edfaef`, `#fcf9e8`, `#fcf0f1`) with a left‑edge colored bar.
- **Brand purple** — `#873EFF` (Studio) for the wordmark and the marketing/onboarding hero gradient `linear-gradient(135deg, #873EFF, #6B2FE0)`. Legacy `#7F54B3` is still valid in older lockups. **Not for any admin control.**

## Typography

- **System font stack only.** No webfonts. `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, …`. Weight + size do the work.
- **Default UI text 13 / 1.4** (`gray-900`). Editor body 16 / 1.8. Page titles 23 / 400 — admin pages are deliberately understated. Section headings step up to 600.
- **Tabular numerics** in dashboards. Bold the number, keep the label regular and gray.

## Spacing & layout

- **8 px grid.** Tokens `grid-unit-05` (4) through `grid-unit-80` (64). Friendly aliases used in this plugin: `--gap-smallest` 4, `--gap-smaller` 8, `--gap-small` 12, `--gap` 16, `--gap-large` 24, `--gap-largest` 40.
- **Edit canvases are 660 px wide.** Detail views use `.content-narrow` (660) or `.content-default` (1080). List‑as‑page screens use `.list-flush` — full-bleed white surface, no card wrapper.
- **Sidebar is sticky** below the admin bar: `top: 32px`, `height: calc(100vh - 32px)`, `overflow-y: auto`. Non-negotiable on long pages.
- **Page gutter shrinks responsively:** 40 → 24 → 16 px between 1200 / 960 / 782 px breakpoints.

## Cards & components

- **Card** — white background, `1px solid #ddd` border, 4–8 px radius, no shadow. Card header 56–63 px tall, grid `auto 1fr auto` (title / fill / actions). Body 24 px padding. Footer divider on top, 12–16 px padding.
- **Selected option cards are outline‑only** (border + inset blue shadow on a transparent surface). The pale blue *fill* (`#eef1fd`) is reserved for tab and table‑row selection.
- **Header buttons** are either **primary** (one per header) or **secondary** (transparent fill + inset blue border). Black-text "subtle" header actions are deprecated.
- **Page header tabs** (status filters, time-range) live in the header `controls` slot. The active tab's blue underline laps onto the header's bottom border (`margin-bottom: -1px`) — leave the header border continuous; don't drop it when tabs are present.
- **Pills are `white-space: nowrap`** so long labels don't wrap at narrow columns.
- **Count indicators on card titles** use a `.title-chip` pill, not parentheses.
- **Tables in cards** wrap in `.wp-card-body.tight` (zero padding + `overflow-x: auto`) so wide tables scroll inside the card.
- **Repeat the header action pair at the form footer** on long create / edit flows so users can submit without scrolling back.

## Banners & notices

- **One color per banner role.** Grey = neutral hints, yellow = needs‑attention, red = blockers. Blue-info banners are deprecated — blue collides with selection states.
- **Empty‑state hero glyphs are neutral grey** (`#f0f0f0` bg, `#50575e` icon), not a brand-color gradient. Save Woo purple for marketing / onboarding moments.

## Motion

- **Reduced and purposeful.** `0.08s linear` fades only for the global system. Panel disclosure rotates over 0.16 s ease-in-out. Popovers fade + slide 2–4 px. No bounce, no spring physics, no parallax.
- All animation is gated behind `@media not (prefers-reduced-motion)`. Honor it.

## Iconography

WordPress and WooCommerce both use [`@wordpress/icons`](https://github.com/WordPress/gutenberg/tree/trunk/packages/icons) — a flat, single-weight, 24 px SVG icon set bundled with Gutenberg. Stroke-less; icons are filled paths in `currentColor`.

- Always 24×24, rendered in `currentColor`. Don't recolor unless you're styling a CTA.
- Icon-only buttons need an `aria-label`.
- **Don't mix icon sets.** Dashicons is allowed only inside legacy admin pages. No Lucide, Heroicons, or Feather. No emoji as icons.
- **Don't hand-draw new SVG icons.** They won't match.

## Component package priority

When building new React UI, import in this order ([source](../docs/migration-map.md)):

```
1. @wordpress/ui              ← prefer (Gutenberg long-term target)
2. @automattic/design-system  ← second choice
3. @wordpress/components      ← fallback only
```

Reach for the lowest-numbered package that has the component you need. If `@wordpress/ui` is missing the component, flag it as a candidate for upstream — see `docs/migration-map.md` for the existing inventory.

## This is a prototype — what that means

This plugin is a designer's vision of where Woo could go. It is **not** the right reference for production Woo admin code:

1. The CSS in this plugin uses runtime custom properties freely. **Production Woo admin SCSS** uses `@wordpress/base-styles` tokens at compile time (`$gap-large`, `$gray-900`, `$default-font-size`, etc.). Those are the authoritative source for shipped code.
2. Gutenberg ships a runtime `--wpds-*` token set via [`design-tokens.css`](https://github.com/WordPress/gutenberg/blob/trunk/packages/theme/src/prebuilt/css/design-tokens.css), but **it's not loaded on wp-admin pages today** (verified May 2026). Referencing `var(--wpds-…)` from Woo admin SCSS resolves to `unset`. Track [Trac #65085](https://core.trac.wordpress.org/ticket/65085) (the open proposal for `--wp-admin-*` runtime tokens) and [gutenberg#76709](https://github.com/WordPress/gutenberg/issues/76709) (unified admin header) for the future runtime path.
3. **When hiding wp-admin chrome** (`#screen-meta-links`, the admin bar, the screen-options panel): in production, hide the specific standard *children* with the visually-hidden pattern; never hide the parent. Hosts and power-user installs inject sibling buttons there more than popular-plugin samples suggest. This plugin uses `display: none !important` in places — that's prototype-tolerable but **not** what you'd ship.
4. **New self-contained JS:** prefer vanilla JS over jQuery (modifications inside existing jQuery functions can stay jQuery for consistency).

## References

- [WP 7.0 Field Guide](https://make.wordpress.org/core/2026/05/14/wordpress-7-0-field-guide/) — the release that made Modern the default admin scheme
- [Trac #64546](https://core.trac.wordpress.org/ticket/64546) — Modern as default
- [Trac #65085](https://core.trac.wordpress.org/ticket/65085) — proposal to expose admin design tokens as CSS custom properties (filed by [@jillq](https://make.wordpress.org/), April 2026)
- [gutenberg#76709](https://github.com/WordPress/gutenberg/issues/76709) — unified admin header discussion
- [`@wordpress/base-styles`](https://github.com/WordPress/gutenberg/tree/trunk/packages/base-styles) — SCSS source-of-truth for production
- [Gutenberg Storybook](https://wordpress.github.io/gutenberg/) — component reference
- `docs/migration-map.md` — WC Settings field-type → React component mapping in this plugin
