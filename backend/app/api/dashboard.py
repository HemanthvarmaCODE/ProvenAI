from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..core.database import get_db
from ..core.jwt import get_current_user, get_admin_user
from ..models.models import User, Image as DBImage, VerificationLog, AttackLog

router = APIRouter()

@router.get("/dashboard")
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total_images = db.query(DBImage).filter(DBImage.user_id == current_user.id).count()
    verifications = db.query(VerificationLog).filter(VerificationLog.user_id == current_user.id).all()
    
    total_verified = len(verifications)
    tampered = sum(1 for v in verifications if v.is_tampered)
    authentic = sum(1 for v in verifications if v.is_authentic and not v.is_tampered)
    
    recent_images = db.query(DBImage).filter(DBImage.user_id == current_user.id).order_by(DBImage.created_at.desc()).limit(5).all()
    
    return {
        "total_images": total_images,
        "total_verified": total_verified,
        "tampered_images": tampered,
        "authentic_images": authentic,
        "recent_uploads": recent_images
    }

@router.get("/statistics")
def get_statistics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attacks = db.query(AttackLog).filter(AttackLog.user_id == current_user.id).all()
    
    stats_by_attack = {}
    for a in attacks:
        if a.attack_type not in stats_by_attack:
            stats_by_attack[a.attack_type] = {"count": 0, "psnr_sum": 0, "ssim_sum": 0, "nc_sum": 0, "ber_sum": 0, "survived": 0}
        
        st = stats_by_attack[a.attack_type]
        st["count"] += 1
        st["psnr_sum"] += a.psnr_after
        st["ssim_sum"] += a.ssim_after
        st["nc_sum"] += a.nc_after
        st["ber_sum"] += a.ber_after
        if a.watermark_survived:
            st["survived"] += 1
            
    for k, v in stats_by_attack.items():
        c = v["count"]
        v["avg_psnr"] = v["psnr_sum"] / c
        v["avg_ssim"] = v["ssim_sum"] / c
        v["avg_nc"] = v["nc_sum"] / c
        v["avg_ber"] = v["ber_sum"] / c
        v["survival_rate"] = v["survived"] / c
        
    return {"stats_by_attack": stats_by_attack}

@router.get("/admin/dashboard")
def get_admin_dashboard(current_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_images = db.query(DBImage).count()
    
    avg_psnr = db.query(func.avg(DBImage.psnr)).scalar() or 0.0
    avg_ssim = db.query(func.avg(DBImage.ssim)).scalar() or 0.0
    
    total_attacks = db.query(AttackLog).count()
    survived_attacks = db.query(AttackLog).filter(AttackLog.watermark_survived == True).count()
    survival_rate = (survived_attacks / total_attacks) if total_attacks > 0 else 0.0
    
    return {
        "total_users": total_users,
        "total_images": total_images,
        "avg_psnr": float(avg_psnr),
        "avg_ssim": float(avg_ssim),
        "total_attacks": total_attacks,
        "overall_survival_rate": survival_rate
    }
