package com.boilerplate.auth.model.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Class chuẩn hóa response trả về cho client
 * Tuân thủ cấu trúc: statusCode, message, data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseData<T> {
    private int statusCode;
    private String message;
    private T data;

    /**
     * Tạo response thành công với dữ liệu
     */
    public static <T> ResponseData<T> success(T data) {
        return ResponseData.<T>builder()
                .statusCode(200)
                .message("Thao tác thành công")
                .data(data)
                .build();
    }

    /**
     * Tạo response thành công với message tùy chỉnh
     */
    public static <T> ResponseData<T> success(String message, T data) {
        return ResponseData.<T>builder()
                .statusCode(200)
                .message(message)
                .data(data)
                .build();
    }

    /**
     * Tạo response thành công không có dữ liệu
     */
    public static <T> ResponseData<T> success(String message) {
        return ResponseData.<T>builder()
                .statusCode(200)
                .message(message)
                .build();
    }

    /**
     * Tạo response lỗi
     */
    public static <T> ResponseData<T> error(int statusCode, String message) {
        return ResponseData.<T>builder()
                .statusCode(statusCode)
                .message(message)
                .build();
    }
}

