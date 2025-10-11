package com.boilerplate.auth.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO cho admin phê duyệt đơn đăng ký
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveRegistrationRequest {

    /**
     * ID của user cần phê duyệt
     */
    @NotNull(message = "User ID không được để trống")
    private Long userId;

    /**
     * Quyết định: true = approve, false = reject
     */
    @NotNull(message = "Quyết định không được để trống")
    private Boolean approved;

    /**
     * Lý do từ chối (bắt buộc nếu approved = false)
     */
    private String rejectionReason;
}

