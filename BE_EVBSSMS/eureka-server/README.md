✅ application.yml (Base Config)
Common config cho tất cả môi trường
Profile mặc định: dev
Eureka server config: register-with-eureka=false, fetch-registry=false
Management endpoints
Logging config
✅ application-dev.yml (Development - MỚI)
Server port: 8761
Self-preservation: Disabled (dev)
Eviction interval: 4000ms (nhanh)
Logging: DEBUG
Dùng cho IDE hoặc docker-compose.base.yml
✅ application-prod.yml (Production - MỚI)
Server port: 8761
Self-preservation: Enabled (prod)
Eviction interval: 10000ms (chậm, ổn định)
Logging: INFO/WARN
Dùng cho docker-compose.prod.yml