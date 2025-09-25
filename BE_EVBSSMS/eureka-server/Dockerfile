FROM eclipse-temurin:21-jre

# Tạo thư mục làm việc
WORKDIR /app

# Copy file JAR vào container (đường dẫn đúng từ context eureka-server)
COPY target/eureka-server-0.0.1-SNAPSHOT.jar app.jar

# Expose port cho Eureka Server
EXPOSE 8761

# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]
