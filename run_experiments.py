import os
import sys
import time
import json
import numpy as np
import cv2
from PIL import Image
from fastapi.testclient import TestClient

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.main import app
from app.core.database import init_db, engine, Base
from app.core.config import settings

def run_all_benchmarks():
    print("=== PROVENAI COMPREHENSIVE EXPERIMENTAL TEST SUITE ===")
    
    # 1. Clean Database initialization
    db_file = "./storage/provenai.db"
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
            print("Removed existing test database for fresh run.")
        except Exception as e:
            print(f"Database reset note: {e}")
            
    init_db()
    client = TestClient(app)
    
    results = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "environment": {
            "python_version": sys.version,
            "fastapi": "0.141+",
            "opencv": cv2.__version__,
            "numpy": np.__version__
        },
        "endpoints": {},
        "embedding": {},
        "verification": {},
        "attacks": [],
        "dashboard": {}
    }
    
    # 2. Test Root and Health
    r_root = client.get("/")
    assert r_root.status_code == 200
    results["endpoints"]["root"] = {"status": r_root.status_code, "body": r_root.json()}
    print(f"[*] GET / -> 200 OK: {r_root.json()}")
    
    r_health = client.get("/api/health")
    assert r_health.status_code == 200
    results["endpoints"]["health"] = {"status": r_health.status_code, "body": r_health.json()}
    print(f"[*] GET /api/health -> 200 OK: {r_health.json()}")
    
    # 3. Test Registration
    reg_data = {
        "username": "researcher_lead",
        "email": "lead@provenai.org",
        "password": "SecurePassword2026!",
        "full_name": "Dr. Lead Researcher"
    }
    r_reg = client.post("/api/register", json=reg_data)
    assert r_reg.status_code == 200
    reg_json = r_reg.json()
    token = reg_json["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    results["endpoints"]["register"] = {"status": r_reg.status_code, "token_type": reg_json["token_type"]}
    print(f"[*] POST /api/register -> 200 OK: User created")
    
    # 4. Test Login
    login_data = {"username": "researcher_lead", "password": "SecurePassword2026!"}
    r_login = client.post("/api/login", data=login_data)
    assert r_login.status_code == 200
    results["endpoints"]["login"] = {"status": r_login.status_code, "access_token_received": bool(r_login.json().get("access_token"))}
    print(f"[*] POST /api/login -> 200 OK: Token refreshed")
    
    # 5. Test Profile
    r_prof = client.get("/api/profile", headers=headers)
    assert r_prof.status_code == 200
    results["endpoints"]["profile"] = r_prof.json()
    print(f"[*] GET /api/profile -> 200 OK: {r_prof.json()['username']}")
    
    # 6. Generate Realistic Test Images (Landscape 640x480 & Square 512x512)
    os.makedirs("./storage/uploads", exist_ok=True)
    
    # Create synthetic gradient & texture test image
    np.random.seed(42)
    h, w = 512, 512
    x = np.linspace(0, 1, w)
    y = np.linspace(0, 1, h)
    xx, yy = np.meshgrid(x, y)
    r = np.uint8(255 * (0.5 + 0.5 * np.sin(xx * 10)))
    g = np.uint8(255 * (0.5 + 0.5 * np.cos(yy * 10)))
    b = np.uint8(255 * (0.5 + 0.5 * np.sin((xx + yy) * 8)))
    test_img = np.stack([r, g, b], axis=2)
    
    test_img_path = "./storage/uploads/benchmark_test_art.png"
    cv2.imwrite(test_img_path, cv2.cvtColor(test_img, cv2.COLOR_RGB2BGR))
    
    # 7. Test Image Upload
    with open(test_img_path, "rb") as f:
        r_up = client.post("/api/upload", files={"file": ("benchmark_test_art.png", f, "image/png")}, headers=headers)
    assert r_up.status_code == 200
    results["endpoints"]["upload"] = r_up.json()
    print(f"[*] POST /api/upload -> 200 OK: {r_up.json()['filename']}")
    
    # 8. Test Watermark Embed
    embed_form = {
        "file_path": test_img_path,
        "owner_name": "Provenance AI Consortium",
        "ai_model": "Stable Diffusion XL v1.0",
        "prompt_id": "SDXL-PROMPT-98242"
    }
    t0 = time.perf_counter()
    r_embed = client.post("/api/embed", data=embed_form, headers=headers)
    embed_time = time.perf_counter() - t0
    assert r_embed.status_code == 200
    embed_res = r_embed.json()
    results["embedding"] = {
        "psnr_db": embed_res["psnr"],
        "ssim": embed_res["ssim"],
        "embedding_time_s": embed_res["embedding_time"],
        "measured_wall_time_s": embed_time,
        "watermarked_path": embed_res["watermarked_path"],
        "image_uuid": embed_res["image_uuid"]
    }
    print(f"[*] POST /api/embed -> 200 OK: PSNR={embed_res['psnr']:.2f} dB, SSIM={embed_res['ssim']:.4f}, Time={embed_res['embedding_time']:.4f}s")
    
    # 9. Test Verification on Clean Watermarked Image
    with open(embed_res["watermarked_path"], "rb") as f:
        t0 = time.perf_counter()
        r_verify = client.post("/api/verify", files={"file": ("watermarked.png", f, "image/png")}, headers=headers)
        verify_time = time.perf_counter() - t0
    assert r_verify.status_code == 200
    verify_res = r_verify.json()
    results["verification"] = {
        "is_authentic": verify_res["is_authentic"],
        "is_tampered": verify_res["is_tampered"],
        "confidence_score": verify_res["confidence_score"],
        "nc_score": verify_res["nc_score"],
        "ber_score": verify_res["ber_score"],
        "provenance": verify_res["provenance"],
        "verification_wall_time_s": verify_time
    }
    print(f"[*] POST /api/verify (clean) -> 200 OK: Authentic={verify_res['is_authentic']}, NC={verify_res['nc_score']:.4f}, BER={verify_res['ber_score']:.4f}")
    
    # Get image ID from database / history
    r_hist = client.get("/api/history", headers=headers)
    images = r_hist.json()["images"]
    image_id = images[0]["id"]
    
    # 10. Robustness Attack Simulations
    attack_configs = [
        ("jpeg", {"quality": 90}, "JPEG Compression (Q=90)"),
        ("jpeg", {"quality": 70}, "JPEG Compression (Q=70)"),
        ("jpeg", {"quality": 50}, "JPEG Compression (Q=50)"),
        ("jpeg", {"quality": 30}, "JPEG Compression (Q=30)"),
        ("gaussian_noise", {"mean": 0, "std": 5}, "Gaussian Noise (std=5)"),
        ("gaussian_noise", {"mean": 0, "std": 10}, "Gaussian Noise (std=10)"),
        ("gaussian_noise", {"mean": 0, "std": 20}, "Gaussian Noise (std=20)"),
        ("salt_pepper", {"amount": 0.01}, "Salt & Pepper (1%)"),
        ("salt_pepper", {"amount": 0.03}, "Salt & Pepper (3%)"),
        ("blur", {"kernel_size": 3}, "Gaussian Blur (3x3)"),
        ("blur", {"kernel_size": 5}, "Gaussian Blur (5x5)"),
        ("rotation", {"angle": 2}, "Rotation (2 deg)"),
        ("rotation", {"angle": 5}, "Rotation (5 deg)"),
        ("scaling", {"scale": 0.75}, "Scaling (0.75x)"),
        ("scaling", {"scale": 0.5}, "Scaling (0.50x)"),
        ("cropping", {"ratio": 0.05}, "Cropping (5% border)"),
        ("cropping", {"ratio": 0.10}, "Cropping (10% border)"),
        ("brightness", {"factor": 1.2}, "Brightness (+20%)"),
        ("brightness", {"factor": 0.8}, "Brightness (-20%)"),
        ("contrast", {"factor": 1.2}, "Contrast (+20%)"),
        ("contrast", {"factor": 0.8}, "Contrast (-20%)")
    ]
    
    print("\n--- RUNNING ATTACK ROBUSTNESS BENCHMARKS ---")
    for atk_type, params, label in attack_configs:
        payload = {
            "image_id": image_id,
            "attack_type": atk_type,
            "attack_params": params
        }
        r_atk = client.post("/api/attack", json=payload, headers=headers)
        assert r_atk.status_code == 200, f"Attack {atk_type} failed: {r_atk.text}"
        atk_res = r_atk.json()
        metrics = atk_res["metrics"]
        survived = atk_res["survived"]
        
        record = {
            "label": label,
            "attack_type": atk_type,
            "params": params,
            "nc_after": metrics["nc_after"],
            "ber_after": metrics["ber_after"],
            "psnr_after": metrics["psnr_after"],
            "ssim_after": metrics["ssim_after"],
            "watermark_survived": survived
        }
        results["attacks"].append(record)
        print(f"  {label:<30} | NC={metrics['nc_after']:.4f} | BER={metrics['ber_after']:.4f} | PSNR={metrics['psnr_after']:.2f}dB | Survived={survived}")
        
    # 11. Test Dashboard & Statistics endpoints
    r_dash = client.get("/api/dashboard", headers=headers)
    assert r_dash.status_code == 200
    results["dashboard"]["user_summary"] = r_dash.json()
    
    r_stats = client.get("/api/statistics", headers=headers)
    assert r_stats.status_code == 200
    results["dashboard"]["aggregated_stats"] = r_stats.json()
    
    print(f"\n[*] GET /api/dashboard -> Total Images: {r_dash.json()['total_images']}, Total Verified: {r_dash.json()['total_verified']}")
    print(f"[*] Aggregated Attack Statistics Generated for {len(r_stats.json()['stats_by_attack'])} attack classes.")
    
    # Save results to JSON
    out_json = "test_benchmark_results.json"
    with open(out_json, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n[+] Experimental results saved to {out_json}")
    return results

if __name__ == "__main__":
    run_all_benchmarks()
