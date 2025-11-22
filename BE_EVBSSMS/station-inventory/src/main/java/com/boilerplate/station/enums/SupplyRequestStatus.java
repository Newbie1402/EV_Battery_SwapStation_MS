package com.boilerplate.station.enums;

public enum SupplyRequestStatus {
    PENDING,    // Chờ admin duyệt
    APPROVED,   // Admin chấp nhận yêu cầu
    REJECTED,   // Admin từ chối
    COMPLETED   // Đã cấp pin xong
}
