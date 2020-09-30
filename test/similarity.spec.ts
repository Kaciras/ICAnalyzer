import { join } from "path";
import sharp from "sharp";
import { butteraugli, getPSNR } from "../web/similarity";

function fixture(name: string) {
	return join(__dirname, "fixtures", name);
}

async function readImage(name: string) {
	return await sharp(fixture("image.jpg"))
		.raw()
		.toBuffer({ resolveWithObject: true });
}

it("should get butteraugli source", async () => {
	const { data, info } = await readImage("image.jpg");
	const dataB = (await readImage("image.webp")).data;

	const { width, height } = info;
	const [source, heatMap] = await butteraugli({ dataA: data, dataB, width, height });

	expect(source).toBe(5);

	return sharp(Buffer.from(heatMap), { raw: { channels: 3, width, height } })
		.png()
		.toFile("heatmap.png");
});

it("should get PSNR", async () => {
	const { data, info } = await sharp(fixture("image.jpg"))
		// .ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	const dataB = await sharp(fixture("image.webp"))
		// .ensureAlpha()
		.raw()
		.toBuffer();

	const { width, height } = info;
	const psnr = await getPSNR({ dataA: data, dataB, width, height });

	expect(psnr).toBeCloseTo(40.238, 2);
});
