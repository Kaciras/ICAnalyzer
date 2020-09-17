"""
提供基于 asyncio 的各种指标计算功能，同时提供对转码过程的优化工具。
"""
import asyncio
import shutil
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


class Runner:

	def __init__(self, file, encode):
		file = Path(file)

		with file.open("rb") as fp:
			self.origin = fp.read()

		temp_origin = TEMP_DIR.joinpath(file.name)
		temp_origin.write_bytes(self.origin)

		self.store = FileResultStoreFactory(file)

		self.file = temp_origin
		self.encode = encode
		self.mat = get_mat(self.origin)

	async def compute_all(self, args_list, name):
		store = self.store.create(name, args_list)

		tasks = (self.compute(args_list[i], i, store) for i in range(len(args_list)))
		data = await asyncio.gather(*tasks)

		store.close()
		return data

	async def compute(self, args, i, store):
		async with semaphore:
			start = time()
			buffer, mat = await self.encode(self.file, args)
			etime = time() - start

		raw_size = len(self.origin)

		ratio = len(buffer) / raw_size
		ssim = await get_ssim(self.mat, mat)
		speed = raw_size / etime / 1024

		diff_ = await loop.run_in_executor(executor, cv2.absdiff, self.mat, mat)

		store.handle(i, (ratio, ssim, speed), diff_)

		return ratio, ssim, speed

	def close(self):
		self.file.unlink()


class FileResultStoreFactory:

	def __init__(self, file, name=None):
		if name is None:
			name = file.stem

		self.dir_ = Path("web/data", name)
		self.dir_.mkdir(parents=True, exist_ok=True)

		raw = self.dir_.joinpath("image.ext").with_suffix(file.suffix)
		shutil.copyfile(file, raw)

	def create(self, name, argslist):
		return FileResultStore(self.dir_, name, argslist)


class FileResultStore:

	def __init__(self, dir_, title, argslist):
		self.directory = dir_.joinpath(title)
		self.directory.mkdir(exist_ok=True)
		self.data = [None] * len(argslist)

	def handle(self, i, metrics, diff_):
		self.data[i] = metrics

		dfile = self.directory.joinpath(f"{i}.png")
		cv2.imwrite(str(dfile), diff_)

	def close(self):
		csv_file = self.directory.joinpath("metrics.csv")
		data = np.asarray(self.data).T
		np.savetxt(csv_file, data, delimiter=",")
