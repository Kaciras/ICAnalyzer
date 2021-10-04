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
	import { ComponentType, SVGProps } from "react";

	const component: ComponentType<SVGProps<SVGSVGElement>>;

	export default component;
}
