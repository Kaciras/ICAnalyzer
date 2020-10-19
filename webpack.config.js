const { join } = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WorkerPlugin = require("worker-plugin");
const HtmlPlugin = require("html-webpack-plugin");

module.exports = function webpackConfig(env) {
	const isProd = Boolean(env?.production);

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

	const loaders =  [
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
			test: /\.wasm$/,
			type: "asset/resource",
		},
		{
			test: /\.svg$/,
			use: "@svgr/webpack",
		},
		{
			oneOf: [
				{
					test: /\.(scss|sass)$/,
					include: join(__dirname, "web", "component"),
					use: cssLoaderChain(true),
				},
				{
					test: /\.(scss|sass)$/,
					use: cssLoaderChain(false),
				},
			],
		},
	];

	const plugins = [

		// Replace with webpack5 native worker support?
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
	];

	return {
		mode: isProd ? "production" : "development",
		context: __dirname,
		performance: false,
		entry: {
			index: "./web/index",
		},
		output: {
			assetModuleFilename: "[name].[hash:5][ext][query]",
		},
		devtool: isProd ? "source-map" : "inline-source-map",
		devServer: {
			compress: true,
			hot: true,
			stats: "minimal",
			clientLogLevel: "none",
		},
		resolve: {
			extensions: [".tsx", ".ts", ".mjs", ".js", ".json"],
			alias: {
				squoosh: join(__dirname, "deps/squoosh"),
			},
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
		optimization: {
			splitChunks: {
				chunks: "all",
			},
		},
		module: {
			rules: loaders,
		},
		plugins: plugins.filter(Boolean),
	};
};
