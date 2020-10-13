import { OptionType } from "../component/OptionTemplate";

export interface OptionTemplate {
	label: string;
	name: string;
	type: OptionType<unknown, unknown>;
	defaultVariable?: true;
}

export function createOptionsList(template: OptionTemplate[]) {

}

export { WebPOptionsTemplate } from "./webp";
