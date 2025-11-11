package com.boilerplate.bookingswap.exception;

/**
 * Exception được throw khi không tìm thấy resource
 */
public class NotFoundException extends RuntimeException {

    /**
     * Constructor với message
     * @param message Thông báo lỗi
     */
    public NotFoundException(String message) {
        super(message);
    }

    /**
     * Constructor với message và cause
     * @param message Thông báo lỗi
     * @param cause Nguyên nhân gây lỗi
     */
    public NotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}

