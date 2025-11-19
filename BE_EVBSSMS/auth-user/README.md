Đăng ký tài khoản, đăng nhập, quản lý tài khoản, liên kết VIN, loại pin
Luồng hoạt động:
Đăng ký → Chờ Admin duyệt → Lấy token trong mail → Điền token vào enpoint /api/verification/confirm 
/api/auth/oauth2/google/register -> /api/admin/registrations/approve -> /api/auth/verify-otp ->
/api/auth/verify-otp

✅ application.yml - Base config
Common config cho tất cả môi trường
Profile mặc định: dev
Không chứa URL cụ thể (để profile override)
✅ application-dev.yml - IDE development
Server port: 8081
Database: localhost:5433
Eureka: localhost:8761
Kafka: localhost:9092
Logging: DEBUG
✅ application-prod.yml - Docker production
Server port: 8080
Database: auth-user-db:5432
Eureka: eureka-server:8761
Kafka: kafka:9092
Logging: INFO