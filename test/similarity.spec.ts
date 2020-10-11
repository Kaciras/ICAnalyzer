import { butteraugli, getPSNR, getSSIM } from "../web/similarity";
import { readImage } from "./test-helper";

it("should check image data have same length", () => {
	const dataA = Buffer.alloc(900);
	const dataB = Buffer.alloc(1200);
	const ti = { dataA, dataB, width: 30, height: 10 };

	return expect(butteraugli(ti)).rejects.toThrow();
});

it("should check image is RGB", () => {
	const dataA = Buffer.alloc(900);
	const dataB = Buffer.alloc(1200);
	const ti = { dataA, dataB, width: 30, height: 20 };

	return expect(butteraugli(ti)).rejects.toThrow();
});

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

it("should get SSIM", async () => {
	const { data, info } = await readImage("image.jpg");
	const dataB = (await readImage("image.webp")).data;

	const { width, height } = info;
	const psnr = await getSSIM({ dataA: data, dataB, width, height });

	expect(psnr).toBeCloseTo(0.99783, 4);
});
