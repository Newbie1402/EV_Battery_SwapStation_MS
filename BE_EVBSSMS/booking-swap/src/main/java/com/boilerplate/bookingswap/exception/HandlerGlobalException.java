package com.boilerplate.bookingswap.exception;

import com.boilerplate.bookingswap.enums.StatusApplication;
import com.boilerplate.bookingswap.model.response.ResponseData;
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

    // Bắt lỗi NotFoundException
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ResponseData<String>> handleNotFoundException(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ResponseData<>(
                HttpStatus.NOT_FOUND.value(),
                "Không tìm thấy",
                ex.getMessage()
        ));
    }

    // Bắt lỗi ConflictException
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ResponseData<String>> handleConflictException(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ResponseData<>(
                HttpStatus.CONFLICT.value(),
                "Xung đột dữ liệu",
                ex.getMessage()
        ));
    }

    // Bắt lỗi ForbiddenException
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ResponseData<String>> handleForbiddenException(ForbiddenException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ResponseData<>(
                HttpStatus.FORBIDDEN.value(),
                "Không có quyền truy cập",
                ex.getMessage()
        ));
    }

    // Bắt lỗi BadRequestException
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ResponseData<String>> handleBadRequestException(BadRequestException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ResponseData<>(
                HttpStatus.BAD_REQUEST.value(),
                "Yêu cầu không hợp lệ",
                ex.getMessage()
        ));
    }

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

    // Bắt lỗi IllegalStateException
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ResponseData<String>> handleIllegalStateException(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ResponseData<>(
                HttpStatus.BAD_REQUEST.value(),
                "Yêu cầu không hợp lệ",
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