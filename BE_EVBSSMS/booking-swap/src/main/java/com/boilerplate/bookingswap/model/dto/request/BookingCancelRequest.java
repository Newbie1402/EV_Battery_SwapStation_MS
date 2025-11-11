package com.boilerplate.bookingswap.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO nhận dữ liệu yêu cầu hủy booking
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCancelRequest {

    /** Lý do hủy booking */
    @NotBlank(message = "Lý do hủy không được để trống")
    private String cancelReason;

    /** Id người hủy (có thể là driver hoặc admin) */
    @NotBlank(message = "userId không được để trống")
    private String cancelledBy;
}