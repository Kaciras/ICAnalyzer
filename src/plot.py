import matplotlib.pyplot as plt
import numpy as np

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
