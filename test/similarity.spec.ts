import { butteraugli, getPSNR, getSSIM, initWasmModule } from "../lib/similarity";
import { fixturePath, readImage } from "./test-helper";
import { TwoImages } from "../lib/metrics";
import sharp from "sharp";

let twoImages: TwoImages;

beforeAll(async () => {
	await initWasmModule();

	const { data, info } = await readImage("image.jpg");
	const dataB = (await readImage("image.webp")).data;
	const { width, height } = info;

	twoImages = { dataA: data, dataB, width, height };
});

it("should check image data have same length", () => {
	const dataA = Buffer.alloc(900);
	const dataB = Buffer.alloc(1200);
	const ti = { dataA, dataB, width: 30, height: 10 };

	return expect(() => butteraugli(ti)).toThrow();
});

it("should check image is RGB", () => {
	const dataA = Buffer.alloc(900);
	const dataB = Buffer.alloc(1200);
	const ti = { dataA, dataB, width: 30, height: 20 };

	expect(() => butteraugli(ti)).toThrow();
});

it("should get butteraugli source & heatMap", async () => {
	const correctHeatMap = (await readImage("heatMap.png")).data;

	const [source, heatMap] = await butteraugli(twoImages);

	expect(source).toBeCloseTo(3.297, 2);
	expect(heatMap.byteLength).toBe(twoImages.width * twoImages.height * 3);
	expect(Buffer.from(heatMap)).toStrictEqual(correctHeatMap);
});

it("should support return RGBA in HeatMap", async () => {
	const correctHeatMap = await sharp(fixturePath("heatMap.png"))
		.ensureAlpha()
		.raw()
		.toBuffer();

	const [, heatMap] = await butteraugli(twoImages, { ensureAlpha: true });

	expect(heatMap.byteLength).toBe(twoImages.width * twoImages.height * 4);
	expect(Buffer.from(heatMap)).toStrictEqual(correctHeatMap);
});

it("should get PSNR", async () => {
	const psnr = await getPSNR(twoImages);
	expect(psnr).toBeCloseTo(35.778, 2);
});

it("should get SSIM", async () => {
	const ssim = await getSSIM(twoImages);
	expect(ssim).toBeCloseTo(0.99783, 4);
});
