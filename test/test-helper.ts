import { join } from "path";
import sharp from "sharp";

export function fixturePath(name: string) {
	return join(__dirname, "fixtures", name);
}

export async function readImage(name: string, scale = 1.0) {
	const image = sharp(fixturePath(name));

	if (scale !== 1) {
		const { width, height } = await image.metadata();
		image.resize({ width: width! * scale, height: height! * scale});
	}

	return image.raw().toBuffer({ resolveWithObject: true });
}
