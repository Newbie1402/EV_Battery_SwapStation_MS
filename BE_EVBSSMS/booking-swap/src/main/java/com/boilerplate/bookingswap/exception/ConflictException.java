package com.boilerplate.bookingswap.exception;

/**
 * Exception được throw khi có xung đột dữ liệu (ví dụ: tên đã tồn tại)
 */
public class ConflictException extends RuntimeException {

    /**
     * Constructor với message
     * @param message Thông báo lỗi
     */
    public ConflictException(String message) {
        super(message);
    }

    /**
     * Constructor với message và cause
     * @param message Thông báo lỗi
     * @param cause Nguyên nhân gây lỗi
     */
    public ConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}