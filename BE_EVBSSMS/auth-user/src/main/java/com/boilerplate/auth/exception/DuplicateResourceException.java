package com.boilerplate.auth.exception;

/**
 * Exception khi tài nguyên đã tồn tại
 */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}

