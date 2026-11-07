"""
Image handling module for TollTrack AI Vehicle Detection (Hugging Face Space)
Supports: JPG, JPEG, PNG, WEBP
Input: Multipart upload or Base64 payload
Validates file integrity and format.
"""

import os
import sys
import io
import base64
import numpy as np
import cv2
from PIL import Image

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB


def is_allowed_filename(filename: str) -> bool:
    """Check if file extension is allowed."""
    if not filename or '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in ALLOWED_EXTENSIONS


def decode_base64_image(base64_str: str):
    """
    Decodes a base64 encoded image string (e.g. from webcam capture) into an OpenCV BGR image.
    Returns (cv2_image, error_message)
    """
    if not base64_str or not isinstance(base64_str, str):
        return None, "Empty or invalid base64 image data."

    try:
        # Strip data URL header if present (e.g., "data:image/jpeg;base64,...")
        if ',' in base64_str:
            base64_str = base64_str.split(',', 1)[1]

        image_data = base64.b64decode(base64_str)
        if len(image_data) > MAX_CONTENT_LENGTH:
            return None, f"Image size exceeds maximum limit of {MAX_CONTENT_LENGTH // (1024*1024)}MB."

        # Verify image using PIL first
        pil_img = Image.open(io.BytesIO(image_data))
        format_lower = (pil_img.format or '').lower()
        if format_lower not in ALLOWED_EXTENSIONS and format_lower != 'mpo':
            return None, f"Unsupported image format: {pil_img.format}. Supported: JPG, JPEG, PNG, WEBP."

        # Convert PIL to RGB then to OpenCV BGR
        pil_img = pil_img.convert('RGB')
        np_arr = np.array(pil_img)
        cv2_img = cv2.cvtColor(np_arr, cv2.COLOR_RGB2BGR)

        return cv2_img, None
    except Exception as e:
        return None, f"Failed to decode base64 image: {str(e)}"


def encode_image_to_base64(cv2_image: np.ndarray, format: str = 'JPEG', quality: int = 88) -> str:
    """
    Encodes an OpenCV BGR image to a base64 data URL string.
    """
    if cv2_image is None or cv2_image.size == 0:
        return ""

    try:
        ext = '.jpg' if format.upper() == 'JPEG' else f".{format.lower()}"
        params = [int(cv2.IMWRITE_JPEG_QUALITY), quality] if ext == '.jpg' else []
        success, buffer = cv2.imencode(ext, cv2_image, params)
        if not success:
            return ""
        b64 = base64.b64encode(buffer).decode('utf-8')
        mime = 'image/jpeg' if ext == '.jpg' else f"image/{format.lower()}"
        return f"data:{mime};base64,{b64}"
    except Exception:
        return ""


def pil_to_cv2(pil_img: Image.Image) -> np.ndarray:
    """Converts a PIL Image to an OpenCV BGR ndarray."""
    rgb_img = pil_img.convert('RGB')
    np_arr = np.array(rgb_img)
    return cv2.cvtColor(np_arr, cv2.COLOR_RGB2BGR)


def cv2_to_pil(cv2_img: np.ndarray) -> Image.Image:
    """Converts an OpenCV BGR ndarray to a PIL Image."""
    rgb_img = cv2.cvtColor(cv2_img, cv2.COLOR_BGR2RGB)
    return Image.fromarray(rgb_img)

