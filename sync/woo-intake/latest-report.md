# Future Woo intake report

Generated: 2026-06-25
Source: woocommerce/woocommerce
Auto-merge gate: hold

## What the bot checked

- All recent Woo PR activity: all PRs matching `updated:>=2026-06-18`.
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

Score: 12
Author: beaulebens
Source search: Tracked PR: Nested admin navigation
Why it matched: path: plugins/woocommerce/src/Internal/Admin/Navigation; path: plugins/woocommerce/client/legacy/js/admin/admin-navigation-v2.js; path: plugins/woocommerce/client/legacy/css/admin-navigation-v2.scss; keyword: feature flag; keyword: experiment; keyword: navigation; tracked PR: Nested admin navigation
Touched areas:
- .gitignore
- docs/best-practices/nested-admin-navigation.md
- packages/js/experimental-products-app/src/product-edit/utils.ts
- plugins/woocommerce/changelog/dev-native-rail-rendering
- plugins/woocommerce/changelog/feat-nested-admin-navigation
- plugins/woocommerce/client/legacy/css/admin-navigation-v2.scss
- plugins/woocommerce/client/legacy/js/admin/admin-navigation-v2.js
- plugins/woocommerce/includes/class-woocommerce.php

### #65866 [Backport to release/10.9] Add Settings UI section registry
https://github.com/woocommerce/woocommerce/pull/65866

Score: 11
Author: woocommercebot
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/client/admin/client/settings; path: plugins/woocommerce/src/Admin; path: plugins/woocommerce/includes/admin; keyword: settings-ui; keyword: settings ui; keyword: feature flag; keyword: navigation
Touched areas:
- docs/extensions/settings-and-config/registering-settings-ui-components.md
- docs/extensions/settings-and-config/settings-ui-sdk.md
- packages/js/settings-ui-sdk/src/registry.ts
- packages/js/settings-ui-sdk/src/settings-ui-page.tsx
- packages/js/settings-ui-sdk/src/test/html-rendering.test.tsx
- packages/js/settings-ui-sdk/src/test/registry.test.ts
- packages/js/settings-ui/changelog/update-section-scope-semantics
- plugins/woocommerce/changelog/add-settings-ui-section-registry

### #65813 Add Settings UI section registry
https://github.com/woocommerce/woocommerce/pull/65813

Score: 11
Author: dmallory42
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/client/admin/client/settings; path: plugins/woocommerce/src/Admin; path: plugins/woocommerce/includes/admin; keyword: settings-ui; keyword: settings ui; keyword: feature flag; keyword: navigation
Touched areas:
- docs/extensions/settings-and-config/registering-settings-ui-components.md
- docs/extensions/settings-and-config/settings-ui.md
- packages/js/settings-ui/changelog/update-section-scope-semantics
- packages/js/settings-ui/src/registry.ts
- packages/js/settings-ui/src/settings-ui-page.tsx
- packages/js/settings-ui/src/test/html-rendering.test.tsx
- packages/js/settings-ui/src/test/registry.test.ts
- plugins/woocommerce/changelog/add-settings-ui-section-registry

### #65975 Add native Settings UI page provider for registered sections
https://github.com/woocommerce/woocommerce/pull/65975

Score: 10
Author: dmallory42
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/src/Admin; path: plugins/woocommerce/includes/admin; keyword: settings-ui; keyword: settings ui; keyword: feature flag; keyword: navigation
Touched areas:
- docs/extensions/settings-and-config/settings-ui.md
- plugins/woocommerce/changelog/add-settings-section-ui-page-provider
- plugins/woocommerce/includes/admin/views/html-admin-settings.php
- plugins/woocommerce/src/Admin/Settings/SettingsSection.php
- plugins/woocommerce/src/Admin/Settings/SettingsSectionUIPageProviderInterface.php
- plugins/woocommerce/src/Internal/Admin/Settings/SettingsUIRequestContext.php
- plugins/woocommerce/tests/php/src/Admin/Settings/SettingsSectionRegistryTest.php

### #65437 Clean enabled admin feature flags from config
https://github.com/woocommerce/woocommerce/pull/65437

Score: 9
Author: gigitux
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/client/admin/client/analytics; path: plugins/woocommerce/client/admin/client/shipping; path: plugins/woocommerce/client/admin/client/payments; path: plugins/woocommerce/src/Admin; path: plugins/woocommerce/includes/admin; keyword: feature flag; keyword: experiment
Touched areas:
- packages/js/internal-js-tests/src/setup-globals.js
- plugins/woocommerce/changelog/dev-clean-enabled-admin-feature-flags
- plugins/woocommerce/client/admin/client/activity-panel/index.js
- plugins/woocommerce/client/admin/client/analytics/components/report-header/report-header.tsx
- plugins/woocommerce/client/admin/client/analytics/components/report-table/style.scss
- plugins/woocommerce/client/admin/client/analytics/components/scheduled-updates-promotion-notice/index.tsx
- plugins/woocommerce/client/admin/client/analytics/components/scheduled-updates-promotion-notice/test/index.tsx
- plugins/woocommerce/client/admin/client/analytics/settings/config.js

### #65893 [Backport to release/10.9] Rename @woocommerce/settings-ui-sdk to @woocommerce/settings-ui
https://github.com/woocommerce/woocommerce/pull/65893

Score: 8
Author: woocommercebot
Source search: All recent Woo PR activity: updated:>=2026-04-15
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

### #65729 [Backport to release/10.9] Align settings UI layout and number inputs with design spec
https://github.com/woocommerce/woocommerce/pull/65729

Score: 8
Author: woocommercebot
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: settings-ui; keyword: settings ui; keyword: feature flag; keyword: experiment
Touched areas:
- packages/js/settings-ui-sdk/changelog/update-number-spin-control
- packages/js/settings-ui-sdk/package.json
- packages/js/settings-ui-sdk/src/native-fields.tsx
- packages/js/settings-ui-sdk/src/number-spin-control.tsx
- packages/js/settings-ui-sdk/src/test/native-fields.test.tsx
- plugins/woocommerce/changelog/update-settings-ui-layout-width-spacing
- plugins/woocommerce/changelog/update-settings-ui-number-spin-control-styles
- plugins/woocommerce/client/admin/client/wp-admin-scripts/settings-embed/settings-ui.scss

### #65719 Rename @woocommerce/settings-ui-sdk to @woocommerce/settings-ui
https://github.com/woocommerce/woocommerce/pull/65719

Score: 8
Author: dmallory42
Source search: All recent Woo PR activity: updated:>=2026-04-15
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

### #65715 Fix horizontal overflow of the settings UI tab bar
https://github.com/woocommerce/woocommerce/pull/65715

Score: 8
Author: mordeth
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: settings-ui; keyword: settings ui; keyword: feature flag; keyword: navigation
Touched areas:
- plugins/woocommerce/changelog/fix-settings-ui-tabs-horizontal-overflow
- plugins/woocommerce/client/admin/client/wp-admin-scripts/settings-embed/settings-ui.scss

### #65695 Align settings UI layout and number inputs with design spec
https://github.com/woocommerce/woocommerce/pull/65695

Score: 8
Author: dmallory42
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: settings-ui; keyword: settings ui; keyword: feature flag; keyword: experiment
Touched areas:
- packages/js/settings-ui-sdk/changelog/update-number-spin-control
- packages/js/settings-ui-sdk/package.json
- packages/js/settings-ui-sdk/src/native-fields.tsx
- packages/js/settings-ui-sdk/src/number-spin-control.tsx
- packages/js/settings-ui-sdk/src/test/native-fields.test.tsx
- plugins/woocommerce/changelog/update-settings-ui-layout-width-spacing
- plugins/woocommerce/changelog/update-settings-ui-number-spin-control-styles
- plugins/woocommerce/client/admin/client/wp-admin-scripts/settings-embed/settings-ui.scss

### #65910 Fix Settings UI save-and-continue navigation
https://github.com/woocommerce/woocommerce/pull/65910

Score: 7
Author: dmallory42
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: settings-ui; keyword: settings ui; keyword: navigation
Touched areas:
- packages/js/settings-ui/changelog/fix-save-and-continue-navigation
- packages/js/settings-ui/src/settings-ui-page.tsx
- packages/js/settings-ui/src/test/html-rendering.test.tsx
- plugins/woocommerce/changelog/fix-settings-ui-save-and-continue
- plugins/woocommerce/includes/admin/class-wc-admin-settings.php
- plugins/woocommerce/tests/php/includes/admin/class-wc-admin-settings-test.php

### #65587 [Backport to release/10.9] Surface settings UI fallback through wc_doing_it_wrong
https://github.com/woocommerce/woocommerce/pull/65587

Score: 7
Author: woocommercebot
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: settings-ui; keyword: settings ui; keyword: feature flag
Touched areas:
- plugins/woocommerce/changelog/fix-settings-ui-fallback-doing-it-wrong
- plugins/woocommerce/includes/admin/settings/class-wc-settings-page.php
- plugins/woocommerce/tests/php/src/Internal/Admin/Settings/SettingsUIFeatureFlagTest.php

