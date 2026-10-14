import os
import json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

os.makedirs('report/figures', exist_ok=True)

with open('test_benchmark_results.json', 'r') as f:
    bench = json.load(f)

attacks = bench['attacks']

# Set style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.size'] = 10
plt.rcParams['axes.labelsize'] = 11
plt.rcParams['axes.titlesize'] = 12
plt.rcParams['figure.titlesize'] = 14

# --- Figure 1: Architectural Block Diagram ---
fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
ax.axis('off')
boxes = [
    ("Host AI Image (RGB)\n[PNG/JPEG/WEBP]", (0.05, 0.70), (0.22, 0.20), "#e0e7ff", "#4338ca"),
    ("Metadata Generation & AES-256\n[UUID, Owner, Timestamp, SHA-256]", (0.05, 0.35), (0.22, 0.22), "#fef3c7", "#b45309"),
    ("QR Code Representation\n[128x128 Binary Pattern]", (0.33, 0.35), (0.18, 0.22), "#fef3c7", "#b45309"),
    ("Arnold Cat Map Scrambling\n[5 Iterations / Spatial Dispersion]", (0.56, 0.35), (0.20, 0.22), "#fef3c7", "#b45309"),
    ("Color Space Converter\n[RGB -> YCrCb (Luminance Y)]", (0.33, 0.70), (0.18, 0.20), "#dcfce7", "#15803d"),
    ("1-Level 2D DWT\n[Haar Wavelet -> LL Subband]", (0.56, 0.70), (0.18, 0.20), "#dcfce7", "#15803d"),
    ("Singular Value Decomposition (SVD)\n[LL = U_Y * S_Y * Vh_Y]", (0.78, 0.70), (0.18, 0.20), "#dcfce7", "#15803d"),
    ("False-Positive Resistant Fusion\n[M = diag(S_Y) + alpha * W_scrambled]\n[SVD(M) -> S_M, IDWT -> Watermarked RGB]", (0.50, 0.05), (0.45, 0.22), "#ede9fe", "#6d28d9"),
]

for label, (x, y), (w, h), bg, border in boxes:
    rect = plt.Rectangle((x, y), w, h, facecolor=bg, edgecolor=border, linewidth=2, transform=ax.transAxes, zorder=2)
    ax.add_patch(rect)
    ax.text(x + w/2, y + h/2, label, ha='center', va='center', fontsize=9, fontweight='bold', color='#1e293b', transform=ax.transAxes, zorder=3)

# Arrows
arrows = [
    ((0.27, 0.80), (0.33, 0.80)),
    ((0.51, 0.80), (0.56, 0.80)),
    ((0.74, 0.80), (0.78, 0.80)),
    ((0.27, 0.46), (0.33, 0.46)),
    ((0.51, 0.46), (0.56, 0.46)),
    ((0.66, 0.35), (0.66, 0.27)),
    ((0.87, 0.70), (0.87, 0.27)),
]
for p1, p2 in arrows:
    ax.annotate('', xy=p2, xytext=p1, xycoords='axes fraction', textcoords='axes fraction',
                arrowprops=dict(arrowstyle="->", color="#334155", lw=2, shrinkA=5, shrinkB=5))

ax.set_title("ProvenAI: End-to-End Secure DWT-SVD Provenance Watermarking Architecture", fontsize=13, fontweight='bold', pad=15)
plt.tight_layout()
plt.savefig('report/figures/fig1_system_architecture.png', dpi=300)
plt.close()

# --- Figure 2: DWT-SVD Embedding & Extraction Pipeline ---
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5), dpi=300)
ax1.axis('off')
ax2.axis('off')

ax1.set_title("(a) Watermark Embedding Pipeline", fontsize=11, fontweight='bold')
ax2.set_title("(b) Provenance Extraction & Verification", fontsize=11, fontweight='bold')

embed_steps = [
    "1. Host AI Image Input (RGB, HxWx3)",
    "2. YCrCb Color Decomposition (Extract Y)",
    "3. 1-Level 2D Discrete Wavelet Transform (LL, LH, HL, HH)",
    "4. SVD on LL Subband: LL = U_Y * diag(S_Y) * Vh_Y",
    "5. Metadata Payload Encryption (AES-256-GCM)",
    "6. Generate 128x128 Binary QR Matrix",
    "7. Arnold Cat Map Permutation (5 Rounds)",
    "8. Composite SVD Formulation: M = diag(S_Y) + alpha * W",
    "9. SVD on Matrix M: M = U_M * diag(S_M) * Vh_M",
    "10. Modified LL Subband: LL' = U_Y * diag(S_M) * Vh_Y",
    "11. Inverse DWT (IDWT) & RGB Synthesis",
    "12. Watermarked Output Image (PSNR=48.04 dB, SSIM=0.9902)"
]

