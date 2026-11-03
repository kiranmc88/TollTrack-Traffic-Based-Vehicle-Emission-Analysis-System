"""
Image handling module for TollTrack AI Vehicle Detection
Supports: JPG, JPEG, PNG, WEBP
Input: Multipart upload or Base64 payload
Validates file integrity and format.
"""

import os
import sys
import re
import io
import base64

# Ensure site-packages with cv2 and PIL are accessible
for extra_path in [
    os.path.expanduser(r'~\miniconda3\Lib\site-packages'),
    r'C:\Users\kiran kumar\miniconda3\Lib\site-packages',
]:
    if os.path.isdir(extra_path) and extra_path not in sys.path:
        sys.path.insert(0, extra_path)

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


def read_uploaded_file(file_storage):
    """
    Reads a Flask FileStorage object into an OpenCV BGR image.
    Returns (cv2_image, original_filename, error_message)
    """
    if not file_storage or file_storage.filename == '':
        return None, "", "No file selected."

    filename = file_storage.filename
    if not is_allowed_filename(filename):
        return None, filename, f"Unsupported file extension. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS)).upper()}."

    try:
        file_bytes = file_storage.read()
        if len(file_bytes) > MAX_CONTENT_LENGTH:
            return None, filename, f"File size exceeds maximum limit of {MAX_CONTENT_LENGTH // (1024*1024)}MB."

        # Decode using OpenCV
        np_arr = np.frombuffer(file_bytes, np.uint8)
        cv2_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if cv2_img is None or cv2_img.size == 0:
            return None, filename, "Invalid or corrupted image file."

        return cv2_img, filename, None
    except Exception as e:
        return None, filename, f"Error processing uploaded image: {str(e)}"


def encode_image_to_base64(cv2_img, format='JPEG', quality=90) -> str:
    """
    Encodes an OpenCV image to a base64 Data URL string for web transfer.
    """
    if cv2_img is None:
        return ""
    
    if format.upper() in ('JPG', 'JPEG'):
        ext = '.jpg'
        params = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
        mime = 'image/jpeg'
    elif format.upper() == 'PNG':
        ext = '.png'
        params = [int(cv2.IMWRITE_PNG_COMPRESSION), 6]
        mime = 'image/png'
    elif format.upper() == 'WEBP':
        ext = '.webp'
        params = [int(cv2.IMWRITE_WEBP_QUALITY), quality]
        mime = 'image/webp'
    else:
        ext = '.jpg'
        params = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
        mime = 'image/jpeg'

    success, buffer = cv2.imencode(ext, cv2_img, params)
    if not success:
        return ""

    encoded = base64.b64encode(buffer).decode('utf-8')
    return f"data:{mime};base64,{encoded}"
