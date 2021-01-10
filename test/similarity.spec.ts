import { Butteraugli, getPSNR, getSSIM, initWasmModule } from "../lib/similarity";
import { readImage } from "./test-helper";

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

	const comparator = new Butteraugli(dataA);
	expect(() => comparator.diff(dataB)).toThrow();
	comparator.close();
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

	const comparator = new Butteraugli(dataA);
	expect(() => comparator.diff(dataB)).toThrow();
	comparator.close();
});

it("should get butteraugli source & heatMap", async () => {
	const correctHeatMap = (await readImage("heatMap.png")).data;
	const comparator = new Butteraugli(image0);

	const [source, heatMap] = comparator.diff(image1);
	comparator.close();

	expect(source).toBeCloseTo(3.297, 2);
	expect(heatMap.byteLength).toBe(image0.width * image0.height * 4);
	expect(Buffer.from(heatMap)).toStrictEqual(correctHeatMap);
});

it("should get PSNR", () => {
	const psnr = getPSNR(image0, image1);
	expect(psnr).toBeCloseTo(37.031, 2);
});

it("should get SSIM", () => {
	const ssim = getSSIM(image0, image1);
	expect(ssim).toBeCloseTo(0.97137869478362, 8);
});
