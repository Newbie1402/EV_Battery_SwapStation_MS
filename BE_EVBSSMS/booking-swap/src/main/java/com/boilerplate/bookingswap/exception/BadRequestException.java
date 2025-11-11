package com.boilerplate.bookingswap.exception;

/**
 * Exception được throw khi yêu cầu không hợp lệ hoặc vi phạm business rule
 */
public class BadRequestException extends RuntimeException {

    /**
     * Constructor với message
     * @param message Thông báo lỗi
     */
    public BadRequestException(String message) {
        super(message);
    }

    /**
     * Constructor với message và cause
     * @param message Thông báo lỗi
     * @param cause Nguyên nhân gây lỗi
     */
    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}