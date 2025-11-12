# Dockerfile for Nginx
# Nginx reverse proxy cho API Gateway

FROM nginx:1.25-alpine

# Copy cấu hình
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

# Tạo thư mục log
RUN mkdir -p /var/log/nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Expose port
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

