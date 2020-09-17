"""
提供基于 asyncio 的各种指标计算功能，同时提供对转码过程的优化工具。
"""
import asyncio
from concurrent.futures.thread import ThreadPoolExecutor
from pathlib import Path
from time import time

import cv2
import numpy as np
import psutil
from skimage.metrics import structural_similarity

# 保存编码器输出的临时文件，可以搞成内存文件系统加点速
TEMP_DIR = Path("R:\\")

loop = asyncio.get_event_loop()

executor = ThreadPoolExecutor()
semaphore = asyncio.Semaphore(psutil.cpu_count())


def get_mat(data):
	array = np.asarray(bytearray(data), dtype=np.uint8)
	return cv2.imdecode(array, cv2.IMREAD_COLOR)


def _compute_ssim(img_a, img_b, multichannel=True):
	return structural_similarity(img_a, img_b, multichannel=multichannel)


async def get_ssim(img_a, img_b):
	"""
	计算两张图的 SSIM，因为计算量有点大，所以使用多线程加速了一下。
	run_in_executor 不支持 kwargs，所以创建了闭包函数 bind_fn 来传参。

	:param img_a: 待比较的图片
	:param img_b: 待比较的另一个图片
	:return: 异步的计算结果
	"""
	return await loop.run_in_executor(executor, _compute_ssim, img_a, img_b)


class ImageCodecAnalyzer:

	def __init__(self, file, encode):
		with open(file, "rb") as fp:
			self.origin = fp.read()

		self.file = file
		self.encode = encode
		self.mat = get_mat(self.origin)

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
		ssim = await get_ssim(self.mat, mux)
		speed = raw_size / etime / 1024

		return ratio, ssim, speed

	async def diff(self, *args):
		buffer, mat = await self.encode(self.file, args)
		return await asyncio.get_event_loop().run_in_executor(executor, cv2.absdiff, self.mat, mat)
