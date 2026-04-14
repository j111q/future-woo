# WooCommerce Settings → CIAB Design System Migration Map

This document audits every WooCommerce field type used in the core settings
tabs, maps each to its correct component under the CIAB design skill priority
(`@wordpress/ui` > `@automattic/design-system` > `@wordpress/components`),
and flags migration opportunities for upstream WooCommerce Core PRs.

Generated as part of the `general-settings` branch prototype.
Reference: Ahmed EL AZZABI's technical exploration, Jan 9/30 2026.

---

## Design Skill Priority

```
1. @wordpress/ui           ← always prefer (Gutenberg long-term target)
2. @automattic/design-system  ← second choice (not yet in Jetpack monorepo)
3. @wordpress/components   ← fallback only
```

---

## Field Type → Component Mapping

### ✅ Fully supported — renders in new React UI

| WC Field Type | Component | Package | Notes |
|---|---|---|---|
| `text` | `Input` | `@wordpress/ui` | Preferred over `TextControl` |
| `number` | `Input` (type="number") | `@wordpress/ui` | Supports min/max/step via custom_attributes |
| `email` | `Input` (type="email") | `@wordpress/ui` | |
| `url` | `Input` (type="url") | `@wordpress/ui` | |
| `tel` | `Input` (type="tel") | `@wordpress/ui` | |
| `password` | `Input` (type="password") | `@wordpress/ui` | |
| `color` | `Input` (type="color") | `@wordpress/ui` | Visually minimal; design may want `ColorPicker` (@wordpress/components) for picker UX |
| `textarea` | `Textarea` | `@wordpress/ui` | Preferred over `TextareaControl` |
| `select` | `Select.Root/Trigger/Popup/Item` | `@wordpress/ui` | Preferred over `SelectControl` |
| `single_select_country` | `Select` (with country list) | `@wordpress/ui` | Country data from WC API `options` field |
| `title` | `Fieldset.Root` + `Fieldset.Legend` + `Fieldset.Description` | `@wordpress/ui` | Section heading / structural |
| `sectionend` | _(structural, no render)_ | — | Marks end of a section group |

### ⚠️ Supported with migration target — uses @wordpress/components fallback

| WC Field Type | Current Component | Package | Upstream Migration Opportunity |
|---|---|---|---|
| `checkbox` | `CheckboxControl` | `@wordpress/components` | ⚠️ No checkbox in `@wordpress/ui` v0.8.0. Add one and migrate. |
| `checkboxgroup` | `CheckboxControl` × n + React state for `show_if_checked` | `@wordpress/components` | ⚠️ Same as checkbox. Also requires conditional visibility logic. |
| `multi_select_countries` | `FormTokenField` | `@wordpress/components` | ⚠️ No token/multi-select in `@wordpress/ui` v0.8.0. Candidate for new `@wordpress/ui` component. |
| `radio` | `RadioControl` | `@wordpress/components` | ⚠️ No radio group in `@wordpress/ui` v0.8.0. Migration opportunity. |
| `multiselect` | `FormTokenField` or custom | `@wordpress/components` | ⚠️ Same as multi_select_countries. |

### 🔴 Unsupported — triggers automatic fallback to legacy PHP page

| WC Field Type | Reason | Path Forward |
|---|---|---|
| `image_width` | Renders 3 inputs (min/max/crop) in a single row — no DataForm equivalent | Implement as a custom DataForm field extension. Design input needed (see below). |
| `single_select_page` | Page-ID dropdown backed by WP query — not a static options list | Implement with async `ComboboxControl` (@wordpress/components) or new `@wordpress/ui` async select |
| `single_select_page_with_search` | Same as above with search | Same path |
| `relative_date_selector` | Composite: number input + unit select | Implement as a custom composite component |
| `slotfill_placeholder` | PHP SlotFill bridge — content provided by other JS apps | Keep as SlotFill; React app should pass through, not replace |
| _(custom plugin types)_ | Plugin author injects arbitrary PHP HTML | Opt-out filter: `woocommerce_modern_settings_disable_{tab}`. Encourage devs to register custom field types via `cdw.modernSettings.registerFieldType` |

---

## Component Overlap Map (upstream WC Core migration targets)

These WC Core files import `@wordpress/components` for a component that has a
preferred `@wordpress/ui` equivalent. Each is a candidate for a WC Core PR.

| File | Current import | Should use | Priority |
|---|---|---|---|
| `woocommerce/packages/js/components/src/…` | `Button` from `@wordpress/components` | `Button` from `@wordpress/ui` | High |
| `woocommerce/packages/js/components/src/…` | `TabPanel` from `@wordpress/components` | `Tabs` namespace from `@wordpress/ui` | High |
| `woocommerce/packages/js/components/src/…` | `Tooltip` from `@wordpress/components` | `Tooltip` namespace from `@wordpress/ui` | High |
| `woocommerce/packages/js/components/src/…` | `SelectControl` from `@wordpress/components` | `Select` namespace from `@wordpress/ui` | High |
| `woocommerce/packages/js/components/src/…` | `TextControl` from `@wordpress/components` | `Input` from `@wordpress/ui` | High |
| `woocommerce/packages/js/components/src/…` | `TextareaControl` from `@wordpress/components` | `Textarea` from `@wordpress/ui` | Medium |
| `woocommerce/packages/js/components/src/…` | `Notice` from `@wordpress/components` | `Notice` namespace from `@wordpress/ui` | Medium |
| `woocommerce/packages/js/components/src/…` | `Icon` from `@wordpress/components` | `Icon` from `@wordpress/ui` | Low |
| `woocommerce/packages/js/components/src/…` | `VisuallyHidden` from `@wordpress/components` | `VisuallyHidden` from `@wordpress/ui` | Low |

