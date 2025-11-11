package com.boilerplate.bookingswap.exception;

/**
 * Exception được throw khi người dùng không có quyền thực hiện hành động
 */
public class ForbiddenException extends RuntimeException {

    /**
     * Constructor với message
     * @param message Thông báo lỗi
     */
    public ForbiddenException(String message) {
        super(message);
    }

    /**
     * Constructor với message và cause
     * @param message Thông báo lỗi
     * @param cause Nguyên nhân gây lỗi
     */
    public ForbiddenException(String message, Throwable cause) {
        super(message, cause);
    }
}

