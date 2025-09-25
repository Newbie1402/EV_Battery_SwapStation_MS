package com.boilerplate.code.exception;

import com.boilerplate.code.enums.StatusApplication;
import com.boilerplate.code.model.response.ResponseData;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.nio.file.AccessDeniedException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ControllerAdvice
public class HandlerGlobalException {
    // Bắt lỗi NullPointerException
    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<ResponseData<String>> handleNullPointerException(NullPointerException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ResponseData<>(
                StatusApplication.INTERNAL_SERVER_ERROR.getCode(),
                StatusApplication.INTERNAL_SERVER_ERROR.getMessage(),
                ex.getMessage()
        ));
    }

    // Bắt lỗi IllegalArgumentException
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ResponseData<String>>handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ResponseData<>(
                StatusApplication.INTERNAL_SERVER_ERROR.getCode(),
                StatusApplication.INTERNAL_SERVER_ERROR.getMessage(),
                ex.getMessage()
        ));
    }

    // Bắt tất cả các lỗi còn lại
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseData<String>> handleAllExceptions(Exception ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ResponseData<>(
                StatusApplication.INTERNAL_SERVER_ERROR.getCode(),
                StatusApplication.INTERNAL_SERVER_ERROR.getMessage(),
                ex.getMessage()
        ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ResponseData<Map<String, String>>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<FieldError> fieldErrors = ex.getBindingResult().getFieldErrors();
        Map<String, String> errors = new HashMap<>();

        // Lưu các lỗi vào Map với tên trường và thông báo lỗi
        for (FieldError fieldError : fieldErrors) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        // Trả về Response với mã lỗi 400 (BAD_REQUEST) và các lỗi chi tiết
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ResponseData<>(
                StatusApplication.VALIDATION_FAILED.getCode(),
                StatusApplication.VALIDATION_FAILED.getMessage(),
                errors
        ));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ResponseData<String>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                new ResponseData<>(403, "Forbidden", "Bạn không có quyền truy cập")
        );
    }

}