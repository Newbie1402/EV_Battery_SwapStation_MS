package com.boilerplate.auth.enums;

/**
 * Enum định nghĩa các loại support ticket
 */
public enum SupportTicketType {
    BATTERY_ISSUE("Sự cố pin"),
    VEHICLE_MALFUNCTION("Hỏng hóc phương tiện"),
    STATION_EQUIPMENT("Sự cố thiết bị trạm"),
    SWAP_FAILURE("Lỗi quá trình đổi pin"),
    PAYMENT_ISSUE("Vấn đề thanh toán"),
    SERVICE_QUALITY("Chất lượng dịch vụ"),
    OTHER("Khác");

    private final String description;

    SupportTicketType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

