/// <binding />
"use strict";

// ReSharper disable UndeclaredGlobalVariableUsing
var webpack = require("webpack");
var path = require("path");

// definePlugin takes raw strings and inserts them, so you can put strings of JS if you want.
var definePlugin = new webpack.DefinePlugin({
	__DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
	__PRERELEASE__: JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false'))
});

const config = {
	entry: [
		"./src/js/index"
	],
	output: {
		path: __dirname,
		filename: "dist/bundle.js"
	},
	plugins: [
		definePlugin
	],
	module: {
		loaders: [
			{ test: /\.jsx?$/, loader: "babel-loader", query: { presets: ['es2015', 'stage-1', 'react'] } },
			{ test: /\.css$/, loader: 'style-loader!css-loader' },
			{ test: /\.png$/, loader: "url-loader?limit=100000" },
			{ test: /\.jpg$/, loader: "file-loader" },
			{ test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff' },
			{ test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/octet-stream' },
			{ test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader' },
			{ test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml' }
		]
	},
	resolve: {
		// you can now require('file') instead of require('file.coffee')
		extensions: ['.js', '.json', '.jsx'],
		modules: ["node_modules", path.resolve('./src/js'), path.resolve('./src/css')],
		alias: {
			"underscore": "lodash"
		}
	}
};

if (process.env.NODE_ENV === 'production') {
	// Production mode
	//config.output.publicPath = '/';
	//config.module.loaders.push({ test: /\.jsx?$/, loader: "babel-loader", query: { presets: ['es2015', 'react'] } });
} else {
	// Dev Mode

	//config.devtool = "#cheap-module-source-map";
	config.devServer = {
		contentBase: ".",
		host: "localhost",
		port: 9000
	};

	config.plugins.push(
		new webpack.HotModuleReplacementPlugin()
	);

	config.entry.push(
		'webpack-dev-server/client?http://0.0.0.0:9000', // WebpackDevServer host and port
		'webpack/hot/only-dev-server' // "only" prevents reload on syntax errors
	);

	config.output.publicPath = 'http://localhost:9000/';
	//config.module.loaders.push({ test: /\.jsx?$/, loaders: ['react-hot-loader', 'babel-loader?presets[]=react,presets[]=es2015'] });
}

module.exports = config;