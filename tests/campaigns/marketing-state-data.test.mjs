import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

const loadMarketingDataForState = ( state ) => {
	const php = [
		"define( 'ABSPATH', getcwd() . '/' );",
		'class WAR_Global_State_Manager { public static function get_state(): string { return ' +
			JSON.stringify( state ) +
			'; } }',
		"require getcwd() . '/includes/class-mcc-data.php';",
		'echo json_encode( array(',
		"'channels' => MCC_Data::get_channels(),",
		"'campaigns' => MCC_Data::get_campaigns(),",
		"'rollup' => MCC_Data::get_rollup(),",
		"'analytics' => MCC_Data::get_marketing_analytics(),",
		"'detail' => MCC_Data::get_campaign_detail( 1 ),",
		"'hasConnectedMarketingChannel' => MCC_Data::has_connected_channel(),",
		') );',
	].join( ' ' );

	return JSON.parse(
		execFileSync( 'php', [ '-r', php ], {
			cwd: process.cwd(),
			encoding: 'utf8',
		} )
	);
};

test( 'early store states expose marketing discovery without campaign data', () => {
	for ( const state of [ 'new_store', 'setting_up' ] ) {
		const data = loadMarketingDataForState( state );

		assert.ok(
			data.channels.length > 0,
			`${ state } should still show marketing channels for discovery`
		);
		assert.ok(
			data.channels.every( ( channel ) => channel.connected === false ),
			`${ state } should not treat discovery channels as connected`
		);
		assert.ok(
			data.channels.every(
				( channel ) => channel.action_label === 'Set up'
			),
			`${ state } should show setup CTAs on every channel`
		);
		assert.ok(
			data.channels.every(
				( channel ) => ! channel.badges.includes( 'Connected' )
			),
			`${ state } should not show connected badges on discovery channels`
		);
		assert.deepEqual( data.campaigns, [], `${ state } should have no campaigns` );
		assert.deepEqual(
			data.rollup,
			{
				active_count: 0,
				attributed_sales: 0,
				avg_roas: 0,
				sessions: 0,
			},
			`${ state } should have an empty rollup`
		);
		assert.equal( data.analytics, null, `${ state } should have no analytics` );
		assert.equal( data.detail, null, `${ state } should have no campaign detail` );
		assert.equal(
			data.hasConnectedMarketingChannel,
			false,
			`${ state } should not expose the Campaigns page`
		);
	}
} );

test( 'active store keeps the marketing prototype data', () => {
	const data = loadMarketingDataForState( 'active_store' );

	assert.ok( data.channels.length > 0 );
	assert.ok( data.campaigns.length > 0 );
	assert.ok( data.rollup.active_count > 0 );
	assert.ok( data.analytics.channels.length > 0 );
	assert.equal( data.detail.id, 1 );
	assert.equal( data.hasConnectedMarketingChannel, true );
} );
