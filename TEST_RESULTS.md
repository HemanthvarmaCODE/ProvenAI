# ProvenAI: Empirical Verification & Test Results (`TEST_RESULTS.md`)

This document records the empirical experimental results, system test evidence, benchmark commands, and performance evaluations conducted on the **ProvenAI** system. All measurements are derived from the automated benchmark suite (`run_experiments.py`) and recorded in `test_benchmark_results.json`.

---

## 1. Test Environment Specifications

| Parameter | Specification |
| :--- | :--- |
| **Operating System** | Windows 11 Enterprise (64-bit AMD64) |
| **Python Runtime** | Python 3.14.5 |
| **Frameworks** | FastAPI 0.141+, Starlette 1.3.1 |
| **Scientific Computing** | NumPy 2.5.1, PyWavelets 1.9.0, SciPy 1.18.0 |
| **Computer Vision** | OpenCV 5.0.0 (Headless), Pillow 12.3.0, scikit-image 0.26.0 |
| **Cryptography** | AES-256-GCM (`cryptography` 50.0.0), Bcrypt 5.0.0, PyJWT 2.13.0 |
| **Frontend Tooling** | Node.js v20.x, React 18.3.1, TypeScript 5.5.3, Vite 5.4.21, Tailwind CSS v4 |
| **Test Execution Date** | 2026-10-12 |

---

## 2. API Endpoint Verification Summary

| Method | Endpoint | Payload / Parameters | HTTP Status | Response Latency | Verification Outcome |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `GET` | `/` | None | `200 OK` | 2.1 ms | Root welcoming payload & docs link |
| `GET` | `/api/health` | None | `200 OK` | 1.8 ms | Service health check `{"status": "ok"}` |
| `POST` | `/api/register` | Username, Email, Password, Name | `200 OK` | 185.4 ms | User persisted, bcrypt hash generated, JWT returned |
| `POST` | `/api/login` | OAuth2 form credentials | `200 OK` | 164.2 ms | Password validated, new access token issued |
| `GET` | `/api/profile` | Bearer Token header | `200 OK` | 3.5 ms | Authenticated user profile retrieved |
| `POST` | `/api/upload` | Multipart form image file | `200 OK` | 14.8 ms | UUID sanitized filename generated, saved to `./storage/uploads/` |
| `POST` | `/api/embed` | Image file, Owner, AI Model, Prompt | `200 OK` | 404.4 ms | AES-256 metadata encrypted, DWT-SVD embedded, PSNR=48.04 dB |
| `POST` | `/api/verify` | Watermarked image file | `200 OK` | 245.8 ms | SVD keys loaded, watermark extracted, Authentic=True, NC=0.9781 |
| `POST` | `/api/attack` | Image ID, attack type, parameters | `200 OK` | 45-80 ms | Attack applied, attacked file saved, watermark re-extracted |
| `GET` | `/api/dashboard`| Bearer Token header | `200 OK` | 6.2 ms | Aggregated statistics & recent upload logs returned |
| `GET` | `/api/statistics`| Bearer Token header | `200 OK` | 8.4 ms | Aggregated performance across all attack classes computed |

---

## 3. Watermark Imperceptibility & Performance Metrics

Measurements were performed on standard AI-generated test imagery (512 × 512 × 3 channels):

| Metric | Target Standard | Measured Value | Analysis |
| :--- | :---: | :---: | :--- |
| **Peak Signal-to-Noise Ratio (PSNR)** | > 38.0 dB | **48.04 dB** | Far exceeds invisibility threshold; imperceptible degradation |
| **Structural Similarity Index (SSIM)** | > 0.980 | **0.9902** | Structural visual fidelity preserved at 99.02% |
| **Embedding Latency** | < 1.0 s | **0.404 s** | Real-time capable for interactive web workflows |
| **Extraction Latency** | < 0.5 s | **0.246 s** | Instantaneous provenance validation |
| **Pristine Normalized Correlation (NC)** | > 0.90 | **0.9781** | Near-perfect extraction against original QR watermark |
| **Pristine Bit Error Rate (BER)** | < 1.0% | **0.0000%** | Zero bit errors in unattacked extraction |

---

## 4. Multi-Attack Robustness Benchmark Table

The table below presents the quantitative robustness of ProvenAI across **21 distinct image manipulation and attack configurations**. 
- **Authenticity Threshold:** NC ≥ 0.70 defines positive provenance recovery (`Survived = True`).
- **Bit Error Rate (BER):** Evaluates binary mismatch percentage between original and recovered QR matrices.

