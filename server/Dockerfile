# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Install necessary system dependencies for processing PDFs, images, and performing OCR
RUN apt-get update && apt-get install -y \
    libsm6 \
    libxext6 \
    libgl1-mesa-glx \
    libjpeg-dev \
    zlib1g-dev \
    libpng-dev \
    libopenjp2-7-dev \
    poppler-utils \
    tesseract-ocr \
    libtesseract-dev && \
    apt-get clean

# Upgrade pip to ensure compatibility with the latest packages
RUN pip install --upgrade pip

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Clear any potentially corrupt PaddleOCR cache before initialization
RUN rm -rf /root/.paddleocr/whl/rec/en/en_PP-OCRv4_rec_infer.tar

# Pre-download PaddleOCR models to avoid runtime download issues
RUN python -c "from paddleocr import PaddleOCR; PaddleOCR(use_angle_cls=True, lang='en')"

# Copy the rest of the application code
COPY . .

# Expose the necessary ports
EXPOSE 8080

# Start the Gunicorn server
CMD ["gunicorn", "server:app", "--bind", "0.0.0.0:8080", "--workers", "1", "--timeout", "4000"]
