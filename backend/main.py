from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import onnxruntime as ort
import numpy as np
from PIL import Image
import io
import os

app = FastAPI(title="Smart Security Camera API")

# Cấu hình CORS để Frontend (chạy trên trình duyệt) có thể gọi API này
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép mọi nguồn gốc kết nối (chỉ dùng cho demo)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lấy luôn model đã train từ dự án trước để tiết kiệm thời gian
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "edge-mlops-pipeline", "model_pipeline", "mobilenet_v2.onnx"))

ort_session = None

@app.on_event("startup")
async def startup_event():
    global ort_session
    try:
        ort_session = ort.InferenceSession(MODEL_PATH)
        print("Da nap thanh cong bo nao AI (MobileNetV2)")
    except Exception as e:
        print(f"Loi nap model: {e}")

def preprocess_image(image_bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img = img.resize((224, 224))
        img_data = np.array(img).astype('float32')
        # Normalize
        img_data = img_data / 255.0
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        img_data = (img_data - mean) / std
        # HWC to CHW
        img_data = np.transpose(img_data, (2, 0, 1))
        # Add batch dimension
        img_data = np.expand_dims(img_data, axis=0)
        return img_data.astype(np.float32)
    except Exception as e:
        raise ValueError(f"Invalid image format: {e}")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    global ort_session
    if ort_session is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
    
    try:
        contents = await file.read()
        input_data = preprocess_image(contents)
        
        # Chạy AI
        input_name = ort_session.get_inputs()[0].name
        output = ort_session.run(None, {input_name: input_data})
        
        predictions = output[0][0]
        predicted_class = int(np.argmax(predictions))
        confidence = float(predictions[predicted_class])
        
        # ==========================================
        # 🧠 LOGIC AN NINH: PHÂN BIỆT THÚ CƯNG VS NGƯỜI
        # ==========================================
        # Trong ImageNet: 
        # Chó: Các ID từ 151 đến 268
        # Mèo: Các ID từ 281 đến 285
        
        is_dog = (151 <= predicted_class <= 268)
        is_cat = (281 <= predicted_class <= 285)
        
        # Nếu độ tự tin quá thấp (< 20%), có thể do ảnh mờ, bỏ qua để tránh báo nhầm
        if confidence < 0.20:
            return JSONResponse(content={
                "status": "IGNORE",
                "message": "Không rõ ràng, bỏ qua.",
                "confidence": confidence
            })
            
        if is_dog or is_cat:
            return JSONResponse(content={
                "status": "SAFE",
                "message": f"Phát hiện {'Chó' if is_dog else 'Mèo'}. An toàn!",
                "confidence": confidence,
                "class_id": predicted_class
            })
        else:
            return JSONResponse(content={
                "status": "ALARM",
                "message": "BÁO ĐỘNG! Phát hiện đối tượng lạ!",
                "confidence": confidence,
                "class_id": predicted_class
            })
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Chạy server ở cổng 8080
    uvicorn.run(app, host="0.0.0.0", port=8080)
