import assert from 'node:assert/strict';
import test from 'node:test';

import {
	buildDesignerReport,
	buildPullRequestSearchQueries,
	classifySurfaceDecisions,
	forceEnabledFlags,
	loadConfigFromString,
	matchPatchAdapters,
	resolveGateStatus,
	scorePullRequest,
	selectCandidates,
} from '../scripts/woo-intake/lib.mjs';

const config = loadConfigFromString( JSON.stringify( {
	wooRepository: 'woocommerce/woocommerce',
	minimumScore: 3,
	pullRequestSearches: [
		{
			id: 'recent-woo-activity',
			label: 'All recent Woo PR activity',
			state: 'all',
			dateQualifier: 'updated',
			lookbackDays: 7,
			limit: 2000,
		},
	],
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
	surfacePolicies: [
		{
			id: 'analytics-dashboard',
			label: 'Analytics dashboard',
			mode: 'vision-owned',
			owner: 'Jill',
			reviewPath: 'Analytics',
			matches: {
				paths: [ 'plugins/woocommerce/client/admin/client/analytics' ],
				keywords: [ 'analytics dashboard', 'analytics' ],
			},
			intake: {
				bugfix: 'report-only',
				'feature-flag': 'draft-pr',
				default: 'report-only',
			},
			notes: [
				'Future Woo owns a super-future version of this surface.',
			],
		},
		{
			id: 'products-table',
			label: 'Products table',
			mode: 'hybrid',
			owner: 'Future Woo',
			reviewPath: 'Products > All Products',
			matches: {
				paths: [ 'plugins/woocommerce/client/admin/client/products' ],
				keywords: [ 'products table', 'dataviews' ],
			},
			intake: {
				bugfix: 'self-merge',
				'feature-flag': 'draft-pr',
				default: 'draft-pr',
			},
		},
		{
			id: 'settings',
			label: 'Settings screens',
			mode: 'mirror-owned',
			owner: 'Woo core',
			reviewPath: 'WooCommerce > Settings',
			matches: {
				paths: [ 'plugins/woocommerce/client/admin/client/settings' ],
			},
			intake: {
				bugfix: 'self-merge',
				default: 'self-merge',
			},
		},
	],
} ) );

test( 'builds pull request searches for all recent Woo PR activity', () => {
	const searches = buildPullRequestSearchQueries( config, {
		now: new Date( '2026-06-25T00:00:00Z' ),
	} );

	assert.deepEqual( searches, [
		{
			id: 'recent-woo-activity',
			label: 'All recent Woo PR activity',
			state: 'all',
			limit: 2000,
			query: 'updated:>=2026-06-18',
		},
	] );
} );

test( 'lets manual since run the prototype-baseline backfill', () => {
	const searches = buildPullRequestSearchQueries( config, {
		now: new Date( '2026-06-25T00:00:00Z' ),
		since: '2026-04-15',
	} );

	assert.equal( searches[ 0 ].query, 'updated:>=2026-04-15' );
} );

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

test( 'classifies surface ownership decisions for super-future surfaces', () => {
	const candidates = [
		scorePullRequest( {
			number: 65011,
			title: 'Fix Analytics chart empty-state bug',
			author: 'woocommerce-dev',
			labels: [ 'bug' ],
			files: [
				'plugins/woocommerce/client/admin/client/analytics/report/index.tsx',
			],
		}, config ),
		scorePullRequest( {
			number: 65012,
			title: 'Add Analytics dashboard refresh behind feature flag',
			author: 'woocommerce-dev',
			labels: [ 'experimental' ],
			files: [
				'plugins/woocommerce/client/admin/client/analytics/components/dashboard.tsx',
			],
		}, config ),
		scorePullRequest( {
			number: 65013,
			title: 'Fix Settings layout regression',
			author: 'woocommerce-dev',
			labels: [ 'bug' ],
			files: [
				'plugins/woocommerce/client/admin/client/settings/payments/index.tsx',
			],
		}, config ),
	];

	const decisions = classifySurfaceDecisions( candidates, config );

	assert.deepEqual(
		decisions.map( ( decision ) => ( {
			number: decision.candidate.number,
			surface: decision.surfaceId,
			intent: decision.intent,
			action: decision.action,
		} ) ),
		[
			{
				number: 65011,
				surface: 'analytics-dashboard',
				intent: 'bugfix',
				action: 'report-only',
			},
			{
				number: 65012,
				surface: 'analytics-dashboard',
				intent: 'feature-flag',
				action: 'draft-pr',
			},
			{
				number: 65013,
				surface: 'settings',
				intent: 'bugfix',
				action: 'self-merge',
			},
		]
	);
} );

test( 'uses surface decisions to hold risky auto-merges', () => {
	const draftDecision = {
		action: 'draft-pr',
	};
	const reportOnlyDecision = {
		action: 'report-only',
	};

	assert.equal( resolveGateStatus( 'merge', [ draftDecision ] ), 'hold' );
	assert.equal( resolveGateStatus( 'merge', [ reportOnlyDecision ] ), 'merge' );
	assert.equal( resolveGateStatus( 'hold', [] ), 'hold' );
} );

test( 'adds surface ownership decisions to the designer report', () => {
	const candidates = [
		scorePullRequest( {
			number: 65011,
			title: 'Fix Analytics chart empty-state bug',
			url: 'https://github.com/woocommerce/woocommerce/pull/65011',
			author: 'woocommerce-dev',
			labels: [ 'bug' ],
			files: [
				'plugins/woocommerce/client/admin/client/analytics/report/index.tsx',
			],
		}, config ),
	];
	const report = buildDesignerReport( {
		config,
		candidates,
		gate: {
			status: 'merge',
			checks: [
				{ name: 'Build', ok: true },
			],
		},
		now: new Date( '2026-06-25T00:00:00Z' ),
	} );

	assert.match( report, /Surface ownership policy/ );
	assert.match( report, /Analytics dashboard/ );
	assert.match( report, /Mode: vision-owned/ );
	assert.match( report, /Intent: bugfix/ );
	assert.match( report, /Action: report-only/ );
	assert.match( report, /Future Woo owns a super-future version/ );
} );
