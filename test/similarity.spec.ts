import { join } from "path";
import sharp from "sharp";
import fs from "fs";
import { butteraugli, getPSNR } from "../web/similarity";

function fixture(name: string) {
	return join(__dirname, "fixtures", name);
}

async function readImage(name: string) {
	return await sharp(fixture(name))
		.raw()
		.toBuffer({ resolveWithObject: true });
}

it("should get butteraugli source & heatMap", async () => {
	const { data, info } = await readImage("image.jpg");
	const dataB = (await readImage("image.webp")).data;
	const expectdHeatMap = (await readImage("heatMap.png")).data;

	fs.writeFileSync("jpeg.data", data);
	fs.writeFileSync("webp.data", dataB);

	const { width, height } = info;
	const [source, heatMap] = await butteraugli({ dataA: data, dataB, width, height });

	expect(source).toBeCloseTo(3.297, 2);
	expect(Buffer.from(heatMap)).toStrictEqual(expectdHeatMap);
});

it("should get PSNR", async () => {
	const { data, info } = await readImage("image.jpg");
	const dataB = (await readImage("image.webp")).data;

	const { width, height } = info;
	const psnr = await getPSNR({ dataA: data, dataB, width, height });

	expect(psnr).toBeCloseTo(35.778, 2);
});
