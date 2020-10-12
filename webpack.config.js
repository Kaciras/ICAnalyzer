const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WorkerPlugin = require("worker-plugin");
const HtmlPlugin = require("html-webpack-plugin");

module.exports = function (env) {
	const isProd = env?.production;

	function cssLoaderChain(cssModules) {
		const outputLoader = isProd ? MiniCssExtractPlugin.loader : "style-loader";

		const cssLoader = {
			loader: "css-loader",
			options: {
				importLoaders: 1,
			},
		};
		if (cssModules) {
			cssLoader.options.modules = {
				localIdentName: isProd ? "[hash:base64:5]" : "[local]_[hash:base64:5]",
			};
		}
		return [outputLoader, cssLoader, "sass-loader"];
	}

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
				path: false,
				fs: false,
				crypto: false,
			},
		},
		cache: {
			type: "filesystem",
			buildDependencies: {
				config: [__filename],
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
							use: cssLoaderChain(true),
						},
						{
							test: /\.(scss|sass)$/,
							use: cssLoaderChain(false),
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

			// Replace with webpack5 native worker support ?
			new WorkerPlugin({
				globalObject: "self",
			}),

			new HtmlPlugin({
				filename: "index.html",
				template: "web/index.html",
				inject: "head",
				scriptLoading: "defer",
			}),

			isProd && new MiniCssExtractPlugin({
				filename: "[name].[contenthash:5].css",
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
		performance: false,
	};
};
