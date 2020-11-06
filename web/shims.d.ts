declare module "worker-plugin/loader*" {
	const url: string;
	export default url;
}

declare module "*.wasm" {
	const url: string;
	export default url;
}

declare module "*.jpg" {
	const url: string;
	export default url;
}

declare module "*.png" {
	const url: string;
	export default url;
}

declare module "*.gif" {
	const url: string;
	export default url;
}

declare module "*.scss" {
	const classes: {
		readonly [key: string]: string;
	};
	export default classes;
}

declare module "*.svg" {
	const svgXml: string;
	export default svgXml;
}
