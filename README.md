# 🐾 Smart Security Camera (Pet Filter AI)

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)
![ONNX](https://img.shields.io/badge/ONNX_Runtime-1.16+-orange.svg)
![Status](https://img.shields.io/badge/Status-Production_Ready-success.svg)

Giải pháp Camera An ninh Thông minh sử dụng **Edge AI** để giải quyết triệt để bài toán **"Báo động giả" (False Alarm)**. Thay vì rú còi mỗi khi có chuyển động, hệ thống sử dụng mạng Neural Network (MobileNetV2 ONNX) để phân tích hình ảnh và tự động bỏ qua nếu đối tượng chỉ là Chó hoặc Mèo.

## 🚀 Tính năng cốt lõi (Core Features)
- **Pet Filtering Logic:** Tự động nhận diện >100 giống Chó/Mèo để vô hiệu hóa báo động.
- **ONNX Acceleration:** Sử dụng ONNX Runtime siêu tốc, không cần cài đặt PyTorch cồng kềnh.
- **Premium Dashboard:** Giao diện điều khiển UI/UX chuẩn Cybersecurity (Glassmorphism, Dark mode).
- **Asynchronous Processing:** Xử lý ảnh bất đồng bộ với FastAPI.

## 🧠 Luồng Nghiệp vụ (Business Logic Flow)

```mermaid
graph TD
    A[Camera phát hiện chuyển động] --> B[Chụp Frame gửi về API]
    B --> C{ONNX Runtime (MobileNetV2)}
    C -->|Class ID 151-268| D[Nhận diện: CHÓ]
    C -->|Class ID 281-285| E[Nhận diện: MÈO]
    C -->|Class ID khác| F[Nhận diện: VẬT THỂ LẠ / NGƯỜI]
    
    D --> G[Trả về: SAFE (Đèn Xanh)]
    E --> G
    F --> H[Trả về: ALARM (Đèn Đỏ)]
```

## 🛠️ Hướng dẫn Khởi chạy (Quick Start)

### 1. Khởi động AI Server (Backend)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
*API được expose tại cổng `8000` (hoặc `8080` tùy cấu hình).*

### 2. Truy cập Control Panel (Frontend)
Click đúp mở file `frontend/index.html`. Giao diện giám sát sẽ tự động kết nối với Camera của thiết bị.

## 📁 Cấu trúc Hệ thống (Structure)
```text
smart-security-camera/
├── backend/
│   ├── main.py              # Xử lý Logic lọc Chó/Mèo
│   ├── requirements.txt     # Dependency (onnxruntime, fastapi...)
│   └── MODULE.md            # Tài liệu Backend
├── frontend/
│   ├── app.js               # Logic Polling API
│   ├── index.html           # Bảng điều khiển An ninh
│   ├── style.css            # Premium UI
│   └── MODULE.md            # Tài liệu Frontend
├── AGENT_CONTEXT.md         # Master Context cho AI
└── README.md
```

## 💡 Lưu ý cho Developers
Mô hình `mobilenet_v2.onnx` được trỏ Link vật lý từ dự án MLOps Pipeline để tối ưu hóa không gian lưu trữ ổ cứng. Tuyệt đối không xóa file gốc của mô hình.
