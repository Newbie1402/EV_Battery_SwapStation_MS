package com.boilerplate.bookingswap.enums;

/**
 * Enum trạng thái của Subscription:
 * - ACTIVE: Đang hoạt động
 * - INACTIVE: Không hoạt động
 * - EXPIRED: Hết hạn
 * - OUT_OF_SWAPS: Hết lượt đổi pin trong chu kỳ
 */
public enum SubscriptionStatus {
    ACTIVE,         // Đang hoạt động
    INACTIVE,       // Không hoạt động
    EXPIRED,        // Hết hạn
    OUT_OF_SWAPS    // Hết lượt đổi pin trong chu kỳ
}
