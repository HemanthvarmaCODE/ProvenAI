import numpy as np

class ArnoldTransform:
    @staticmethod
    def transform(image: np.ndarray, iterations: int) -> np.ndarray:
        if len(image.shape) > 2:
            raise ValueError("Arnold Transform requires a 2D grayscale image")
        h, w = image.shape
        if h != w:
            # Pad to square
            size = max(h, w)
            padded = np.zeros((size, size), dtype=image.dtype)
            padded[:h, :w] = image
            image = padded
        else:
            size = h
            
        N = size
        scrambled = np.copy(image)
        for _ in range(iterations):
            new_img = np.zeros_like(scrambled)
            for y in range(N):
                for x in range(N):
                    new_x = (x + y) % N
                    new_y = (x + 2 * y) % N
                    new_img[new_y, new_x] = scrambled[y, x]
            scrambled = new_img
            
        if h != w:
            return scrambled[:h, :w]
        return scrambled

    @staticmethod
    def inverse_transform(image: np.ndarray, iterations: int) -> np.ndarray:
        if len(image.shape) > 2:
            raise ValueError("Arnold Transform requires a 2D grayscale image")
        h, w = image.shape
        if h != w:
            size = max(h, w)
            padded = np.zeros((size, size), dtype=image.dtype)
            padded[:h, :w] = image
            image = padded
        else:
            size = h
            
        N = size
        scrambled = np.copy(image)
        for _ in range(iterations):
            new_img = np.zeros_like(scrambled)
            for y in range(N):
                for x in range(N):
                    old_x = (2 * x - y) % N
                    old_y = (-x + y) % N
                    new_img[old_y, old_x] = scrambled[y, x]
            scrambled = new_img
            
        if h != w:
            return scrambled[:h, :w]
        return scrambled
