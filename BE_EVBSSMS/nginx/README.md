# Nginx Reverse Proxy

Nginx đóng vai trò reverse proxy phía trước API Gateway, cung cấp các tính năng bảo mật, load balancing, và tối ưu hiệu năng.

## Kiến trúc

```
Client (Browser/Mobile App)
    ↓
Nginx:80 (Reverse Proxy)
    ↓
API Gateway:8080
    ↓
[Auth-User, Station, Booking, Billing Services]
```

## Tính năng

### 1. Reverse Proxy
- Forward tất cả requests từ client đến API Gateway
- Ẩn cấu trúc hệ thống backend khỏi client

### 2. Rate Limiting
- API endpoints: 100 requests/giây với burst 50
- Auth endpoints: 20 requests/giây với burst 10
- Connection limit: 10 connections/IP

### 3. Security
- Headers bảo mật: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- Rate limiting chống DDoS
- SSL/TLS termination (khi có certificate)

### 4. Performance
- Gzip compression cho tất cả response
- HTTP/1.1 keep-alive connections
- Connection pooling với upstream
- Buffering tối ưu

### 5. Load Balancing
- Strategy: Least connections
- Health checks cho upstream servers
- Failover tự động khi API Gateway lỗi

## Cấu hình

### nginx.conf
File cấu hình chính, định nghĩa:
- Worker processes
- Compression settings
- Security headers
- Rate limiting zones
- Upstream servers

### conf.d/api.conf
Cấu hình routing chi tiết:
- `/api/*` - Tất cả API endpoints
- `/api/auth/*` - Auth endpoints với rate limit nghiêm ngặt
- `/{service}/swagger-ui/*` - Swagger UI (dev only)
- `/ws/*` - WebSocket support

### conf.d/proxy_params.conf
Common proxy settings:
- Headers forwarding
- Timeouts
- Buffering
- Rate limiting

## URL Mapping

### Production (qua Nginx)
```
http://localhost/api/auth/login           → API Gateway → Auth-User Service
http://localhost/api/stations             → API Gateway → Station Service
http://localhost/api/bookings             → API Gateway → Booking Service
http://localhost/api/billings             → API Gateway → Billing Service
```

### Development (truy cập trực tiếp)
```
http://localhost:9000/api/auth/login      → API Gateway trực tiếp
http://localhost:9001/api/users           → Auth-User Service trực tiếp
```

### Swagger UI (qua Nginx)
```
http://localhost/auth-user/swagger-ui/index.html
http://localhost/station/swagger-ui/index.html
http://localhost/booking/swagger-ui/index.html
http://localhost/billing/swagger-ui/index.html
```

## Chạy Nginx

### Với Docker Compose
```bash
# Chạy toàn bộ hệ thống kèm Nginx
docker-compose -f docker-compose.prod.yml up -d --build

# Chỉ chạy Nginx
docker-compose -f docker-compose.prod.yml up -d nginx

# Xem logs
docker-compose -f docker-compose.prod.yml logs -f nginx

# Restart Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Standalone Docker
```bash
# Build image
docker build -t evbss-nginx ./nginx

# Run container
docker run -d \
  --name nginx-proxy \
  --network evnet \
  -p 80:80 \
  -p 443:443 \
  evbss-nginx
```

## Health Check

```bash
# Nginx health
curl http://localhost/health

# Output: "Nginx is healthy"
```

## Logs

### Access logs
```bash
docker exec nginx-proxy tail -f /var/log/nginx/access.log
docker exec nginx-proxy tail -f /var/log/nginx/api_access.log
```

### Error logs
```bash
docker exec nginx-proxy tail -f /var/log/nginx/error.log
docker exec nginx-proxy tail -f /var/log/nginx/api_error.log
```

## Monitoring

### Kiểm tra cấu hình
```bash
# Test cấu hình trước khi apply
docker exec nginx-proxy nginx -t

# Reload cấu hình không downtime
docker exec nginx-proxy nginx -s reload
```

### Kiểm tra connections
```bash
# Số connections đang active
docker exec nginx-proxy ss -an | grep :80 | wc -l
```

## SSL/TLS Configuration

Khi có SSL certificate, uncomment phần HTTPS trong `nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... rest of config
}
```

Thêm volume cho certificates trong docker-compose:
```yaml
nginx:
  volumes:
    - ./ssl:/etc/nginx/ssl:ro
```

## Rate Limiting Tuning

Điều chỉnh trong `nginx.conf`:

```nginx
# Tăng limit cho API
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=200r/s;

# Giảm limit cho auth
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=10r/s;
```

## Load Balancing Multiple API Gateway Instances

Thêm instances vào upstream trong `nginx.conf`:

```nginx
upstream api_gateway {
    least_conn;
    server api-gateway-1:8080 max_fails=3 fail_timeout=30s;
    server api-gateway-2:8080 max_fails=3 fail_timeout=30s;
    server api-gateway-3:8080 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

## Troubleshooting

### Nginx không start
```bash
# Kiểm tra logs
docker logs nginx-proxy

# Kiểm tra cấu hình
docker exec nginx-proxy nginx -t
```

### 502 Bad Gateway
- API Gateway chưa ready → Đợi health check
- API Gateway crashed → Kiểm tra logs gateway
- Network issue → Kiểm tra Docker network

### 503 Service Unavailable
- Eureka chưa ready
- Services chưa đăng ký với Eureka
- Rate limit quá thấp

### Không thể kết nối
```bash
# Kiểm tra Nginx đang chạy
docker ps | grep nginx

# Kiểm tra port 80 có được bind
netstat -an | grep :80

# Kiểm tra network
docker network inspect evnet
```

## Production Checklist

- [ ] Enable HTTPS với SSL certificate
- [ ] Chặn Swagger UI trong production (return 403)
- [ ] Điều chỉnh rate limits phù hợp
- [ ] Setup log rotation
- [ ] Monitor Nginx metrics (access logs, error rate)
- [ ] Backup cấu hình Nginx
- [ ] Setup alerts cho 5xx errors
- [ ] Enable fail2ban để chặn IP độc hại

## Performance Tuning

### Worker processes
```nginx
# Mặc định: auto (= số CPU cores)
worker_processes auto;
```

### Worker connections
```nginx
events {
    worker_connections 2048;  # Tăng nếu cần handle nhiều connections
}
```

### Client body size
```nginx
http {
    client_max_body_size 20M;  # Tăng nếu cần upload files lớn
}
```