### #65504 [Backport to release/10.9] [RSM] Add Checkout Recovery email settings behind an experimental feature flag
https://github.com/woocommerce/woocommerce/pull/65504

Score: 7
Author: woocommercebot
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/src/Admin; keyword: feature flag; keyword: experiment; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/abandoned-cart-recovery-email
- plugins/woocommerce/changelog/abandoned-cart-recovery-recommendations
- plugins/woocommerce/changelog/checkout-recovery-manual-send
- plugins/woocommerce/changelog/checkout-recovery-unsubscribe
- plugins/woocommerce/client/admin/client/abandoned-cart-recovery/abandoned-cart-recovery-recommendations-wrapper.tsx
- plugins/woocommerce/client/admin/client/abandoned-cart-recovery/abandoned-cart-recovery-recommendations.scss
- plugins/woocommerce/client/admin/client/abandoned-cart-recovery/abandoned-cart-recovery-recommendations.tsx
- plugins/woocommerce/client/admin/client/abandoned-cart-recovery/automatewoo-item.tsx

### #65499 Surface settings UI fallback through wc_doing_it_wrong
https://github.com/woocommerce/woocommerce/pull/65499

Score: 7
Author: dmallory42
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: settings-ui; keyword: settings ui; keyword: feature flag
Touched areas:
- plugins/woocommerce/changelog/fix-settings-ui-fallback-doing-it-wrong
- plugins/woocommerce/includes/admin/settings/class-wc-settings-page.php
- plugins/woocommerce/tests/php/src/Internal/Admin/Settings/SettingsUIFeatureFlagTest.php

### #65136 [RSM] Add Checkout Recovery email settings behind an experimental feature flag
https://github.com/woocommerce/woocommerce/pull/65136

Score: 7
Author: mayisha
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/src/Admin; keyword: feature flag; keyword: experiment; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/abandoned-cart-recovery-email
- plugins/woocommerce/changelog/abandoned-cart-recovery-recommendations
- plugins/woocommerce/changelog/checkout-recovery-manual-send
- plugins/woocommerce/changelog/checkout-recovery-unsubscribe
- plugins/woocommerce/client/admin/client/abandoned-cart-recovery/abandoned-cart-recovery-recommendations-wrapper.tsx
- plugins/woocommerce/client/admin/client/abandoned-cart-recovery/abandoned-cart-recovery-recommendations.scss
- plugins/woocommerce/client/admin/client/abandoned-cart-recovery/abandoned-cart-recovery-recommendations.tsx
- plugins/woocommerce/client/admin/client/abandoned-cart-recovery/automatewoo-item.tsx

### #65038 Fix incorrect heading order on admin orders page
https://github.com/woocommerce/woocommerce/pull/65038

Score: 7
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm; keyword: order edit; keyword: navigation
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-266
- plugins/woocommerce/client/legacy/css/admin.scss
- plugins/woocommerce/includes/admin/meta-boxes/class-wc-meta-box-order-data.php
- plugins/woocommerce/tests/e2e-pw/tests/order/create-order.spec.ts
- plugins/woocommerce/tests/php/includes/admin/meta-boxes/class-wc-meta-box-order-data-heading-hierarchy-test.php

### #65825 Settings UI: add subtitle and badges to the shell header
https://github.com/woocommerce/woocommerce/pull/65825

Score: 6
Author: mordeth
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: settings-ui; keyword: settings ui; keyword: navigation
Touched areas:
- docs/extensions/settings-and-config/settings-ui.md
- packages/js/settings-ui/changelog/add-shell-header-fields
- packages/js/settings-ui/src/index.ts
- packages/js/settings-ui/src/settings-ui-page.tsx
- packages/js/settings-ui/src/test/header-fields.test.tsx
- packages/js/settings-ui/src/types.ts
- plugins/woocommerce/changelog/add-settings-ui-shell-header-fields
- plugins/woocommerce/client/admin/client/wp-admin-scripts/settings-embed/settings-ui.scss

### #65802 Explore DataForm internals for Settings UI
https://github.com/woocommerce/woocommerce/pull/65802

Score: 6
Author: dmallory42
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: dataviews; keyword: settings-ui; keyword: settings ui
Touched areas:
- .syncpackrc
- packages/js/settings-ui-sdk/changelog/tweak-settings-ui-dataform-internals
- packages/js/settings-ui-sdk/package.json
- packages/js/settings-ui-sdk/src/dataform.tsx
- packages/js/settings-ui-sdk/src/settings-ui-page.tsx
- packages/js/settings-ui-sdk/src/test/html-rendering.test.tsx
- plugins/woocommerce/changelog/tweak-settings-ui-dataform-internals
- plugins/woocommerce/client/admin/client/wp-admin-scripts/settings-embed/settings-ui.scss

### #65696 Render settings UI number fields with design-spec spin controls
https://github.com/woocommerce/woocommerce/pull/65696

Score: 6
Author: dmallory42
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: settings-ui; keyword: settings ui; keyword: feature flag
Touched areas:
- packages/js/settings-ui-sdk/changelog/update-number-control-spin-buttons
- packages/js/settings-ui-sdk/src/native-fields.tsx
- packages/js/settings-ui-sdk/src/test/native-fields.test.tsx

### #65577 Keep Settings UI navigation guard until form exists
https://github.com/woocommerce/woocommerce/pull/65577

Score: 6
Author: dmallory42
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: settings-ui; keyword: settings ui; keyword: navigation
Touched areas:
- packages/js/settings-ui/changelog/fix-form-submit-navigation-guard
- packages/js/settings-ui/src/settings-ui-page.tsx

### #65575 [Backport to release/10.9] Add settings UI flag-off smoke test
https://github.com/woocommerce/woocommerce/pull/65575

Score: 6
Author: woocommercebot
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: settings-ui; keyword: settings ui; keyword: feature flag
Touched areas:
- plugins/woocommerce/changelog/add-settings-ui-flag-off-smoke
- plugins/woocommerce/tests/e2e-pw/tests/settings/settings-ui-feature-flag.spec.ts

### #65567 [Backport to release/10.9] Align settings UI SDK with settings card design
https://github.com/woocommerce/woocommerce/pull/65567

Score: 6
Author: woocommercebot
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: settings-ui; keyword: settings ui; keyword: feature flag
Touched areas:
- packages/js/settings-ui-sdk/changelog/tweak-settings-ui-card-design
- packages/js/settings-ui-sdk/src/settings-ui-page.tsx
- packages/js/settings-ui-sdk/src/test/html-rendering.test.tsx
- plugins/woocommerce/changelog/tweak-settings-ui-card-design
- plugins/woocommerce/client/admin/client/wp-admin-scripts/settings-embed/settings-ui.scss

### #65557 Align settings UI SDK with settings card design
https://github.com/woocommerce/woocommerce/pull/65557

Score: 6
Author: dmallory42
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: settings-ui; keyword: settings ui; keyword: feature flag
Touched areas:
- packages/js/settings-ui-sdk/changelog/tweak-settings-ui-card-design
- packages/js/settings-ui-sdk/src/settings-ui-page.tsx
- packages/js/settings-ui-sdk/src/test/html-rendering.test.tsx
- plugins/woocommerce/changelog/tweak-settings-ui-card-design
- plugins/woocommerce/client/admin/client/wp-admin-scripts/settings-embed/settings-ui.scss

### #65490 Add settings UI flag-off smoke test
https://github.com/woocommerce/woocommerce/pull/65490

Score: 6
Author: dmallory42
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: settings-ui; keyword: settings ui; keyword: feature flag
Touched areas:
- plugins/woocommerce/changelog/add-settings-ui-flag-off-smoke
- plugins/woocommerce/tests/e2e-pw/tests/settings/settings-ui-feature-flag.spec.ts

### #65241 Fix variation table edit links
https://github.com/woocommerce/woocommerce/pull/65241

Score: 6
Author: gigitux
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: products table; keyword: dataviews; keyword: experiment
Touched areas:
- packages/js/experimental-products-app/changelog/fix-variation-parent-edit-link
- packages/js/experimental-products-app/src/dataviews-actions/actions.test.tsx
- packages/js/experimental-products-app/src/dataviews-actions/actions.tsx
- packages/js/experimental-products-app/src/product-list/index.tsx
- packages/js/experimental-products-app/src/product-list/utils.test.ts
- packages/js/experimental-products-app/src/product-list/utils.ts

### #65174 Fix experimental products table polish
https://github.com/woocommerce/woocommerce/pull/65174

Score: 6
Author: gigitux
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: products table; keyword: dataviews; keyword: experiment
Touched areas:
- packages/js/experimental-products-app/changelog/fix-products-table-polish
- packages/js/experimental-products-app/src/fields/price/field.tsx
- packages/js/experimental-products-app/src/fields/stock/field.tsx
- packages/js/experimental-products-app/src/product-list/index.tsx

