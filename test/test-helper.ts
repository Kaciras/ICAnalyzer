import { join } from "path";
import sharp from "sharp";

export function fixturePath(name: string) {
	return join(__dirname, "fixtures", name);
}

export async function readImage(name: string) {
	return await sharp(fixturePath(name))
		.raw()
		.toBuffer({ resolveWithObject: true });
}
