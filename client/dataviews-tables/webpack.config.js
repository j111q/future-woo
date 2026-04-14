const path = require( 'path' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );

module.exports = {
	entry: {
		'orders-list': './orders-list/index.tsx',
		// 'products-list': './products-list/index.tsx',  // future
		// 'customers-list': './customers-list/index.tsx', // future
	},
	output: {
		path: path.resolve( __dirname, '../../assets/js' ),
		filename: '[name]/index.js',
	},
	resolve: {
		extensions: [ '.tsx', '.ts', '.js' ],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.s?css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader',
				],
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin( {
			filename: '[name]/style.css',
		} ),
		new DependencyExtractionWebpackPlugin( {
			// Bundle @wordpress/dataviews — WP core doesn't expose it as a standalone script
			requestToExternal( request ) {
				if ( request === '@wordpress/dataviews' ) {
					return undefined;
				}
			},
			requestToHandle( request ) {
				if ( request === '@wordpress/dataviews' ) {
					return undefined;
				}
			},
		} ),
	],
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
	},
};