### #65165 [RSM] Add customer unsubscribe to the Checkout Recovery email
https://github.com/woocommerce/woocommerce/pull/65165

Score: 6
Author: mayisha
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: feature flag; keyword: rsm; keyword: order edit
Touched areas:
- plugins/woocommerce/changelog/checkout-recovery-unsubscribe
- plugins/woocommerce/includes/class-wc-install.php
- plugins/woocommerce/includes/class-woocommerce.php
- plugins/woocommerce/includes/emails/class-wc-email-customer-abandoned-cart-recovery.php
- plugins/woocommerce/src/Internal/Email/Unsubscribes/Endpoint.php
- plugins/woocommerce/src/Internal/Email/Unsubscribes/Storage.php
- plugins/woocommerce/src/Internal/EmailEditor/PersonalizationTagManager.php
- plugins/woocommerce/src/Internal/EmailEditor/PersonalizationTags/UnsubscribeTagsProvider.php

### #65155 Allow multiple stock status filters
https://github.com/woocommerce/woocommerce/pull/65155

Score: 6
Author: gigitux
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: feature flag; keyword: experiment; keyword: rsm
Touched areas:
- packages/js/data/changelog/fix-rsm-3550-stock-status-query-type
- packages/js/data/src/products/types.ts
- packages/js/experimental-products-app/changelog/fix-rsm-3550-stock-multiselect
- packages/js/experimental-products-app/src/fields/stock/field.tsx
- packages/js/experimental-products-app/src/product-list/query.test.ts
- packages/js/experimental-products-app/src/product-list/query.ts
- plugins/woocommerce/changelog/fix-rsm-3550-stock-status-filter
- plugins/woocommerce/src/Internal/RestApi/Routes/V4/Products/Controller.php

### #65152 [RSM] Shopper Collections: add wishlists feature flag and My Account support
https://github.com/woocommerce/woocommerce/pull/65152

Score: 6
Author: jorgeatorres
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: feature flag; keyword: experiment; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/add-shopper-collections-wishlists-base
- plugins/woocommerce/includes/class-woocommerce.php
- plugins/woocommerce/src/Blocks/BlockTypesController.php
- plugins/woocommerce/src/Internal/Features/FeaturesController.php
- plugins/woocommerce/src/Internal/ShopperLists/ShopperList.php
- plugins/woocommerce/src/Internal/ShopperLists/ShopperListsController.php
- plugins/woocommerce/src/StoreApi/RoutesController.php
- plugins/woocommerce/tests/php/src/Blocks/StoreApi/Schemas/ShopperListSchemaTest.php

### #65137 [VA] PHP groundwork: tab rename + form-POST preservation
https://github.com/woocommerce/woocommerce/pull/65137

Score: 6
Author: jamesckemp
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/src/Admin; path: plugins/woocommerce/includes/admin; keyword: feature flag; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/rsm-3467-variations-tab-php-groundwork
- plugins/woocommerce/client/legacy/js/admin/meta-boxes-product.js
- plugins/woocommerce/includes/admin/meta-boxes/class-wc-meta-box-product-data.php
- plugins/woocommerce/includes/admin/meta-boxes/views/html-product-attribute-inner.php
- plugins/woocommerce/includes/admin/meta-boxes/views/html-product-data-attributes.php
- plugins/woocommerce/phpstan-baseline.neon
- plugins/woocommerce/src/Admin/Features/ProductVariationsClassicRedesign/Init.php
- plugins/woocommerce/tests/php/src/Admin/Features/ProductVariationsClassicRedesign/InitTest.php

### #65131 Floating header: Tracks instrumentation for Screen Options and Help icon clicks
https://github.com/woocommerce/woocommerce/pull/65131

Score: 6
Author: j111q
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: rsm; keyword: floating header; author: j111q
Touched areas:
- plugins/woocommerce/changelog/sprinkle-floating-header-meta-icon-tracks
- plugins/woocommerce/client/admin/client/header/embed.tsx

### #65130 Add experimental dashboard widgets framework with a Store Activity widget
https://github.com/woocommerce/woocommerce/pull/65130

Score: 6
Author: retrofox
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: dataviews; keyword: feature flag; keyword: experiment
Touched areas:
- .syncpackrc
- plugins/woocommerce/.gitignore
- plugins/woocommerce/changelog/add-dashboard-widgets-scaffold
- plugins/woocommerce/package.json
- plugins/woocommerce/packages/README.md
- plugins/woocommerce/packages/core-dashboard-init/README.md
- plugins/woocommerce/packages/core-dashboard-init/package.json
- plugins/woocommerce/packages/core-dashboard-init/src/data/constants.ts

### #65114 Polish the variations DataViews table and unify the stock pill
https://github.com/woocommerce/woocommerce/pull/65114

Score: 6
Author: poligilad-auto
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: dataviews; keyword: feature flag; keyword: experiment
Touched areas:
- packages/js/experimental-products-app/changelog/variations-dataviews-polish
- packages/js/experimental-products-app/src/fields/stock/field.test.tsx
- packages/js/experimental-products-app/src/fields/stock/field.tsx
- packages/js/experimental-products-app/src/product-edit/index.tsx
- packages/js/experimental-products-app/src/product-edit/utils.test.ts
- packages/js/experimental-products-app/src/variation-view/constants.ts
- packages/js/experimental-products-app/src/variation-view/fields.tsx
- packages/js/experimental-products-app/src/variation-view/index.tsx

### #65788 Migrate customer stock notification screens to the order actions "more actions" menu
https://github.com/woocommerce/woocommerce/pull/65788

Score: 5
Author: j111q
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: stock notification; author: j111q
Touched areas:
- plugins/woocommerce/changelog/update-stock-notification-actions-more-menu
- plugins/woocommerce/client/legacy/css/admin.scss
- plugins/woocommerce/client/legacy/js/admin/meta-boxes-order.js
- plugins/woocommerce/client/legacy/js/admin/order-actions-menu.js
- plugins/woocommerce/client/legacy/js/admin/wc-customer-stock-notifications.js
- plugins/woocommerce/includes/admin/class-wc-admin-assets.php
- plugins/woocommerce/src/Internal/StockNotifications/Admin/AdminManager.php
- plugins/woocommerce/src/Internal/StockNotifications/Admin/Templates/html-admin-notification-create.php

### #65636 Add deprecated WC Admin feature flag shims
https://github.com/woocommerce/woocommerce/pull/65636

Score: 5
Author: gigitux
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/src/Admin; keyword: settings-ui; keyword: feature flag
Touched areas:
- plugins/woocommerce/changelog/dev-deflag-wc-admin-feature-compatibility-shims
- plugins/woocommerce/client/admin/client/typings/global.d.ts
- plugins/woocommerce/client/admin/client/utils/features/features.ts
- plugins/woocommerce/client/admin/client/utils/features/retired-feature-flags.ts
- plugins/woocommerce/client/admin/client/utils/test/admin-settings.js
- plugins/woocommerce/client/admin/package.json
- plugins/woocommerce/src/Admin/Features/Features.php
- plugins/woocommerce/src/Blocks/BlockPatterns.php

### #65573 Remove Point of Sale feature flag from WooCommerce
https://github.com/woocommerce/woocommerce/pull/65573

Score: 5
Author: samiuelson
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: feature flag; keyword: experiment
Touched areas:
- plugins/woocommerce/changelog/woomob-2683-remove-pos-feature-flag
- plugins/woocommerce/includes/admin/class-wc-admin-settings.php
- plugins/woocommerce/includes/admin/meta-boxes/class-wc-meta-box-product-data.php
- plugins/woocommerce/includes/admin/meta-boxes/views/html-product-data-advanced.php
- plugins/woocommerce/includes/admin/settings/class-wc-settings-point-of-sale.php
- plugins/woocommerce/includes/class-wc-emails.php
- plugins/woocommerce/includes/class-wc-install.php
- plugins/woocommerce/includes/wc-update-functions.php

### #65140 [RSM] Add recommendation on Checkout Recovery settings
https://github.com/woocommerce/woocommerce/pull/65140

Score: 5
Author: mayisha
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/src/Admin; keyword: feature flag; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/abandoned-cart-recovery-recommendations
- plugins/woocommerce/changelog/checkout-recovery-manual-send
- plugins/woocommerce/changelog/checkout-recovery-unsubscribe
- plugins/woocommerce/client/admin/client/abandoned-cart-recovery/abandoned-cart-recovery-recommendations-wrapper.tsx
- plugins/woocommerce/client/admin/client/abandoned-cart-recovery/abandoned-cart-recovery-recommendations.scss
- plugins/woocommerce/client/admin/client/abandoned-cart-recovery/abandoned-cart-recovery-recommendations.tsx
- plugins/woocommerce/client/admin/client/abandoned-cart-recovery/automatewoo-item.tsx
- plugins/woocommerce/client/admin/client/abandoned-cart-recovery/index.ts