extract_steps = [
    "1. Suspect / Attacked Image Input (RGB)",
    "2. Channel Extraction: Y_suspect Channel",
    "3. DWT on Y_suspect: Extract LL_suspect",
    "4. SVD on LL_suspect: Obtain S_suspect",
    "5. Retrieve Security Key Matrices (U_M, Vh_M, S_Y)",
    "6. Invert SVD Transformation: M* = U_M * diag(S_suspect) * Vh_M",
    "7. Extract Scrambled Pattern: W* = (M* - diag(S_Y)) / alpha",
    "8. Inverse Arnold Cat Map Deshuffling",
    "9. Extract Reconstructed QR Matrix",
    "10. Compute Metrics: NC (Cosine Sim), BER",
    "11. Decrypt Provenance Metadata (AES-256-GCM)",
    "12. Integrity & Provenance Decision Engine (NC >= 0.70 -> Authentic)"
]

for i, text in enumerate(embed_steps):
    ax1.text(0.05, 0.95 - i*0.08, text, fontsize=9, transform=ax1.transAxes,
             bbox=dict(boxstyle="round,pad=0.4", facecolor="#f1f5f9", edgecolor="#cbd5e1"))

for i, text in enumerate(extract_steps):
    ax2.text(0.05, 0.95 - i*0.08, text, fontsize=9, transform=ax2.transAxes,
             bbox=dict(boxstyle="round,pad=0.4", facecolor="#ecfdf5", edgecolor="#a7f3d0"))

plt.suptitle("ProvenAI Mathematical Workflow Pipelines", fontsize=13, fontweight='bold', y=0.98)
plt.tight_layout()
plt.savefig('report/figures/fig2_dwt_svd_workflow.png', dpi=300)
plt.close()

# --- Figure 3: Attack Robustness NC Scores ---
labels = [a['label'] for a in attacks]
nc_scores = [a['nc_after'] for a in attacks]
survived = [a['watermark_survived'] for a in attacks]
colors = ['#10b981' if s else '#ef4444' for s in survived]

fig, ax = plt.subplots(figsize=(12, 6), dpi=300)
bars = ax.barh(labels[::-1], nc_scores[::-1], color=colors[::-1], edgecolor='#334155', linewidth=0.8)
ax.axvline(0.70, color='#dc2626', linestyle='--', linewidth=1.5, label='Verification Threshold (NC = 0.70)')
ax.set_xlim(0, 1.05)
ax.set_xlabel("Normalized Correlation (NC)", fontsize=11, fontweight='bold')
ax.set_title("ProvenAI: Normalized Correlation (NC) Recovery under Diverse Image Attacks", fontsize=12, fontweight='bold')
ax.legend(loc='lower right', frameon=True)

# Add values to bars
for bar in bars:
    w = bar.get_width()
    ax.text(w + 0.01, bar.get_y() + bar.get_height()/2, f"{w:.4f}", va='center', fontsize=8, color='#0f172a')

plt.tight_layout()
plt.savefig('report/figures/fig3_attack_robustness_nc.png', dpi=300)
plt.close()

# --- Figure 4: Bit Error Rate (BER) across Attacks ---
ber_scores = [a['ber_after'] * 100 for a in attacks]

fig, ax = plt.subplots(figsize=(12, 6), dpi=300)
bars2 = ax.barh(labels[::-1], ber_scores[::-1], color='#6366f1', edgecolor='#312e81', linewidth=0.8)
ax.axvline(5.0, color='#d97706', linestyle='--', linewidth=1.5, label='Reliable Extraction Boundary (BER = 5.0%)')
ax.set_xlim(0, max(ber_scores) * 1.15)
ax.set_xlabel("Bit Error Rate (%) [Lower is Better]", fontsize=11, fontweight='bold')
ax.set_title("ProvenAI: Watermark Bit Error Rate (BER) across Attack Scenarios", fontsize=12, fontweight='bold')
ax.legend(loc='upper right', frameon=True)

for bar in bars2:
    w = bar.get_width()
    ax.text(w + 0.5, bar.get_y() + bar.get_height()/2, f"{w:.2f}%", va='center', fontsize=8, color='#0f172a')

plt.tight_layout()
plt.savefig('report/figures/fig4_ber_vs_attack.png', dpi=300)
plt.close()

