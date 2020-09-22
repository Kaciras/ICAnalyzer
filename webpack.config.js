const path = require("path");
const WorkerPlugin = require("worker-plugin");
const HtmlPlugin = require("html-webpack-plugin");


module.exports = {
	mode: "development",
	context: __dirname,
	entry: {
		index: "./web/index",
	},
	output: {
		path: path.resolve(__dirname, "build"),
		filename: "[name].js",
	},
	devtool: "source-map",
	resolve: {
		extensions: [".ts", ".mjs", ".js", ".json"],
		alias: {
			echarts: "echarts/echarts.common.js",
		}
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: {
					loader: "ts-loader",
					options: {
						transpileOnly: true,
					},
				},
			},
			{
				test: /\.wasm$/,
				type: "javascript/auto",
				loader: "file-loader",
				options: {
					name: "[name].[hash:5].[ext]",
				},
			},
		],
	},
	plugins: [
		new WorkerPlugin(),

		new HtmlPlugin({
			filename: "index.html",
			template: "web/index.html",
			inject: "head",
			scriptLoading: "defer",
		}),
	],
	optimization: {
		splitChunks: {
			cacheGroups: {
				vendor:{
					name: "vendors",
					test: /[\\/]node_modules[\\/]/,
					priority: -10,
					chunks: "initial",
				}
			}
		}
	},
	node: {
		fs: "empty",
		crypto: "empty",
		path: "empty",
		__filename: "mock",
		__dirname: "mock",
		process: false,
		Buffer: false,
		setImmediate: false,
		console: false,
	},
};
