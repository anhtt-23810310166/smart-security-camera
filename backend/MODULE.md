# Module Backend (ONNX Core)

## Nghiệp vụ
Xử lý ảnh và suy luận phân loại qua ONNX Runtime.

## Logic
1. Cấu hình CORS để Frontend gọi tới cổng 8000.
2. Tiền xử lý ảnh `preprocess_image`: Crop 224x224, Normalize (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]).
3. Chạy ONNX Session.
4. Lấy argmax mảng kết quả để tìm Class ID cao nhất.
5. So khớp với bảng ID của chó/mèo. Trả JSON.
