import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = ( path ) => readFileSync( path, 'utf8' );

test( 'Shipping Native prototype is checked in as a Future Woo source surface', () => {
	assert.ok(
		existsSync( 'src/shipping-native/index.tsx' ),
		'Future Woo should keep Ann’s prototype as source, not only as a generated bundle'
	);

	const entry = read( 'src/shipping-native/index.tsx' );
	assert.match( entry, /ShippingNativeInlineSetup/ );
	assert.match( entry, /wss-shipping-setup-root/ );
	assert.doesNotMatch( entry, /from 'react'/ );
	assert.match( entry, /@wordpress\/element/ );
} );

test( 'Shipping Native prototype is built and enqueued from its own bundle', () => {
	const webpackConfig = read( 'webpack.config.js' );
	const shippingAdmin = read( 'includes/class-shipping-setup-admin.php' );

	assert.match( webpackConfig, /src\/shipping-native\/index\.tsx/ );
	assert.match( webpackConfig, /assets\/js\/shipping-native/ );
	assert.match( shippingAdmin, /assets\/js\/shipping-native\/index\.js/ );
	assert.match( shippingAdmin, /assets\/js\/shipping-native\/style-index\.css/ );
	assert.match( shippingAdmin, /assets\/js\/shipping-native\/index\.css/ );
	assert.doesNotMatch( shippingAdmin, /assets\/js\/shipping-setup\.js/ );
	assert.doesNotMatch( shippingAdmin, /assets\/css\/shipping-setup\.css/ );
} );

test( 'Shipping Native does not render the legacy Woo settings tab strip', () => {
	const entry = read( 'src/shipping-native/index.tsx' );
	const hostStyles = read( 'src/shipping-native/source-host-overrides.scss' );

	assert.doesNotMatch( entry, /ShippingSettingsHeader/ );
	assert.doesNotMatch( entry, /settingsTabs/ );
	assert.doesNotMatch( entry, /shipping-native-settings-tabs/ );
	assert.doesNotMatch( hostStyles, /shipping-native-settings-header/ );
	assert.doesNotMatch( hostStyles, /shipping-native-settings-tabs/ );
	assert.doesNotMatch( hostStyles, /\.war-page-header--shipping#wss-page-header,/ );
	assert.match( hostStyles, /#wss-tabs\s*\{[^}]*display:\s*none !important;/s );
} );
