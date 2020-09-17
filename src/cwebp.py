import asyncio
from asyncio.subprocess import create_subprocess_exec, PIPE

from src.metrics import Runner, get_mat


# cwebp 下载地址：
# https://storage.googleapis.com/downloads.webmproject.org/releases/webp/index.html
async def cwebp_encode(origin, args):
	"""

	:param origin:
	:param args:
	:return:
	"""
	args += ("-quiet", origin, "-o", "-")
	proc = await create_subprocess_exec("encoder/cwebp", *args, stdout=PIPE)
	buffer, code = await asyncio.gather(proc.stdout.read(), proc.wait())

	code = await proc.wait()
	if code != 0:
		raise Exception("编码器出错！")

	return buffer, get_mat(buffer)


class CWebPAnalyzer:

	def __init__(self, file):
		self.file = file
		self.anal = Runner(file, cwebp_encode)
		self.basis = None

	async def _line_chart(self, alist, title, xtricks):
		rst = await self.anal.compute_all(alist)
		plot = ImageCodecPlot(rst, title)

		if self.basis:
			plot.set_ylims(self.basis)

		return plot.draw_lines(xtricks)

	async def _bar_chart(self, alist, title, xlabels):
		rst = await self.anal.compute_all(alist)
		plot = ImageCodecPlot(rst, title)

		if self.basis:
			plot.set_ylims(self.basis)

		return plot.draw_lines(xlabels)

	async def quality(self, range_=range(0, 101)):
		argslist = [("-sharp_yuv", "-q", str(v)) for v in range_]
		xts = range(range_.start, range_.stop, 5)
		return await self._line_chart(argslist, "Quality (-q)", xts)

	async def method(self):
		rng = range(0, 7)
		qs = [("-sharp_yuv", "-m", str(m)) for m in rng]
		return await self._line_chart(qs, "Method (-m)", rng)

	async def preset(self):
		presets = ("default", "photo", "picture", "drawing", "icon", "text")
		qs = [("-preset", str(p), "-sharp_yuv") for p in presets]
		results = await self.anal.compute_all(qs,"Presets")

		plot = ImageCodecPlot(results, "Presets (-preset)")

		if self.basis:
			plot.set_ylims(self.basis)

		return plot.draw_bars(presets)

	async def sns(self):
		qs = [("-sharp_yuv", "-sns", str(m)) for m in range(0, 101)]
		results = await self.anal.compute_all(qs, "SNS")

		plot = ImageCodecPlot(results, "Method (-m)")

		if self.basis:
			plot.set_ylims(self.basis)

		return plot.draw_lines(results)

	# def lossless_quality(self):
	# 	qs = [("-lossless", "-q", str(v)) for v in range(0, 101)]
	# 	esults = await self.anal.compute_all(qs)
	#
	# 	yaxes = draw_chart(range(0, 101), results, "SSIM", range(0, 101, 5))
	#
	# def lossless_mode(self):
	# 	qs = [("-lossless", "-z", str(m)) for m in range(0, 10)]
	# 	results = await anal.compute_all(qs)
	# 	yaxes = draw_chart(range(0, 10), results, "SSIM", range(0, 10))
	#
	# # 空间噪声整形 (-sns)
	# def near_lossless(self):
	# 	qs = [("-near_lossless", str(v)) for v in range(0, 101)]
	# 	results = await anal.compute_all(qs)
	# 	yaxes = draw_chart(range(0, 101), results, "SSIM", range(0, 101, 5))
	#
	# def filter(self):
	# 	qs = [("-f", str(v)) for v in range(0, 101)]
	# 	results = await anal.compute_all(qs)
	# 	yaxes = draw_chart(range(0, 101), results, "SSIM", range(0, 101, 5))


async def analyze(file):
	# analyzer = CWebPAnalyzer(file)
	# analyzer.basis = await analyzer.quality()
	# await analyzer.method()
	# await analyzer.preset()
	# analyzer.filter()
	# analyzer.sns()
	# analyzer.lossless_quality()
	# analyzer.lossless_mode()
	# analyzer.near_lossless()

	runner = Runner(file, cwebp_encode)
	argslist = [("-sharp_yuv", "-q", str(v)) for v in range(0, 101)]
	await runner.compute_all(argslist, "Quality")


if __name__ == '__main__':
	asyncio.get_event_loop().run_until_complete(analyze(
		r"G:\blog\image\6f6a94d94f9eb1a25faaa68ea3f8565ad09a80b4458bcdbb6bea9ed95f5a3df0.png"))
