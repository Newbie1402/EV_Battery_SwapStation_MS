# 🚀 Hướng dẫn Setup Project cho người mới

## 📋 Mục lục
1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Clone và cài đặt](#clone-và-cài-đặt)
3. [Cấu hình môi trường](#cấu-hình-môi-trường)
4. [Database Migration (Flyway)](#database-migration-flyway)
5. [Chạy project](#chạy-project)
6. [Kiểm tra kết quả](#kiểm-tra-kết-quả)
7. [Troubleshooting](#troubleshooting)

---

## 1. Yêu cầu hệ thống

### Phần mềm cần thiết:
- ✅ **Java 21** (JDK 21)
- ✅ **Maven 3.8+**
- ✅ **Docker Desktop** (Windows/Mac) hoặc Docker Engine (Linux)
- ✅ **Git**
- ✅ **IDE** (IntelliJ IDEA, VS Code, Eclipse)

### Kiểm tra cài đặt:
```bash
# Kiểm tra Java
java -version
# Kết quả mong đợi: java version "21.x.x"

# Kiểm tra Maven
mvn -version
# Kết quả mong đợi: Apache Maven 3.8.x or higher

# Kiểm tra Docker
docker --version
docker-compose --version
```

---

## 2. Clone và cài đặt

### Bước 1: Clone repository
```bash
git clone https://github.com/your-repo/EV_Battery_SwapStation_MS.git
cd EV_Battery_SwapStation_MS/BE_EVBSSMS
```

### Bước 2: Kiểm tra cấu trúc project
```
BE_EVBSSMS/
├── .env.example          # File mẫu cấu hình
├── docker-compose.yml    # Cấu hình Docker services
├── build-all.bat         # Script build (Windows)
├── build-all.sh          # Script build (Linux/Mac)
├── auth-user/            # Service xác thực
│   └── src/main/resources/db/migration/   # ⭐ Flyway migration files
│       ├── V1__init_schema.sql
│       └── V2__update_user_status_constraint.sql
├── station-inventory/
├── booking-swap/
├── billing-payment/
└── api-gateway/
```

---

## 3. Cấu hình môi trường

### Bước 1: Tạo file `.env`
```bash
# Copy file mẫu
cp .env.example .env

# Hoặc trên Windows
copy .env.example .env
```

### Bước 2: Cấu hình Google OAuth2
Mở file `.env` và cập nhật:

```bash
# ==== Google OAuth2 ====
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
ADMIN_EMAIL=your-email@gmail.com
ADMIN_GOOGLE_ID=                    # Để trống, sẽ tự động cập nhật khi admin đăng nhập lần đầu
ADMIN_FULL_NAME=Admin System

# ==== JWT Secret (Phải thay đổi trong Production!) ====
JWT_SECRET=your-very-long-secret-key-at-least-256-bits-for-hs256-algorithm
JWT_ACCESS_TOKEN_EXPIRATION=3600000   # 1 hour
JWT_REFRESH_TOKEN_EXPIRATION=604800000 # 7 days
```

### Bước 3: Các cấu hình khác giữ nguyên default
File `.env` đã có sẵn cấu hình cho:
- Database (PostgreSQL)
- Kafka
- MailHog (Email testing)
- Eureka Server

---

## 4. Database Migration (Flyway)

### ⭐ Điều quan trọng nhất: **KHÔNG CẦN CHẠY FILE SQL THỦ CÔNG!**

Khi bạn chạy service lần đầu, **Flyway sẽ TỰ ĐỘNG**:
1. ✅ Tạo database nếu chưa có
2. ✅ Tạo bảng `flyway_schema_history` để tracking
3. ✅ Chạy tất cả các file migration theo thứ tự (V1, V2, V3...)
4. ✅ Ghi log vào bảng `flyway_schema_history`

### Flyway hoạt động như thế nào?

#### 📂 Cấu trúc migration files:
```
auth-user/src/main/resources/db/migration/
├── V1__init_schema.sql                      # Tạo bảng users, vehicles, otp_tokens, refresh_tokens
└── V2__update_user_status_constraint.sql    # Cập nhật constraint status
```

#### 📋 Quy tắc đặt tên:
```
V<VERSION>__<DESCRIPTION>.sql

V1__init_schema.sql              ✅ Đúng
V2__update_user_status.sql       ✅ Đúng
V10__add_new_table.sql           ✅ Đúng

v1__init_schema.sql              ❌ Sai (chữ v thường)
1__init_schema.sql               ❌ Sai (thiếu chữ V)
V1_init_schema.sql               ❌ Sai (chỉ có 1 dấu gạch dưới)
```

#### 🔄 Luồng hoạt động:
```
1. Service khởi động
   ↓
2. Flyway kiểm tra database
   ↓
3. Nếu database chưa có → Tạo mới
   ↓
4. Kiểm tra bảng flyway_schema_history
   ↓
5. Chạy các migration chưa được áp dụng
   ↓
6. V1__init_schema.sql → Tạo bảng users, vehicles, otp_tokens, refresh_tokens
   ↓
7. V2__update_user_status_constraint.sql → Cập nhật constraint
   ↓
8. Ghi log vào flyway_schema_history
   ↓
9. Service ready! ✅
```

### Log mong đợi khi khởi động lần đầu:

```
INFO [o.f.c.i.d.base.BaseDatabaseType] - Database: jdbc:postgresql://localhost:5433/authdb (PostgreSQL 15.3)
INFO [o.f.core.internal.command.DbValidate] - Successfully validated 2 migrations (execution time 00:00.012s)
INFO [o.f.c.i.s.JdbcTableSchemaHistory] - Creating Schema History table "public"."flyway_schema_history" ...
INFO [o.f.core.internal.command.DbMigrate] - Current version of schema "public": << Empty Schema >>
INFO [o.f.core.internal.command.DbMigrate] - Migrating schema "public" to version "1 - init schema"
INFO [o.f.core.internal.command.DbMigrate] - Migrating schema "public" to version "2 - update user status constraint"
INFO [o.f.core.internal.command.DbMigrate] - Successfully applied 2 migrations to schema "public" (execution time 00:00.234s)
```

### Kiểm tra migration đã chạy thành công:

**Cách 1: Kiểm tra log**
Tìm dòng: `✅ Successfully applied X migrations to schema "public"`

**Cách 2: Kết nối vào database**
```bash
# Vào database container
docker exec -it auth-user-db psql -U ev -d authdb

# Kiểm tra bảng flyway_schema_history
SELECT * FROM flyway_schema_history ORDER BY installed_rank;

# Kết quả mong đợi:
 installed_rank | version | description                    | type | script                                   | success 
----------------+---------+--------------------------------+------+------------------------------------------+---------
              1 | 1       | init schema                    | SQL  | V1__init_schema.sql                      | t
              2 | 2       | update user status constraint  | SQL  | V2__update_user_status_constraint.sql    | t

# Kiểm tra bảng users đã được tạo
\dt

# Kết quả mong đợi:
              List of relations
 Schema |         Name          | Type  | Owner 
--------+-----------------------+-------+-------
 public | flyway_schema_history | table | ev
 public | otp_tokens            | table | ev
 public | refresh_tokens        | table | ev
 public | users                 | table | ev
 public | vehicles              | table | ev
```

---

## 5. Chạy project

### Option 1: Docker Compose (Recommended)
```bash
# Build tất cả services
./build-all.bat         # Windows
./build-all.sh          # Linux/Mac

# Khởi động tất cả services
docker-compose up -d

# Kiểm tra logs
docker-compose logs -f auth-user
```

### Option 2: Chạy từng service riêng (Development)
```bash
cd auth-user
mvn spring-boot:run
```

### Thứ tự khởi động services:
```
1. Eureka Server (Service Discovery)     → http://localhost:8761
2. Auth-User Service                     → http://localhost:8081
3. Station Service                       → http://localhost:8082
4. Booking Service                       → http://localhost:8083
5. Billing Service                       → http://localhost:8084
6. API Gateway                           → http://localhost:8080
```

---

## 6. Kiểm tra kết quả

### ✅ Checklist sau khi chạy thành công:

**1. Kiểm tra Docker containers**
```bash
docker ps

# Kết quả mong đợi (11 containers):
# - auth-user-db (PostgreSQL)
# - station-db (PostgreSQL)
# - booking-db (PostgreSQL)
# - billing-db (PostgreSQL)
# - kafka
# - zookeeper
# - mailhog
# - eureka-server
# - auth-user-service
# - api-gateway
# - ... (các service khác)
```

**2. Truy cập Swagger UI**
- Auth-User: http://localhost:8081/swagger-ui/index.html
- API Gateway: http://localhost:8080/swagger-ui/index.html

**3. Kiểm tra Eureka Dashboard**
- http://localhost:8761
- Các service đã đăng ký thành công: ✅ AUTH-USER, STATION, BOOKING, BILLING, API-GATEWAY

**4. Kiểm tra MailHog**
- http://localhost:8025
- Sẵn sàng nhận email test

**5. Test API đăng nhập Google**
- http://localhost:8080/oauth2/login
- Đăng nhập bằng tài khoản Google

**6. Kiểm tra Admin account**
```bash
# Vào database
docker exec -it auth-user-db psql -U ev -d authdb

# Kiểm tra admin đã được tạo
SELECT id, email, full_name, role, status, is_active 
FROM users 
WHERE role = 'ADMIN';

# Kết quả mong đợi:
 id |           email            |   full_name   | role  | status | is_active 
----+----------------------------+---------------+-------+--------+-----------
  1 | phananhthai.dao04@gmail.com | Admin System | ADMIN | ACTIVE | t
```

---

## 7. Troubleshooting

### ❌ Lỗi: "Port already in use"
**Nguyên nhân:** Port bị chiếm bởi process khác.

**Giải pháp:**
```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8081
kill -9 <PID>
```

### ❌ Lỗi: "Flyway migration failed"
**Nguyên nhân:** File migration bị lỗi syntax SQL.

**Giải pháp:**
```bash
# 1. Kiểm tra log
docker logs auth-user-service

# 2. Nếu cần reset database (CHỈ dùng trong development!)
docker exec -it auth-user-db psql -U ev -d authdb -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 3. Restart service để Flyway chạy lại
docker restart auth-user-service
```

### ❌ Lỗi: "GOOGLE_CLIENT_ID not configured"
**Nguyên nhân:** File `.env` chưa được cấu hình đúng.

**Giải pháp:**
```bash
# 1. Kiểm tra file .env có tồn tại không
ls -la .env

# 2. Kiểm tra nội dung
cat .env | grep GOOGLE_CLIENT_ID

# 3. Nếu chưa có, copy từ .env.example
cp .env.example .env

# 4. Cập nhật GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET

# 5. Restart Docker Compose
docker-compose down
docker-compose up -d
```

### ❌ Lỗi: "Connection refused to database"
**Nguyên nhân:** Database container chưa sẵn sàng.

**Giải pháp:**
```bash
# 1. Kiểm tra database container
docker ps | grep auth-user-db

# 2. Kiểm tra log database
docker logs auth-user-db

# 3. Restart database
docker restart auth-user-db

# 4. Đợi 10 giây rồi restart service
sleep 10
docker restart auth-user-service
```

### ❌ Lỗi: "Could not create JDBC connection"
**Nguyên nhân:** Database chưa được tạo.

**Giải pháp:**
```bash
# Vào database container và tạo database thủ công
docker exec -it auth-user-db psql -U ev

# Tạo database
CREATE DATABASE authdb;
\q

# Restart service
docker restart auth-user-service
```

---

## 8. Các lệnh hữu ích

### Docker Compose
```bash
# Khởi động
docker-compose up -d

# Dừng
docker-compose down

# Xem logs tất cả services
docker-compose logs -f

# Xem logs 1 service cụ thể
docker-compose logs -f auth-user

# Rebuild và restart
docker-compose up -d --build

# Xóa tất cả (bao gồm volumes - DATA SẼ MẤT!)
docker-compose down -v
```

### Maven
```bash
# Build
mvn clean package -DskipTests

# Chạy
mvn spring-boot:run

# Test
mvn test

# Clean
mvn clean
```

### Database
```bash
# Vào database
docker exec -it auth-user-db psql -U ev -d authdb

# Backup database
docker exec auth-user-db pg_dump -U ev authdb > backup.sql

# Restore database
docker exec -i auth-user-db psql -U ev -d authdb < backup.sql
```

---

## 9. Tóm tắt cho người mới

### 🎯 3 bước chính để chạy project:

**1. Setup môi trường**
```bash
git clone <repo>
cd BE_EVBSSMS
cp .env.example .env
# Sửa GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong .env
```

**2. Build và chạy**
```bash
./build-all.bat           # Windows
docker-compose up -d
```

**3. Kiểm tra**
```bash
# Swagger UI
http://localhost:8081/swagger-ui/index.html

# Eureka Dashboard
http://localhost:8761

# Test đăng nhập Google
http://localhost:8080/oauth2/login
```

### ⭐ Lưu ý quan trọng:

1. ✅ **KHÔNG CẦN chạy file SQL thủ công** - Flyway tự động chạy
2. ✅ **File `.env` bắt buộc** - Copy từ `.env.example` và cấu hình
3. ✅ **Đợi database sẵn sàng** - Mất khoảng 10-20 giây
4. ✅ **Kiểm tra log nếu có lỗi** - `docker-compose logs -f`
5. ✅ **Admin account tự động tạo** - Dùng email trong `ADMIN_EMAIL`

---
## 10. Liên hệ hỗ trợ
Nếu gặp khó khăn, bạn có thể liên hệ: 
Instagram: [@pathai.dao04](https://www.instagram.com/pathai.dao04/)
