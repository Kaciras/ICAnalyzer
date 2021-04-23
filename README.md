# ICAnalyzer

Image Convertors Analyzer is an online tool 

- Support image similarity metrics: SSIM, PSNR, and [butteraugli](https://github.com/google/butteraugli) 

🔗 [ic-analyzer.kaciras.com](https://ic-analyzer.kaciras.com/) 

# Build

Clone the repo and install dependencies:

```shell script
git clone https://github.com/Kaciras/ICAnalyzer.git
cd ICAnalyzer
git submodule update --init --recursive --depth=1
npm install
```

Start development server with hot reloading:

```shell script
npm run dev
```

Build production bundle:

```shell script
npm run build
```
