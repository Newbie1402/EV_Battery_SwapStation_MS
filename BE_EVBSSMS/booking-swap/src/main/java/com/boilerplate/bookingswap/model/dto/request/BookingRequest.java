package com.boilerplate.bookingswap.model.dto.request;

import com.boilerplate.bookingswap.enums.PaymentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO nhận dữ liệu yêu cầu đặt lịch đổi pin
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    /** Id tài xế */
    @NotBlank(message = "driverId không được để trống")
    private String driverId;

    /** Id trạm */
    @NotBlank(message = "stationId không được để trống")
    private String stationId;

    /** Id model pin */
    @NotBlank(message = "batteryModelId không được để trống")
    private String batteryModelId;

    /** Thời gian đặt lịch */
    @NotNull(message = "scheduledTime không được để trống")
    private LocalDateTime scheduledTime;

    /** Loại thanh toán */
    @NotNull(message = "paymentType không được để trống")
    private PaymentType paymentType;

    /** Id gói thuê pin (nếu có) */
    private String packageId;

    /** Ghi chú */
    private String notes;
}