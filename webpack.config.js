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
		extensions: [".tsx", ".ts", ".mjs", ".js", ".json"],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: {
					loader: "ts-loader",
					options: {
						compilerOptions: {
							module: "ESNext",
						},
						transpileOnly: true,
					},
				},
			},
			{
				oneOf: [
					{
						test: /\.(scss|sass)$/,
						include: path.join(__dirname, "web", "component"),
						use: [
							"style-loader",
							{
								loader: "css-loader",
								options: {
									modules: {
										localIdentName: "[name]_[local]_[hash:base64:5]",
									},
								},
							},
							"sass-loader",
						],
					},
					{
						test: /\.(scss|sass)$/,
						use: [
							"style-loader",
							"css-loader",
							"sass-loader",
						],
					},
				],
			},
			{
				test: /\.wasm$/,
				type: "javascript/auto",
				loader: "file-loader",
				options: {
					name: "[name].[hash:5].[ext]",
				},
			},
			{
				test: /\.svg$/,
				loader: "svg-inline-loader",
			},
		],
	},
	plugins: [
		new WorkerPlugin({
			globalObject: "self",
		}),

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
				vendor: {
					name: "vendors",
					test: /[\\/]node_modules[\\/]/,
					priority: -10,
					chunks: "initial",
				},
			},
		},
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
	devServer: {
		compress: true,
		stats: "minimal",
		clientLogLevel: "none",
	},
};
