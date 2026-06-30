import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const campaignsList = readFileSync( 'src/campaigns/CampaignsList.tsx', 'utf8' );
const overviewChannels = readFileSync(
	'src/campaigns/MarketingOverviewChannels.tsx',
	'utf8'
);
const campaignStyles = readFileSync( 'src/campaigns/style.scss', 'utf8' );
const dataviewsWrapperRule =
	campaignStyles.match( /\.mcc-page \.dataviews-wrapper\s*{(?<body>[^}]*)}/ )
		?.groups?.body || '';

test( 'campaign rollup deltas are hidden when there is no rollup activity', () => {
	assert.ok(
		overviewChannels.includes( 'hasRollupActivity' ),
		'Overview performance summary should detect whether there is activity before rendering comparisons'
	);
	assert.ok(
		overviewChannels.includes(
			"delta: hasRollupActivity ? '+1 vs last month' : undefined"
		),
		'Active campaigns should not show a comparison when the rollup is empty'
	);
	assert.ok(
		overviewChannels.includes(
			"delta: hasRollupActivity ? '+18%' : undefined"
		),
		'Sessions should not show a comparison when the rollup is empty'
	);
} );

test( 'Marketing Overview performance summary links to Marketing analytics details', () => {
	assert.ok(
		overviewChannels.includes( 'View detailed stats' ),
		'Overview performance summary should reuse the Woo Home detailed-stats affordance'
	);
	assert.ok(
		overviewChannels.includes(
			'admin.php?page=wc-admin&path=/analytics/marketing'
		),
		'Overview performance summary should link to Analytics > Marketing, not generic analytics'
	);
	assert.ok(
		overviewChannels.includes( 'mcc-rollup-summary__link' ),
		'the analytics link should have a stable class for compact header styling'
	);
} );

test( 'Campaigns page leaves performance summary to Marketing Overview', () => {
	assert.doesNotMatch(
		campaignsList,
		/<RollupTiles\s*\/>/,
		'Campaigns should render DataViews directly after the page header'
	);
	assert.doesNotMatch(
		campaignsList,
		/const RollupTiles/,
		'Campaigns should not own the performance summary component'
	);
	assert.doesNotMatch(
		campaignsList,
		/mcc-rollup-summary|Campaign performance|View detailed stats/,
		'Campaigns should not include overview-summary UI copy'
	);
} );

test( 'campaign table is not enclosed in a clipping card wrapper', () => {
	assert.ok(
		dataviewsWrapperRule.includes( 'background: transparent' ),
		'DataViews should sit on the page surface, not inside another white card'
	);
	assert.ok(
		dataviewsWrapperRule.includes( 'border: 0' ),
		'DataViews should not get an extra enclosing border'
	);
	assert.ok(
		dataviewsWrapperRule.includes( 'box-shadow: none' ),
		'DataViews should not get an extra card shadow'
	);
	assert.ok(
		dataviewsWrapperRule.includes( 'overflow: visible' ),
		'DataViews should not clip columns at the right edge'
	);
	assert.ok(
		dataviewsWrapperRule.includes(
			'margin-left: calc(var(--mcc-content-gutter, 32px) * -1)'
		),
		'DataViews should step outside the metric-card gutter and use the full page width'
	);
	assert.ok(
		dataviewsWrapperRule.includes(
			'margin-right: calc(var(--mcc-content-gutter, 32px) * -1)'
		),
		'DataViews should reclaim the right gutter so the actions column remains visible'
	);
	assert.doesNotMatch(
		dataviewsWrapperRule,
		/border-radius:|overflow:\s*hidden|border:\s*1px/,
		'DataViews should keep its native full-width table layout instead of a card frame'
	);
} );
