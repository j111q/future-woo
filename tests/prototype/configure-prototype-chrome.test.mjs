import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync( 'assets/css/state-switcher.css', 'utf8' );

test( 'configure prototype chrome uses a monospace stack', () => {
	assert.match(
		css,
		/\.war-state-fab,\s*\.war-state-fab button,\s*\.war-state-fab input\s*{[^}]*font-family:\s*ui-monospace/s
	);

	assert.match(
		css,
		/\.war-state-menu\s*{[^}]*font-family:\s*ui-monospace/s
	);
} );
