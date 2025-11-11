package com.boilerplate.bookingswap.enums;

/**
 * Enum trạng thái của Booking:
 * - PENDING: Đang chờ xác nhận
 * - CONFIRM: Đã xác nhận
 * - CANCEL: Đã hủy
 * - SUCCESS: Đã hoàn thành giao dịch
 */
public enum BookingStatus {
    PENDING,    // Đang chờ xác nhận
    CONFIRM,    // Đã xác nhận
    CANCEL,     // Đã hủy
    SUCCESS     // Đã hoàn thành giao dịch
}

