import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = ( path ) => readFileSync( path, 'utf8' );

test( 'Analytics > Marketing uses the shared page header for title and actions', () => {
	const analyticsPage = read( 'src/analytics/index.tsx' );
	const customHeader = read( 'includes/class-custom-header.php' );

	assert.ok(
		! analyticsPage.includes( 'fwa-marketing-report-header' ),
		'the React report should not render a second page header'
	);
	assert.ok(
		customHeader.includes( "'/analytics/marketing'" ),
		'the shared header should special-case the Marketing analytics route'
	);
	assert.match(
		customHeader,
		/Analytics.*war-page-header__breadcrumb-sep.*Marketing/s,
		'the shared header should render an Analytics / Marketing breadcrumb'
	);
	assert.ok(
		customHeader.includes( 'fwa-marketing-analytics-header-actions' ),
		'the shared header should expose a Marketing analytics action group'
	);
	assert.ok(
		customHeader.includes( 'Last 30 days' ) &&
			customHeader.includes( 'Download report' ),
		'the date and download controls should live in the shared header'
	);
} );