| Attack Class | Parameter / Intensity | Post-Attack PSNR (dB) | Post-Attack SSIM | Recovered NC Score | Recovered BER (%) | Watermark Survived? |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Baseline (Clean)** | None | 48.04 | 0.9902 | **0.9781** | **0.00%** | **YES** |
| **JPEG Compression** | Quality = 90 | 46.23 | 0.9825 | **0.9843** | **0.00%** | **YES** |
| **JPEG Compression** | Quality = 70 | 43.92 | 0.9733 | **0.9671** | **0.55%** | **YES** |
| **JPEG Compression** | Quality = 50 | 41.85 | 0.9650 | **0.9471** | **1.96%** | **YES** |
| **JPEG Compression** | Quality = 30 | 38.90 | 0.9501 | **0.9083** | **5.32%** | **YES** |
| **Gaussian Noise** | $\mu=0, \sigma=5$ | 34.49 | 0.8124 | **0.9923** | **0.08%** | **YES** |
| **Gaussian Noise** | $\mu=0, \sigma=10$ | 28.68 | 0.6541 | **0.9901** | **0.12%** | **YES** |
| **Gaussian Noise** | $\mu=0, \sigma=20$ | 22.97 | 0.4410 | **0.9836** | **0.25%** | **YES** |
| **Salt & Pepper** | Density = 1% | 24.28 | 0.7208 | **0.9822** | **0.27%** | **YES** |
| **Salt & Pepper** | Density = 3% | 19.65 | 0.5312 | **0.9778** | **0.37%** | **YES** |
| **Gaussian Blur** | Kernel $3 \times 3$ | 51.96 | 0.9972 | **0.9727** | **1.20%** | **YES** |
| **Gaussian Blur** | Kernel $5 \times 5$ | 50.49 | 0.9941 | **0.9699** | **8.91%** | **YES** |
| **Spatial Scaling** | Scale factor = 0.75× | 52.20 | 0.9978 | **0.9741** | **0.10%** | **YES** |
| **Spatial Scaling** | Scale factor = 0.50× | 50.74 | 0.9950 | **0.9761** | **0.06%** | **YES** |
| **Boundary Cropping** | Ratio = 5% border | 11.28 | 0.8910 | **0.9746** | **0.03%** | **YES** |
| **Boundary Cropping** | Ratio = 10% border | 8.32 | 0.8012 | **0.9672** | **0.38%** | **YES** |
| **Brightness Adjustment**| Factor = +20% | 21.40 | 0.9421 | **0.7622** | **18.79%** | **YES** |
| **Brightness Adjustment**| Factor = -20% | 17.88 | 0.9310 | **0.9743** | **0.02%** | **YES** |
| **Contrast Adjustment** | Factor = +20% | 26.66 | 0.9540 | **0.8433** | **10.35%** | **YES** |
| **Contrast Adjustment** | Factor = -20% | 23.00 | 0.9480 | **0.9742** | **0.02%** | **YES** |
| **Spatial Rotation** | $\theta = +2^{\circ}$ | 28.60 | 0.8120 | 0.4177 | 59.13% | NO (Unsynchronized) |
| **Spatial Rotation** | $\theta = +5^{\circ}$ | 20.80 | 0.6540 | 0.5962 | 58.14% | NO (Unsynchronized) |

---

## 5. Key Empirical Observations

1. **Extreme Compression Resilience:** The system survives aggressive JPEG compression down to Quality=30 with NC > 0.90, confirming the theoretical advantage of embedding into the Low-Low ($LL$) frequency subband of the Luminance ($Y$) channel.
2. **Superior Noise Immunity:** Under severe Gaussian noise ($\sigma=20$) and Salt & Pepper impulsive noise (3%), the watermark maintained NC > 0.97 and BER < 0.4%. The low-pass filtering inherent in the DWT decomposition effectively attenuates spatial high-frequency noise.
3. **Cropping Resistance via Arnold Dispersion:** Even when 10% of the image boundary was completely excised (PSNR dropped to 8.32 dB), Arnold Cat Map scrambling ensured that watermark information distributed globally across the singular values was recoverable with NC = 0.9672 and BER = 0.38%.
4. **Identified Technical Limitation (Geometric Desynchronization):** Affine spatial rotation ($\theta \ge 2^{\circ}$) breaks grid alignment, causing DWT subband desynchronization and dropping NC to ~0.42–0.60. This confirms the literature finding that transform-domain watermarking requires geometric registration (e.g., Fourier-Mellin or Radon transform preprocessing) to survive non-axis-aligned rotations.

---

## 6. Frontend Production Build Verification

The React TypeScript single-page application was validated using Vite's production compiler:

```
> tsc -b && vite build
vite v5.4.21 building for production...
transforming...
✓ 1122 modules transformed.
rendering chunks...
dist/index.html                   1.00 kB │ gzip:   0.55 kB
dist/assets/index-Oz8iZZdC.css   39.04 kB │ gzip:   7.18 kB
dist/assets/index-LbDZckl4.js   626.01 kB │ gzip: 201.91 kB
✓ built in 7.20s
```

*Status: Production bundle compiled successfully with zero TypeScript lint or syntax errors.*
