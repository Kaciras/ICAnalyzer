# ICAnalyze

Image Convertors Analyzer is an online tool 

- Support image similarity metrics: SSIM, PSNR, and [butteraugli](https://github.com/google/butteraugli) 

🔗 [ic-analyze.kaciras.com](https://ic-analyze.kaciras.com/) 

# Build

Clone the repo and submodules:

```shell script
git clone https://github.com/Kaciras/ICAnalyze.git
git submodule update --init --recursive --depth=1
```

Start development server with hot reloading:

```shell script
npm install
npm run compile
npm run dev
```

Build production bundle:

```shell script
npm run build
```
