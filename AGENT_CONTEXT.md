# Camera An Ninh (Smart Security Camera) - AI Agent Context

Tài liệu này cung cấp ngữ cảnh để AI Agents nắm bắt kiến trúc dự án.

## 1. Kiến trúc (Architecture)
- **Mô hình AI:** MobileNetV2 (`mobilenet_v2.onnx`). Dùng để Phân loại ảnh (Image Classification - 1000 classes ImageNet).
- **Backend:** FastAPI (Python) + ONNX Runtime.
- **Frontend:** HTML5, CSS3, JS.

## 2. Luật Nghiệp vụ (Business Rules)
- **Mục tiêu:** Lọc báo động giả do thú cưng gây ra.
- **Quy tắc Logic:** 
  - Nếu kết quả suy luận thuộc ID từ `151-268` (Chó) hoặc `281-285` (Mèo) 👉 Trả về trạng thái `SAFE`.
  - Các trường hợp còn lại 👉 Trả về `ALARM`.
- Mức độ Confidence tin cậy: `> 20%` (0.2). Nếu bé hơn, trả về `IGNORE`.

## 3. Agent Skills & Lưu ý
- Khi chỉnh sửa Backend, tuyệt đối tuân thủ việc xử lý file bằng ONNX Runtime để đảm bảo tốc độ. KHÔNG import PyTorch để suy luận trong file này.
