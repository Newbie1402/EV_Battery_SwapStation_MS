package com.boilerplate.bookingswap.exception;

public class BusinessException extends RuntimeException {
    private final BookingException bookingException;

    public BusinessException(BookingException bookingException) {
        super(bookingException.getMessage());
        this.bookingException = bookingException;
    }

    public BookingException getBillingException() {
        return bookingException;
    }
}
