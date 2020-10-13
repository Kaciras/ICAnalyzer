#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "metrics.h"

using namespace emscripten;

val GetButteraugli(TwoImages images, ButteraugliOptions options) {
	double diff_value;
	vector<uint8_t> heatMap;

	Butteraugli(images, options, diff_value, heatMap);

	auto jsSource = val(diff_value);
	auto jsHeatMap = val(typed_memory_view(heatMap.size(), heatMap.data()));

	auto rv = val::array();
	rv.call<void>("push", jsSource);
	rv.call<void>("push", jsHeatMap);
	return rv;
}

EMSCRIPTEN_BINDINGS(my_module) {
	value_object<TwoImages>("TwoImages")
		.field("dataA", &TwoImages::dataA)
		.field("dataB", &TwoImages::dataB)
		.field("width", &TwoImages::width)
		.field("height", &TwoImages::height);

	value_object<ButteraugliOptions>("ButteraugliOptions")
		.field("hfAsymmetry", &ButteraugliOptions::hfAsymmetry)
		.field("goodQualitySeek", &ButteraugliOptions::goodQualitySeek)
		.field("badQualitySeek", &ButteraugliOptions::badQualitySeek);

	function("GetButteraugli", &GetButteraugli);
	function("GetMSE", &GetMSE);
	function("GetSSIM", &GetSSIM);
}
