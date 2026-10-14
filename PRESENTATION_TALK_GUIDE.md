# ProvenAI: 3-Person Presentation Script & Project Defense Guide

**Project Title:** ProvenAI: AI Image Provenance Verification Using Invisible Digital Watermarking  
**Presentation Duration:** 15 – 20 Minutes (approx. 5–6 minutes per speaker + 3 minutes Q&A)  
**Target Audience:** Academic Examiners, Project Review Panel, Technical Evaluators  

---

## Team Division of Work & Role Summary

| Speaker | Role & Title | Specific Subsystems Developed & Contributed | Presentation Focus Area |
| :--- | :--- | :--- | :--- |
| **Speaker 1** | **System Architect & Cryptography Lead** | • System Architecture & Threat Modeling<br>• AES-256-GCM Metadata Encryption Engine<br>• SHA-256 Image Integrity Digest & UUID Pipeline<br>• FastAPI Security (OAuth2, JWT, Bcrypt, SQLite ORM) | **The Problem, The Core Concept, Provenance Metadata & Cryptographic Security** |
| **Speaker 2** | **Core AI & Watermarking Algorithms Specialist** | • YCrCb Luminance ($Y$) Channel Decomposition<br>• 1-Level 2D Discrete Wavelet Transform (DWT)<br>• SVD False-Positive Resistant Matrix Embedding (Scheme B)<br>• 2D Chaotic Arnold Cat Map Permutation Engine | **Mathematical Formulation, DWT-SVD Pipeline, Resolving the False Positive Problem, Arnold Permutation** |
| **Speaker 3** | **Full-Stack Engineer & Evaluation Lead** | • React 18 + TypeScript + Tailwind CSS UI/UX<br>• 9-Vector Interactive Attack Simulator<br>• Evaluation Metrics (PSNR, SSIM, NC, BER)<br>• Automated 21-Condition Benchmark Suite & Live Demo | **Full-Stack Application, Attack Simulator, Empirical Results, Critical Limitations & Live Demo** |

---

# Presentation Slide-by-Slide & Speaking Guide

```
+-----------------------------------------------------------------------------------------+
|                               TIMELINE & FLOW OF PRESENTATION                           |
|                                                                                         |
|  [0:00 - 5:30]     SPEAKER 1: Problem Statement, Core Philosophy, Metadata Cryptography |
|  [5:30 - 11:00]    SPEAKER 2: DWT-SVD Mathematical Engine, FPP Resolution, Arnold Map   |
|  [11:00 - 16:30]   SPEAKER 3: Platform Architecture, Attack Benchmarks, Results & Demo   |
|  [16:30 - 20:00]   ALL MEMBERS: Joint Conclusion, Limitations & Examiner Q&A Defense    |
+-----------------------------------------------------------------------------------------+
```

---

## PART 1: SPEAKER 1 — The Problem, Provenance Philosophy, & Cryptography
**Speaker 1 Role:** System Architect & Cryptography Lead  
**Time Allocation:** 0:00 – 5:30 (approx. 5.5 minutes)  

### Slide 1: Title Slide & Team Introduction
* **Visual:** ProvenAI Logo, Project Title, Names of 3 Team Members.
* **Speaker 1 Script:**
  > *"Good morning respected evaluators, professors, and committee members. Today, my teammates and I are proud to present our final-year project: **ProvenAI: AI Image Provenance Verification Using Invisible Digital Watermarking**.*  
  >  
  > *I am [Speaker 1 Name], the System Architect and Cryptography Lead. Alongside me are [Speaker 2 Name], who developed the core DWT-SVD mathematical watermarking algorithms, and [Speaker 3 Name], who built the full-stack interactive platform and conducted our adversarial robustness benchmarks.*  
  >  
  > *Over the next 15 minutes, we will walk you through why generative AI has broken digital media trust, why current detection models fail, and how our active provenance verification system provides a mathematically tamper-proof solution."*

---

