package com.boilerplate.auth.exception;

/**
 * Exception khi OTP không hợp lệ
 */
public class InvalidOtpException extends RuntimeException {
    public InvalidOtpException(String message) {
        super(message);
    }
}

