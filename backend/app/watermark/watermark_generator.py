import numpy as np
from PIL import Image, ImageDraw, ImageFont
import qrcode

def generate_watermark_image(text: str, size: int = 128) -> np.ndarray:
    img = Image.new('L', (size, size), color=0)
    draw = ImageDraw.Draw(img)
    font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) / 2
    y = (size - text_height) / 2
    
    draw.text((x, y), text, fill=255, font=font)
    return np.array(img)

def generate_qr_watermark(data: str, size: int = 128) -> np.ndarray:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    img = img.resize((size, size)).convert('L')
    
    arr = np.array(img)
    return 255 - arr