### Slide 2: The Core Problem — Why Generative AI Broke Digital Trust
* **Visual:** Side-by-side comparison of photorealistic AI art (Midjourney/Stable Diffusion) vs. real camera photograph, with bullet points on copyright theft, deepfakes, and attribution loss.
* **Speaker 1 Script:**
  > *"With the advent of modern diffusion models like Midjourney, DALL-E 3, and Stable Diffusion XL, anyone can generate hyper-realistic imagery in seconds. While this unlocks incredible creative productivity, it has created a severe socio-technical crisis:*  
  > *1. **Copyright Infringement & Theft:** Digital artists have their styles and works cloned without attribution.*  
  > *2. **Deepfakes & Disinformation:** Fake synthetic images are masqueraded as genuine photojournalism.*  
  > *3. **Provenance Stripping:** When images are uploaded to social media platforms, EXIF headers and metadata are completely erased.*  
  >  
  > *The industry initially tried to solve this with **passive AI detectors**—neural networks trained to spot generative artifacts. But passive detectors suffer from a fatal flaw: they fail when an image is simply compressed, resized, or filtered. More importantly, a passive detector can never answer the real legal questions: **Who created this asset? What prompt was used? What AI model generated it? And has it been altered?**"*

---

### Slide 3: The ProvenAI Paradigm — Active Provenance vs. Passive Detection
* **Visual:** Clear conceptual diagram: `Passive Detection (Guessing from pixels)` vs. `ProvenAI Active Provenance (Cryptographic Passport inside pixels)`.
* **Speaker 1 Script:**
  > *"This brings us to the foundational philosophy of our project:*  
  > ***ProvenAI is NOT an AI-generated image detector.***  
  >  
  > *ProvenAI is an **active provenance verification and tamper-detection system**. Instead of guessing whether an image is AI-generated, ProvenAI securely embeds an **imperceptible, invisible digital watermark** carrying an **encrypted cryptographic provenance passport** directly into the structural transform coefficients of the image at creation time.*  
  >  
  > *Even if the image is shared, compressed to JPEG, cropped, or blurred, this invisible passport travels with the pixel data itself, allowing us to later extract the watermark, decrypt the ownership metadata, and mathematically verify its authenticity."*

---

### Slide 4: Cryptographic Provenance Architecture & AES-256-GCM
* **Visual:** JSON metadata payload structure diagram showing AES-256-GCM encryption with 12-byte random nonce and SHA-256 hash.
* **Speaker 1 Script:**
  > *"To ensure that provenance data cannot be forged, snooped, or tampered with, I designed an authenticated cryptographic pipeline.*  
  >  
  > *Every protected image carries a structured metadata payload containing:*  
  > *• The Owner / Studio Name*  
  > *• Authenticated User ID*  
  > *• ISO-8601 UTC Generation Timestamp*  
  > *• AI Model Name and Architecture*  
  > *• Unique Prompt Identifier*  
  > *• A Random Image UUIDv4*  
  > *• The SHA-256 Cryptographic Hash of the original image bytes.*  
  >  
  > *This structured payload is encrypted using **AES-256 in Galois/Counter Mode (GCM)**. AES-GCM is an Authenticated Encryption with Associated Data (AEAD) standard. For every single embedding, we generate a fresh, cryptographically secure 12-byte random nonce. This guarantees that even if two images have identical creators and prompts, their encrypted ciphertexts are completely distinct.*  
  >  
  > *This encrypted string is then synthesized into a $128 \times 128$ binary QR matrix. But how do we invisibly embed this QR matrix into the image without distorting visual quality or being vulnerable to attackers?*  
  >  
  > *To explain the core mathematical watermarking engine and our solution to the classical False Positive Problem, I will now hand over to [Speaker 2 Name]."*

---

## PART 2: SPEAKER 2 — DWT-SVD Mathematical Engine & Watermark Algorithms
**Speaker 2 Role:** Core AI & Watermarking Algorithms Specialist  
**Time Allocation:** 5:30 – 11:00 (approx. 5.5 minutes)  

