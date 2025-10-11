package com.boilerplate.auth.enums;

import lombok.Getter;

/**
 * Enum định nghĩa các mã trạng thái HTTP và thông điệp tương ứng
 */
@Getter
public enum StatusApplication {
    // Success codes (2xx)
    SUCCESS(200, "Thao tác thành công"),
    CREATED(201, "Tạo mới thành công"),
    NO_CONTENT(204, "Không có nội dung"),

    // Client error codes (4xx)
    BAD_REQUEST(400, "Yêu cầu không hợp lệ"),
    UNAUTHORIZED(401, "Chưa xác thực"),
    FORBIDDEN(403, "Không có quyền truy cập"),
    NOT_FOUND(404, "Không tìm thấy tài nguyên"),
    CONFLICT(409, "Dữ liệu đã tồn tại"),
    VALIDATION_FAILED(422, "Dữ liệu không hợp lệ"),
    UNPROCESSABLE_ENTITY(422, "Dữ liệu không thể xử lý"),

    // Server error codes (5xx)
    INTERNAL_SERVER_ERROR(500, "Lỗi máy chủ nội bộ"),
    SERVICE_UNAVAILABLE(503, "Dịch vụ không khả dụng");

    private final int code;
    private final String message;

    StatusApplication(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