> **Note:** Specific file paths should be filled in after running a grep of
> `woocommerce/packages/js` for each import. See the "How to extend this audit"
> section below.

---

## Reusable Composite Components

These patterns appear in multiple settings tabs and are good candidates for
shared DataForm custom field extensions, benefitting both Core and plugins.

### 1. Country selector (single)
Used in: General (Store Address), potentially Shipping
Current: `single_select_country` → `Select` (@wordpress/ui) with flat country list
Proposal: Shared `<CountrySelect>` component with search + flag support
Design input needed: Should this use a combobox with search? Flag icons?

### 2. Country multi-selector
Used in: General (General Options — selling/shipping location exclusions)
Current: `multi_select_countries` → `FormTokenField` (@wordpress/components)
Proposal: Shared `<CountryTokenField>` with country name autocomplete
Design input needed: Token chips? Flag icons on chips?

### 3. Checkbox group with conditional child
Used in: General (Taxes & Coupons — coupons + sequential discounts)
Used in: Accounts & Privacy, Emails tabs
Pattern: parent checkbox controls visibility of one or more child checkboxes
Proposal: `<ConditionalCheckboxGroup>` DataForm custom field
Design input needed: Indentation level for child checkboxes? Transition animation?

### 4. Three-part number composite (image_width)
Used in: Products tab
Current: Unsupported — triggers legacy fallback
Pattern: min-width input + max-width input + crop checkbox
Proposal: `<ImageSizeField>` DataForm custom field
Design input needed: Inline row layout? How to handle the crop toggle?

### 5. Direct bank transfer table
Used in: Payments (BACS) tab
Current: PHP table
Noted by @timcrepeau: same table structure appears in Subscriptions redesign
Proposal: Shared `<AccountDetailsTable>` component
Design input needed: Should this be the same component as in Subscriptions? Confirm with design.

---

## Conditional Display Patterns

These PHP-side display patterns require React state equivalents.

| PHP pattern | PHP mechanism | React equivalent |
|---|---|---|
| `show_if_checked: 'yes'` | jQuery `.closest('tr').show()` in `html-admin-settings.php` | `useState` on parent checkbox; conditional render of child |
| `show_if_checked: 'option'` | Always visible | Always render |
| `class: 'wc-enhanced-select'` | jQuery Select2 enhancement | `Select` from `@wordpress/ui` (built-in search) |
| `disabled: true` on checkbox | PHP `disabled` attribute | `disabled` prop on `CheckboxControl` |
| `css: 'min-width:50px'` | Inline PHP style | CSS class or `style` prop on Input |

---

## Fields Needing Design Input

Per Ahmed's exploration update (Jan 30, 2026), the design team (@elizaan36,
@magdarogier, @lucyneb) should review these before implementation:

1. **`image_width` (Products tab)** — Three related inputs in one row.
   Options: (a) Keep as 3 separate Input fields, (b) custom inline row layout, (c) combine into a new `ImageSize` field type.

2. **`multi_select_countries`** — Currently `FormTokenField`.
   Options: (a) Keep token-style with search, (b) split into two columns (available / selected), (c) custom combobox.

3. **`single_select_page` / `single_select_page_with_search`** — WP page picker.
   Proposal: async `ComboboxControl` with WP REST search. Does design have a preferred pattern?

4. **Table components** — `Direct bank transfer` table vs `Subscriptions` table.
   Are these the same component? Should Core ship a reusable table field type for DataForm?

---

## How to Extend This Audit

Run the following to find all `@wordpress/components` imports in WooCommerce JS
packages that have a `@wordpress/ui` equivalent:

```bash
# From the WooCommerce repo root:
grep -r "from '@wordpress/components'" packages/js \
  | grep -E "'Button|TabPanel|Tooltip|SelectControl|TextControl|TextareaControl|Notice|Icon|VisuallyHidden'" \
  | sort | uniq
```

For each hit, check the Component Overlap Map in docs/design.skill to confirm
the `@wordpress/ui` equivalent, then open a WC Core PR to migrate it.

---

## Feature Flag

The `modern-settings` feature flag is toggled via the State Switcher FAB on
the WP Dashboard (visible to admins only, for dev/QA use):

```
Option key: cdw_modern_settings
Enabled:  update_option('cdw_modern_settings', '1')
Disabled: delete_option('cdw_modern_settings')
```

The flag is also accessible via the `CDW_WC_Settings_Modern::is_enabled()` PHP
method and the `window.cdwSettingsData.modernSettings` JS boolean.
