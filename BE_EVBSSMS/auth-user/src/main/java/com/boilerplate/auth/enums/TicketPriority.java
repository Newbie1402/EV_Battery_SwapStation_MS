package com.boilerplate.auth.enums;

/**
 * Enum định nghĩa mức độ ưu tiên của support ticket
 */
public enum TicketPriority {
    LOW("Thấp", 3),
    MEDIUM("Trung bình", 2),
    HIGH("Cao", 1),
    CRITICAL("Khẩn cấp", 0);

    private final String description;
    private final int level;

    TicketPriority(String description, int level) {
        this.description = description;
        this.level = level;
    }

    public String getDescription() {
        return description;
    }

    public int getLevel() {
        return level;
    }
}

