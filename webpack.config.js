const { join } = require("path");
const { EnvironmentPlugin } = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlPlugin = require("html-webpack-plugin");
const ReactRefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = function webpackConfig(env) {
	const isProd = Boolean(env?.production);
	const isDevelopment = !isProd;

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

	const loaders = [
		{
			test: /\.tsx?$/,
			use: [
				isDevelopment && {
					loader: "babel-loader",
					options: {
						plugins: ["react-refresh/babel"],
					},
				},
				{
					loader: "ts-loader",
					options: {
						compilerOptions: {
							module: "ESNext",
						},
						transpileOnly: true,
					},
				},
			].filter(Boolean),
		},
		{
			test: /\.wasm$/,
			type: "asset/resource",
		},
		{
			test: /\.svg$/,
			use: {
				loader: "@svgr/webpack",
				options: {
					svgoConfig: {
						plugins: [
							{ removeViewBox: false },
						],
					},
					svgProps: {
						fill: "currentColor",
						width: "1em",
						height: "1em",
					},
				},
			},
		},
		{
			test: /\.(?:jpg|png|gif)$/,
			type: "asset/resource",
		},
		{
			oneOf: [
				{
					test: /\.(scss|sass)$/,
					include: [
						join(__dirname, "web", "app"),
						join(__dirname, "web", "ui"),
						join(__dirname, "web", "form"),
					],
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
		new EnvironmentPlugin(["npm_package_name", "npm_package_version"]),

		new HtmlPlugin({
			filename: "index.html",
			template: "web/index.html",
			inject: "head",
			scriptLoading: "defer",
		}),

		isProd && new BundleAnalyzerPlugin({
			openAnalyzer: false,
			analyzerMode: "static",
		}),

		isProd && new MiniCssExtractPlugin({
			filename: "[name].[contenthash:5].css",
		}),

		isDevelopment && new ReactRefreshPlugin(),
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
			clean: true,
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
				worker_threads: false, // required by wasm-feature-detect
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
