import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

const loadMarketingAnalytics = () => {
	const php = [
		"define( 'ABSPATH', getcwd() . '/' );",
		"require getcwd() . '/includes/class-mcc-data.php';",
		'echo json_encode( MCC_Data::get_marketing_analytics() );',
	].join( ' ' );

	return JSON.parse(
		execFileSync( 'php', [ '-r', php ], {
			cwd: process.cwd(),
			encoding: 'utf8',
		} )
	);
};

test( 'marketing analytics demo data supports the Analytics > Marketing page', () => {
	const data = loadMarketingAnalytics();

	assert.equal( data.period.label, 'Last 30 days' );
	assert.ok( data.summary.sales_from_ads > 0 );
	assert.ok( data.summary.ad_spend > 0 );
	assert.ok( data.summary.orders_from_ads > 0 );
	assert.ok( data.summary.visitors_from_ads > 0 );
	assert.ok( data.summary.reach > data.summary.visitors_from_ads );
	assert.ok( data.summary.ad_cost_percent > 0 );

	assert.equal( data.visitor_quality.total_visitors, 13200 );
	assert.ok(
		data.visitor_quality.ad_conversion_rate >
			data.visitor_quality.other_conversion_rate
	);

	assert.ok( Array.isArray( data.channels ) );
	assert.equal( data.channels.length, 3 );

	for ( const channel of data.channels ) {
		assert.equal( typeof channel.id, 'string' );
		assert.equal( typeof channel.name, 'string' );
		assert.equal( typeof channel.category, 'string' );
		assert.equal( typeof channel.recommendation, 'string' );
		assert.equal( channel.sales_data.length, 7 );
		assert.equal( channel.spend_data.length, 7 );
		assert.ok( channel.revenue > channel.spend );
		assert.ok( channel.budget >= channel.spend );
	}

	assert.ok( Array.isArray( data.recommended_actions ) );
	assert.equal( data.recommended_actions.length, 3 );
	assert.ok(
		data.recommended_actions.some(
			( action ) => action.type === 'budget_shift'
		)
	);
} );