### #65072 Fix Leaderboards analytics for users with view_woocommerce_reports cap
https://github.com/woocommerce/woocommerce/pull/65072

Score: 5
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/src/Admin; keyword: products table; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-290
- plugins/woocommerce/src/Admin/API/Leaderboards.php
- plugins/woocommerce/tests/legacy/unit-tests/woocommerce-admin/api/leaderboards.php

### #65053 Fix a11y: render product attribute Remove control as a button
https://github.com/woocommerce/woocommerce/pull/65053

Score: 5
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm; keyword: navigation
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-316
- plugins/woocommerce/client/legacy/css/admin.scss
- plugins/woocommerce/includes/admin/meta-boxes/views/html-product-attribute.php

### #65044 Fix country dropdown dropping the order's saved country on order edit screen
https://github.com/woocommerce/woocommerce/pull/65044

Score: 5
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm; keyword: order edit
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-337
- plugins/woocommerce/includes/admin/meta-boxes/class-wc-meta-box-order-data.php
- plugins/woocommerce/tests/php/includes/admin/meta-boxes/class-wc-meta-box-order-data-test.php

### #64968 Use boolean `selected` attribute on hardcoded WC admin <option> markup
https://github.com/woocommerce/woocommerce/pull/64968

Score: 5
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm; keyword: order edit
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-434
- plugins/woocommerce/client/legacy/js/admin/meta-boxes-product.js
- plugins/woocommerce/includes/admin/class-wc-admin-brands.php
- plugins/woocommerce/includes/admin/class-wc-admin-settings.php
- plugins/woocommerce/includes/admin/list-tables/class-wc-admin-list-table-products.php
- plugins/woocommerce/includes/admin/meta-boxes/class-wc-meta-box-order-data.php
- plugins/woocommerce/includes/admin/meta-boxes/views/html-order-shipping.php
- plugins/woocommerce/includes/admin/meta-boxes/views/html-product-attribute-inner.php

### #64914 Fix negative Net sales in Analytics after deleting refunded orders
https://github.com/woocommerce/woocommerce/pull/64914

Score: 5
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/src/Admin; keyword: rsm; keyword: order edit
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-426
- plugins/woocommerce/src/Admin/API/Reports/Orders/Stats/DataStore.php
- plugins/woocommerce/tests/legacy/unit-tests/woocommerce-admin/reports/class-wc-tests-reports-orders-stats.php

### #64903 fix: reject reserved internal meta keys in order item Add Meta UI (RSMAPGJ-444)
https://github.com/woocommerce/woocommerce/pull/64903

Score: 5
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm; keyword: order edit
Touched areas:
- plugins/woocommerce/changelog/64903-ai-agent-rsmapgj-444-1778756902
- plugins/woocommerce/changelog/fix-rsmapgj-444
- plugins/woocommerce/includes/admin/wc-admin-functions.php
- plugins/woocommerce/tests/php/includes/admin/class-wc-admin-functions-test.php

### #64885 Floating header: polish + WP design token alignment
https://github.com/woocommerce/woocommerce/pull/64885

Score: 5
Author: j111q
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/client/admin/client/settings; keyword: floating header; author: j111q
Touched areas:
- packages/js/internal-style-build/abstracts/_variables.scss
- packages/js/internal-style-build/changelog/sprinkle-header-tokens-alignment
- plugins/woocommerce/changelog/64885-sprinkle-preview-store-icon
- plugins/woocommerce/client/admin/client/activity-panel/activity-panel.js
- plugins/woocommerce/client/admin/client/activity-panel/display-options/icons/display.js
- plugins/woocommerce/client/admin/client/activity-panel/style.scss
- plugins/woocommerce/client/admin/client/header/style.scss
- plugins/woocommerce/client/admin/client/marketplace/components/header-account/header-account.scss

### #64880 Payments settings: grey tab strip to match other Settings tabs
https://github.com/woocommerce/woocommerce/pull/64880

Score: 5
Author: j111q
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/client/admin/client/settings; keyword: floating header; author: j111q
Touched areas:
- plugins/woocommerce/changelog/64880-sprinkle-payments-settings-grey-bg
- plugins/woocommerce/changelog/sprinkle-payments-tab-strip-grey-bg
- plugins/woocommerce/client/admin/client/settings-payments/settings-payments-body.scss

### #64860 Improve payment setup fallback coverage
https://github.com/woocommerce/woocommerce/pull/64860

Score: 5
Author: annchichi
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/client/admin/client/settings; keyword: payment setup; author: annchichi
Touched areas:
- plugins/woocommerce/changelog/dev-payment-setup-fallback-tests
- plugins/woocommerce/client/admin/client/settings-payments/components/buttons/enable-gateway-button.tsx
- plugins/woocommerce/client/admin/client/settings-payments/components/buttons/test/enable-gateway-button.test.tsx

### #64846 Analytics: align Date range and Data status, refine Update now button
https://github.com/woocommerce/woocommerce/pull/64846

Score: 5
Author: j111q
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/client/admin/client/analytics; keyword: feature flag; author: j111q
Touched areas:
- packages/js/components/changelog/sprinkle-analytics-date-range-alignment
- packages/js/components/src/date-range-filter-picker/index.js
- plugins/woocommerce/changelog/sprinkle-analytics-date-range-alignment
- plugins/woocommerce/client/admin/client/analytics/components/import-status-bar/import-status-bar.scss
- plugins/woocommerce/client/admin/client/analytics/components/import-status-bar/import-status-bar.tsx
- plugins/woocommerce/tests/e2e-pw/tests/analytics/analytics-overview.spec.ts

### #64799 Improve payment provider setup error message
https://github.com/woocommerce/woocommerce/pull/64799

Score: 5
Author: annchichi
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/client/admin/client/settings; keyword: payment provider; author: annchichi
Touched areas:
- plugins/woocommerce/changelog/fix-payment-provider-needs-setup-message
- plugins/woocommerce/client/admin/client/settings-payments/components/buttons/enable-gateway-button.tsx
- plugins/woocommerce/client/admin/client/settings-payments/components/buttons/test/enable-gateway-button.test.tsx

### #65917 Fix Settings UI number field custom attributes
https://github.com/woocommerce/woocommerce/pull/65917

Score: 4
Author: dmallory42
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: settings-ui; keyword: settings ui
Touched areas:
- packages/js/settings-ui/changelog/fix-number-custom-attributes
- packages/js/settings-ui/src/native-fields.tsx
- packages/js/settings-ui/src/test/native-fields.test.tsx

### #65657 Add POS staff foundation: feature flag, orchestrator, caps model
https://github.com/woocommerce/woocommerce/pull/65657

Score: 4
Author: jaclync
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: feature flag; keyword: experiment
Touched areas:
- plugins/woocommerce/changelog/add-pos-staff-foundation
- plugins/woocommerce/includes/class-woocommerce.php
- plugins/woocommerce/src/Internal/Features/FeaturesController.php
- plugins/woocommerce/src/Internal/POS/Capabilities.php
- plugins/woocommerce/src/Internal/POS/POSController.php
- plugins/woocommerce/tests/php/src/Internal/POS/CapabilitiesTest.php

### #65521 Make abandoned cart recovery experimental and opt-in (not default-on for new installs)
https://github.com/woocommerce/woocommerce/pull/65521

Score: 4
Author: prettyboymp
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: feature flag; keyword: experiment
Touched areas:
- plugins/woocommerce/changelog/abandoned-cart-recovery-experimental-optin
- plugins/woocommerce/includes/class-wc-install.php
- plugins/woocommerce/src/Internal/Features/FeaturesController.php

### #65404 Remove `experimental-iapi-runtime` feature flag
https://github.com/woocommerce/woocommerce/pull/65404

Score: 4
Author: gigitux
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: feature flag; keyword: experiment
Touched areas:
- .pnpmfile.cjs
- .syncpackrc
- plugins/woocommerce/changelog/dev-remove-experimental-iapi-runtime
- plugins/woocommerce/client/admin/config/core.json
- plugins/woocommerce/client/admin/config/development.json
- plugins/woocommerce/client/blocks/assets/js/blocks/product-filters/frontend.ts
- plugins/woocommerce/client/blocks/bin/webpack-config-interactivity.js
- plugins/woocommerce/client/blocks/package.json

### #65164 [RSM] Add manual send action for the Checkout Recovery email
https://github.com/woocommerce/woocommerce/pull/65164

Score: 4
Author: mayisha
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: rsm; keyword: order edit
Touched areas:
- plugins/woocommerce/changelog/checkout-recovery-manual-send
- plugins/woocommerce/changelog/checkout-recovery-unsubscribe
- plugins/woocommerce/includes/class-wc-install.php
- plugins/woocommerce/includes/class-woocommerce.php
- plugins/woocommerce/includes/emails/class-wc-email-customer-abandoned-cart-recovery.php
- plugins/woocommerce/src/Internal/AbandonedCartRecovery/ManualSendHandler.php
- plugins/woocommerce/src/Internal/Email/Unsubscribes/Endpoint.php
- plugins/woocommerce/src/Internal/Email/Unsubscribes/Storage.php

