# ICAnalyze

Image Convertors Analyzer is an online tool 

- Support image similarity metrics: SSIM, PSNR, and [butteraugli](https://github.com/google/butteraugli) 

🔗 [ic-analyze.kaciras.com](https://ic-analyze.kaciras.com/) 

# Build

Clone the repo and install dependencies:

```shell script
git clone https://github.com/Kaciras/ICAnalyze.git
cd ICAnalyze
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
