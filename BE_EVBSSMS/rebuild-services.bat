@echo off
echo ========================================
echo Build lai tat ca cac service
echo ========================================

echo.
echo [1/5] Building api-gateway...
cd api-gateway
call mvn clean package -DskipTests
if %ERRORLEVEL% NEQ 0 (
    echo Error building api-gateway!
    exit /b 1
)
cd ..

echo.
echo [2/5] Building auth-user-service...
cd auth-user
call mvn clean package -DskipTests
if %ERRORLEVEL% NEQ 0 (
    echo Error building auth-user-service!
    exit /b 1
)
cd ..

echo.
echo [3/5] Building station-service...
cd station-inventory
call mvn clean package -DskipTests
if %ERRORLEVEL% NEQ 0 (
    echo Error building station-service!
    exit /b 1
)
cd ..

echo.
echo [4/5] Building booking-service...
cd booking-swap
call mvn clean package -DskipTests
if %ERRORLEVEL% NEQ 0 (
    echo Error building booking-service!
    exit /b 1
)
cd ..

echo.
echo [5/5] Building billing-service...
cd billing-payment
call mvn clean package -DskipTests
if %ERRORLEVEL% NEQ 0 (
    echo Error building billing-service!
    exit /b 1
)
cd ..

echo.
echo ========================================
echo Build thanh cong tat ca cac service!
echo ========================================

