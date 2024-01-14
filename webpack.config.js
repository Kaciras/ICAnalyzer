import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlPlugin from "html-webpack-plugin";
import ReactRefreshPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// css-minimizer-webpack-plugin is ineffective (index.css 27898 bytes -> 27540 bytes), so we not use it.

export default function (env) {
	const shouldReport = Boolean(env?.report);
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
				hashStrategy: "minimal-subset",
				localIdentName: isProd ? "[hash:base64:5]" : "[local]_[hash:base64:5]",
			};
		}
		return [outputLoader, cssLoader, "sass-loader"];
	}

	const loaders = [
		{
			test: /\.[jt]sx?$/,
			use: "swc-loader",
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
							{
								name: "preset-default",
								params: {
									overrides: {
										removeViewBox: false,
									},
								},
							},
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
			test: /\.s?css$/,
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
					test: /\.module\.s?css/,
					use: cssLoaderChain(true),
				},
				{
					use: cssLoaderChain(false),
				},
			],
		},
	];

	const plugins = [
		new webpack.EnvironmentPlugin({ SENTRY_DSN: null }),

		new HtmlPlugin({ template: "web/index.html" }),

		shouldReport && new BundleAnalyzerPlugin({
			openAnalyzer: false,
			analyzerMode: "static",
		}),

		isProd && new MiniCssExtractPlugin({
			filename: "s/[name].css",
		}),

		isDevelopment && new ReactRefreshPlugin(),
	];

	return {
		mode: isProd ? "production" : "development",
		context: __dirname,
		entry: {
			check: "./web/support-check.ts",
			index: "./web/index.tsx",
		},
		output: {
			filename: "s/[name].js",
			assetModuleFilename: "s/[name][ext]",
			clean: true,
			hashFunction: "xxhash64",
		},
		devtool: isProd ? "source-map" : "cheap-module-source-map",
		resolve: {
			extensions: [".tsx", ".ts", ".js", ".json"],
			alias: {
				squoosh: join(__dirname, "deps/squoosh"),
			},
			fallback: {
				path: false,
				fs: false,
				crypto: false,
				module: false,

				// Required by wasm-feature-detect
				worker_threads: false,
			},
		},
		module: {
			rules: loaders,
		},
		plugins: plugins.filter(Boolean),
		optimization: {
			minimizer: [
				new TerserPlugin({ minify: TerserPlugin.swcMinify }),
			],
			splitChunks: {
				chunks: "all",
			},
			// Set it to single fixes hot reloading with multiple entries.
			// https://github.com/webpack/webpack-dev-server/issues/2792
			runtimeChunk: "single",
		},
		cache: {
			type: "filesystem",
			buildDependencies: {
				config: [
					__filename,
					resolve(__dirname, "tsconfig.json"),
				],
			},
		},
		performance: false,
		stats: "minimal",
		devServer: {
			static: false,
			hot: true,
			client: {
				logging: "none",
			},
			// Required by SharedArrayBuffer
			headers: {
				"Cross-Origin-Opener-Policy": "same-origin",
				"Cross-Origin-Embedder-Policy": "require-corp",
			},
		},
	};
}
