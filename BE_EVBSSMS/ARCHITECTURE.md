# 🏗️ Kiến trúc Microservice - EV Battery Swap Station Management System

## 📋 Tổng quan

Hệ thống được tổ chức thành **5 service chính** theo domain-driven design, mỗi service chịu trách nhiệm cho một nhóm chức năng nghiệp vụ cụ thể.

## 🌐 Kiến trúc tổng thể

```
Client (Browser/Mobile App)
    ↓
Nginx:80 (Reverse Proxy)
    ├─ Rate Limiting
    ├─ SSL/TLS Termination
    ├─ Compression
    └─ Load Balancing
    ↓
API Gateway:8080 (Entry Point)
    ├─ Routing
    ├─ Authentication
    └─ Service Discovery
    ↓
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Auth-User   │ Station     │ Booking     │ Billing     │
│ :8080       │ :8080       │ :8080       │ :8080       │
└─────────────┴─────────────┴─────────────┴─────────────┘
    ↓               ↓               ↓               ↓
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ AuthDB      │ StationDB   │ BookingDB   │ BillingDB   │
│ :5432       │ :5432       │ :5432       │ :5432       │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

## 🎯 6 Thành phần Chính

### 0. **nginx** (Port 80/443)
**Vai trò:** Reverse Proxy & Load Balancer

**Chức năng:**
- ✅ Reverse proxy cho API Gateway
- ✅ SSL/TLS termination (HTTPS)
- ✅ Rate limiting (chống DDoS)
- ✅ Gzip compression
- ✅ Security headers
- ✅ Load balancing giữa nhiều API Gateway instances
- ✅ Static content serving (nếu cần)

**Tài liệu:** [nginx/README.md](nginx/README.md), [nginx/DEPLOYMENT_GUIDE.md](nginx/DEPLOYMENT_GUIDE.md)

---

### 1. **gateway** (Port 9000 → Container 8080)
**Service:** `api-gateway`

**Chức năng:**
- ✅ Điểm vào (entry point) cho tất cả microservices
- ✅ Định tuyến (routing) request đến service tương ứng
- ✅ Xác thực token (JWT)
- ✅ Service discovery via Eureka
- ✅ Monitoring và rate limiting

**Container:** `api-gateway:8080`

**Access:**
- Via Nginx: `http://localhost/api/*`
- Direct: `http://localhost:9000/api/*`

---

### 2. **auth-user** (Port 9001 → Container 8080)
**Gộp từ:** `auth-user` + `admin`

**Chức năng:**
- ✅ Đăng ký/đăng nhập (EV Driver, Staff, Admin)
- ✅ Quản lý profile và thông tin cá nhân
- ✅ Quản lý phương tiện của người dùng
- ✅ Phân quyền (roles & permissions)
- ✅ Quản lý nhân viên
- ✅ Xử lý khiếu nại/khiếu kiện liên quan đến tài khoản

**Database:** `authdb` (PostgreSQL - Port 5433)

**Container:** `auth-user-service:8080`

**Access:**
- Via Nginx: `http://localhost/auth-user/swagger-ui/index.html`
- Via Gateway: `http://localhost:9000/auth-user/swagger-ui/index.html`
- Direct: `http://localhost:9001/swagger-ui/index.html`

---

### 3. **station** (Port 9002 → Container 8080)
**Gộp từ:** `station-inventory` + `geo-routing`

**Chức năng:**
- ✅ Quản lý trạm đổi pin
- ✅ Quản lý slot (ngăn chứa pin)
- ✅ Quản lý pin (model, dung lượng, SoH - State of Health)
- ✅ Theo dõi tồn kho pin (đầy, đang sạc, bảo dưỡng, lỗi)
- ✅ Tìm kiếm trạm gần nhất (Geolocation)
- ✅ Gợi ý lộ trình (Routing)

**Database:** `stationdb` (PostgreSQL - Port 5434)

**Container:** `station-service:8080`

**Access:**
- Via Nginx: `http://localhost/station/swagger-ui/index.html`
- Via Gateway: `http://localhost:9000/station/swagger-ui/index.html`
- Direct: `http://localhost:9002/swagger-ui/index.html`

---

### 4. **booking** (Port 9003 → Container 8080)
**Gộp từ:** `booking-swap` + `support-feedback` + `notification`

**Chức năng:**
- ✅ Đặt lịch trước để đổi pin
- ✅ Giữ chỗ pin
- ✅ Xử lý giao dịch đổi pin tại trạm
- ✅ Xác nhận giao dịch
- ✅ Quản lý support ticket
- ✅ Đánh giá (rating) dịch vụ trạm
- ✅ Gửi thông báo (email, SMS, push notification)

**Database:** `bookingdb` (PostgreSQL - Port 5435)

**Container:** `booking-service:8080`