### Slide 5: The Frequency Domain — Why DWT + SVD in the Luminance ($Y$) Channel?
* **Visual:** YCrCb color decomposition diagram, followed by 1-level 2D Haar DWT showing LL, LH, HL, HH subbands, and SVD decomposition of LL.
* **Speaker 2 Script:**
  > *"Thank you, [Speaker 1 Name]. As the algorithm lead, my responsibility was formulating a mathematical watermarking engine that satisfies the **watermarking trilemma**: high visual imperceptibility, extreme robustness against attacks, and mathematical security.*  
  >  
  > *First, we transform the host RGB image into the **YCrCb color space**. Why? Because human vision is sensitive to luminance changes but insensitive to chrominance, whereas lossy image compression like JPEG heavily compresses chrominance ($Cr, Cb$). By isolating the **Luminance ($Y$) channel**, we ensure maximum energy preservation.*  
  >  
  > *Next, we apply a **1-level 2D Discrete Wavelet Transform (DWT)** using the Haar wavelet. This decomposes the Luminance channel into four frequency subbands:*  
  > *• $LH, HL, HH$ containing high-frequency edge gradients.*  
  > *• The **$LL$ subband**—which represents the low-frequency approximation containing the dominant structural energy of the image.*  
  >  
  > *Modifying high-frequency subbands would be fragile against blurring and compression. Therefore, we target the $LL$ subband, and decompose it using **Singular Value Decomposition (SVD)**: $LL = U_Y \Sigma_Y V_Y^T$.*  
  > *Singular values represent intrinsic geometric luminance energy. They possess exceptional algebraic stability: when an image undergoes noise or compression, its singular values shift only marginally."*

---

### Slide 6: Solving the SVD False-Positive Problem (FPP) via Scheme B
* **Visual:** Diagram comparing Classical SVD (vulnerable to false claims) vs. ProvenAI's False-Positive Resistant Scheme B matrix embedding.
* **Speaker 2 Script:**
  > *"Here, our research encountered a critical academic obstacle: **The False Positive Problem (FPP)**.*  
  >  
  > *In 2002, Liu and Tan proposed direct SVD watermarking by modifying singular values: $\Sigma_{\text{mod}} = \Sigma_Y + \alpha W$. But in 2007, Chung et al. proved that this classical method is completely broken. Why? Because the spatial patterns of an image reside in the singular vectors $U$ and $V$, not $\Sigma$. If an attacker claims ownership, they can decompose any image, substitute their own arbitrary watermark into the singular values, and falsely extract a high-correlation watermark!*  
  >  
  > *In ProvenAI, we strictly solved this vulnerability by implementing **Matrix Embedding (Scheme B)**:*  
  > *1. We take our scrambled watermark matrix $W_{\text{scrambled}}$ and construct a composite matrix: $M = \Sigma_Y + \alpha W_{\text{float}}$.*  
  > *2. We perform SVD on matrix $M$ itself: $M = U_M \Sigma_M V_M^T$.*  
  > *3. We embed only the composite singular values $\Sigma_M$ into the host: $LL_{\text{mod}} = U_Y \Sigma_M V_Y^T$.*  
  > *4. We archive the orthogonal matrices $U_M$ and $V_M$ as secret cryptographic security keys.*  
  >  
  > *Because extracting the watermark mathematically requires the exact orthogonal eigenvectors $U_M$ and $V_M$, an attacker cannot fabricate a false positive claim. Ownership is uniquely and irreversibly tied to the creator's secret key."*

---

