/**
 * Future Woo build — a webpack multi-compiler (array) config so two
 * independent surfaces build from one `wp-scripts build`:
 *
 *  1. Settings  (src/settings/index.js)  → assets/js/settings/settings-general.js
 *     Plain @wordpress/scripts default config. Behaviour is byte-identical to
 *     the previous CLI-arg build, so the existing Settings surface is untouched.
 *
 *  2. Campaigns (src/campaigns/index.tsx) → assets/js/campaigns/index.js
 *     Vendored from the standalone `multichannel-campaigns` prototype. Uses the
 *     WooCommerce dependency-extraction plugin so @woocommerce/* resolve to the
 *     wc-admin global, with an exception: @wordpress/dataviews and @wordpress/ui
 *     aren't registered as script handles on this WP/Gutenberg yet, so we bundle
 *     them. Drop entries from BUNDLED_PACKAGES as those handles ship upstream.
 *
 *  3. Analytics > Marketing (src/analytics/index.tsx) →
 *     assets/js/analytics/index.js
 *     A wc-admin report page using the same dependency strategy as Campaigns.
 */
const path = require( 'path' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const WooCommerceDependencyExtractionWebpackPlugin = require( '@woocommerce/dependency-extraction-webpack-plugin' );

const BUNDLED_PACKAGES = new Set( [
	'@wordpress/dataviews',
	'@wordpress/ui',
] );

const getWooAdminPlugins = () => [
	...defaultConfig.plugins.filter(
		( p ) => p.constructor.name !== 'DependencyExtractionWebpackPlugin'
	),
	new WooCommerceDependencyExtractionWebpackPlugin( {
		requestToExternal( request ) {
			if ( BUNDLED_PACKAGES.has( request ) ) {
				return false;
			}
		},
		requestToHandle( request ) {
			if ( BUNDLED_PACKAGES.has( request ) ) {
				return false;
			}
		},
	} ),
];

// Surface 1 — Settings. Default config, explicit entry + output path so it
// keeps landing exactly where class-wc-settings-modern.php enqueues it from.
const settingsConfig = {
	...defaultConfig,
	entry: {
		'settings-general': path.resolve( __dirname, 'src/settings/index.js' ),
	},
	output: {
		...defaultConfig.output,
		path: path.resolve( __dirname, 'assets/js/settings' ),
		filename: '[name].js',
	},
};

// Surface 2 — Campaigns. Swap the default dependency-extraction plugin for the
// WooCommerce one, keeping @wordpress/ui + dataviews bundled.
const campaignsConfig = {
	...defaultConfig,
	entry: {
		index: path.resolve( __dirname, 'src/campaigns/index.tsx' ),
	},
	output: {
		...defaultConfig.output,
		path: path.resolve( __dirname, 'assets/js/campaigns' ),
		filename: '[name].js',
	},
	plugins: getWooAdminPlugins(),
};

// Surface 3 — Analytics > Marketing. A wc-admin report page that uses the
// multichannel demo data but lives under the native Analytics drilldown.
const analyticsConfig = {
	...defaultConfig,
	entry: {
		index: path.resolve( __dirname, 'src/analytics/index.tsx' ),
	},
	output: {
		...defaultConfig.output,
		path: path.resolve( __dirname, 'assets/js/analytics' ),
		filename: '[name].js',
	},
	plugins: getWooAdminPlugins(),
};

module.exports = [ settingsConfig, campaignsConfig, analyticsConfig ];
