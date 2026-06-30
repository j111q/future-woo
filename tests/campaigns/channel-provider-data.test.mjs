import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

const loadChannels = () => {
	const php = [
		"define( 'ABSPATH', getcwd() . '/' );",
		"require getcwd() . '/includes/class-mcc-data.php';",
		'echo json_encode( MCC_Data::get_channels() );',
	].join( ' ' );

	return JSON.parse(
		execFileSync( 'php', [ '-r', php ], {
			cwd: process.cwd(),
			encoding: 'utf8',
		} )
	);
};

test( 'marketing channels expose provider-row metadata', () => {
	const channels = loadChannels();
	const byId = new Map( channels.map( ( channel ) => [ channel.id, channel ] ) );

	assert.deepEqual(
		channels.map( ( channel ) => channel.id ),
		[
			'woo_ads',
			'google',
			'meta',
			'pinterest',
			'tiktok',
			'amazon',
			'ebay',
		],
		'provider rows should stay focused on external marketing and sales channels'
	);

	for ( const id of [ 'woo_ads', 'google', 'pinterest', 'amazon', 'ebay' ] ) {
		assert.ok( byId.has( id ), `expected ${ id } channel` );
	}

	for ( const channel of channels ) {
		assert.equal( typeof channel.label, 'string' );
		assert.equal( typeof channel.description, 'string' );
		assert.equal( typeof channel.action_label, 'string' );
		assert.equal( typeof channel.status, 'string' );
		assert.equal( typeof channel.category, 'string' );
		assert.ok( Array.isArray( channel.capabilities ) );
		assert.ok(
			channel.capabilities.length > 0,
			`${ channel.id } should describe channel capabilities`
		);
	}

	assert.equal( byId.get( 'woo_ads' ).label, 'Woo Ads' );
	assert.equal( byId.get( 'woo_ads' ).featured, true );
	assert.ok( byId.get( 'woo_ads' ).badges.includes( 'Official' ) );
	assert.notEqual( byId.get( 'google' ).featured, true );
	assert.ok( ! byId.get( 'google' ).badges.includes( 'Official' ) );
	assert.ok( byId.get( 'google' ).capabilities.includes( 'Product sync' ) );
	assert.equal( byId.get( 'pinterest' ).status, 'recommended' );
	assert.equal( byId.get( 'amazon' ).category, 'Marketplace' );
	assert.equal( byId.get( 'ebay' ).category, 'Marketplace' );
} );
