import numpy as np
from skimage.metrics import peak_signal_noise_ratio, structural_similarity

class WatermarkMetrics:
    @staticmethod
    def psnr(img1: np.ndarray, img2: np.ndarray) -> float:
        return float(peak_signal_noise_ratio(img1, img2, data_range=255))

    @staticmethod
    def ssim(img1: np.ndarray, img2: np.ndarray) -> float:
        # Check if color or gray
        if len(img1.shape) == 3:
            return float(structural_similarity(img1, img2, channel_axis=2, data_range=255))
        return float(structural_similarity(img1, img2, data_range=255))

    @staticmethod
    def normalized_correlation(wm1: np.ndarray, wm2: np.ndarray) -> float:
        wm1_f = wm1.astype(np.float32)
        wm2_f = wm2.astype(np.float32)
        mean1, mean2 = np.mean(wm1_f), np.mean(wm2_f)
        wm1_zero = wm1_f - mean1
        wm2_zero = wm2_f - mean2
        
        num = np.sum(wm1_zero * wm2_zero)
        den = np.sqrt(np.sum(wm1_zero ** 2) * np.sum(wm2_zero ** 2))
        
        if den == 0:
            return 0.0
        return float(num / den)

    @staticmethod
    def bit_error_rate(wm1: np.ndarray, wm2: np.ndarray, threshold=128) -> float:
        b1 = (wm1 > threshold).astype(np.uint8)
        b2 = (wm2 > threshold).astype(np.uint8)
        err = np.sum(b1 != b2)
        return float(err / b1.size)
