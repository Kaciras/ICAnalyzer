#pragma once
#include <string>
#include <vector>

using std::vector;
using std::string;

struct TwoImages {
	string dataA;
	string dataB;
	int width;
	int height;
};

struct ButteraugliOptions {
	float hfAsymmetry;
	double goodQualitySeek;
	double badQualitySeek;
	bool ensureAlpha;
};

void Butteraugli(
	TwoImages images,
	ButteraugliOptions options,
	double& diff_value,
	vector<uint8_t>& heatMap
);

double GetMSE(TwoImages images);

double GetSSIM(TwoImages images);

double SSIMGet_C(const uint8_t* src1, int stride1, const uint8_t* src2, int stride2);
