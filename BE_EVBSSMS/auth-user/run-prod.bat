@echo off
echo ========================================
echo Starting auth-user service in PRODUCTION mode
echo ========================================
echo.
echo Profile: prod (production with local IDE)
echo Database: localhost:5433 (Docker container)
echo Kafka: localhost:9092 (Docker container)
echo Eureka: localhost:8761 (Docker container)
echo Security: ENABLED (OAuth2 required)
echo.
echo ========================================

cd /d "%~dp0"
mvn spring-boot:run -Dspring-boot.run.profiles=prod

pause

