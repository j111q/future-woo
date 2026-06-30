import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const navCustomizer = readFileSync( 'includes/class-nav-tree-customizer.php', 'utf8' );
const context = readFileSync( 'includes/vendor/nested-nav/Context.php', 'utf8' );
const defaultTree = readFileSync( 'includes/vendor/nested-nav/default-tree.php', 'utf8' );

test( 'Payments rail item opens the same Settings > Payments URL as real Woo', () => {
	assert.match(
		navCustomizer,
		/add_filter\( 'woocommerce_admin_menu_tree', array\( __CLASS__, 'map_payments_to_settings_payments' \), 10, 3 \)/,
		'Future Woo should own the Payments URL mapping outside the vendored nested-nav tree'
	);

	assert.match(
		navCustomizer,
		/admin\.php\?page=wc-settings&tab=checkout&from=PAYMENTS_MENU_ITEM/,
		'Payments should use the real Woo menu-item URL that lands on Settings > Payments'
	);

	assert.match(
		defaultTree,
		/'wc-settings&tab=checkout'\s*=> array\(/,
		'The vendored tree should keep the stable checkout-tab slug for current-state matching'
	);
} );

test( 'Payments current state resolves as Settings > Payments, not the shortcut item', () => {
	assert.match(
		navCustomizer,
		/\$tree\['wc-settings&tab=checkout'\]\['parent'\]\s*=\s*'wc-settings';/,
		'The canonical Payments tab should live under Settings'
	);

	assert.match(
		navCustomizer,
		/'nav_only'\s*=>\s*true/,
		'The top-level Payments menu item should be a click-only shortcut'
	);

	assert.match(
		context,
		/!\s*empty\( \$node\['nav_only'\] \)/,
		'Navigation context should ignore click-only shortcut nodes when resolving current state'
	);
} );
