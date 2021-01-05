#include <butteraugli/butteraugli.h>
#include "metrics.h"

using namespace butteraugli;

using std::vector;
using std::string;

const double* NewSrgbToLinearTable() {
	double* table = new double[256];
	for (int i = 0; i < 256; ++i) {
		const double srgb = i / 255.0;
		table[i] =
			255.0 * (srgb <= 0.04045 ? srgb / 12.92
				: std::pow((srgb + 0.055) / 1.055, 2.4));
	}
	return table;
}

double ToLiner(uint8_t value, uint8_t alpha, int background) {
	static const double* const kSrgbToLinearTable = NewSrgbToLinearTable();

	if (alpha == 0) {
		value = background;
	} else if (alpha != 255) {
		const int fg_weight = alpha;
		const int bg_weight = 255 - fg_weight;
		value = (value * fg_weight + background * bg_weight + 127) / 255;
	}
	return kSrgbToLinearTable[value];
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

void CreateHeatMapImage(
	const ImageF& distmap,
	double good_threshold,
	double bad_threshold,
	vector<uint8_t>* heatmap)
{
	size_t width = distmap.xsize();
	size_t height = distmap.ysize();

	heatmap->resize(4 * width * height);
	for (size_t y = 0; y < height; ++y) {
		for (size_t x = 0; x < width; ++x) {
			int px = width * y + x;
			double d = distmap.Row(y)[x];
			uint8_t* rgb = &(*heatmap)[4 * px];
			ScoreToRgb(d, good_threshold, bad_threshold, rgb);
			rgb[3] = 255;
		}
	}
}

class ButteraugliDiff {

	vector<ImageF> reference;
	size_t width;
	size_t height;
	int background;

	void FromSrgbToLinear(const char* data, vector<ImageF>& linear) {
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
				auto alpha = p[3];

				row_r[x] = ToLiner(p[0], alpha, background);
				row_g[x] = ToLiner(p[1], alpha, background);
				row_b[x] = ToLiner(p[2], alpha, background);
			}
		}
	}

public:

	ButteraugliDiff(string image, size_t width, size_t height, int background) {
		this->width = width;
		this->height = height;
		this->background = background;
		FromSrgbToLinear(image.data(), reference);
	}

	double Compare(string image, float hfAsymmetry, ImageF& diffMap) {
		vector<ImageF> linear;
		FromSrgbToLinear(image.data(), linear);

		ButteraugliDiffmap(reference, linear, hfAsymmetry, diffMap);
		return ButteraugliScoreFromDiffmap(diffMap);
	}
};


void Butteraugli(TwoImages images, ButteraugliOptions options, double& diff_value, vector<uint8_t>& heatMap) {
	const auto length = images.dataA.length();
	const auto width = images.width;
	const auto height = images.height;

	ImageF diff_map, diff_map_on_white;

	ButteraugliDiff diff = ButteraugliDiff(images.dataA, width, height, 0);
	diff_value = diff.Compare(images.dataB, options.hfAsymmetry, diff_map);

	diff = ButteraugliDiff(images.dataA, width, height, 255);
	auto diff_value_on_white = diff.Compare(images.dataB, options.hfAsymmetry, diff_map_on_white);

	ImageF* diff_map_ptr = &diff_map;
	if (diff_value_on_white > diff_value) {
		diff_value = diff_value_on_white;
		diff_map_ptr = &diff_map_on_white;
	}

	const double good_quality = ButteraugliFuzzyInverse(options.goodQualitySeek);
	const double bad_quality = ButteraugliFuzzyInverse(options.badQualitySeek);
	CreateHeatMapImage(*diff_map_ptr, good_quality, bad_quality, &heatMap);
}

double GetMSE(TwoImages images) {
	auto length = images.dataA.length();

	auto p1 = reinterpret_cast<const uint8_t*>(images.dataA.data());
	auto p2 = reinterpret_cast<const uint8_t*>(images.dataB.data());

	double sum = 0;

	for (auto i = 0; i < length; ++i)
	{
		const auto e = *(p1 + i) - *(p2 + i);
		sum += e * e;
	}

	return sum / length;
}
