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


COPY . .

CMD ["gunicorn", "server:app", "--bind", "0.0.0.0:8080", "--reload", "--workers", "1", "--timeout", "4000"]

