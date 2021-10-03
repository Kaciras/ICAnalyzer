/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Modifications copyright (C) 2020 Kaciras
 */
#include <butteraugli/butteraugli.h>
#include <emscripten/val.h>
#include <emscripten/bind.h>

using namespace butteraugli;
using namespace emscripten;

using std::vector;
using std::string;

thread_local const val Uint8Array = val::global("Uint8Array");

const double* NewSrgbToLinearTable() {
	double* table = new double[256];
	for (int i = 0; i < 256; ++i) {
		const double srgb = i / 255.0;
		table[i] =
			255.0 * (srgb <= 0.04045 ? srgb / 12.92
				: pow((srgb + 0.055) / 1.055, 2.4));
	}
	return table;
}

static void ScoreToRgb(double score, double good_threshold, double bad_threshold, uint8_t rgb[3]) {
	double heatmap[12][3] = {
	  { 0, 0, 0 },
	  { 0, 0, 1 },
	  { 0, 1, 1 },
	  { 0, 1, 0 }, // Good level
	  { 1, 1, 0 },
	  { 1, 0, 0 }, // Bad level
	  { 1, 0, 1 },
	  { 0.5, 0.5, 1.0 },
	  { 1.0, 0.5, 0.5 },  // Pastel colors for the very bad quality range.
	  { 1.0, 1.0, 0.5 },
	  { 1, 1, 1, },
	  { 1, 1, 1, },
	};

	if (score < good_threshold) {
		score = (score / good_threshold) * 0.3;
	}
	else if (score < bad_threshold) {
		score = 0.3 + (score - good_threshold) / (bad_threshold - good_threshold) * 0.15;
	}
	else {
		score = 0.45 + (score - bad_threshold) / (bad_threshold * 12) * 0.5;
	}

	static const int kTableSize = sizeof(heatmap) / sizeof(heatmap[0]);
	score = std::min<double>(std::max<double>(score * (kTableSize - 1), 0.0), kTableSize - 2);
	int ix = static_cast<int>(score);
	double mix = score - ix;

	for (int i = 0; i < 3; ++i) {
		double v = mix * heatmap[ix + 1][i] + (1 - mix) * heatmap[ix][i];
		rgb[i] = static_cast<uint8_t>(255 * pow(v, 0.5) + 0.5);
	}
}

void CreateHeatMapImage(const ImageF& distmap, double goodSeek, double badSeek, vector<uint8_t>* heatmap)
{
	const double good_threshold = ButteraugliFuzzyInverse(goodSeek);
	const double bad_threshold = ButteraugliFuzzyInverse(badSeek);

	size_t width = distmap.xsize();
	size_t height = distmap.ysize();
	heatmap->resize(4 * width * height);

	for (size_t y = 0; y < height; ++y) {
		for (size_t x = 0; x < width; ++x) {
			size_t px = width * y + x;
			double d = distmap.Row(y)[x];
			uint8_t* rgb = &(*heatmap)[4 * px];
			ScoreToRgb(d, good_threshold, bad_threshold, rgb);
			rgb[3] = 255;
		}
	}
}

struct ImageData {
	string data;
	size_t width;
	size_t height;
};

struct ButteraugliOptions {
	float hfAsymmetry;
	double goodQualitySeek;
	double badQualitySeek;
};

class ButteraugliDiff {

	vector<ImageF> reference;
	size_t width;
	size_t height;

	void FromSrgbToLinear(const char* data, vector<ImageF>& linear) {
		static const double* const kSrgbToLinearTable = NewSrgbToLinearTable();

		const uint8_t* rgb = reinterpret_cast<const uint8_t*>(data);

		linear.push_back(ImageF(width, height));
		linear.push_back(ImageF(width, height));
		linear.push_back(ImageF(width, height));

		for (size_t y = 0; y < height; ++y) {
			float* const BUTTERAUGLI_RESTRICT row_r = linear[0].Row(y);
			float* const BUTTERAUGLI_RESTRICT row_g = linear[1].Row(y);
			float* const BUTTERAUGLI_RESTRICT row_b = linear[2].Row(y);

			for (size_t x = 0; x < width; ++x) {
				auto p = rgb + (y * width + x) * 4;
				row_r[x] = kSrgbToLinearTable[p[0]];
				row_g[x] = kSrgbToLinearTable[p[1]];
				row_b[x] = kSrgbToLinearTable[p[2]];
			}
		}
	}

public:

	ButteraugliDiff(ImageData image) {
		this->width = image.width;
		this->height = image.height;
		FromSrgbToLinear(image.data.c_str(), reference);
	}

	val Diff(string image, ButteraugliOptions options) {
		vector<ImageF> linear;
		FromSrgbToLinear(image.data(), linear);

		ImageF diffMap;
		ButteraugliDiffmap(reference, linear, options.hfAsymmetry, diffMap);
		double score = ButteraugliScoreFromDiffmap(diffMap);

		vector<uint8_t> heatMap;
		CreateHeatMapImage(diffMap, options.goodQualitySeek, options.badQualitySeek, &heatMap);

		auto jsScore = val(score);
		auto jsHeatMap = Uint8Array.new_(typed_memory_view(heatMap.size(), heatMap.data()));

		auto rv = val::array();
		rv.call<void>("push", jsScore);
		rv.call<void>("push", jsHeatMap);
		return rv;
	}
};

EMSCRIPTEN_BINDINGS(butteraugli_module) {

	value_object<ButteraugliOptions>("ButteraugliOptions")
		.field("hfAsymmetry", &ButteraugliOptions::hfAsymmetry)
		.field("goodQualitySeek", &ButteraugliOptions::goodQualitySeek)
		.field("badQualitySeek", &ButteraugliOptions::badQualitySeek);

	value_object<ImageData>("ImageData")
		.field("data", &ImageData::data)
		.field("width", &ImageData::width)
		.field("height", &ImageData::height);

	class_<ButteraugliDiff>("ButteraugliDiff")
		.constructor<ImageData>()
		.function("Diff", &ButteraugliDiff::Diff);
}
