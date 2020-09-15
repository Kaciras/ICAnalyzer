from setuptools import setup

setup(
	name="image-codec-analyzer",
	version="1.0.0",
	description='几个运维脚本',
	author="Kaciras",
	platforms='any',
	python_requires='>=3.8',
	install_requires=[
		"fire",
		"colorama",
		"opencv-python",
		"matplotlib",
		"numpy",
		"psutil",
		"scikit-image"
	],
)
