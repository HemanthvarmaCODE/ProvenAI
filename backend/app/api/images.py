from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import cv2
import time
import numpy as np
from ..core.database import get_db
from ..core.jwt import get_current_user
from ..core.config import settings
from ..models.models import User, Image as DBImage, VerificationLog
from ..utils.helpers import compute_sha256, allowed_file, generate_uuid, get_file_extension
from ..watermark.metadata_handler import MetadataHandler
from ..watermark.dwt_svd import DWTSVDWatermarking
from ..watermark.metrics import WatermarkMetrics

router = APIRouter()

@router.post("/upload")
async def upload_image(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    file_bytes = await file.read()
    ext = get_file_extension(file.filename)
    filename = f"{generate_uuid()}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as f:
        f.write(file_bytes)
        
    return {"filename": filename, "path": filepath, "original_filename": file.filename}

@router.post("/embed")
async def embed_watermark(
    file_path: str = Form(None),
    file: UploadFile = File(None),
    owner_name: str = Form(...),
    ai_model: str = Form(...),
    prompt_id: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file_path and not file:
        raise HTTPException(status_code=400, detail="Must provide either file_path or file")
    
    image_bytes = None
    orig_filename = ""
    
    if file:
        image_bytes = await file.read()
        ext = get_file_extension(file.filename)
        filename = f"{generate_uuid()}{ext}"
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        with open(file_path, "wb") as f:
            f.write(image_bytes)
        orig_filename = file.filename
    else:
        with open(file_path, "rb") as f:
            image_bytes = f.read()
        orig_filename = os.path.basename(file_path)
        
    start_time = time.time()
    
    metadata = MetadataHandler.create_metadata(owner_name, current_user.id, ai_model, prompt_id, image_bytes)
    encrypted_meta = MetadataHandler.encrypt_metadata(metadata)
    wm_img = MetadataHandler.metadata_to_qr(encrypted_meta, size=128)
    
    host_bgr = cv2.imread(file_path)
    if host_bgr is None:
        raise HTTPException(status_code=400, detail="Invalid image file")
    host_rgb = cv2.cvtColor(host_bgr, cv2.COLOR_BGR2RGB)
    
    watermarker = DWTSVDWatermarking(alpha=settings.WATERMARK_ALPHA)
    watermarked_rgb, keys = watermarker.embed(host_rgb, wm_img, settings.ARNOLD_ITERATIONS)
    
    embed_time = time.time() - start_time
    
    psnr_val = WatermarkMetrics.psnr(host_rgb, watermarked_rgb)
    ssim_val = WatermarkMetrics.ssim(host_rgb, watermarked_rgb)
    
    watermarked_bgr = cv2.cvtColor(watermarked_rgb, cv2.COLOR_RGB2BGR)
    wm_filename = f"wm_{metadata['image_uuid']}.png"
    wm_path = os.path.join(settings.WATERMARKED_DIR, wm_filename)
    cv2.imwrite(wm_path, watermarked_bgr)
    
    keys['wm_orig'] = wm_img
    keys_filename = f"keys_{metadata['image_uuid']}.npz"
    keys_path = os.path.join(settings.KEYS_DIR, keys_filename)
    np.savez(keys_path, **keys)
    
    db_img = DBImage(
        user_id=current_user.id,
        original_filename=orig_filename,
        file_path=file_path,
        watermarked_path=wm_path,
        keys_path=keys_path,
        metadata_encrypted=encrypted_meta,
        sha256_hash=metadata["sha256_hash"],
        image_uuid=metadata["image_uuid"],
        owner_name=owner_name,
        ai_model=ai_model,
        prompt_id=prompt_id,
        psnr=psnr_val,
        ssim=ssim_val,
        embedding_time=embed_time,
        extraction_time=0.0
    )
    db.add(db_img)
    db.commit()
    db.refresh(db_img)
    
    return {
        "image_uuid": db_img.image_uuid,
        "watermarked_path": wm_path,
        "watermarked_filename": wm_filename,
        "psnr": psnr_val,
        "ssim": ssim_val,
        "embedding_time": embed_time
    }

@router.post("/verify")
async def verify_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    image_bytes = await file.read()
    np_arr = np.frombuffer(image_bytes, np.uint8)
    query_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if query_bgr is None:
        raise HTTPException(status_code=400, detail="Invalid image")
        
    query_rgb = cv2.cvtColor(query_bgr, cv2.COLOR_BGR2RGB)
    
    images = db.query(DBImage).all()
    watermarker = DWTSVDWatermarking(alpha=settings.WATERMARK_ALPHA)
    
    best_match = None
    best_nc = -1.0
    best_ber = 1.0
    best_keys = None
    extracted_wm = None
    
    start_time = time.time()
    
    for img in images:
        try:
            keys = dict(np.load(img.keys_path))
            h_orig, w_orig = keys['original_shape'][:2]
            temp_rgb = cv2.resize(query_rgb, (w_orig, h_orig))
            
            ext_wm = watermarker.extract(temp_rgb, keys)
            
            orig_wm = keys.get('wm_orig')
            if orig_wm is None:
                orig_wm = MetadataHandler.metadata_to_qr(img.metadata_encrypted, size=128)
            
            nc = WatermarkMetrics.normalized_correlation(orig_wm, ext_wm)
            ber = WatermarkMetrics.bit_error_rate(orig_wm, ext_wm)
            
            if nc > best_nc:
                best_nc = nc
                best_ber = ber
                best_match = img
                extracted_wm = ext_wm
        except Exception:
            continue
            
    extract_time = time.time() - start_time
    
    is_authentic = False
    is_tampered = False
    extracted_owner = None
    extracted_model = None
    extracted_prompt_id = None
    extracted_image_id = None
    extracted_timestamp = None
    
    if best_nc >= 0.70:
        is_authentic = True
        is_tampered = best_nc < 0.95
        if best_match:
            try:
                meta = MetadataHandler.decrypt_metadata(best_match.metadata_encrypted)
                extracted_owner = meta.get("owner_name")
                extracted_model = meta.get("ai_model")
                extracted_prompt_id = meta.get("prompt_id")
                extracted_image_id = meta.get("image_uuid")
                extracted_timestamp = meta.get("timestamp")
            except:
                pass
                
    log = VerificationLog(
        image_id=best_match.id if best_match else None,
        user_id=current_user.id,
        is_authentic=is_authentic,
        is_tampered=is_tampered,
        confidence_score=best_nc,
        nc_score=best_nc,
        ber_score=best_ber,
        extracted_owner=extracted_owner,
        extracted_model=extracted_model,
        extracted_prompt_id=extracted_prompt_id,
        extracted_image_id=extracted_image_id,
        extracted_timestamp=extracted_timestamp
    )
    db.add(log)
    if best_match and best_match.extraction_time == 0.0:
        best_match.extraction_time = extract_time
    db.commit()
    
    return {
        "is_authentic": is_authentic,
        "is_tampered": is_tampered,
        "confidence_score": best_nc,
        "nc_score": best_nc,
        "ber_score": best_ber,
        "provenance": {
            "owner": extracted_owner,
            "model": extracted_model,
            "prompt_id": extracted_prompt_id,
            "image_uuid": extracted_image_id,
            "timestamp": extracted_timestamp
        }
    }

@router.get("/history")
def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    images = db.query(DBImage).filter(DBImage.user_id == current_user.id).all()
    logs = db.query(VerificationLog).filter(VerificationLog.user_id == current_user.id).all()
    return {"images": images, "verifications": logs}

@router.get("/download/{filename}")
def download_image(filename: str):
    safe_filename = os.path.basename(filename)
    path = os.path.join(settings.WATERMARKED_DIR, safe_filename)
    if not os.path.exists(path):
        path = os.path.join(settings.ATTACKED_DIR, safe_filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="image/png", filename=safe_filename)
