/// <binding />
"use strict";

var webpack = require('webpack');
var path = require('path');

// definePlugin takes raw strings and inserts them, so you can put strings of JS if you want.
var definePlugin = new webpack.DefinePlugin({
	__DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
	__PRERELEASE__: JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false'))
});

module.exports = {
	entry: [
		'webpack-dev-server/client?http://0.0.0.0:9000', // WebpackDevServer host and port
		'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
		"./src/js/jsx1"
	],
	output: {
		filename: "dist/bundle.js"
	},
	devServer: {
		contentBase: ".",
		host: "localhost",
		port: 9000
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		definePlugin
	],
	module: {
		loaders: [
			{ test: /\.jsx?$/, loaders: ['react-hot-loader', 'babel-loader?presets[]=es2015'], include: path.join(__dirname, 'src') },
			{ test: /\.jsx?$/, loader: "babel-loader", query: { presets: ['es2015', 'react'] } },
			{ test: /\.css$/, loader: 'style-loader!css-loader' }
		]
	},
	resolve: {
		// you can now require('file') instead of require('file.coffee')
		extensions: ['.js', '.json', '.jsx'],
		modules: ["node_modules", path.resolve('./src/js'), path.resolve('./src/lib'), path.resolve('./src/css')]
	}
};