### Slide 7: Chaotic Spatial Dispersion — The 2D Arnold Cat Map
* **Visual:** Visual progression of a QR code undergoing 5 rounds of Arnold Cat Map permutation, becoming complete pseudo-random white noise.
* **Speaker 2 Script:**
  > *"Before embedding the $128 \times 128$ QR watermark into matrix $M$, we face another threat: **localized spatial cropping**.*  
  > *If an attacker crops 10% of the image border, a standard watermark embedded spatially would lose an entire corner of data.*  
  >  
  > *To prevent this, we implemented **Arnold Cat Map chaotic scrambling**. For every pixel coordinate $(x, y)$ in our $N \times N$ watermark, we apply the 2D chaotic transform:*  
  > $$\begin{bmatrix} x' \\ y' \end{bmatrix} = \begin{bmatrix} 1 & 1 \\ 1 & 2 \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} \pmod N$$  
  >  
  > *We execute 5 scrambling iterations. As you can see on the slide, the structured QR code is transformed into uncorrelated, pseudo-random noise. Adjacent watermark bits are scattered across distant coordinates in the frequency spectrum.*  
  > *During extraction, we apply the exact inverse transformation matrix $\begin{bmatrix} 2 & -1 \\ -1 & 1 \end{bmatrix} \pmod N$.*  
  >  
  > *Through this combination of parameter tuning—setting our embedding strength $\alpha = 2.0$ and 5 Arnold iterations—we achieve both imperceptibility and extreme attack resilience.*  
  >  
  > *To show how this operates inside our complete web application and review our benchmark results across 21 attacks, I now hand over to [Speaker 3 Name]."*

---

## PART 3: SPEAKER 3 — Platform Architecture, Attack Benchmarks, Results & Live Demo
**Speaker 3 Role:** Full-Stack Engineer & Evaluation Lead  
**Time Allocation:** 11:00 – 16:30 (approx. 5.5 minutes)  

### Slide 8: Full-Stack Architecture & User Experience
* **Visual:** System architecture diagram (FastAPI + React 18 + Tailwind CSS + SQLite + Docker) alongside screenshots of the modern glassmorphism UI.
* **Speaker 3 Script:**
  > *"Thank you, [Speaker 2 Name]. While the mathematical algorithms provide the theoretical foundation, my role was translating this into a production-grade, highly responsive full-stack platform.*  
  >  
  > *ProvenAI is built as a decoupled, modern web system:*  
  > *• **Frontend:** A responsive single-page application built with React 18, TypeScript, and Tailwind CSS v4, featuring a dark-mode glassmorphism interface, interactive drag-and-drop file uploaders, and Framer Motion animated state transitions.*  
  > *• **Backend API Gateway:** High-performance Python FastAPI service with synchronous SQLite persistence (configured with Write-Ahead Logging for concurrency) and automated OpenAPI Swagger documentation.*  
  > *• **Containerization:** Complete Docker and Docker Compose orchestration with an alpine Nginx reverse proxy for production deployment.*  
  >  
  > *The platform provides dedicated modules for **Watermark Embedding**, **Authenticity Verification**, **Adversarial Attack Simulation**, and an **Analytics Dashboard** tracking PSNR, SSIM, and tamper rates."*

---

### Slide 9: Imperceptibility & Visual Quality Benchmark
* **Visual:** Bar chart showing Baseline vs. Watermarked Image quality (PSNR = 48.04 dB, SSIM = 0.9902), along with a side-by-side zoom showing zero visible artifacts.
* **Speaker 3 Script:**
  > *"Let us examine our empirical results. In digital watermarking, the industry standard for visual imperceptibility is a **PSNR greater than 38 dB** and an **SSIM above 0.98**.*  
  >  
  > *On our generative AI benchmark test imagery, ProvenAI achieved:*  
  > *• **PSNR = 48.04 dB** (over 10 dB above the invisibility threshold).*  
  > *• **SSIM = 0.9902** (99.02% structural fidelity preservation).*  
  > *• **Embedding Latency = 0.404 seconds**.*  
  > *• **Extraction Latency = 0.246 seconds**.*  
  > *• **Clean Bit Error Rate (BER) = 0.00%**.*  
  >  
  > *The watermarked image is visually indistinguishable from the pristine generative original, yet it contains the complete encrypted provenance payload."*

---

