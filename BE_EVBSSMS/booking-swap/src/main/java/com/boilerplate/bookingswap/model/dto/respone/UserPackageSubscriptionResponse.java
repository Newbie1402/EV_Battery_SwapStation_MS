package com.boilerplate.bookingswap.model.dto.respone;

import com.boilerplate.bookingswap.enums.PackageType;
import com.boilerplate.bookingswap.enums.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO trả dữ liệu đăng ký gói thuê pin về cho client
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPackageSubscriptionResponse {

    /** Id đăng ký */
    private Long id;

    /** Id người dùng */
    private String userId;

    /** Id gói thuê pin */
    private Long packagePlanId;

    /** Tên gói thuê pin */
    private String packagePlanName;

    /** Số lần đổi pin tối đa mỗi tháng của gói */
    private Integer packageMaxSwapPerMonth;

    /** Loại gói thuê pin */
    private PackageType packagePlanType;

    /** Thời gian bắt đầu */
    private LocalDateTime startDate;

    /** Thời gian kết thúc */
    private LocalDateTime endDate;

    /** Số lần đổi pin đã sử dụng */
    private Integer usedSwaps;

    /** Trạng thái đăng ký */
    private SubscriptionStatus status;

    /** Thời gian tạo */
    private LocalDateTime createdAt;

    /** Thời gian cập nhật */
    private LocalDateTime updatedAt;
}


