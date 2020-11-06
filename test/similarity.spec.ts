import sharp from "sharp";
import { butteraugli, getPSNR, getSSIM, initWasmModule } from "../lib/similarity";
import { fixturePath, readImage } from "./test-helper";

let image0: ImageData;
let image1: ImageData;

beforeAll(async () => {
	await initWasmModule();
	image0 = await readImage("image.jpg");
	image1 = await readImage("image.webp");
});

it("should check image data have same length", () => {
	const dataA = {
		data: new Uint8ClampedArray(Buffer.alloc(900)),
		width: 30,
		height: 10,
	};
	const dataB = {
		data: new Uint8ClampedArray(Buffer.alloc(1200)),
		width: 30,
		height: 10,
	};
	return expect(() => butteraugli(dataA, dataB)).toThrow();
});

it("should check image is RGB", () => {
	const dataA = {
		data: new Uint8ClampedArray(Buffer.alloc(900)),
		width: 30,
		height: 20,
	};
	const dataB = {
		data: new Uint8ClampedArray(Buffer.alloc(1200)),
		width: 30,
		height: 20,
	};
	return expect(() => butteraugli(dataA, dataB)).toThrow();
});

it("should get butteraugli source & heatMap", async () => {
	const correctHeatMap = (await readImage("heatMap.png")).data;

	const [source, heatMap] = await butteraugli(image0, image1);

	expect(source).toBeCloseTo(3.297, 2);
	expect(heatMap.byteLength).toBe(image0.width * image0.height * 3);
	expect(Buffer.from(heatMap)).toStrictEqual(correctHeatMap);
});

it("should support return RGBA in HeatMap", async () => {
	const correctHeatMap = await sharp(fixturePath("heatMap.png"))
		.ensureAlpha()
		.raw()
		.toBuffer();

	const [, heatMap] = await butteraugli(image0, image1, { ensureAlpha: true });

	expect(heatMap.byteLength).toBe(image0.width * image0.height * 4);
	expect(Buffer.from(heatMap)).toStrictEqual(correctHeatMap);
});

it("should get PSNR", async () => {
	const psnr = await getPSNR(image0, image1);
	expect(psnr).toBeCloseTo(35.778, 2);
});

it("should get SSIM", async () => {
	const ssim = await getSSIM(image0, image1);
	expect(ssim).toBeCloseTo(0.99783, 4);
});