### Slide 10: Multi-Attack Robustness Benchmark (21 Attack Scenarios)
* **Visual:** The 21-attack benchmark horizontal bar chart (`fig3_attack_robustness_nc.png`) and radar chart (`fig5_watermark_recovery_radar.png`).
* **Speaker 3 Script:**
  > *"To rigorously validate robustness, we developed an automated test suite executing **21 distinct attack scenarios** covering every standard image manipulation vector:*  
  >  
  > *1. **JPEG Compression:** At standard JPEG Quality 90, Normalized Correlation was **0.9843**. Even under severe, aggressive compression down to **Quality 30**, our watermark survived with **NC = 0.9083** and BER under 5.3%.*  
  > *2. **Additive Gaussian Noise:** Under severe Gaussian noise with standard deviation $\sigma = 20$ (where PSNR plummeted to 22.97 dB), ProvenAI recovered the watermark with **NC = 0.9836** and **BER = 0.25%**!*  
  > *3. **Impulse Noise:** Under 3% Salt & Pepper noise, NC remained at **0.9778**.*  
  > *4. **Boundary Cropping:** When 10% of the image border was completely cut away (dropping PSNR to 8.32 dB), our Arnold Cat Map dispersion recovered the watermark with **NC = 0.9672**.*  
  > *5. **Spatial Scaling & Blurring:** Survived 0.50× downscaling with **NC = 0.9761** and $5 \times 5$ Gaussian blur with **NC = 0.9699**.*  
  >  
  > *Across all compression, noise, filtering, and cropping attacks, ProvenAI demonstrated near-perfect recovery."*

---

### Slide 11: Critical System Limitations & Future Work
* **Visual:** Slide detailing the Spatial Rotation limitation ($\theta = 2^{\circ}$) and future Fourier-Mellin / Neural Latent Space integration.
* **Speaker 3 Script:**
  > *"In the spirit of honest scientific reporting, our benchmark also isolated our system's primary technical limitation: **Unsynchronized Spatial Rotation**.*  
  >  
  > *When an image was rotated by just 2 degrees, the Normalized Correlation dropped to 0.4177. Why? Because the Discrete Wavelet Transform operates on a rectilinear orthogonal grid. Rotation causes subband desynchronization.*  
  >  
  > *In our future work, we plan to resolve this by integrating **Fourier-Mellin transform preprocessing** to automatically correct rotation angles prior to DWT extraction, as well as exploring **latent-space diffusion watermarking** directly within the generative denoising network."*

---

### Slide 12: Live System Demonstration Walkthrough
* **Visual:** Switching to live browser running on `http://localhost:3000`.
* **Speaker 3 Script:**
  > *"Now, we would like to show you ProvenAI running live.*  
  >  
  > *[Step 1: Sign in with researcher credentials on the React dashboard]*  
  > *[Step 2: Navigate to `/embed`, upload an AI-generated art piece, input creator name 'Studio AI' and model 'Midjourney v6', and click Embed. Point out the instant 48 dB PSNR and download the protected PNG]*  
  > *[Step 3: Navigate to `/attack`, select the protected image, apply 50% JPEG Compression. Show the attacked preview and verify that NC is 0.947+ and watermark survived]*  
  > *[Step 4: Navigate to `/verify`, upload the attacked image, click Verify Authenticity. Show the green authentic badge, the 95%+ confidence circle, and the decrypted provenance metadata displaying Owner, Prompt ID, and Timestamp].*  
  >  
  > *Everything you see here is executed dynamically through our live running FastAPI backend and React frontend."*

---

## PART 4: CONCLUSION & EXAMINER Q&A DEFENSE
**Time Allocation:** 16:30 – 20:00 (approx. 3.5 minutes)  

### Slide 13: Summary of Deliverables & Conclusion
* **Speaker 1 Conclusion:**
  > *"To conclude: ProvenAI successfully bridges the gap between generative AI creativity and content accountability. We have delivered:*  
  > *1. An imperceptible, mathematically false-positive-resistant DWT-SVD watermarking engine.*  
  > *2. Authenticated AES-256-GCM metadata encryption.*  
  > *3. Empirically proven survivability across 21 attack benchmarks.*  
  > *4. A production-ready, Dockerized full-stack application.*  
  >  
  > *We thank the examination committee for your time, and we are now open to your questions."*

