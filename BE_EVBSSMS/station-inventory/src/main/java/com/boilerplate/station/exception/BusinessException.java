package com.boilerplate.station.exception;

public class BusinessException extends RuntimeException {
    private final AppException appException;

    public BusinessException(AppException appException) {
        super(appException.getMessage());
        this.appException = appException;
    }

    public AppException getAppException() {
        return appException;
    }
}
