# Cách chạy BE:

1. Thêm file .env vào thư mục gốc của project với nội dung như file .env.example
2. Chạy lệnh sau trong terminal ở thư mục gốc của project BE:

```bash
  ./build-all.bat
  docker-compose up --build -d
```

Nếu không dùng service trực tiếp ở docker muốn chạy được file env thì cần dùng thêm plugin Vd:
EnvFile plugin

## Kiến trúc hệ thống

```
Client → Nginx:80 → API Gateway:8080 → [Microservices]
         ↓
    Rate Limiting
    Compression
    SSL/TLS
    Load Balancing
```

| Service       | Chức năng chính                       | Loại giao tiếp chính    |
|---------------|---------------------------------------|-------------------------|
| **nginx**     | Reverse proxy, load balancer, security| HTTP/HTTPS              |
| **gateway**   | API Gateway, routing                  | HTTP/REST               |
| **auth-user** | Xác thực, quản lý user, role, profile | ✅ REST sync (HTTP)      |
| **station**   | Quản lý trạm, pin, slot, vị trí       | ✅ REST + 🔄 Kafka event |
| **booking**   | Đặt lịch, đổi pin, xử lý giao dịch    | ✅ REST + 🔄 Kafka event |
| **billing**   | Thanh toán, gói thuê, hóa đơn         | ✅ REST + 🔄 Kafka event |

## Truy cập API và Swagger UI

### Qua Nginx (Production - Recommended):
```
http://localhost/api/auth/login
http://localhost/api/stations
http://localhost/api/bookings
http://localhost/api/billings
```

### Swagger UI qua Nginx:
```
http://localhost/auth-user/swagger-ui/index.html
http://localhost/station/swagger-ui/index.html
http://localhost/booking/swagger-ui/index.html
http://localhost/billing/swagger-ui/index.html
```

### Qua API Gateway trực tiếp (Development):
```
Auth-User Service: http://localhost:9000/auth-user/swagger-ui.html
Station Service: http://localhost:9000/station/swagger-ui.html
Booking Service: http://localhost:9000/booking/swagger-ui.html
Billing Service: http://localhost:9000/billing/swagger-ui.html
```

### Trực tiếp các service (Development only):
```
Auth: http://localhost:9001/swagger-ui/index.html
Station: http://localhost:9002/swagger-ui/index.html
Booking: http://localhost:9003/swagger-ui/index.html
Billing: http://localhost:9004/swagger-ui/index.html
```

### Infrastructure:
```
Eureka Dashboard: http://localhost:8761
MailHog Web UI: http://localhost:8025
```



## 4. Project code style

If using IntelliJ IDEA, you can import the code style file from the project root directory:

- Go to `File` -> `Settings` -> `Editor` -> `Code Style`.

Then import the code style file:

[Google code style](GoogleStyle.xml)

Then enable auto formatting on save:

- Go to `File` -> `Settings` -> `Tools` -> `Actions on Save`.

- Check `Reformat code` and `Optimize imports`.