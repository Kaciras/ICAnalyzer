import { dirname, join } from "path";
import sharp, { Raw } from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function fixturePath(name: string) {
	return join(__dirname, "fixtures", name);
}

export async function readImage(name: string, scale = 1.0) {
	const image = sharp(fixturePath(name));

	if (scale !== 1) {
		const { width, height } = await image.metadata();
		image.resize({ width: width! * scale, height: height! * scale });
	}

	const { data, info } = await image
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	const returnValue = { data, width: info.width, height: info.height };
	return returnValue as unknown as ImageData;
}

export function saveImage(file: string, buffer: ArrayBuffer, width: number, height: number) {
	const channels = buffer.byteLength / width / height;
	const raw = { width, height, channels } as Raw;
	return sharp(Buffer.from(buffer), { raw }).png().toFile(file);
}