# --- Figure 5: Category-Wise Radar Robustness Chart ---
categories = ['JPEG\nCompression', 'Gaussian\nNoise', 'Salt & Pepper\nNoise', 'Gaussian\nBlur', 'Scaling', 'Cropping', 'Contrast\nMod.', 'Brightness\nMod.', 'Rotation\n(Unsynced)']

# Grouped averages
jpeg_nc = np.mean([a['nc_after'] for a in attacks if 'JPEG' in a['label']])
gn_nc = np.mean([a['nc_after'] for a in attacks if 'Gaussian Noise' in a['label']])
sp_nc = np.mean([a['nc_after'] for a in attacks if 'Salt & Pepper' in a['label']])
blur_nc = np.mean([a['nc_after'] for a in attacks if 'Blur' in a['label']])
scale_nc = np.mean([a['nc_after'] for a in attacks if 'Scaling' in a['label']])
crop_nc = np.mean([a['nc_after'] for a in attacks if 'Cropping' in a['label']])
contrast_nc = np.mean([a['nc_after'] for a in attacks if 'Contrast' in a['label']])
bright_nc = np.mean([a['nc_after'] for a in attacks if 'Brightness' in a['label']])
rot_nc = np.mean([a['nc_after'] for a in attacks if 'Rotation' in a['label']])

values = [jpeg_nc, gn_nc, sp_nc, blur_nc, scale_nc, crop_nc, contrast_nc, bright_nc, rot_nc]
values += values[:1] # close polygon

angles = np.linspace(0, 2 * np.pi, len(categories), endpoint=False).tolist()
angles += angles[:1]

fig, ax = plt.subplots(figsize=(7, 7), subplot_kw=dict(polar=True), dpi=300)
ax.plot(angles, values, color='#4f46e5', linewidth=2.5)
ax.fill(angles, values, color='#6366f1', alpha=0.3)
ax.set_thetagrids(np.degrees(angles[:-1]), categories, fontsize=9, fontweight='bold')
ax.set_ylim(0, 1.0)
ax.set_yticks([0.2, 0.4, 0.6, 0.8, 1.0])
ax.set_yticklabels(['0.2', '0.4', '0.6', '0.8', '1.0'], fontsize=8)
ax.plot(angles, [0.70]*len(angles), color='#dc2626', linestyle='--', linewidth=1.2, label='Authenticity Threshold (0.70)')
ax.set_title("ProvenAI: Multilateral Attack Robustness Radar Profile", fontsize=12, fontweight='bold', pad=20)
ax.legend(loc='lower left', bbox_to_anchor=(0.85, 0.05), fontsize=8)

plt.tight_layout()
plt.savefig('report/figures/fig5_watermark_recovery_radar.png', dpi=300)
plt.close()

# --- Figure 6: Imperceptibility Quality Metrics Comparison ---
fig, ax = plt.subplots(figsize=(8, 4.5), dpi=300)
metrics_labels = ['Host Image\n(Baseline)', 'Watermarked Image\n(alpha = 2.0)']
psnr_vals = [np.inf, bench['embedding']['psnr_db']]
ssim_vals = [1.0, bench['embedding']['ssim']]

x_pos = np.arange(2)
w_bar = 0.35

ax2 = ax.twinx()
p1 = ax.bar(x_pos - w_bar/2, [55, bench['embedding']['psnr_db']], width=w_bar, color='#0284c7', label='PSNR (dB)')
p2 = ax2.bar(x_pos + w_bar/2, ssim_vals, width=w_bar, color='#10b981', label='SSIM Index')

ax.set_ylabel('PSNR (dB)', color='#0284c7', fontweight='bold')
ax2.set_ylabel('SSIM Index (0.0 to 1.0)', color='#10b981', fontweight='bold')
ax.set_ylim(0, 60)
ax2.set_ylim(0, 1.05)
ax.set_xticks(x_pos)
ax.set_xticklabels(metrics_labels, fontweight='bold')
ax.set_title(f"ProvenAI Imperceptibility: PSNR = {bench['embedding']['psnr_db']:.2f} dB, SSIM = {bench['embedding']['ssim']:.4f}", fontweight='bold')

ax.text(x_pos[1] - w_bar/2, bench['embedding']['psnr_db'] + 1, f"{bench['embedding']['psnr_db']:.2f} dB", ha='center', fontweight='bold', color='#0284c7')
ax2.text(x_pos[1] + w_bar/2, bench['embedding']['ssim'] + 0.02, f"{bench['embedding']['ssim']:.4f}", ha='center', fontweight='bold', color='#10b981')

plt.tight_layout()
plt.savefig('report/figures/fig6_imperceptibility_comparison.png', dpi=300)
plt.close()

print("[+] All 6 publication-grade figures generated in report/figures/")
