package com.boilerplate.bookingswap.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO nhận dữ liệu yêu cầu đăng ký gói thuê pin
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPackageSubscriptionRequest {

    /** Id người dùng */
    @NotBlank(message = "userId không được để trống")
    private String userId;

    /** Id gói thuê pin */
    @NotNull(message = "packagePlanId không được để trống")
    private Long packagePlanId;
}