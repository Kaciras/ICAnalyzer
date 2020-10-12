const path = require("path");
const WorkerPlugin = require("worker-plugin");
const HtmlPlugin = require("html-webpack-plugin");

module.exports = function(env) {
	const isProd = env?.production;

	return {
		mode: isProd ? "production" : "development",
		context: __dirname,
		entry: {
			index: "./web/index",
		},
		devtool: isProd ? "source-map" : "inline-source-map",
		resolve: {
			extensions: [".tsx", ".ts", ".mjs", ".js", ".json"],
			fallback: {
				fs: false,
				path: false,
			},
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
				chunks: "all",
			},
		},
		devServer: {
			compress: true,
			stats: "minimal",
			clientLogLevel: "none",
		},
	};
};