### #65159 Fix variation quick edit crashes and save errors in experimental products app
https://github.com/woocommerce/woocommerce/pull/65159

Score: 4
Author: poligilad-auto
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: feature flag; keyword: experiment
Touched areas:
- packages/js/experimental-products-app/src/product-edit/save.test.ts
- packages/js/experimental-products-app/src/product-edit/save.ts

### #65156 Add price range filter spacing
https://github.com/woocommerce/woocommerce/pull/65156

Score: 4
Author: gigitux
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: experiment; keyword: rsm
Touched areas:
- packages/js/experimental-products-app/changelog/fix-rsm-3550-price-range-spacing
- packages/js/experimental-products-app/src/fields/price/field.tsx

### #65154 Fix empty product list filters
https://github.com/woocommerce/woocommerce/pull/65154

Score: 4
Author: gigitux
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: experiment; keyword: rsm
Touched areas:
- packages/js/experimental-products-app/changelog/fix-rsm-3550-empty-filters
- packages/js/experimental-products-app/src/product-list/query.test.ts
- packages/js/experimental-products-app/src/product-list/query.ts

### #65071 Fix order refund items inheriting meta IDs from original line item
https://github.com/woocommerce/woocommerce/pull/65071

Score: 4
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: rsm; keyword: order edit
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-298
- plugins/woocommerce/includes/wc-order-functions.php
- plugins/woocommerce/tests/php/includes/wc-order-functions-test.php

### #65061 Fix wc_format_decimal trimming trailing zeros below price decimals
https://github.com/woocommerce/woocommerce/pull/65061

Score: 4
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: rsm; keyword: order edit
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-330
- plugins/woocommerce/includes/wc-formatting-functions.php
- plugins/woocommerce/tests/legacy/unit-tests/formatting/functions.php

### #65054 Preserve 0% tax rates on refund orders
https://github.com/woocommerce/woocommerce/pull/65054

Score: 4
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: rsm; keyword: order edit
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-310
- plugins/woocommerce/includes/class-wc-ajax.php
- plugins/woocommerce/includes/wc-order-functions.php
- plugins/woocommerce/tests/legacy/unit-tests/order/class-wc-tests-order-functions.php

### #65039 Fix Mini Cart toggle missing from Navigation hooked-blocks panel
https://github.com/woocommerce/woocommerce/pull/65039

Score: 4
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: rsm; keyword: navigation
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-275
- plugins/woocommerce/src/Blocks/BlockTypes/CustomerAccount.php
- plugins/woocommerce/src/Blocks/BlockTypes/MiniCart.php
- plugins/woocommerce/src/Blocks/Utils/BlockHooksTrait.php
- plugins/woocommerce/tests/php/src/Blocks/BlockTypes/BlockHooksTests.php

### #65029 Fix Analytics crash when customer-effort-score-tracks feature is disabled
https://github.com/woocommerce/woocommerce/pull/65029

Score: 4
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: feature flag; keyword: rsm
Touched areas:
- packages/js/customer-effort-score/changelog/fix-rsmapgj-319
- packages/js/customer-effort-score/src/components/customer-effort-score-modal-container/index.tsx
- packages/js/customer-effort-score/src/components/customer-effort-score-modal-container/test/index.tsx
- plugins/woocommerce/changelog/fix-rsmapgj-319

### #65022 Resolve relative paths in `getNewPath` against the current path
https://github.com/woocommerce/woocommerce/pull/65022

Score: 4
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: rsm; keyword: navigation
Touched areas:
- packages/js/navigation/changelog/fix-rsmapgj-343
- packages/js/navigation/src/test/index.js
- packages/js/navigation/src/url.js

### #65009 RSM: better detection for saved for later block on cart page
https://github.com/woocommerce/woocommerce/pull/65009

Score: 4
Author: jorgeatorres
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: feature flag; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-shopper-collection-hooked-block-flag
- plugins/woocommerce/src/Blocks/BlockTypes/Cart.php
- plugins/woocommerce/src/Blocks/BlockTypes/ShopperCollection.php
- plugins/woocommerce/tests/php/src/Blocks/BlockTypes/ShopperCollectionTests.php

### #64996 Prevent duplicate order actions on Update button double-click
https://github.com/woocommerce/woocommerce/pull/64996

Score: 4
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: rsm; keyword: order edit
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-372
- plugins/woocommerce/client/legacy/js/admin/meta-boxes-order.js

### #64982 Fire woocommerce_trash_order and woocommerce_delete_order from WP post hooks
https://github.com/woocommerce/woocommerce/pull/64982

Score: 4
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: rsm; keyword: order edit
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-394
- plugins/woocommerce/includes/class-wc-post-data.php
- plugins/woocommerce/includes/data-stores/abstract-wc-order-data-store-cpt.php
- plugins/woocommerce/tests/php/includes/class-wc-post-data-test.php

### #64976 Fix CES shop_order_update survey on HPOS order edit page
https://github.com/woocommerce/woocommerce/pull/64976

Score: 4
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: rsm; keyword: order edit
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-433
- plugins/woocommerce/src/Internal/Admin/CustomerEffortScoreTracks.php
- plugins/woocommerce/tests/legacy/unit-tests/woocommerce-admin/features/class-wc-tests-ces-tracks.php

### #64947 Fix single product description CSS in Twenty * classic themes
https://github.com/woocommerce/woocommerce/pull/64947

Score: 4
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: rsm; keyword: navigation
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-403
- plugins/woocommerce/client/legacy/css/twenty-nineteen.scss
- plugins/woocommerce/client/legacy/css/twenty-twenty-one.scss
- plugins/woocommerce/client/legacy/css/twenty-twenty.scss

### #64939 Fix current-menu-item class on shop page link in Navigation block
https://github.com/woocommerce/woocommerce/pull/64939

Score: 4
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: rsm; keyword: navigation
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-398
- plugins/woocommerce/includes/wc-page-functions.php
- plugins/woocommerce/tests/legacy/unit-tests/util/page-functions.php

### #64938 Reject refunds that exceed a line item's remaining total or quantity
https://github.com/woocommerce/woocommerce/pull/64938

Score: 4
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: rsm; keyword: order edit
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-379
- plugins/woocommerce/includes/wc-order-functions.php
- plugins/woocommerce/tests/php/includes/wc-order-functions-test.php

### #64932 Fix duplicate variation attributes on Order Pay, My Account, and emails
https://github.com/woocommerce/woocommerce/pull/64932

Score: 4
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: rsm; keyword: email template
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-397
- plugins/woocommerce/includes/class-wc-order-item.php
- plugins/woocommerce/tests/legacy/unit-tests/order-items/class-wc-tests-order-item-product.php

### #64913 Add per-tab empty states to the experimental products app
https://github.com/woocommerce/woocommerce/pull/64913

Score: 4
Author: verofasulo
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: dataviews; keyword: experiment
Touched areas:
- packages/js/experimental-products-app/changelog/add-products-app-empty-states
- packages/js/experimental-products-app/src/product-list/empty-state/icon.tsx
- packages/js/experimental-products-app/src/product-list/empty-state/index.tsx
- packages/js/experimental-products-app/src/product-list/index.tsx

### #64902 Fix color contrast for paragraph text on admin order screen
https://github.com/woocommerce/woocommerce/pull/64902

Score: 4
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: rsm; keyword: order edit
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-440
- plugins/woocommerce/client/legacy/css/admin.scss

### #64897 fix: wrap product editor info tooltip text (GTIN field)
https://github.com/woocommerce/woocommerce/pull/64897

Score: 4
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: keyword: experiment; keyword: rsm
Touched areas:
- packages/js/components/changelog/64897-ai-agent-rsmapgj-427-1778756902
- packages/js/components/changelog/fix-rsmapgj-427
- packages/js/components/src/tooltip/style.scss
- packages/js/product-editor/changelog/64897-ai-agent-rsmapgj-427-1778756902
- packages/js/product-editor/changelog/fix-rsmapgj-427
- packages/js/product-editor/src/components/label/style.scss
- plugins/woocommerce/changelog/64897-ai-agent-rsmapgj-427-1778756902
- plugins/woocommerce/changelog/fix-rsmapgj-427

### #65859 Add unique CSS classes to the order_data_column DIVs in the order edit screen
https://github.com/woocommerce/woocommerce/pull/65859

Score: 3
Author: webdados
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: order edit
Touched areas:
- plugins/woocommerce/changelog/patch-1
- plugins/woocommerce/includes/admin/meta-boxes/class-wc-meta-box-order-data.php

### #65487 Fix tooltip accessibility: keyboard navigation, ARIA roles, and WCAG 1.4.13 compliance
https://github.com/woocommerce/woocommerce/pull/65487