**Tích hợp:** Kafka, MailHog

**Access:**
- Via Nginx: `http://localhost/booking/swagger-ui/index.html`
- Via Gateway: `http://localhost:9000/booking/swagger-ui/index.html`
- Direct: `http://localhost:9003/swagger-ui/index.html`

---

### 5. **billing** (Port 9004 → Container 8080)
**Gộp từ:** `billing-payment` + `analytics`

**Chức năng:**
- ✅ Quản lý gói thuê bao
- ✅ Xử lý thanh toán (tích hợp payment gateway)
- ✅ Tạo và quản lý hóa đơn
- ✅ Báo cáo doanh thu
- ✅ Thống kê số lượt đổi pin
- ✅ Phân tích tần suất sử dụng, giờ cao điểm
- ✅ AI dự báo nhu cầu sử dụng trạm

**Database:** `billingdb` (PostgreSQL - Port 5436)

**Container:** `billing-service:8080`

**Tích hợp:** Kafka

**Access:**
- Via Nginx: `http://localhost/billing/swagger-ui/index.html`
- Via Gateway: `http://localhost:9000/billing/swagger-ui/index.html`
- Direct: `http://localhost:9004/swagger-ui/index.html`

---

## 🛠️ Hạ tầng hỗ trợ

### Eureka Server (Port 8761)
- Service Discovery & Registration
- Health check cho các microservice

### Kafka + Zookeeper
- Message broker cho event-driven architecture
- Kafka: Port 9092
- Zookeeper: Port 2181

### MailHog
- SMTP server cho môi trường development
- Web UI: Port 8025
- SMTP: Port 1025

---

## 🗺️ Sơ đồ kiến trúc

```
                        ┌─────────────────┐
                        │   Client Apps   │
                        │  (Web/Mobile)   │
                        └────────┬────────┘
                                 │ HTTP/HTTPS
                        ┌────────▼────────┐
                        │      Nginx      │ :80/:443
                        │ (Reverse Proxy) │
                        │  Rate Limiting  │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │   API Gateway   │ :9000
                        │  (Routing, JWT) │
                        └────────┬────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────▼────────┐    ┌─────────▼──────────┐    ┌───────▼────────┐
│  auth-user     │    │     station        │    │    booking     │
│  :9001         │    │     :9002          │    │    :9003       │
│                │    │                    │    │                │
│ • Auth         │    │ • Stations         │    │ • Bookings     │
│ • Profile      │    │ • Batteries        │    │ • Swaps        │
│ • Permissions  │    │ • Geo/Routing      │    │ • Support      │
│ • Admin        │    │ • Inventory        │    │ • Notification │
└───────┬────────┘    └─────────┬──────────┘    └───────┬────────┘
        │                       │                        │
┌───────▼────────┐    ┌─────────▼──────────┐           │
│   authdb       │    │    stationdb       │           │
│   :5433        │    │    :5434           │           │
└────────────────┘    └────────────────────┘           │
                                                        │
        ┌───────────────────────────────────────────────┤
        │                                               │
┌───────▼────────┐                            ┌────────▼─────────┐
│    billing     │                            │    bookingdb     │
│    :9004       │                            │    :5435         │
│                │                            └──────────────────┘
│ • Payments     │
│ • Invoices     │              ┌─────────────────┐
│ • Analytics    │◄─────────────┤ Kafka + Zookeeper│
│ • AI Forecast  │              │ :9092 / :2181   │
└───────┬────────┘              └─────────────────┘
        │
┌───────▼────────┐              ┌─────────────────┐
│   billingdb    │              │    MailHog      │
│   :5436        │              │  :8025 / :1025  │
└────────────────┘              └─────────────────┘

        ┌──────────────────────────┐
        │   Eureka Server :8761    │
        │  (Service Discovery)     │
        └──────────────────────────┘
```

---

## 🚀 Cách sử dụng

### 1. Chuẩn bị môi trường

Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```


### 2. Build tất cả service

```bash
# Windows
build-all.bat

# Linux/Mac
chmod +x build-all.sh
./build-all.sh
```

### 3. Khởi động hệ thống

```bash
# Khởi động tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Xem logs của 1 service cụ thể
docker-compose logs -f auth-user
```

### 4. Kiểm tra trạng thái

- **Eureka Dashboard**: http://localhost:8761
- **API Gateway**: http://localhost:9000
- **Auth-User Service**: http://localhost:9001
- **Station Service**: http://localhost:9002
- **Booking Service**: http://localhost:9003
- **Billing Service**: http://localhost:9004
- **MailHog UI**: http://localhost:8025

### 5. Dừng hệ thống

```bash
# Dừng tất cả
docker-compose down

# Dừng và xóa volumes (dữ liệu database)
docker-compose down -v
```

