@echo off
REM Tự động build tất cả các service Spring Boot
set SERVICES=admin analytics api-gateway auth-user billing-payment booking-swap geo-routing notification station-inventory support-feedback eureka-server

for %%d in (%SERVICES%) do (
    echo ============================
    echo Building %%d ...
    cd %%d
    call mvnw.cmd clean package -DskipTests
    cd ..
)
echo ============================
echo Build tất cả service hoàn tất!
