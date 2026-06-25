import assert from 'node:assert/strict';
import test from 'node:test';

import {
	buildDesignerReport,
	forceEnabledFlags,
	loadConfigFromString,
	matchPatchAdapters,
	scorePullRequest,
	selectCandidates,
} from '../scripts/woo-intake/lib.mjs';

const config = loadConfigFromString( JSON.stringify( {
	wooRepository: 'woocommerce/woocommerce',
	minimumScore: 3,
	designSignals: {
		labels: [ 'design', 'ux', 'dataviews' ],
		paths: [
			'plugins/woocommerce/client/admin/client/products',
			'plugins/woocommerce/client/admin/client/settings',
		],
		keywords: [ 'products table', 'dataviews', 'feature flag' ],
		authors: [ 'veronica' ],
	},
	featureFlags: [
		{
			id: 'product-list-dataviews',
			label: 'Products table: DataViews',
			flags: [ 'product_list_dataviews', 'products_table_dataviews' ],
			reviewPath: 'Products > All Products',
			enabled: true,
		},
		{
			id: 'navigation-v2',
			label: 'Nested admin navigation',
			flags: [ 'navigation_v2' ],
			reviewPath: 'WooCommerce admin rail',
			enabled: true,
		},
	],
	patchAdapters: [
		{
			id: 'products-dataviews-table',
			label: 'Products table: DataViews adapter',
			status: 'planned',
			reviewPath: 'Products > All Products',
			localTarget: 'client/dataviews-tables/products-list',
			matches: {
				paths: [ 'plugins/woocommerce/client/admin/client/products' ],
				keywords: [ 'products table', 'dataviews' ],
				authors: [ 'veronica' ],
			},
			notes: [
				'Vendor or translate the Woo product-list DataViews surface into Future Woo.',
			],
		},
	],
} ) );

test( 'scores Woo PRs using designer-relevant signals', () => {
	const result = scorePullRequest( {
		number: 65001,
		title: 'Add DataViews products table behind feature flag',
		author: 'veronica',
		labels: [ 'enhancement', 'design' ],
		files: [
			'plugins/woocommerce/client/admin/client/products/product-list/index.tsx',
		],
	}, config );

	assert.equal( result.selected, true );
	assert.equal( result.score >= config.minimumScore, true );
	assert.ok( result.reasons.includes( 'label: design' ) );
	assert.ok( result.reasons.includes( 'author: veronica' ) );
	assert.ok( result.reasons.some( ( reason ) => reason.startsWith( 'path:' ) ) );
	assert.ok( result.reasons.includes( 'keyword: dataviews' ) );
} );

test( 'filters out Woo PRs without design-facing signals', () => {
	const candidates = selectCandidates( [
		{
			number: 65001,
			title: 'Add DataViews products table behind feature flag',
			author: 'veronica',
			labels: [ 'design' ],
			files: [
				'plugins/woocommerce/client/admin/client/products/product-list/index.tsx',
			],
		},
		{
			number: 65002,
			title: 'Update CI retry timeout',
			author: 'build-bot',
			labels: [ 'ci' ],
			files: [ '.github/workflows/ci.yml' ],
		},
	], config );

	assert.deepEqual(
		candidates.map( ( candidate ) => candidate.number ),
		[ 65001 ]
	);
} );

test( 'returns only enabled feature flags for runtime forcing', () => {
	assert.deepEqual( forceEnabledFlags( config ), [
		'product_list_dataviews',
		'products_table_dataviews',
		'navigation_v2',
	] );
} );

test( 'builds a designer-readable report with the merge gate', () => {
	const candidates = [
		scorePullRequest( {
			number: 65001,
			title: 'Add DataViews products table behind feature flag',
			url: 'https://github.com/woocommerce/woocommerce/pull/65001',
			author: 'veronica',
			labels: [ 'design' ],
			files: [
				'plugins/woocommerce/client/admin/client/products/product-list/index.tsx',
			],
		}, config ),
	];
	const report = buildDesignerReport( {
		config,
		candidates,
		adapterMatches: matchPatchAdapters( candidates, config ),
		gate: {
			status: 'merge',
			checks: [
				{ name: 'Build', ok: true },
				{ name: 'PHP syntax', ok: true },
			],
		},
		now: new Date( '2026-06-25T00:00:00Z' ),
	} );

	assert.match( report, /Future Woo intake report/ );
	assert.match( report, /Auto-merge gate: merge/ );
	assert.match( report, /Add DataViews products table behind feature flag/ );
	assert.match( report, /Products table: DataViews/ );
	assert.match( report, /Patch adapters/ );
	assert.match( report, /Products table: DataViews adapter/ );
	assert.match( report, /Designer review paths/ );
} );

test( 'matches patch adapters to the Woo PRs they can translate', () => {
	const candidates = selectCandidates( [
		{
			number: 65001,
			title: 'Add DataViews products table behind feature flag',
			author: 'veronica',
			labels: [ 'design' ],
			files: [
				'plugins/woocommerce/client/admin/client/products/product-list/index.tsx',
			],
		},
	], config );

	const adapterMatches = matchPatchAdapters( candidates, config );

	assert.equal( adapterMatches.length, 1 );
	assert.equal( adapterMatches[ 0 ].adapterId, 'products-dataviews-table' );
	assert.equal( adapterMatches[ 0 ].status, 'planned' );
	assert.equal( adapterMatches[ 0 ].candidate.number, 65001 );
	assert.deepEqual( adapterMatches[ 0 ].matchedBy, [
		'path: plugins/woocommerce/client/admin/client/products',
		'keyword: products table',
		'keyword: dataviews',
		'author: veronica',
	] );
} );
