#!/bin/bash
# ============================================
# EV Battery Swap Station Management System
# ============================================

echo ""
echo "============================================"
echo "  BUILDING 5 MICROSERVICES"
echo "============================================"
echo ""

# Danh sách 5 service chính
SERVICES=(
    "eureka-server"
    "api-gateway"
    "auth-user"
    "station-inventory"
    "booking-swap"
    "billing-payment"
)

for service in "${SERVICES[@]}"; do
    echo "============================"
    echo "Building $service ..."
    echo "============================"
    cd "$service"
    if [ -f "mvnw" ]; then
        ./mvnw clean package -DskipTests
    else
        echo "[WARNING] mvnw not found in $service, skipping..."
    fi
    cd ..
    echo ""
done

echo "============================================"
echo "  BUILD COMPLETED!"
echo "============================================"
echo ""
echo "Services built:"
echo "  1. eureka-server (Service Discovery)"
echo "  2. api-gateway (API Gateway)"
echo "  3. auth-user (Auth & User Management)"
echo "  4. station-inventory (Station & Inventory Management)"
echo "  5. booking-swap (Booking & Swap Management)"
echo "  6. billing-payment (Billing & Payment Management)"
echo ""
echo "Next step: docker-compose up -d"
echo "============================================"

