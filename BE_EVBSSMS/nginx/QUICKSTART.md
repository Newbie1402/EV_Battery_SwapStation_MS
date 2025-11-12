# Quick Start Guide - Nginx cho API Gateway

## Khởi động nhanh (5 phút)

### Bước 1: Build và Start

```bash
# Từ thư mục gốc BE_EVBSSMS
docker-compose -f docker-compose.prod.yml up -d --build
```

Chờ khoảng 2-3 phút để tất cả services khởi động.

### Bước 2: Kiểm tra Status

```bash
# Xem tất cả containers
docker-compose -f docker-compose.prod.yml ps

# Kiểm tra Nginx
curl http://localhost/health
```

Kết quả mong đợi: `healthy`

### Bước 3: Test API qua Nginx

```bash
# Test API Gateway health
curl http://localhost/api/actuator/health

# Test Auth Service
curl http://localhost/auth-user/v3/api-docs

# Test Station Service
curl http://localhost/station/v3/api-docs
```

### Bước 4: Truy cập Swagger UI

Mở trình duyệt và truy cập:

**Via Nginx (Production)**
- Auth: http://localhost/auth-user/swagger-ui/index.html
- Station: http://localhost/station/swagger-ui/index.html
- Booking: http://localhost/booking/swagger-ui/index.html
- Billing: http://localhost/billing/swagger-ui/index.html

**Direct Access (Development)**
- Auth: http://localhost:9001/swagger-ui/index.html
- Station: http://localhost:9002/swagger-ui/index.html
- Booking: http://localhost:9003/swagger-ui/index.html
- Billing: http://localhost:9004/swagger-ui/index.html

### Bước 5: Test Rate Limiting

Chạy script test:

**Windows:**
```bash
cd nginx
test-nginx.bat
```

**Linux/Mac:**
```bash
cd nginx
chmod +x test-nginx.sh
./test-nginx.sh
```

## Các lệnh thường dùng

### Quản lý Services

```bash
# Start
docker-compose -f docker-compose.prod.yml up -d

# Stop
docker-compose -f docker-compose.prod.yml down

# Restart Nginx
docker-compose -f docker-compose.prod.yml restart nginx

# Xem logs Nginx
docker logs nginx-proxy -f

# Xem logs tất cả services
docker-compose -f docker-compose.prod.yml logs -f
```

### Kiểm tra Nginx

```bash
# Test cấu hình
docker exec nginx-proxy nginx -t

# Reload cấu hình (không downtime)
docker exec nginx-proxy nginx -s reload

# Xem access logs
docker exec nginx-proxy tail -f /var/log/nginx/access.log

# Xem error logs
docker exec nginx-proxy tail -f /var/log/nginx/error.log
```

### Health Checks

```bash
# Nginx
curl http://localhost/health

# API Gateway
curl http://localhost/api/actuator/health

# Eureka (xem services đã đăng ký)
http://localhost:8761
```

## Troubleshooting nhanh

### Nginx không start

**Lỗi:** Port 80 đã bị chiếm

```bash
# Windows - Tìm process đang dùng port 80
netstat -ano | findstr :80

# Kill process
taskkill /PID <PID> /F
```

### 502 Bad Gateway

**Nguyên nhân:** API Gateway chưa sẵn sàng

```bash
# Kiểm tra API Gateway
docker logs api-gateway

# Chờ Gateway ready
docker-compose -f docker-compose.prod.yml logs -f gateway
```

### 503 Service Unavailable

**Nguyên nhân 1:** Services chưa đăng ký với Eureka

```bash
# Kiểm tra Eureka
http://localhost:8761

# Restart service
docker-compose -f docker-compose.prod.yml restart auth-user
```

**Nguyên nhân 2:** Rate limiting

→ Đây là behavior đúng khi bạn gửi quá nhiều requests

### Swagger UI không load

**Kiểm tra routing:**

```bash
# Test trực tiếp service
curl http://localhost:9001/swagger-ui/index.html

# Test qua Gateway
curl http://localhost:9000/auth-user/swagger-ui/index.html

# Test qua Nginx
curl http://localhost/auth-user/swagger-ui/index.html
```

## Production Checklist

Trước khi deploy lên production, đảm bảo:

- [ ] Đã thêm SSL certificate
- [ ] Đã chặn Swagger UI endpoints
- [ ] Đã điều chỉnh rate limits phù hợp
- [ ] Đã setup log rotation
- [ ] Đã setup monitoring và alerts
- [ ] Đã test failover scenarios
- [ ] Đã backup cấu hình Nginx
- [ ] Đã document các environment variables

## URLs Tham khảo nhanh

### Via Nginx (Port 80) - Production
| Service | URL |
|---------|-----|
| Health Check | http://localhost/health |
| API Gateway | http://localhost/api/* |
| Auth Swagger | http://localhost/auth-user/swagger-ui/index.html |
| Station Swagger | http://localhost/station/swagger-ui/index.html |
| Booking Swagger | http://localhost/booking/swagger-ui/index.html |
| Billing Swagger | http://localhost/billing/swagger-ui/index.html |

### Direct Access - Development
| Service | Port | URL |
|---------|------|-----|
| Nginx | 80 | http://localhost |
| API Gateway | 9000 | http://localhost:9000 |
| Auth-User | 9001 | http://localhost:9001 |
| Station | 9002 | http://localhost:9002 |
| Booking | 9003 | http://localhost:9003 |
| Billing | 9004 | http://localhost:9004 |
| Eureka | 8761 | http://localhost:8761 |
| MailHog | 8025 | http://localhost:8025 |

## Hỗ trợ

Để biết thêm chi tiết, xem:
- [README.md](README.md) - Tài liệu kỹ thuật đầy đủ
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Hướng dẫn triển khai chi tiết
- [CHANGELOG.md](CHANGELOG.md) - Lịch sử thay đổi và tổng quan

Nếu gặp vấn đề, kiểm tra logs:
```bash
docker logs nginx-proxy
docker logs api-gateway
docker-compose -f docker-compose.prod.yml logs
```

