package com.boilerplate.auth.enums;

/**
 * Enum trạng thái của Support Ticket
 */
public enum TicketStatus {
    OPEN("Mở"),
    IN_PROGRESS("Đang xử lý"),
    RESOLVED("Đã giải quyết"),
    CLOSED("Đóng");

    private final String description;

    TicketStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

