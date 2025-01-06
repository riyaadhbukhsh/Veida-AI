from paddleocr import PaddleOCR

def preload_models():
    print("Preloading models...")   
    ocr = PaddleOCR(use_angle_cls=True, lang='en')
    print("Models preloaded successfully")

if __name__ == "__main__":
    preload_models()
