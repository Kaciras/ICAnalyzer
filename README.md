# ICAnalyzer

[![Test](https://github.com/Kaciras/ICAnalyzer/actions/workflows/test.yml/badge.svg)](https://github.com/Kaciras/ICAnalyzer/actions/workflows/test.yml)

Online image Codec & Quality analyze tool.

🔗 [ic-analyzer.kaciras.com](https://ic-analyzer.kaciras.com/)

- Convert & compare image directly within the browser.

- Support image similarity metrics: SSIM, PSNR, and [butteraugli](https://github.com/google/butteraugli) 

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
