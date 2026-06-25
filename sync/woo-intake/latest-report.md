# Future Woo intake report

Generated: 2026-06-25
Source: woocommerce/woocommerce
Auto-merge gate: merge

## What the bot checked

- Recent merged Woo PRs from the last 7 days.
- Design-facing labels, paths, keywords, tracked people, and explicitly tracked PRs.
- Future Woo feature flags that should be forced on for the prototype.

## Gate checks

- pass: Intake tests
- pass: Build
- pass: PHP syntax

## Feature flags Future Woo will force-enable

- Products table: DataViews: product_list_dataviews, products_table_dataviews
  Designer review path: Products > All Products
- Nested admin navigation: navigation_v2
  Designer review path: WooCommerce admin rail

## Woo candidates

### #64712 Add nested admin navigation behind navigation_v2 feature flag
https://github.com/woocommerce/woocommerce/pull/64712

Score: 9
Author: beaulebens
Why it matched: keyword: feature flag; keyword: experiment; keyword: navigation; tracked PR: Nested admin navigation
Touched areas:
- .gitignore
- docs/best-practices/nested-admin-navigation.md
- packages/js/experimental-products-app/src/product-edit/utils.ts
- plugins/woocommerce/changelog/dev-native-rail-rendering
- plugins/woocommerce/changelog/feat-nested-admin-navigation
- plugins/woocommerce/client/legacy/css/admin-navigation-v2.scss
- plugins/woocommerce/client/legacy/js/admin/admin-navigation-v2.js
- plugins/woocommerce/includes/class-woocommerce.php

### #65893 [Backport to release/10.9] Rename @woocommerce/settings-ui-sdk to @woocommerce/settings-ui
https://github.com/woocommerce/woocommerce/pull/65893

Score: 8
Author: woocommercebot
Why it matched: path: plugins/woocommerce/client/admin/client/settings; path: plugins/woocommerce/includes/admin; keyword: settings-ui; keyword: settings ui; keyword: feature flag
Touched areas:
- docs/extensions/settings-and-config/registering-settings-ui-components.md
- docs/extensions/settings-and-config/settings-ui.md
- packages/js/dependency-extraction-webpack-plugin/assets/packages.js
- packages/js/dependency-extraction-webpack-plugin/changelog/update-rename-settings-ui-entry
- packages/js/settings-ui-sdk/changelog/add-settings-ui-sdk
- packages/js/settings-ui-sdk/changelog/tweak-settings-ui-card-design
- packages/js/settings-ui/README.md
- packages/js/settings-ui/build.mjs

## Patch adapters

No patch adapters matched this run.

## Designer review paths

- Products > All Products
- WooCommerce admin rail

## How to read this

- If the gate says `merge`, the bot is allowed to merge this PR after it creates it.
- If the gate says `hold`, the bot leaves a draft PR and this report is the handoff.
- A candidate here is not a promise that the patch applied. It is a designer-relevant Woo change the bot noticed and tried to keep visible.
