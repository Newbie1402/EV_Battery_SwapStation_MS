@echo off
REM ============================================
REM EV Battery Swap Station Management System
REM ============================================

echo.
echo ============================================
echo  BUILDING 5 MICROSERVICES
echo ============================================
echo.

set SERVICES=eureka-server api-gateway auth-user station-inventory booking-swap billing-payment

for %%d in (%SERVICES%) do (
    echo ============================
    echo Building %%d ...
    echo ============================
    cd %%d
    if exist mvnw.cmd (
        call mvnw.cmd clean package -DskipTests
    ) else (
        echo [WARNING] mvnw.cmd not found in %%d, skipping...
    )
    cd ..
    echo.
)

echo ============================================
echo  BUILD COMPLETED!
echo ============================================
echo.
echo Services built:
echo   1. eureka-server (Service Discovery)
echo   2. api-gateway (API Gateway)
echo   3. auth-user (Auth ^& User Management)
echo   4. station-inventory (Station ^& Inventory Management)
echo   5. booking-swap (Booking ^& Swap Management)
echo   6. billing-payment (Billing ^& Payment Management)
echo.
echo Next step: docker-compose up -d
echo ============================================
