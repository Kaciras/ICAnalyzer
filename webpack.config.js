const path = require("path");
const { IgnorePlugin } = require("webpack");
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
			filename: path.join(__dirname, "build/index.html"),
			template: "web/index.html",
		}),
	],
	node: {
		fs: "empty",
		__filename: "mock",
		__dirname: "mock",
	},
};