Score: 3
Author: anuj-rathore24
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: navigation
Touched areas:
- plugins/woocommerce/client/legacy/css/admin.scss
- plugins/woocommerce/client/legacy/js/admin/meta-boxes-product.js
- plugins/woocommerce/client/legacy/js/admin/woocommerce_admin.js
- plugins/woocommerce/client/legacy/js/jquery-tiptip/jquery.tipTip.js
- plugins/woocommerce/includes/admin/meta-boxes/class-wc-meta-box-order-downloads.php
- plugins/woocommerce/includes/gateways/bacs/class-wc-gateway-bacs.php
- plugins/woocommerce/includes/wc-core-functions.php
- plugins/woocommerce/src/Internal/Admin/Orders/Edit.php

### #65387 Remove product editor template system feature flag
https://github.com/woocommerce/woocommerce/pull/65387

Score: 3
Author: gigitux
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/src/Admin; keyword: feature flag
Touched areas:
- packages/js/product-editor/changelog/remove-product-editor-template-system-flag
- packages/js/product-editor/src/blocks/product-fields/product-details-section-description/edit.tsx
- packages/js/product-editor/src/components/block-editor/block-editor.tsx
- packages/js/product-editor/src/types.ts
- packages/js/product-editor/src/utils/is-product-form-template-system-enabled.ts
- plugins/woocommerce/changelog/remove-product-editor-template-system-flag
- plugins/woocommerce/client/admin/config/core.json
- plugins/woocommerce/client/admin/config/development.json

### #65086 Fix: Allow sample products to be excluded from onboarding task completion
https://github.com/woocommerce/woocommerce/pull/65086

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/src/Admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-363
- plugins/woocommerce/src/Admin/Features/OnboardingTasks/Tasks/Products.php
- plugins/woocommerce/tests/php/src/Admin/Features/OnboardingTasks/Tasks/ProductsTest.php

### #65081 Resync stock status when the out-of-stock threshold changes
https://github.com/woocommerce/woocommerce/pull/65081

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-274
- plugins/woocommerce/includes/admin/settings/class-wc-settings-products.php
- plugins/woocommerce/includes/class-woocommerce.php
- plugins/woocommerce/src/Internal/StockThresholdResync.php
- plugins/woocommerce/tests/php/src/Internal/StockThresholdResyncTest.php

### #65078 Fix duplicate product entry in admin menu order
https://github.com/woocommerce/woocommerce/pull/65078

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-289
- plugins/woocommerce/includes/admin/class-wc-admin-menus.php
- plugins/woocommerce/tests/php/includes/admin/class-wc-admin-menus-test.php

### #65076 Replace deprecated `width` attribute on `<td>` with inline CSS
https://github.com/woocommerce/woocommerce/pull/65076

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-273
- plugins/woocommerce/client/admin/client/wp-admin-scripts/payment-method-promotions/payment-promotion-row.tsx
- plugins/woocommerce/includes/admin/settings/views/html-admin-page-shipping-zone-methods.php
- plugins/woocommerce/includes/admin/settings/views/html-admin-page-shipping-zones.php

### #65075 Fix woocommerce_wp_text_input not populating value under HPOS
https://github.com/woocommerce/woocommerce/pull/65075

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-283
- plugins/woocommerce/includes/admin/wc-meta-box-functions.php
- plugins/woocommerce/tests/php/includes/admin/class-wc-meta-box-functions-test.php

### #65074 Fix duplicate/missing rows in Analytics Products CSV export
https://github.com/woocommerce/woocommerce/pull/65074

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/src/Admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-287
- plugins/woocommerce/src/Admin/API/Reports/Products/DataStore.php
- plugins/woocommerce/tests/legacy/unit-tests/woocommerce-admin/reports/class-wc-tests-reports-products.php

### #65073 Preserve intentionally empty Shop Page during WooCommerce updates
https://github.com/woocommerce/woocommerce/pull/65073

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-295
- plugins/woocommerce/includes/admin/wc-admin-functions.php
- plugins/woocommerce/tests/php/includes/admin/class-wc-admin-functions-test.php

### #65070 Fix WooCommerce Status warning when PHP memory_limit is -1
https://github.com/woocommerce/woocommerce/pull/65070

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-299
- plugins/woocommerce/includes/admin/views/html-admin-page-status-report.php
- plugins/woocommerce/includes/rest-api/Controllers/Version2/class-wc-rest-system-status-v2-controller.php
- plugins/woocommerce/includes/wc-formatting-functions.php
- plugins/woocommerce/phpstan-baseline.neon
- plugins/woocommerce/tests/legacy/unit-tests/formatting/functions.php
- plugins/woocommerce/tests/php/includes/rest-api/Controllers/Version2/class-wc-rest-system-status-v2-controller-test.php

### #65058 Fix product CSV import losing 'Used for variations' on edited attributes
https://github.com/woocommerce/woocommerce/pull/65058

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-334
- plugins/woocommerce/includes/admin/importers/class-wc-product-csv-importer-controller.php
- plugins/woocommerce/includes/admin/importers/mappings/default.php
- plugins/woocommerce/includes/export/class-wc-product-csv-exporter.php
- plugins/woocommerce/includes/import/abstract-wc-product-importer.php
- plugins/woocommerce/includes/import/class-wc-product-csv-importer.php
- plugins/woocommerce/tests/php/includes/importer/class-wc-product-csv-importer-test.php

### #65045 Fix: only save product once on update (RSMAPGJ-324)
https://github.com/woocommerce/woocommerce/pull/65045

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-324
- plugins/woocommerce/includes/admin/meta-boxes/class-wc-meta-box-product-data.php
- plugins/woocommerce/includes/admin/meta-boxes/class-wc-meta-box-product-images.php
- plugins/woocommerce/tests/php/includes/admin/meta-boxes/class-wc-meta-box-product-save-once-test.php

### #65016 Fix Out of Stock count in dashboard status widget for unmanaged products
https://github.com/woocommerce/woocommerce/pull/65016

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-354
- plugins/woocommerce/includes/admin/class-wc-admin-dashboard.php
- plugins/woocommerce/tests/php/includes/admin/class-wc-admin-dashboard-test.php

### #64973 Fix tax names containing percent-encoded-like sequences being stripped on order pages
https://github.com/woocommerce/woocommerce/pull/64973

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-418
- plugins/woocommerce/includes/admin/settings/class-wc-settings-tax.php
- plugins/woocommerce/includes/class-wc-tax.php
- plugins/woocommerce/includes/rest-api/Controllers/Version1/class-wc-rest-taxes-v1-controller.php
- plugins/woocommerce/tests/php/includes/class-wc-tax-test.php

### #64956 Fix Sales by Date report TypeError when refund totals are strings (PHP 8+)
https://github.com/woocommerce/woocommerce/pull/64956

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-409
- plugins/woocommerce/includes/admin/reports/class-wc-report-sales-by-date.php
- plugins/woocommerce/tests/legacy/unit-tests/admin/reports/class-wc-tests-report-sales-by-date.php

### #64948 Fix manual order shipping method name truncated to "Shipping" in emails
https://github.com/woocommerce/woocommerce/pull/64948

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-406
- plugins/woocommerce/includes/admin/wc-admin-functions.php
- plugins/woocommerce/tests/php/includes/admin/class-wc-admin-functions-test.php

### #64940 Fix wc/v3/reports/sales returning empty data on HPOS-only sites
https://github.com/woocommerce/woocommerce/pull/64940

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-425
- plugins/woocommerce/includes/admin/reports/class-wc-report-sales-by-date.php
- plugins/woocommerce/tests/php/includes/admin/reports/class-wc-report-sales-by-date-hpos-test.php

### #64933 Fix manual order shipping instance id
https://github.com/woocommerce/woocommerce/pull/64933

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-410
- plugins/woocommerce/includes/admin/meta-boxes/views/html-order-items.php
- plugins/woocommerce/includes/admin/meta-boxes/views/html-order-shipping.php
- plugins/woocommerce/includes/admin/wc-admin-functions.php
- plugins/woocommerce/includes/class-wc-ajax.php
- plugins/woocommerce/phpstan-baseline.neon
- plugins/woocommerce/tests/php/includes/admin/class-wc-admin-functions-test.php

### #64929 Fix layout shift on Products list by rendering Import/Export buttons server-side
https://github.com/woocommerce/woocommerce/pull/64929

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-386
- plugins/woocommerce/client/legacy/js/admin/woocommerce_admin.js
- plugins/woocommerce/includes/admin/class-wc-admin-importers.php

### #64926 Initialise product term `order` meta in non-admin contexts
https://github.com/woocommerce/woocommerce/pull/64926

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-396
- plugins/woocommerce/includes/admin/class-wc-admin-taxonomies.php
- plugins/woocommerce/includes/wc-term-functions.php
- plugins/woocommerce/tests/php/includes/wc-term-functions-tests.php

