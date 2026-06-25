import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const navScript = readFileSync( 'assets/js/nested-nav.js', 'utf8' );

test( 'Marketing route changes clear stale submenu current state before selecting the new item', () => {
	assert.match(
		navScript,
		/\$\( '#adminmenu \.wp-submenu li\.current' \)[\s\S]*?\.removeClass\( 'current' \)[\s\S]*?\.removeAttr\( 'aria-current' \);/,
		'route changes should remove the old current submenu item and aria state'
	);

	assert.match(
		navScript,
		/href === subLit \|\| href === subEnc/,
		'route changes should select submenu items by exact route, not substring'
	);
} );
