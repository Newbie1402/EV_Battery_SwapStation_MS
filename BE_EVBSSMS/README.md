# Cách chạy BE:
1. Thêm file .env vào thư mục gốc của project với nội dung như file .env.example
2. Chạy lệnh sau trong terminal ở thư mục gốc của project BE:
```bash
  ./build-all.bat
  docker-compose up --build -d
```
Nếu không dùng service trực tiếp ở docker muốn chạy được file env thì cần dùng thêm plugin Vd: EnvFile plugin
http://localhost:8081/swagger-ui/index.html#/Admin/approveRegistration

| Service       | Chức năng chính                       | Loại giao tiếp chính   |
| ------------- | ------------------------------------- |------------------------|
| **auth-user** | Xác thực, quản lý user, role, profile | ✅ REST sync (HTTP)     |
| **station**   | Quản lý trạm, pin, slot, vị trí       | ✅ REST + 🔄 Kafka event|
| **booking**   | Đặt lịch, đổi pin, xử lý giao dịch    | ✅ REST + 🔄 Kafka event|
| **billing**   | Thanh toán, gói thuê, hóa đơn         | ✅ REST + 🔄 Kafka event|
