import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def create_doc():
    doc = Document()
    for s in doc.sections:
        s.top_margin = Inches(1.0)
        s.bottom_margin = Inches(1.0)
        s.left_margin = Inches(1.0)
        s.right_margin = Inches(1.0)

    # Styles
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Times New Roman'
    font.size = Pt(11)
    font.color.rgb = RGBColor(30, 41, 59)

    # Header
    p_head = doc.add_paragraph()
    p_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_h1 = p_head.add_run("PROVENAI: 3-PERSON PRESENTATION TALK & DEFENSE SCRIPT\n")
    r_h1.font.size = Pt(18)
    r_h1.font.bold = True
    r_h1.font.color.rgb = RGBColor(30, 58, 138)

    r_h2 = p_head.add_run("AI Image Provenance Verification Using Invisible Digital Watermarking\n")
    r_h2.font.size = Pt(13)
    r_h2.font.bold = True
    r_h2.font.color.rgb = RGBColor(71, 85, 105)

    r_h3 = p_head.add_run("Comprehensive Speaker Division, Word-for-Word Scripts, Slide Layouts, and Committee Q&A Defense Guide\n\n")
    r_h3.font.size = Pt(11)
    r_h3.font.italic = True

    # Division Table
    doc.add_heading("1. Team Division of Roles & Project Modules", level=2)
    tbl = doc.add_table(rows=4, cols=4)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Speaker", "Role & Title", "Subsystems Built", "Presentation Focus Area"]
    data = [
        ["Speaker 1", "System Architect & Cryptography Lead", "System Architecture, AES-256-GCM Metadata, SHA-256 Digest, FastAPI Security (JWT, Bcrypt, SQLite)", "The Crisis in GenAI, Provenance Paradigm, Metadata Structure, AES-256-GCM"],
        ["Speaker 2", "Core AI & Watermarking Specialist", "YCrCb Decomposition, 1-Level 2D DWT, SVD Matrix Embedding (Scheme B), Arnold Cat Map", "Mathematical Formulation, DWT-SVD Pipeline, Solving False Positive Problem, Arnold Map"],
        ["Speaker 3", "Full-Stack & Evaluation Lead", "React 18 + TS Frontend, 9-Vector Attack Simulator, Benchmark Suite, Docker Deployment", "User Platform, Empirical Results (21 Attacks), Rotation Limitations, Live System Demo"]
    ]

    for c_idx, h in enumerate(headers):
        cell = tbl.cell(0, c_idx)
        cell.text = h
        set_cell_background(cell, "1e3a8a")
        set_cell_margins(cell, 100, 100, 100, 100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)
            r.font.size = Pt(9.5)

    for r_idx, row in enumerate(data):
        for c_idx, val in enumerate(row):
            cell = tbl.cell(r_idx + 1, c_idx)
            cell.text = val
            set_cell_background(cell, "f8fafc" if r_idx % 2 == 0 else "ffffff")
            set_cell_margins(cell, 80, 80, 100, 100)
            p = cell.paragraphs[0]
            for r in p.runs:
                r.font.size = Pt(9)
                if c_idx == 0:
                    r.font.bold = True
                    r.font.color.rgb = RGBColor(30, 58, 138)

    doc.add_paragraph("\n")

    # Flow chart paragraph
    doc.add_heading("2. Presentation Timing & Structure (15–20 Minutes)", level=2)
    p_flow = doc.add_paragraph()
    p_flow.paragraph_format.line_spacing = 1.2
    p_flow.add_run(
        "• 0:00 – 5:30 (Speaker 1): Problem statement, failure of passive detectors, active provenance philosophy, metadata payload, and AES-256-GCM encryption.\n"
        "• 5:30 – 11:00 (Speaker 2): Mathematical engine, YCrCb + DWT + SVD formulation, solving the classical SVD False Positive Problem (Scheme B), and Arnold Cat Map scrambling.\n"
        "• 11:00 – 16:30 (Speaker 3): Full-stack React/FastAPI architecture, empirical results (PSNR 48.04 dB, NC 0.9781), 21-attack benchmark table, rotation limitations, and live demonstration.\n"
        "• 16:30 – 20:00 (All Members): Summary of deliverables and joint committee Q&A defense."
    )

    # Detailed Speaker Sections
    doc.add_page_break()
    doc.add_heading("3. Detailed Word-for-Word Speaking Scripts", level=1)

    # Speaker 1
    doc.add_heading("PART 1: SPEAKER 1 — The Problem, Provenance Paradigm, & Cryptography", level=2)
    p1 = doc.add_paragraph()
    p1.paragraph_format.line_spacing = 1.25
    p1.add_run("Slide 1: Title Slide & Team Introduction\n").bold = True
    p1.add_run(
        "\"Good morning respected evaluators, professors, and committee members. Today, my teammates and I are proud to present our final-year project: "
        "ProvenAI: AI Image Provenance Verification Using Invisible Digital Watermarking.\n\n"
        "I am [Speaker 1 Name], the System Architect and Cryptography Lead. Alongside me are [Speaker 2 Name], who developed the core DWT-SVD mathematical "
        "watermarking algorithms, and [Speaker 3 Name], who built the full-stack interactive platform and conducted our adversarial robustness benchmarks.\n\n"
        "Over the next 15 minutes, we will walk you through why generative AI has broken digital media trust, why current detection models fail, and how our active "
        "provenance verification system provides a mathematically tamper-proof solution.\"\n\n"
    )
    p1.add_run("Slide 2: The Core Problem — Why Generative AI Broke Digital Trust\n").bold = True
    p1.add_run(
        "\"With modern diffusion models like Midjourney, DALL-E 3, and Stable Diffusion XL, anyone can generate hyper-realistic imagery in seconds. "
        "While this unlocks incredible creative productivity, it has created a severe socio-technical crisis:\n"
        "1. Copyright Infringement & Theft: Digital artists have their styles and works cloned without attribution.\n"
        "2. Deepfakes & Disinformation: Fake synthetic images are masqueraded as genuine photojournalism.\n"
        "3. Provenance Stripping: When images are uploaded to social media platforms, EXIF headers and metadata are completely erased.\n\n"
        "The industry initially tried to solve this with passive AI detectors—neural networks trained to spot generative artifacts. But passive detectors suffer from a fatal flaw: "
        "they fail when an image is simply compressed, resized, or filtered. More importantly, a passive detector can never answer the real legal questions: "
        "Who created this asset? What prompt was used? What AI model generated it? And has it been altered?\"\n\n"
    )
    p1.add_run("Slide 3: The ProvenAI Paradigm — Active Provenance vs. Passive Detection\n").bold = True
    p1.add_run(
        "\"This brings us to the foundational philosophy of our project:\n"
        "ProvenAI is NOT an AI-generated image detector.\n\n"
        "ProvenAI is an active provenance verification and tamper-detection system. Instead of guessing whether an image is AI-generated, ProvenAI securely embeds an "
        "imperceptible, invisible digital watermark carrying an encrypted cryptographic provenance passport directly into the structural transform coefficients of the image at creation time.\n\n"
        "Even if the image is shared, compressed to JPEG, cropped, or blurred, this invisible passport travels with the pixel data itself, allowing us to later extract the watermark, "
        "decrypt the ownership metadata, and mathematically verify its authenticity.\"\n\n"
    )
    p1.add_run("Slide 4: Cryptographic Provenance Architecture & AES-256-GCM\n").bold = True
    p1.add_run(
        "\"To ensure that provenance data cannot be forged, snooped, or tampered with, I designed an authenticated cryptographic pipeline.\n"
        "Every protected image carries a structured metadata payload containing: Owner Name, User ID, ISO-8601 UTC Timestamp, AI Model Architecture, Prompt ID, "
        "Random Image UUIDv4, and the SHA-256 Cryptographic Hash of the original image.\n\n"
        "This structured payload is encrypted using AES-256 in Galois/Counter Mode (GCM). AES-GCM is an Authenticated Encryption with Associated Data (AEAD) standard. "
        "For every single embedding, we generate a fresh, cryptographically secure 12-byte random nonce. This guarantees that even if two images have identical creators and prompts, "
        "their encrypted ciphertexts are completely distinct.\n\n"
        "This encrypted string is then synthesized into a 128x128 binary QR matrix. To explain how we embed this into the frequency domain, I now hand over to [Speaker 2 Name].\"\n"
    )

    # Speaker 2
    doc.add_page_break()
    doc.add_heading("PART 2: SPEAKER 2 — DWT-SVD Mathematical Engine & Watermark Algorithms", level=2)
    p2 = doc.add_paragraph()
    p2.paragraph_format.line_spacing = 1.25
    p2.add_run("Slide 5: The Frequency Domain — Why DWT + SVD in the Luminance (Y) Channel?\n").bold = True
    p2.add_run(
        "\"Thank you, [Speaker 1 Name]. As the algorithm lead, my responsibility was formulating a mathematical watermarking engine that satisfies the watermarking trilemma: "
        "high visual imperceptibility, extreme robustness against attacks, and mathematical security.\n\n"
        "First, we transform the host RGB image into the YCrCb color space. Why? Because human vision is sensitive to luminance changes but insensitive to chrominance, "
        "whereas lossy image compression like JPEG heavily compresses chrominance (Cr, Cb). By isolating the Luminance (Y) channel, we ensure maximum energy preservation.\n\n"
        "Next, we apply a 1-level 2D Discrete Wavelet Transform (DWT) using the Haar wavelet. This decomposes the Luminance channel into four frequency subbands: "
        "LH, HL, HH containing high-frequency edge gradients, and the LL subband—which represents the low-frequency approximation containing the dominant structural energy of the image.\n\n"
        "Modifying high-frequency subbands would be fragile against blurring and compression. Therefore, we target the LL subband, and decompose it using Singular Value Decomposition (SVD): "
        "LL = U_Y * diag(S_Y) * Vh_Y. Singular values represent intrinsic geometric luminance energy. They possess exceptional algebraic stability: when an image undergoes noise or compression, "
        "its singular values shift only marginally.\"\n\n"
    )
    p2.add_run("Slide 6: Solving the SVD False-Positive Problem (FPP) via Scheme B\n").bold = True
    p2.add_run(
        "\"Here, our research encountered a critical academic obstacle: The False Positive Problem (FPP).\n\n"
        "In 2002, Liu and Tan proposed direct SVD watermarking by modifying singular values: S_mod = S_Y + alpha * W. But in 2007, Chung et al. proved that this classical method is completely broken. "
        "Why? Because the spatial patterns of an image reside in the singular vectors U and V, not S. If an attacker claims ownership, they can decompose any image, substitute their own arbitrary "
        "watermark into the singular values, and falsely extract a high-correlation watermark!\n\n"
        "In ProvenAI, we strictly solved this vulnerability by implementing Matrix Embedding (Scheme B):\n"
        "1. We take our scrambled watermark matrix W_scrambled and construct a composite matrix: M = diag(S_Y) + alpha * W_float.\n"
        "2. We perform SVD on matrix M itself: M = U_M * diag(S_M) * Vh_M.\n"
        "3. We embed only the composite singular values S_M into the host: LL_mod = U_Y * diag(S_M) * Vh_Y.\n"
        "4. We archive the orthogonal matrices U_M and V_M as secret cryptographic security keys.\n\n"
        "Because extracting the watermark mathematically requires the exact orthogonal eigenvectors U_M and V_M, an attacker cannot fabricate a false positive claim. "
        "Ownership is uniquely and irreversibly tied to the creator's secret key.\"\n\n"
    )
    p2.add_run("Slide 7: Chaotic Spatial Dispersion — The 2D Arnold Cat Map\n").bold = True
    p2.add_run(
        "\"Before embedding the 128x128 QR watermark into matrix M, we face another threat: localized spatial cropping.\n"
        "If an attacker crops 10% of the image border, a standard watermark embedded spatially would lose an entire corner of data.\n\n"
        "To prevent this, we implemented Arnold Cat Map chaotic scrambling. For every pixel coordinate (x, y) in our N x N watermark, we apply the 2D chaotic transform: "
        "[x'; y'] = [1  1; 1  2] * [x; y] (mod N).\n\n"
        "We execute 5 scrambling iterations. The structured QR code is transformed into uncorrelated, pseudo-random noise. Adjacent watermark bits are scattered across distant coordinates "
        "in the frequency spectrum. During extraction, we apply the exact inverse transformation matrix [2  -1; -1  1] (mod N).\n\n"
        "Through this combination of parameter tuning—setting our embedding strength alpha = 2.0 and 5 Arnold iterations—we achieve both imperceptibility and extreme attack resilience. "
        "To show how this operates inside our complete web application, I now hand over to [Speaker 3 Name].\"\n"
    )

    # Speaker 3
    doc.add_page_break()
    doc.add_heading("PART 3: SPEAKER 3 — Platform Architecture, Attack Benchmarks, Results & Live Demo", level=2)
    p3 = doc.add_paragraph()
    p3.paragraph_format.line_spacing = 1.25
    p3.add_run("Slide 8: Full-Stack Architecture & User Experience\n").bold = True
    p3.add_run(
        "\"Thank you, [Speaker 2 Name]. While the mathematical algorithms provide the theoretical foundation, my role was translating this into a production-grade, highly responsive full-stack platform.\n\n"
        "ProvenAI is built as a decoupled, modern web system:\n"
        "• Frontend: A responsive single-page application built with React 18, TypeScript, and Tailwind CSS v4, featuring a dark-mode glassmorphism interface, interactive drag-and-drop file uploaders, "
        "and Framer Motion animated state transitions.\n"
        "• Backend API Gateway: High-performance Python FastAPI service with synchronous SQLite persistence (configured with Write-Ahead Logging for concurrency) and automated OpenAPI Swagger documentation.\n"
        "• Containerization: Complete Docker and Docker Compose orchestration with an alpine Nginx reverse proxy for production deployment.\n\n"
        "The platform provides dedicated modules for Watermark Embedding, Authenticity Verification, Adversarial Attack Simulation, and an Analytics Dashboard tracking PSNR, SSIM, and tamper rates.\"\n\n"
    )
    p3.add_run("Slide 9 & 10: Empirical Robustness Benchmark (21 Attack Scenarios)\n").bold = True
    p3.add_run(
        "\"Let us examine our empirical results. In digital watermarking, the industry standard for visual imperceptibility is a PSNR greater than 38 dB and an SSIM above 0.98.\n\n"
        "On our generative AI benchmark test imagery, ProvenAI achieved:\n"
        "• PSNR = 48.04 dB (over 10 dB above the invisibility threshold).\n"
        "• SSIM = 0.9902 (99.02% structural fidelity preservation).\n"
        "• Embedding Latency = 0.404 seconds, Extraction Latency = 0.246 seconds.\n"
        "• Clean Bit Error Rate (BER) = 0.00%.\n\n"
        "To rigorously validate robustness, we developed an automated test suite executing 21 distinct attack scenarios:\n"
        "1. JPEG Compression: At JPEG Quality 90, Normalized Correlation was 0.9843. Even under aggressive compression down to Quality 30, our watermark survived with NC = 0.9083 and BER under 5.3%.\n"
        "2. Additive Gaussian Noise: Under severe Gaussian noise with standard deviation sigma = 20 (where PSNR plummeted to 22.97 dB), ProvenAI recovered the watermark with NC = 0.9836 and BER = 0.25%!\n"
        "3. Impulse Noise: Under 3% Salt & Pepper noise, NC remained at 0.9778.\n"
        "4. Boundary Cropping: When 10% of the image border was completely cut away (dropping PSNR to 8.32 dB), our Arnold Cat Map dispersion recovered the watermark with NC = 0.9672.\n"
        "5. Spatial Scaling & Blurring: Survived 0.50x downscaling with NC = 0.9761 and 5x5 Gaussian blur with NC = 0.9699.\"\n\n"
    )
    p3.add_run("Slide 11 & 12: Transparent Limitation & Live Demonstration\n").bold = True
    p3.add_run(
        "\"In the spirit of honest scientific reporting, our benchmark also isolated our system's primary technical limitation: Unsynchronized Spatial Rotation.\n\n"
        "When an image was rotated by just 2 degrees, the Normalized Correlation dropped to 0.4177. Why? Because the Discrete Wavelet Transform operates on a rectilinear orthogonal grid. "
        "Rotation causes subband desynchronization. In our future work, we plan to resolve this by integrating Fourier-Mellin transform registration to automatically correct rotation angles.\n\n"
        "Now, let us switch over to our live running application:\n"
        "[Action: Show live browser at http://localhost:3000, demonstrate embedding on an AI image, apply JPEG compression attack in the simulator, and verify authentic provenance live on screen].\"\n"
    )

    # Q&A Section
    doc.add_page_break()
    doc.add_heading("4. Committee Q&A Defense Manual", level=1)
    qa_list = [
        ("Q1 (For Speaker 2): Why did you use DWT-SVD instead of simple DCT or spatial LSB?",
         "Spatial LSB is extremely fragile; even saving an image as a JPEG destroys least significant bits. DCT operates on fixed 8x8 blocks, which introduces visible blocking artifacts under compression. "
         "DWT provides multi-resolution spatio-frequency localization without blocking artifacts. Combining DWT with SVD gives us the best of both worlds: DWT isolates low-frequency approximation energy in the LL subband, "
         "while SVD's singular values provide algebraic stability against perturbations. That is why our clean PSNR is 48.04 dB while surviving JPEG compression down to Quality 30."),

        ("Q2 (For Speaker 1): How does ProvenAI prevent an attacker from modifying the owner name or timestamp in the watermark?",
         "The provenance metadata is encrypted using AES-256 in Galois/Counter Mode (GCM). AES-GCM is an Authenticated Encryption with Associated Data (AEAD) algorithm. It produces both ciphertext and an authentication tag. "
         "If an attacker alters even a single bit of the encrypted payload, GCM authentication fails during decryption, alerting the system immediately that the metadata was tampered with. "
         "Furthermore, the payload contains the SHA-256 hash of the original image, providing an immutable integrity digest."),

        ("Q3 (For Speaker 2): Explain the False Positive Problem in SVD watermarking and how your Scheme B solves it.",
         "In classical SVD watermarking by Liu and Tan, the watermark is embedded directly into singular values: S_mod = S_Y + alpha * W. During extraction, the detector uses the attacker's supplied watermark singular vectors U_w and V_w. "
         "Because the spatial structure of any matrix is preserved in its orthogonal singular vectors U and V, anyone can pair their own arbitrary watermark eigenvectors with the extracted singular values and extract a high-correlation watermark. "
         "In ProvenAI, we implement Scheme B: we form a composite matrix M = diag(S_Y) + alpha * W_float and perform SVD on M. The resulting orthogonal matrices U_M and V_M are saved as secret security keys. "
         "Watermark extraction is mathematically impossible without these specific orthogonal matrices, completely closing the false-positive loophole."),

        ("Q4 (For Speaker 3): Your results show rotation failed at 2 degrees. Why did this happen and how would you fix it?",
         "2D Discrete Wavelet Transform relies on an axis-aligned rectilinear grid. When an image undergoes affine rotation, the spatial coordinates are desynchronized relative to the wavelet basis functions, causing the extracted LL subband to misalign. "
         "We transparently documented this in Chapter 5 of our report. To resolve this in production, we can apply Fourier-Mellin transform registration or feature-point matching (like SIFT or ORB) to detect the rotation angle and rotate the image back to 0 degrees before DWT extraction."),

        ("Q5 (For Speaker 3): What is the significance of the 0.70 Normalized Correlation threshold?",
         "In digital watermarking literature, Normalized Correlation (NC) ranges from 0.0 to 1.0. An NC of 1.0 indicates a pristine, identical match, while random uncorrelated images yield an NC between 0.10 and 0.35. "
         "Through our empirical testing across 21 attack conditions, we found that genuine watermarks under moderate to heavy attacks (like JPEG Q=50 or Gaussian noise sigma=20) maintain an NC between 0.75 and 0.99. "
         "Setting our decision threshold at NC >= 0.70 provides a statistically robust margin that eliminates false alarms while reliably verifying genuine watermarks even after aggressive tampering.")
    ]

    for q, a in qa_list:
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_after = Pt(4)
        r_q = p_q.add_run(q)
        r_q.font.bold = True
        r_q.font.color.rgb = RGBColor(30, 58, 138)

        p_a = doc.add_paragraph()
        p_a.paragraph_format.space_after = Pt(10)
        p_a.paragraph_format.left_indent = Inches(0.2)
        r_a = p_a.add_run(a)
        r_a.font.size = Pt(10.5)

    doc.save("Presentation_Talk_Guide.docx")
    print("[+] Successfully compiled Presentation_Talk_Guide.docx")

if __name__ == "__main__":
    create_doc()
