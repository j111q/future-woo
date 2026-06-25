import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = ( path ) => readFileSync( path, 'utf8' );

test( 'Analytics > Marketing follows the CIAB-style dashboard contract', () => {
	const analyticsPage = read( 'src/analytics/index.tsx' );
	const analyticsStyles = read( 'src/analytics/style.scss' );
	const customHeader = read( 'includes/class-custom-header.php' );

	assert.match(
		analyticsPage,
		/const MARKETING_WIDGETS\s*:/,
		'the page should define widgets through a local registry'
	);
	assert.match(
		analyticsPage,
		/name:\s*'marketing\/performance-overview'/,
		'the primary overview should be registered as a named widget'
	);
	assert.match(
		analyticsPage,
		/name:\s*'marketing\/channel-performance'/,
		'the channel table should be registered as a named widget'
	);
	assert.match(
		analyticsPage,
		/MARKETING_WIDGETS\.map/,
		'the board should render from the widget registry instead of hand-placing each widget'
	);
	assert.ok(
		! analyticsPage.includes( '<MetricWidget' ),
		'the KPI row should be folded into the at-a-glance performance widget'
	);
	assert.ok(
		analyticsPage.includes( 'MarketingPerformanceWidget' ) &&
			analyticsPage.includes( 'fwa-marketing-metric-tabs' ),
		'the primary widget should combine metric tabs and charting'
	);
	assert.match(
		analyticsPage,
		/const MARKETING_DATE_RANGES(?:[^=]*)=/,
		'the page should model date range as page-level state'
	);
	assert.match(
		analyticsPage,
		/useState<\s*string\s*>\(\s*data\?\.period\.label\s*\?\?/,
		'the selected date range should be passed into widgets from page state'
	);
	assert.ok(
		customHeader.includes( 'fwa-marketing-analytics-date-range' ) &&
			customHeader.includes( 'fwa-marketing-analytics-date-range-change' ),
		'the shared page header should dispatch date range changes to the dashboard'
	);
	assert.ok(
		analyticsPage.includes( 'data-widget-name={ name }' ) &&
			analyticsPage.includes( 'fwa-marketing-widget__info' ) &&
			analyticsPage.includes( 'fwa-marketing-widget__state' ),
		'the shared widget shell should expose metadata, info, and state UI'
	);
	assert.match(
		analyticsStyles,
		/\.fwa-marketing-performance-widget\s*\{/,
		'the at-a-glance widget should have dedicated layout styles'
	);
	assert.match(
		analyticsStyles,
		/\.fwa-marketing-performance-widget\s*\{[^}]*grid-template-columns:\s*1fr/s,
		'the at-a-glance metrics should sit above the chart, not in a left rail'
	);
	assert.match(
		analyticsStyles,
		/\.fwa-marketing-metric-tabs\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s,
		'the metric controls should use the CIAB horizontal tab layout on desktop'
	);
	assert.ok(
		! analyticsPage.includes( 'fwa-marketing-selected-metric' ),
		'the visible selected-metric helper text should not appear between the metrics and chart'
	);
	assert.ok(
		analyticsStyles.includes( 'box-shadow: inset 0 0 0 1px var(--fwa-marketing-brand)' ) &&
			! analyticsStyles.includes( 'inset 3px 0 0 var(--fwa-marketing-brand)' ),
		'the active metric should use the CIAB outline treatment instead of a left accent bar'
	);
	assert.match(
		analyticsStyles,
		/\.fwa-marketing-widget__state\s*\{/,
		'the shared widget shell should style loading, empty, and error states'
	);
} );