---

# Anticipated Examiner Questions & Model Answers

### Question 1 (Targeted at Speaker 2):
**"Why did you use DWT-SVD instead of simple DCT or spatial LSB?"**
* **Speaker 2 Answer:**
  > *"Spatial LSB is extremely fragile; even saving an image as a JPEG will completely destroy the least significant bits. DCT is better, but it operates on fixed blocks (typically $8 \times 8$), which introduces visible blocky artifacts under compression. DWT provides multi-resolution spatio-frequency localization without blocking artifacts. Combining DWT with SVD gives us the best of both worlds: DWT isolates the low-frequency approximation energy in the $LL$ subband, while SVD's singular values provide algebraic stability against perturbations. That is why our clean PSNR is 48.04 dB while surviving JPEG compression down to Quality 30."*

---

### Question 2 (Targeted at Speaker 1):
**"How does ProvenAI prevent an attacker from modifying the owner name or timestamp in the watermark?"**
* **Speaker 1 Answer:**
  > *"The provenance metadata is encrypted using AES-256 in Galois/Counter Mode (GCM). AES-GCM is an Authenticated Encryption with Associated Data (AEAD) algorithm. It produces both ciphertext and an authentication tag. If an attacker attempts to alter even a single bit of the encrypted payload, GCM authentication fails during decryption, alerting the system immediately that the metadata was tampered with. Furthermore, the payload contains the SHA-256 hash of the original image, providing an immutable integrity digest."*

---

### Question 3 (Targeted at Speaker 2):
**"Explain the False Positive Problem in SVD watermarking and how your Scheme B solves it."**
* **Speaker 2 Answer:**
  > *"In classical SVD watermarking by Liu and Tan, the watermark is embedded directly into singular values: $\Sigma_{\text{mod}} = \Sigma_Y + \alpha W$. During extraction, the detector uses the attacker's supplied watermark singular vectors $U_w$ and $V_w$. Because the spatial structure of any matrix is preserved in its orthogonal singular vectors $U$ and $V$, anyone can pair their own arbitrary watermark eigenvectors with the extracted singular values and extract a high-correlation watermark from an image they never owned.  
  > In ProvenAI, we implement Scheme B: we form a composite matrix $M = \Sigma_Y + \alpha W_{\text{float}}$ and perform SVD on $M$. The resulting orthogonal matrices $U_M$ and $V_M$ are saved as secret security keys. Watermark extraction is mathematically impossible without these specific orthogonal matrices, completely closing the false-positive loophole."*

---

### Question 4 (Targeted at Speaker 3):
**"Your results show rotation failed at 2 degrees. Why did this happen and how would you fix it?"**
* **Speaker 3 Answer:**
  > *"2D Discrete Wavelet Transform relies on an axis-aligned rectilinear grid (filtering rows and columns sequentially). When an image undergoes affine rotation, the spatial coordinates are desynchronized relative to the wavelet basis functions, causing the extracted $LL$ subband to misalign. We transparently documented this in Chapter 5 of our report. To resolve this in production, we can apply Fourier-Mellin transform registration or feature-point matching (like SIFT or ORB) to detect the rotation angle and rotate the image back to $0^{\circ}$ alignment before passing it to the DWT extraction module."*

---

### Question 5 (Targeted at Speaker 3):
**"What is the significance of the 0.70 Normalized Correlation threshold?"**
* **Speaker 3 Answer:**
  > *"In digital watermarking literature, Normalized Correlation (NC) ranges from 0.0 to 1.0. An NC of 1.0 indicates a pristine, identical match, while random uncorrelated images yield an NC between 0.10 and 0.35. Through our empirical testing across 21 attack conditions, we found that genuine watermarks under moderate to heavy attacks (like JPEG Q=50 or Gaussian noise $\sigma=20$) maintain an NC between 0.75 and 0.99. Setting our decision threshold at $\text{NC} \ge 0.70$ provides a statistically robust margin that eliminates false alarms while reliably verifying genuine watermarks even after aggressive tampering."*
