from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
import os
import cv2
import numpy as np
import json
from ..core.database import get_db
from ..core.jwt import get_current_user
from ..core.config import settings
from ..models.models import User, Image as DBImage, AttackLog
from ..watermark.attacks import ImageAttacks
from ..watermark.dwt_svd import DWTSVDWatermarking
from ..watermark.metrics import WatermarkMetrics
from ..watermark.metadata_handler import MetadataHandler
from ..utils.helpers import generate_uuid

router = APIRouter()

@router.post("/attack")
def apply_attack(
    image_id: int = Body(None),
    image_uuid: str = Body(None),
    attack_type: str = Body(...),
    attack_params: dict = Body(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(DBImage).filter(DBImage.user_id == current_user.id)
    if image_id:
        img_record = query.filter(DBImage.id == image_id).first()
    elif image_uuid:
        img_record = query.filter(DBImage.image_uuid == image_uuid).first()
    else:
        img_record = query.order_by(DBImage.created_at.desc()).first()

    if not img_record:
        raise HTTPException(status_code=404, detail="No watermarked images found for this user. Please embed an image first.")
        
    wm_bgr = cv2.imread(img_record.watermarked_path)
    if wm_bgr is None:
        raise HTTPException(status_code=404, detail="Watermarked file missing")
        
    wm_rgb = cv2.cvtColor(wm_bgr, cv2.COLOR_BGR2RGB)
    attacked_rgb = None
    
    if attack_params is None:
        attack_params = {}
        
    if attack_type == "jpeg":
        attacked_rgb = ImageAttacks.jpeg_compression(wm_rgb, quality=attack_params.get("quality", 50))
    elif attack_type == "gaussian_noise":
        attacked_rgb = ImageAttacks.gaussian_noise(wm_rgb, mean=attack_params.get("mean", 0), std=attack_params.get("std", 10))
    elif attack_type == "salt_pepper":
        attacked_rgb = ImageAttacks.salt_pepper_noise(wm_rgb, amount=attack_params.get("amount", 0.02))
    elif attack_type == "rotation":
        attacked_rgb = ImageAttacks.rotation(wm_rgb, angle=attack_params.get("angle", 5))
    elif attack_type == "scaling":
        attacked_rgb = ImageAttacks.scaling(wm_rgb, scale=attack_params.get("scale", 0.5))
    elif attack_type == "cropping":
        attacked_rgb = ImageAttacks.cropping(wm_rgb, ratio=attack_params.get("ratio", 0.1))
    elif attack_type == "brightness":
        attacked_rgb = ImageAttacks.brightness(wm_rgb, factor=attack_params.get("factor", 1.3))
    elif attack_type == "contrast":
        attacked_rgb = ImageAttacks.contrast(wm_rgb, factor=attack_params.get("factor", 1.5))
    elif attack_type == "blur":
        attacked_rgb = ImageAttacks.blur(wm_rgb, kernel_size=attack_params.get("kernel_size", 5))
    else:
        raise HTTPException(status_code=400, detail="Invalid attack type")
        
    attacked_filename = f"attacked_{generate_uuid()}.png"
    attacked_path = os.path.join(settings.ATTACKED_DIR, attacked_filename)
    attacked_bgr = cv2.cvtColor(attacked_rgb, cv2.COLOR_RGB2BGR)
    cv2.imwrite(attacked_path, attacked_bgr)
    
    psnr_after = WatermarkMetrics.psnr(wm_rgb, attacked_rgb)
    ssim_after = WatermarkMetrics.ssim(wm_rgb, attacked_rgb)
    
    watermarker = DWTSVDWatermarking(alpha=settings.WATERMARK_ALPHA)
    keys = dict(np.load(img_record.keys_path))
    
    h_orig, w_orig = keys['original_shape'][:2]
    attacked_resized = cv2.resize(attacked_rgb, (w_orig, h_orig))
    
    ext_wm = watermarker.extract(attacked_resized, keys)
    
    orig_wm = keys.get('wm_orig')
    if orig_wm is None:
        orig_wm = MetadataHandler.metadata_to_qr(img_record.metadata_encrypted, size=128)
    
    nc_after = WatermarkMetrics.normalized_correlation(orig_wm, ext_wm)
    ber_after = WatermarkMetrics.bit_error_rate(orig_wm, ext_wm)
    
    survived = nc_after > 0.8
    
    log = AttackLog(
        image_id=img_record.id,
        user_id=current_user.id,
        attack_type=attack_type,
        attack_params=json.dumps(attack_params),
        nc_after=nc_after,
        ber_after=ber_after,
        psnr_after=psnr_after,
        ssim_after=ssim_after,
        watermark_survived=survived,
        attacked_image_path=attacked_path
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    
    return {
        "attacked_path": attacked_path,
        "attacked_filename": attacked_filename,
        "metrics": {
            "nc_after": nc_after,
            "ber_after": ber_after,
            "psnr_after": psnr_after,
            "ssim_after": ssim_after
        },
        "survived": survived
    }
