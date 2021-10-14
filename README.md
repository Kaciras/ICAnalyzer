# ICAnalyzer

[![Test](https://github.com/Kaciras/ICAnalyzer/actions/workflows/test.yml/badge.svg)](https://github.com/Kaciras/ICAnalyzer/actions/workflows/test.yml)

Online image compression analyze tool.

[ic-analyzer.kaciras.com](https://ic-analyzer.kaciras.com/)

- Convert an image or just select images to analyze.
- Images never leave your device since ICAnalyzer does all the work locally.
- Support image similarity metrics: SSIM, PSNR, and [butteraugli](https://github.com/google/butteraugli)

Supported browsers:

- Firefox >= 79
- Edge >= 85
- Chrome >= 85
- Safari >= 14.1

# Build

Clone the repo and install dependencies:

```shell script
git clone https://github.com/Kaciras/ICAnalyzer.git
cd ICAnalyzer
git submodule update --init --recursive --depth=1
pnpm install
```

Start development server with hot reloading:

```shell script
pnpm run dev
```

Build production bundle:

```shell script
pnpm run build
```
