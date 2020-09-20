#include <emscripten/emscripten.h>
#include <butteraugli.h>

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

void FromSrgbToLinear(const std::vector<Image8>& rgb, std::vector<ImageF>& linear, int background) {
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
  } else {  // RGBA
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
          } else if (row_alpha[x] == 0) {
            value = background;
          } else {
            const int fg_weight = row_alpha[x];
            const int bg_weight = 255 - fg_weight;
            value =
                (row_rgb[x] * fg_weight + background * bg_weight + 127) / 255;
          }
          row_linear[x] = kSrgbToLinearTable[value];
        }
      }
    }
  }
}

EMSCRIPTEN_KEEPALIVE
double getButteraugli(dataA, dataB, length, width, height){
	auto channels = length / width/height;
	auto planes = CreatePlanes(width, height, channels);

	 for (int y = 0; y < height; ++y) {

	 }
}


EMSCRIPTEN_KEEPALIVE
double getPSNR(){

}

EMSCRIPTEN_KEEPALIVE
double getSSIM(dataA, dataB, length, width, height){

}
