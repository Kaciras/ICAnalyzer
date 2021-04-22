const { join } = require("path");
const { EnvironmentPlugin } = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlPlugin = require("html-webpack-plugin");
const ReactRefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

/*
 * Webpack converts import.meta.url to a local path, this occurred on wasm bridge files:
 * https://github.com/GoogleChromeLabs/squoosh/blob/650c662ffabcd01f22adbc4299ea136df312e2ee/codecs/avif/dec/avif_dec.js#L3
 *
 * Although the value is not used at runtime, it leaks sensitive data.
 * I saw Squoosh converts them to new URL('/c/features-worker-1ff98a60.js', location).href
 * https://github.com/webpack/webpack/issues/6719
 */

// css-minimizer-webpack-plugin is ineffective (index.css 27898 bytes -> 27540 bytes), so we not use it.

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
			test: /\.(?:s?css|sass)$/,
			oneOf: [
				{
					include: [
						join(__dirname, "web", "app"),
						join(__dirname, "web", "ui"),
						join(__dirname, "web", "form"),
					],
					use: cssLoaderChain(true),
				},
				{
					use: cssLoaderChain(false),
				},
			],
		},
	];

	const plugins = [
		new EnvironmentPlugin({ SENTRY_DSN: null }),

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
			headers: {
				"Cross-Origin-Opener-Policy": "same-origin",
				"Cross-Origin-Embedder-Policy": "require-corp",
			},
			compress: true,
			hot: true,
			stats: "minimal",
			clientLogLevel: "none",
		},
		resolve: {
			extensions: [".tsx", ".ts", ".js", ".json"],
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
