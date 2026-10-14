import cv2
import pywt
import numpy as np
from .arnold import ArnoldTransform

class DWTSVDWatermarking:
    def __init__(self, wavelet='haar', alpha=0.05):
        self.wavelet = wavelet
        self.alpha = alpha

    def embed(self, host_rgb: np.ndarray, watermark_gray: np.ndarray, arnold_iters=10) -> tuple:
        # Convert RGB to YCrCb
        ycrcb = cv2.cvtColor(host_rgb, cv2.COLOR_RGB2YCrCb)
        Y = ycrcb[:, :, 0].astype(np.float64)
        
        # 1-level DWT on Y
        coeffs = pywt.dwt2(Y, self.wavelet)
        LL, (LH, HL, HH) = coeffs
        
        # SVD on LL
        U_Y, S_Y, Vh_Y = np.linalg.svd(LL, full_matrices=False)
        
        # Resize watermark to square matching SVD singular values dimension
        h_ll, w_ll = LL.shape
        k = min(h_ll, w_ll)
        watermark_resized = cv2.resize(watermark_gray, (k, k))
        
        # Arnold scramble
        W_scrambled = ArnoldTransform.transform(watermark_resized, arnold_iters)
        W_float = W_scrambled.astype(np.float64) / 255.0
        
        # Composite
        M = np.diag(S_Y) + self.alpha * W_float
        
        # SVD on M
        U_M, S_M, Vh_M = np.linalg.svd(M, full_matrices=False)
        
        # Reconstruct LL
        LL_mod = U_Y @ np.diag(S_M) @ Vh_Y
        
        # IDWT
        coeffs_mod = (LL_mod, (LH, HL, HH))
        Y_mod = pywt.idwt2(coeffs_mod, self.wavelet)
        
        # Adjust dimensions if odd
        if Y_mod.shape != Y.shape:
            Y_mod = cv2.resize(Y_mod, (Y.shape[1], Y.shape[0]))
            
        ycrcb[:, :, 0] = np.clip(Y_mod, 0, 255).astype(np.uint8)
        watermarked_rgb = cv2.cvtColor(ycrcb, cv2.COLOR_YCrCb2RGB)
        
        keys = {
            'U_M': U_M,
            'Vh_M': Vh_M,
            'S_Y': S_Y,
            'arnold_iters': arnold_iters,
            'wm_shape': watermark_gray.shape,
            'original_shape': host_rgb.shape
        }
        
        return watermarked_rgb, keys

    def extract(self, watermarked_rgb: np.ndarray, keys: dict) -> np.ndarray:
        U_M = keys['U_M']
        Vh_M = keys['Vh_M']
        S_Y = keys['S_Y']
        arnold_iters = keys['arnold_iters']
        
        ycrcb = cv2.cvtColor(watermarked_rgb, cv2.COLOR_RGB2YCrCb)
        Y = ycrcb[:, :, 0].astype(np.float64)
        
        coeffs = pywt.dwt2(Y, self.wavelet)
        LL, _ = coeffs
        
        _, S_wm, _ = np.linalg.svd(LL, full_matrices=False)
        
        M_star = U_M @ np.diag(S_wm) @ Vh_M
        W_extracted_float = (M_star - np.diag(S_Y)) / self.alpha
        
        W_extracted = np.clip(W_extracted_float * 255, 0, 255).astype(np.uint8)
        
        W_unscrambled = ArnoldTransform.inverse_transform(W_extracted, arnold_iters)
        
        # Resize to original watermark shape
        wm_shape = keys['wm_shape']
        W_unscrambled = cv2.resize(W_unscrambled, (wm_shape[1], wm_shape[0]))
        
        return W_unscrambled
