import asyncio
from concurrent.futures.thread import ThreadPoolExecutor
from time import time

import cv2
import matplotlib.pyplot as plt
import numpy as np
import psutil
from skimage.metrics import structural_similarity


def get_mux(data):
	array = np.asarray(bytearray(data), dtype=np.uint8)
	return cv2.imdecode(array, cv2.IMREAD_COLOR)


def _compute_ssim(img_a, img_b, multichannel=True):
	return structural_similarity(img_a, img_b, multichannel=multichannel)


executor = ThreadPoolExecutor()
semaphore = asyncio.Semaphore(psutil.cpu_count())
lp = asyncio.get_event_loop()


async def _get_ssim(img_a, img_b):
	"""
	计算两张图的 SSIM，因为计算量有点大，所以使用多线程加速了一下。
	run_in_executor 不支持 kwargs，所以创建了闭包函数 bind_fn 来传参。

	:param img_a: 待比较的图片
	:param img_b: 待比较的另一个图片
	:return: 异步的计算结果
	"""
	return await lp.run_in_executor(executor, _compute_ssim, img_a, img_b)


class ImageCodecAnalyzer:

	def __init__(self, file, encode):
		with open(file, "rb") as fp:
			self.origin = fp.read()

		self.file = file
		self.encode = encode
		self.mux = get_mux(self.origin)
		self.inspect = None

	async def compute_all(self, args_list):
		tasks = (self.compute(x) for x in args_list)
		return await asyncio.gather(*tasks)

	async def compute(self, args):
		async with semaphore:
			start = time()
			buffer, mux = await self.encode(self.file, args)
			etime = time() - start

		raw_size = len(self.origin)

		ratio = len(buffer) / raw_size
		ssim = await _get_ssim(self.mux, mux)
		speed = raw_size / etime / 1024

		return ratio, ssim, speed

	async def diff(self, *args):
		buffer, mux = await self.encode(self.file, args)
		return await asyncio.get_event_loop().run_in_executor(executor, cv2.absdiff, self.mux, mux)


BAR_WIDTH = 0.35
COLOR_RATIO = "blue"
COLOR_QUALITY = "limegreen"


class ImageCodecPlot:

	def __init__(self, results, title):
		self.stats = np.asarray(results).T

		self.axe_base = plt.subplots()[1]
		self.axe_base.set_title(title)
		self.axe_base.set_ylabel("Compress Ratio")

		self.axe_ssim = self.axe_base.twinx()
		self.axe_ssim.set_ylabel("SSIM")

	def set_ylims(self, ylims):
		self.axe_base.set_ylim(ylims[0])
		self.axe_ssim.set_ylim(ylims[1])

	def _post_process(self, pltos):
		self.axe_base.legend(pltos, ["Ratio", "SSIM"])
		plt.show()
		return self.axe_base.get_ylim(), self.axe_ssim.get_ylim()

	def draw_bars(self, xlabels=None):
		ratio, ssim = self.stats[:2]

		index = np.arange(len(ratio))

		rb = self.axe_base.bar(index, ratio, BAR_WIDTH, label="Ratio", color="#87CEFA")
		self.axe_base.set_xticks(index + BAR_WIDTH / 2)

		sb = self.axe_ssim.bar(index + BAR_WIDTH, ssim, BAR_WIDTH, label="SSIM", color="red")

		self.axe_base.axhline(ratio[0], linestyle="dashed")
		self.axe_ssim.axhline(ssim[0], color="red", linestyle="dashed")

		self.axe_base.set_xticklabels(xlabels)

		return self._post_process(rb + sb)

	def draw_lines(self, xgrids, xlabels=None):
		ratio, ssim = self.stats[:2]
		xvalues = np.arange(len(ratio))

		rline = self.axe_base.plot(xvalues, ratio)
		sline = self.axe_ssim.plot(xvalues, ssim, "limegreen")

		self.axe_base.set_xticks(xgrids)

		if xlabels:
			self.axe_base.set_xticklabels(xlabels)

		self.axe_base.grid()
		self.axe_base.legend(rline + sline, ["Ratio", "SSIM"])

		return self._post_process(rline + sline)
