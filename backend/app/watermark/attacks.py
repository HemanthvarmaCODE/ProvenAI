import cv2
import numpy as np
from PIL import ImageEnhance, Image

class ImageAttacks:
    @staticmethod
    def jpeg_compression(img: np.ndarray, quality=50) -> np.ndarray:
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
        result, encimg = cv2.imencode('.jpg', img, encode_param)
        decimg = cv2.imdecode(encimg, 1)
        return decimg

    @staticmethod
    def gaussian_noise(img: np.ndarray, mean=0, std=10) -> np.ndarray:
        noise = np.random.normal(mean, std, img.shape)
        noisy_img = np.clip(img.astype(np.float32) + noise, 0, 255).astype(np.uint8)
        return noisy_img

    @staticmethod
    def salt_pepper_noise(img: np.ndarray, amount=0.02) -> np.ndarray:
        noisy = np.copy(img)
        num_salt = np.ceil(amount * img.size * 0.5)
        coords = [np.random.randint(0, i - 1, int(num_salt)) for i in img.shape]
        noisy[tuple(coords)] = 255
        num_pepper = np.ceil(amount * img.size * 0.5)
        coords = [np.random.randint(0, i - 1, int(num_pepper)) for i in img.shape]
        noisy[tuple(coords)] = 0
        return noisy

    @staticmethod
    def rotation(img: np.ndarray, angle=5) -> np.ndarray:
        h, w = img.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        return rotated

    @staticmethod
    def scaling(img: np.ndarray, scale=0.5) -> np.ndarray:
        h, w = img.shape[:2]
        scaled_down = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        scaled_up = cv2.resize(scaled_down, (w, h), interpolation=cv2.INTER_CUBIC)
        return scaled_up

    @staticmethod
    def cropping(img: np.ndarray, ratio=0.1) -> np.ndarray:
        h, w = img.shape[:2]
        crop_h = int(h * ratio)
        crop_w = int(w * ratio)
        cropped = np.zeros_like(img)
        cropped[crop_h:h-crop_h, crop_w:w-crop_w] = img[crop_h:h-crop_h, crop_w:w-crop_w]
        return cropped

    @staticmethod
    def brightness(img: np.ndarray, factor=1.3) -> np.ndarray:
        pil_img = Image.fromarray(img)
        enhancer = ImageEnhance.Brightness(pil_img)
        return np.array(enhancer.enhance(factor))

    @staticmethod
    def contrast(img: np.ndarray, factor=1.5) -> np.ndarray:
        pil_img = Image.fromarray(img)
        enhancer = ImageEnhance.Contrast(pil_img)
        return np.array(enhancer.enhance(factor))

    @staticmethod
    def blur(img: np.ndarray, kernel_size=5) -> np.ndarray:
        return cv2.GaussianBlur(img, (kernel_size, kernel_size), 0)
