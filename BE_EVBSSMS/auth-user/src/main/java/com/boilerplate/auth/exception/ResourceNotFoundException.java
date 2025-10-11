package com.boilerplate.auth.exception;

/**
 * Exception khi không tìm thấy tài nguyên
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

