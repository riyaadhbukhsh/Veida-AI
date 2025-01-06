FROM python:3.10-slim

WORKDIR /app

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

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Clear any potentially corrupt PaddleOCR cache before initialization
RUN rm -rf /root/.paddleocr/whl/rec/en/en_PP-OCRv4_rec_infer.tar

# Pre-download PaddleOCR models
RUN python -c "from paddleocr import PaddleOCR; PaddleOCR(use_angle_cls=True, lang='en')"

COPY . .

CMD ["gunicorn", "server:app", "--bind", "0.0.0.0:8080", "--reload", "--workers", "1", "--timeout", "4000"]

