package com.boilerplate.auth.exception;

/**
 * Exception khi thông tin đăng nhập không hợp lệ
 */
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}

