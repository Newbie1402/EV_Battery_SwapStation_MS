package com.boilerplate.bookingswap.enums;

/**
 * Enum trạng thái của giao dịch:
 * - PENDING: Đang chờ xử lý
 * - SUCCESS: Đã hoàn thành
 * - FAILED: Thất bại
 */
public enum TransactionStatus {
    PENDING,    // Đang chờ xử lý
    SUCCESS,  // Đã hoàn thành
    FAILED      // Thất bại
}
