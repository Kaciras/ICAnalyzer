import { butteraugli, getPSNR } from "../web/similarity";
import { readImage } from "./test-helper";

it("should get butteraugli source & heatMap", async () => {
	const { data, info } = await readImage("image.jpg");
	const dataB = (await readImage("image.webp")).data;
	const expectdHeatMap = (await readImage("heatMap.png")).data;

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
