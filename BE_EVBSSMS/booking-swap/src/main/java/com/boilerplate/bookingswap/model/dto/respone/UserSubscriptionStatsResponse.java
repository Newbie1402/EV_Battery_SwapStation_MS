package com.boilerplate.bookingswap.model.dto.respone;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO trả về thống kê gói thuê pin của người dùng
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSubscriptionStatsResponse {

    /** Id người dùng */
    private String userId;

    /** Id đăng ký gói */
    private Long subscriptionId;

    private Long packagePlanId;

    private BigDecimal packagePlanPrice;

    /** Tên gói */
    private String packageName;

    /** Số lần đổi pin tối đa */
    private Integer maxSwapPerMonth;

    /** Số lần đã sử dụng */
    private Integer usedSwaps;

    /** Số lần còn lại */
    private Integer remainingSwaps;

    /** Ngày bắt đầu */
    private LocalDateTime startDate;

    /** Ngày kết thúc */
    private LocalDateTime endDate;

    /** Số ngày còn lại */
    private Long daysRemaining;

    /** Trạng thái */
    private String status;
}