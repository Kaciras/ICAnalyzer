#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <butteraugli/butteraugli.h>

using namespace butteraugli;
using namespace emscripten;

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

void FromSrgbToLinear(const vector<Image8>& rgb, vector<ImageF>& linear, int background) {
	const size_t xsize = rgb[0].xsize();
	const size_t ysize = rgb[0].ysize();
	static const double* const kSrgbToLinearTable = NewSrgbToLinearTable();

	if (rgb.size() == 3) {  // RGB
		for (int c = 0; c < 3; c++) {
			linear.push_back(ImageF(xsize, ysize));
			for (int y = 0; y < ysize; ++y) {
				const uint8_t* const BUTTERAUGLI_RESTRICT row_rgb = rgb[c].Row(y);
				float* const BUTTERAUGLI_RESTRICT row_linear = linear[c].Row(y);

				for (size_t x = 0; x < xsize; x++) {
					const int value = row_rgb[x];
					row_linear[x] = kSrgbToLinearTable[value];
				}
			}
		}
	}
	else {  // RGBA
		for (int c = 0; c < 3; c++) {
			linear.push_back(ImageF(xsize, ysize));
			for (int y = 0; y < ysize; ++y) {
				const uint8_t* const BUTTERAUGLI_RESTRICT row_rgb = rgb[c].Row(y);
				float* const BUTTERAUGLI_RESTRICT row_linear = linear[c].Row(y);
				const uint8_t* const BUTTERAUGLI_RESTRICT row_alpha = rgb[3].Row(y);

				for (size_t x = 0; x < xsize; x++) {
					int value;
					if (row_alpha[x] == 255) {
						value = row_rgb[x];
					}
					else if (row_alpha[x] == 0) {
						value = background;
					}
					else {
						const int fg_weight = row_alpha[x];
						const int bg_weight = 255 - fg_weight;
						value = (row_rgb[x] * fg_weight + background * bg_weight + 127) / 255;
					}
					row_linear[x] = kSrgbToLinearTable[value];
				}
			}
		}
	}
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
	size_t xsize,
	size_t ysize,
	vector<uint8_t>* heatmap)
{
	heatmap->resize(3 * xsize * ysize);
	for (size_t y = 0; y < ysize; ++y) {
		for (size_t x = 0; x < xsize; ++x) {
			int px = xsize * y + x;
			double d = distmap.Row(y)[x];
			uint8_t* rgb = &(*heatmap)[3 * px];
			ScoreToRgb(d, good_threshold, bad_threshold, rgb);
		}
	}
}

void ConvertImage(string data, size_t xsize, size_t ysize, vector<Image8>& rgb) {
	auto channels = data.length() / xsize / ysize;
	auto rowLenth = xsize * channels;

	const uint8_t* BUTTERAUGLI_RESTRICT buffer = reinterpret_cast<const uint8_t*>(data.data());

	if (channels == 3) {
		rgb = CreatePlanes<uint8_t>(xsize, ysize, 3);

		for (int y = 0; y < ysize; y++) {
			uint8_t* const BUTTERAUGLI_RESTRICT r = rgb[0].Row(y);
			uint8_t* const BUTTERAUGLI_RESTRICT g = rgb[1].Row(y);
			uint8_t* const BUTTERAUGLI_RESTRICT b = rgb[2].Row(y);

			for (int x = 0; x < xsize; x++) {
				const int offset = (y * rowLenth) + (x * 3);
				r[x] = buffer[offset + 0];
				g[x] = buffer[offset + 1];
				b[x] = buffer[offset + 2];
			}
		}
	}
	else {
		rgb = CreatePlanes<uint8_t>(xsize, ysize, 4);

		for (int y = 0; y < ysize; y++) {
			uint8_t* const BUTTERAUGLI_RESTRICT r = rgb[0].Row(y);
			uint8_t* const BUTTERAUGLI_RESTRICT g = rgb[1].Row(y);
			uint8_t* const BUTTERAUGLI_RESTRICT b = rgb[2].Row(y);
			uint8_t* const BUTTERAUGLI_RESTRICT a = rgb[3].Row(y);

			for (int x = 0; x < xsize; x++) {
				const int offset = (y * rowLenth) + (x * 4);
				r[x] = buffer[offset + 0];
				g[x] = buffer[offset + 1];
				b[x] = buffer[offset + 2];
				a[x] = buffer[offset + 3];
			}
		}
	}
}

struct ButteraugliOptions {
	float hfAsymmetry;
	double goodQualitySeek;
	double badQualitySeek;
};

double Calc(vector<Image8>& rgb1, vector<Image8>& rgb2, int background, float hfAsymmetry, ImageF& diffMap) {
	vector<ImageF> linear1, linear2;
	FromSrgbToLinear(rgb1, linear1, background);
	FromSrgbToLinear(rgb2, linear2, background);

	double diff_value;
	if (!ButteraugliInterface(linear1, linear2, hfAsymmetry, diffMap, diff_value)) {
		throw "test error";
	}

	return diff_value;
}

val GetButteraugli(string data1, string data2, size_t width, size_t height, ButteraugliOptions options) {
	auto length = data1.length();

	vector<Image8> rgb1, rgb2;
	ConvertImage(data1, width, height, rgb1);
	ConvertImage(data2, width, height, rgb2);

	ImageF diff_map, diff_map_on_white;
	auto diff_value = Calc(rgb1, rgb2, 0, options.hfAsymmetry, diff_map);

	ImageF* diff_map_ptr = &diff_map;
	if (length / width / height == 4) {
		double diff_value_on_white = Calc(rgb1, rgb2, 0, options.hfAsymmetry, diff_map_on_white);

		if (diff_value_on_white > diff_value) {
			diff_value = diff_value_on_white;
			diff_map_ptr = &diff_map_on_white;
		}
	}

	const double good_quality = ButteraugliFuzzyInverse(options.goodQualitySeek);
	const double bad_quality = ButteraugliFuzzyInverse(options.badQualitySeek);
	vector<uint8_t> heatMap;
	CreateHeatMapImage(*diff_map_ptr, good_quality, bad_quality, width, height, &heatMap);

	auto jsSource = val(diff_value);
	auto jsHeatMap = val(typed_memory_view(heatMap.size(), heatMap.data()));

	auto rv = val::array();
	rv.call<void>("push", jsSource);
	rv.call<void>("push", jsHeatMap);
	return rv;
}


double GetMSE(string data1, string data2, size_t width, size_t height) {
	auto length = data1.length();

	auto p1 = reinterpret_cast<const uint8_t*>(data1.data());
	auto p2 = reinterpret_cast<const uint8_t*>(data2.data());

	double sum = 0;

	for (auto i = 0; i < length; ++i)
	{
		auto e = *(p1 + i) - *(p2 + i);
		sum += e * e;
	}

	return sum / length;
}

double GetSSIM(string data1, string data2, size_t width, size_t height) {

}

EMSCRIPTEN_BINDINGS(my_module) {
	value_object<ButteraugliOptions>("ButteraugliOptions")
		.field("hfAsymmetry", &ButteraugliOptions::hfAsymmetry)
		.field("goodQualitySeek", &ButteraugliOptions::goodQualitySeek)
		.field("badQualitySeek", &ButteraugliOptions::badQualitySeek);

	function("GetMSE", &GetMSE);
	function("GetSSIM", &GetSSIM);
	function("GetButteraugli", &GetButteraugli);
}