### #64918 Fix product quick edit saving NULL stock quantity with empty input
https://github.com/woocommerce/woocommerce/pull/64918

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-441
- plugins/woocommerce/includes/admin/class-wc-admin-post-types.php
- plugins/woocommerce/tests/unit-tests/admin/class-wc-tests-admin-post-types.php

### #64915 Fix shipping class cleared on quick/bulk edit with non-ASCII slugs
https://github.com/woocommerce/woocommerce/pull/64915

Score: 3
Author: ayushpahwa
Source search: All recent Woo PR activity: updated:>=2026-04-15
Why it matched: path: plugins/woocommerce/includes/admin; keyword: rsm
Touched areas:
- plugins/woocommerce/changelog/fix-rsmapgj-381
- plugins/woocommerce/includes/admin/class-wc-admin-post-types.php
- plugins/woocommerce/tests/unit-tests/admin/class-wc-tests-admin-post-types.php

## Surface ownership policy

### Analytics dashboard
Mode: vision-owned
Owner: Future Woo design
Woo PR: #65437 Clean enabled admin feature flags from config
Intent: feature-flag
Action: draft-pr
Designer review path: Analytics
Matched by: path: plugins/woocommerce/client/admin/client/analytics
Auto-merge: held; the bot should leave a draft PR for review.
- Future Woo owns a super-future version of this surface, so Woo core changes stay visible without automatically overwriting it.

### Analytics dashboard
Mode: vision-owned
Owner: Future Woo design
Woo PR: #65072 Fix Leaderboards analytics for users with view_woocommerce_reports cap
Intent: bugfix
Action: report-only
Designer review path: Analytics
Matched by: keyword: analytics
Auto-apply: skipped; this stays visible without overwriting the Future Woo surface.
- Future Woo owns a super-future version of this surface, so Woo core changes stay visible without automatically overwriting it.

### Analytics dashboard
Mode: vision-owned
Owner: Future Woo design
Woo PR: #64914 Fix negative Net sales in Analytics after deleting refunded orders
Intent: bugfix
Action: report-only
Designer review path: Analytics
Matched by: keyword: analytics
Auto-apply: skipped; this stays visible without overwriting the Future Woo surface.
- Future Woo owns a super-future version of this surface, so Woo core changes stay visible without automatically overwriting it.

### Analytics dashboard
Mode: vision-owned
Owner: Future Woo design
Woo PR: #64846 Analytics: align Date range and Data status, refine Update now button
Intent: feature-flag
Action: draft-pr
Designer review path: Analytics
Matched by: path: plugins/woocommerce/client/admin/client/analytics; keyword: analytics
Auto-merge: held; the bot should leave a draft PR for review.
- Future Woo owns a super-future version of this surface, so Woo core changes stay visible without automatically overwriting it.

### Analytics dashboard
Mode: vision-owned
Owner: Future Woo design
Woo PR: #65029 Fix Analytics crash when customer-effort-score-tracks feature is disabled
Intent: feature-flag
Action: draft-pr
Designer review path: Analytics
Matched by: keyword: analytics
Auto-merge: held; the bot should leave a draft PR for review.
- Future Woo owns a super-future version of this surface, so Woo core changes stay visible without automatically overwriting it.

### Analytics dashboard
Mode: vision-owned
Owner: Future Woo design
Woo PR: #65074 Fix duplicate/missing rows in Analytics Products CSV export
Intent: bugfix
Action: report-only
Designer review path: Analytics
Matched by: keyword: analytics
Auto-apply: skipped; this stays visible without overwriting the Future Woo surface.
- Future Woo owns a super-future version of this surface, so Woo core changes stay visible without automatically overwriting it.

### Products table
Mode: hybrid
Owner: Future Woo plus Woo core
Woo PR: #65174 Fix experimental products table polish
Intent: feature-flag
Action: draft-pr
Designer review path: Products > All Products
Matched by: keyword: products table
Auto-merge: held; the bot should leave a draft PR for review.
- Product-list DataViews work is worth pulling forward, but feature-flagged UI changes should pause as a draft for review.

### Products table
Mode: hybrid
Owner: Future Woo plus Woo core
Woo PR: #65114 Polish the variations DataViews table and unify the stock pill
Intent: feature-flag
Action: draft-pr
Designer review path: Products > All Products
Matched by: keyword: dataviews
Auto-merge: held; the bot should leave a draft PR for review.
- Product-list DataViews work is worth pulling forward, but feature-flagged UI changes should pause as a draft for review.

### Products table
Mode: hybrid
Owner: Future Woo plus Woo core
Woo PR: #65154 Fix empty product list filters
Intent: feature-flag
Action: draft-pr
Designer review path: Products > All Products
Matched by: keyword: product list
Auto-merge: held; the bot should leave a draft PR for review.
- Product-list DataViews work is worth pulling forward, but feature-flagged UI changes should pause as a draft for review.

### Products table
Mode: hybrid
Owner: Future Woo plus Woo core
Woo PR: #64897 fix: wrap product editor info tooltip text (GTIN field)
Intent: feature-flag
Action: draft-pr
Designer review path: Products > All Products
Matched by: path: packages/js/product-editor
Auto-merge: held; the bot should leave a draft PR for review.
- Product-list DataViews work is worth pulling forward, but feature-flagged UI changes should pause as a draft for review.

### Products table
Mode: hybrid
Owner: Future Woo plus Woo core
Woo PR: #65387 Remove product editor template system feature flag
Intent: feature-flag
Action: draft-pr
Designer review path: Products > All Products
Matched by: path: packages/js/product-editor
Auto-merge: held; the bot should leave a draft PR for review.
- Product-list DataViews work is worth pulling forward, but feature-flagged UI changes should pause as a draft for review.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65866 [Backport to release/10.9] Add Settings UI section registry
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings
Matched by: path: plugins/woocommerce/client/admin/client/settings; path: plugins/woocommerce/includes/admin/settings; keyword: settings ui
Auto-merge: held; the bot should leave a draft PR for review.
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65813 Add Settings UI section registry
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings
Matched by: path: plugins/woocommerce/client/admin/client/settings; path: plugins/woocommerce/includes/admin/settings; keyword: settings-ui; keyword: settings ui
Auto-merge: held; the bot should leave a draft PR for review.
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65975 Add native Settings UI page provider for registered sections
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings
Matched by: keyword: settings ui
Auto-merge: held; the bot should leave a draft PR for review.
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65437 Clean enabled admin feature flags from config
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings
Matched by: path: plugins/woocommerce/includes/admin/settings
Auto-merge: held; the bot should leave a draft PR for review.
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65893 [Backport to release/10.9] Rename @woocommerce/settings-ui-sdk to @woocommerce/settings-ui
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings
Matched by: path: plugins/woocommerce/client/admin/client/settings; path: plugins/woocommerce/includes/admin/settings; keyword: settings-ui
Auto-merge: held; the bot should leave a draft PR for review.
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65729 [Backport to release/10.9] Align settings UI layout and number inputs with design spec
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings
Matched by: keyword: settings ui
Auto-merge: held; the bot should leave a draft PR for review.
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65719 Rename @woocommerce/settings-ui-sdk to @woocommerce/settings-ui
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings
Matched by: path: plugins/woocommerce/client/admin/client/settings; path: plugins/woocommerce/includes/admin/settings; keyword: settings-ui
Auto-merge: held; the bot should leave a draft PR for review.
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65715 Fix horizontal overflow of the settings UI tab bar
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings
Matched by: keyword: settings-ui; keyword: settings ui
Auto-merge: held; the bot should leave a draft PR for review.
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65695 Align settings UI layout and number inputs with design spec
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings
Matched by: keyword: settings-ui; keyword: settings ui
Auto-merge: held; the bot should leave a draft PR for review.
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65910 Fix Settings UI save-and-continue navigation
Intent: bugfix
Action: self-merge
Designer review path: WooCommerce > Settings
Matched by: keyword: settings-ui; keyword: settings ui
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65587 [Backport to release/10.9] Surface settings UI fallback through wc_doing_it_wrong
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings
Matched by: path: plugins/woocommerce/includes/admin/settings; keyword: settings ui
Auto-merge: held; the bot should leave a draft PR for review.
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65499 Surface settings UI fallback through wc_doing_it_wrong
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings
Matched by: path: plugins/woocommerce/includes/admin/settings; keyword: settings-ui; keyword: settings ui
Auto-merge: held; the bot should leave a draft PR for review.
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65825 Settings UI: add subtitle and badges to the shell header
Intent: default
Action: self-merge
Designer review path: WooCommerce > Settings
Matched by: keyword: settings-ui; keyword: settings ui
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65802 Explore DataForm internals for Settings UI
Intent: default
Action: self-merge
Designer review path: WooCommerce > Settings
Matched by: keyword: settings-ui; keyword: settings ui
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65696 Render settings UI number fields with design-spec spin controls
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings
Matched by: keyword: settings-ui; keyword: settings ui
Auto-merge: held; the bot should leave a draft PR for review.
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65577 Keep Settings UI navigation guard until form exists
Intent: default
Action: self-merge
Designer review path: WooCommerce > Settings
Matched by: keyword: settings-ui; keyword: settings ui
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65575 [Backport to release/10.9] Add settings UI flag-off smoke test
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings
Matched by: keyword: settings ui
Auto-merge: held; the bot should leave a draft PR for review.
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65567 [Backport to release/10.9] Align settings UI SDK with settings card design
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings
Matched by: keyword: settings ui
Auto-merge: held; the bot should leave a draft PR for review.
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65557 Align settings UI SDK with settings card design
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings
Matched by: keyword: settings-ui; keyword: settings ui
Auto-merge: held; the bot should leave a draft PR for review.
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65490 Add settings UI flag-off smoke test
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings
Matched by: keyword: settings-ui; keyword: settings ui
Auto-merge: held; the bot should leave a draft PR for review.
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65573 Remove Point of Sale feature flag from WooCommerce
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings
Matched by: path: plugins/woocommerce/includes/admin/settings
Auto-merge: held; the bot should leave a draft PR for review.
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #64968 Use boolean `selected` attribute on hardcoded WC admin <option> markup
Intent: default
Action: self-merge
Designer review path: WooCommerce > Settings
Matched by: path: plugins/woocommerce/includes/admin/settings
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #64885 Floating header: polish + WP design token alignment
Intent: default
Action: self-merge
Designer review path: WooCommerce > Settings
Matched by: path: plugins/woocommerce/client/admin/client/settings
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #64880 Payments settings: grey tab strip to match other Settings tabs
Intent: default
Action: self-merge
Designer review path: WooCommerce > Settings
Matched by: path: plugins/woocommerce/client/admin/client/settings
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #64860 Improve payment setup fallback coverage
Intent: default
Action: self-merge
Designer review path: WooCommerce > Settings
Matched by: path: plugins/woocommerce/client/admin/client/settings
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #64799 Improve payment provider setup error message
Intent: default
Action: self-merge
Designer review path: WooCommerce > Settings
Matched by: path: plugins/woocommerce/client/admin/client/settings
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65917 Fix Settings UI number field custom attributes
Intent: bugfix
Action: self-merge
Designer review path: WooCommerce > Settings
Matched by: keyword: settings-ui; keyword: settings ui
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65081 Resync stock status when the out-of-stock threshold changes
Intent: default
Action: self-merge
Designer review path: WooCommerce > Settings
Matched by: path: plugins/woocommerce/includes/admin/settings
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #65076 Replace deprecated `width` attribute on `<td>` with inline CSS
Intent: default
Action: self-merge
Designer review path: WooCommerce > Settings
Matched by: path: plugins/woocommerce/includes/admin/settings
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Settings screens
Mode: mirror-owned
Owner: Woo core
Woo PR: #64973 Fix tax names containing percent-encoded-like sequences being stripped on order pages
Intent: bugfix
Action: self-merge
Designer review path: WooCommerce > Settings
Matched by: path: plugins/woocommerce/includes/admin/settings
- Settings currently behaves like a mirror surface, so low-risk Woo improvements can flow in automatically when checks pass.

