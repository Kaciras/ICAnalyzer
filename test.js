const sharp = require("sharp");
const metrics = require("./build/metrics");
const { cv, cvTranslateError } = require("opencv-wasm");
const ssim = require("ssim.js").default;
const { performance } = require("perf_hooks");

async function getData(fileA, fileB) {
	const { data, info } = await sharp(fileA)
		// .ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	const dataB = await sharp(fileB)
		// .ensureAlpha()
		.raw()
		.toBuffer();

	return [data, dataB, info.width, info.height];
}

async function sharpToImageData(sharp) {
	const { data, info } = await sharp.raw().toBuffer({ resolveWithObject: true });
	return { data, width: info.width, height: info.height };
}

async function butteraugli() {
	const args = await getData(
		"G:/blog/image/2ed8be3bf60361bf63ef04abc7aff4d80b093ea5576a869bac8eea965f9ebb5b.jpg",
		"G:\\blog\\cache\\webp/2ed8be3bf60361bf63ef04abc7aff4d80b093ea5576a869bac8eea965f9ebb5b.webp");

	// 越大质量越差，相同图片为0
	const wasmModule = await metrics();

	const start = performance.now();
	const [source, heatMap] = wasmModule.GetButteraugli(...args, {
		hfAsymmetry: 1.0,
		goodQualitySeek: 1.5,
		badQualitySeek: 0.5,
	});
	const end = performance.now();

	console.log(`${(end - start).toFixed(3)}ms`);
	console.log(source);

	return sharp(Buffer.from(heatMap), {
		raw: {
			channels: 3,
			width: args[2],
			height: args[3],
		}
	}).png().toFile("heatmap.png");
}

async function psnr() {
	const args = await getData(
		"G:/blog/image/2ed8be3bf60361bf63ef04abc7aff4d80b093ea5576a869bac8eea965f9ebb5b.jpg",
		"G:\\blog\\cache\\webp/2ed8be3bf60361bf63ef04abc7aff4d80b093ea5576a869bac8eea965f9ebb5b.webp");

	const wasmModule = await metrics();
	const mse = wasmModule.GetMSE(...args);
	const psnr = 10 * Math.log10(mse);
	console.log(psnr);
}

async function cvPSNR() {
	const [data, dataB, info] = await getData();

	const mat1 = cv.matFromArray(info.height, info.width, cv.CV_8SC3, data);
	const mat2 = cv.matFromArray(info.height, info.width, cv.CV_8SC3, dataB);

	let s1 = new cv.Mat();
	cv.absdiff(mat1, mat2, s1);
	s1.convertTo(s1, cv.CV_32FC3);
	s1 = s1.mul(s1, 1);
	const s = cv.sum(s1);

	const sse = s.val[0] + s.val[1] + s.val[2];
	const mse = sse / data.length;

	const psnr = 10 * Math.log10((255 * 255) / mse);
	console.log(psnr);
}

async function ssimJS() {
	const a = await sharpToImageData(sharp("G:\\blog\\image\\6e837a58270423d0ba65a1a092314486a5ccbab6528fe48d22f89a060a522814.png"));
	const b = await sharpToImageData(sharp("G:\\blog\\cache\\webp\\6e837a58270423d0ba65a1a092314486a5ccbab6528fe48d22f89a060a522814.webp"));

	const { mssim, performance } = await ssim(a, b);
	console.log(`SSIM: ${mssim}, time: ${performance}ms`);
}

butteraugli();
/// 3.016244888305664
