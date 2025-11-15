package com.boilerplate.gateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.web.reactive.error.DefaultErrorAttributes;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Custom error attributes để format lỗi theo chuẩn của dự án
 */
@Component
@Slf4j
public class CustomErrorAttributes extends DefaultErrorAttributes {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public Map<String, Object> getErrorAttributes(ServerRequest request, ErrorAttributeOptions options) {
        Map<String, Object> errorAttributes = new HashMap<>();
        Throwable error = getError(request);

        HttpStatus status = determineHttpStatus(error);

        errorAttributes.put("timestamp", LocalDateTime.now().format(FORMATTER));
        errorAttributes.put("statusCode", status.value());
        errorAttributes.put("message", determineMessage(error, status));
        errorAttributes.put("path", request.path());

        log.error("Error occurred: {} - {}", status.value(), error.getMessage());

        return errorAttributes;
    }

    /**
     * Xác định HTTP status code dựa trên exception
     */
    private HttpStatus determineHttpStatus(Throwable error) {
        if (error instanceof org.springframework.web.server.ResponseStatusException) {
            return HttpStatus.resolve(
                ((org.springframework.web.server.ResponseStatusException) error).getStatusCode().value()
            );
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    /**
     * Xác định message phù hợp
     */
    private String determineMessage(Throwable error, HttpStatus status) {
        if (error.getMessage() != null && !error.getMessage().isEmpty()) {
            return error.getMessage();
        }

        return switch (status) {
            case BAD_REQUEST -> "Yêu cầu không hợp lệ";
            case UNAUTHORIZED -> "Chưa xác thực";
            case FORBIDDEN -> "Không có quyền truy cập";
            case NOT_FOUND -> "Không tìm thấy tài nguyên";
            case INTERNAL_SERVER_ERROR -> "Lỗi hệ thống";
            case SERVICE_UNAVAILABLE -> "Dịch vụ tạm thời không khả dụng";
            default -> "Đã xảy ra lỗi";
        };
    }
}

