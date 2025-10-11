@echo off
echo ========================================
echo Starting auth-user service in DEV mode
echo ========================================
echo.
echo Profile: dev (local development)
echo Database: localhost:5433
echo Kafka: localhost:9092
echo Eureka: localhost:8761
echo.
echo ========================================

cd /d "%~dp0"
mvn spring-boot:run -Dspring-boot.run.profiles=dev

pause