### Shipping providers
Mode: hybrid
Owner: Future Woo plus Woo core
Woo PR: #65437 Clean enabled admin feature flags from config
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce > Settings > Shipping
Matched by: path: plugins/woocommerce/client/admin/client/shipping
Auto-merge: held; the bot should leave a draft PR for review.
- Shipping provider work can follow the same provider-card pattern, but design-facing reshapes should stop as drafts.

### Woo admin navigation
Mode: hybrid
Owner: Future Woo plus Woo core
Woo PR: #64712 Add nested admin navigation behind navigation_v2 feature flag
Intent: feature-flag
Action: draft-pr
Designer review path: WooCommerce admin rail
Matched by: path: plugins/woocommerce/src/Internal/Admin/Navigation; path: plugins/woocommerce/client/legacy/js/admin/admin-navigation-v2.js; path: plugins/woocommerce/client/legacy/css/admin-navigation-v2.scss; keyword: navigation_v2; keyword: nested admin navigation; keyword: navigation
Auto-merge: held; the bot should leave a draft PR for review.
- Navigation changes touch the frame of the whole prototype, so feature-flagged UI shifts should pause for review.

### Woo admin navigation
Mode: hybrid
Owner: Future Woo plus Woo core
Woo PR: #65910 Fix Settings UI save-and-continue navigation
Intent: bugfix
Action: self-merge
Designer review path: WooCommerce admin rail
Matched by: keyword: navigation
- Navigation changes touch the frame of the whole prototype, so feature-flagged UI shifts should pause for review.

### Woo admin navigation
Mode: hybrid
Owner: Future Woo plus Woo core
Woo PR: #65577 Keep Settings UI navigation guard until form exists
Intent: default
Action: draft-pr
Designer review path: WooCommerce admin rail
Matched by: keyword: navigation
Auto-merge: held; the bot should leave a draft PR for review.
- Navigation changes touch the frame of the whole prototype, so feature-flagged UI shifts should pause for review.

### Woo admin navigation
Mode: hybrid
Owner: Future Woo plus Woo core
Woo PR: #65039 Fix Mini Cart toggle missing from Navigation hooked-blocks panel
Intent: bugfix
Action: self-merge
Designer review path: WooCommerce admin rail
Matched by: keyword: navigation
- Navigation changes touch the frame of the whole prototype, so feature-flagged UI shifts should pause for review.

### Woo admin navigation
Mode: hybrid
Owner: Future Woo plus Woo core
Woo PR: #64939 Fix current-menu-item class on shop page link in Navigation block
Intent: bugfix
Action: self-merge
Designer review path: WooCommerce admin rail
Matched by: keyword: navigation
- Navigation changes touch the frame of the whole prototype, so feature-flagged UI shifts should pause for review.

### Woo admin navigation
Mode: hybrid
Owner: Future Woo plus Woo core
Woo PR: #65487 Fix tooltip accessibility: keyboard navigation, ARIA roles, and WCAG 1.4.13 compliance
Intent: bugfix
Action: self-merge
Designer review path: WooCommerce admin rail
Matched by: keyword: navigation
- Navigation changes touch the frame of the whole prototype, so feature-flagged UI shifts should pause for review.

## Patch adapters

### Products table: DataViews adapter
Status: planned
Matched Woo PR: #65174 Fix experimental products table polish
Local target: client/dataviews-tables/products-list
Designer review path: Products > All Products
Matched by: keyword: products table
- Translate the Woo product-list DataViews surface into a Future Woo products-list bundle.
- Keep the adapter separate from the existing orders-list DataViews bundle until the Products page has its own smoke test.

### Products table: DataViews adapter
Status: planned
Matched Woo PR: #65114 Polish the variations DataViews table and unify the stock pill
Local target: client/dataviews-tables/products-list
Designer review path: Products > All Products
Matched by: keyword: dataviews
- Translate the Woo product-list DataViews surface into a Future Woo products-list bundle.
- Keep the adapter separate from the existing orders-list DataViews bundle until the Products page has its own smoke test.

### Products table: DataViews adapter
Status: planned
Matched Woo PR: #65154 Fix empty product list filters
Local target: client/dataviews-tables/products-list
Designer review path: Products > All Products
Matched by: keyword: product list
- Translate the Woo product-list DataViews surface into a Future Woo products-list bundle.
- Keep the adapter separate from the existing orders-list DataViews bundle until the Products page has its own smoke test.

### Products table: DataViews adapter
Status: planned
Matched Woo PR: #64897 fix: wrap product editor info tooltip text (GTIN field)
Local target: client/dataviews-tables/products-list
Designer review path: Products > All Products
Matched by: path: packages/js/product-editor
- Translate the Woo product-list DataViews surface into a Future Woo products-list bundle.
- Keep the adapter separate from the existing orders-list DataViews bundle until the Products page has its own smoke test.

### Products table: DataViews adapter
Status: planned
Matched Woo PR: #65387 Remove product editor template system feature flag
Local target: client/dataviews-tables/products-list
Designer review path: Products > All Products
Matched by: path: packages/js/product-editor
- Translate the Woo product-list DataViews surface into a Future Woo products-list bundle.
- Keep the adapter separate from the existing orders-list DataViews bundle until the Products page has its own smoke test.

## Designer review paths

- Products > All Products
- WooCommerce admin rail
- Analytics
- WooCommerce > Settings
- WooCommerce > Settings > Shipping

## How to read this

- If the gate says `merge`, the bot is allowed to merge this PR after it creates it.
- If the gate says `hold`, the bot leaves a draft PR and this report is the handoff.
- A candidate here is not a promise that the patch applied. It is a designer-relevant Woo change the bot noticed and tried to keep visible.
