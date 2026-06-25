import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = ( path ) => readFileSync( path, 'utf8' );

test( 'Analytics > Marketing renders as a WPDS-style widget board', () => {
	const analyticsPage = read( 'src/analytics/index.tsx' );
	const analyticsStyles = read( 'src/analytics/style.scss' );
	const adminPage = read( 'includes/class-mcc-admin-page.php' );
	const packageJson = read( 'package.json' );

	assert.match(
		packageJson,
		/"@automattic\/charts"/,
		'the Marketing board should use the public Automattic charts package'
	);
	assert.match(
		analyticsPage,
		/import\s+\{[^}]*GlobalChartsProvider[^}]*LineChart[^}]*\}\s+from\s+'@automattic\/charts'/s,
		'the trend widget should import charts from the public top-level package'
	);
	assert.ok(
		analyticsPage.includes( "import '@automattic/charts/style.css'" ),
		'the chart package stylesheet should be loaded once for the report'
	);
	assert.ok(
		analyticsPage.includes( 'fwa-marketing-board-grid' ),
		'the page should use a dashboard-style board grid'
	);
	assert.ok(
		analyticsPage.includes( 'fwa-marketing-widget' ),
		'the board should be composed of simple widgets'
	);
	assert.ok(
		! analyticsPage.includes( '<svg' ) &&
			! analyticsPage.includes( 'fwa-marketing-chart__line' ),
		'the hand-rolled SVG trend chart should be removed'
	);
	assert.ok(
		! analyticsPage.includes( 'fwa-marketing-metric-grid' ) &&
			! analyticsPage.includes( 'fwa-marketing-report-grid' ),
		'the old report layout should be replaced by the board layout'
	);
	assert.match(
		analyticsStyles,
		/\.fwa-marketing-board-grid\s*\{/,
		'the board grid should have explicit layout styles'
	);
	assert.match(
		analyticsStyles,
		/\.fwa-marketing-widget\s*\{/,
		'the shared widget shell should have explicit styles'
	);
	assert.ok(
		adminPage.includes( 'assets/js/analytics/index.css' ),
		'the chart package stylesheet emitted by webpack should be enqueued'
	);
} );
