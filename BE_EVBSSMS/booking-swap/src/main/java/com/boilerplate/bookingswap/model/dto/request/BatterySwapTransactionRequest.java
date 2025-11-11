package com.boilerplate.bookingswap.model.dto.request;

import com.boilerplate.bookingswap.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO nhận dữ liệu yêu cầu tạo giao dịch đổi pin
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatterySwapTransactionRequest {

    /** Id booking liên quan */
    @NotBlank(message = "bookingId không được để trống")
    private String bookingId;

    /** Id trạm thực hiện đổi pin */
    @NotBlank(message = "stationId không được để trống")
    private String stationId;

    /** Id tài xế thực hiện giao dịch */
    @NotBlank(message = "driverId không được để trống")
    private String driverId;

    /** Id pin cũ trả về */
    @NotBlank(message = "oldBatteryId không được để trống")
    private String oldBatteryId;

    /** Id pin mới nhận */
    @NotBlank(message = "newBatteryId không được để trống")
    private String newBatteryId;

    /** Số tiền giao dịch */
    @NotNull(message = "amount không được để trống")
    private BigDecimal amount;

    /** Phương thức thanh toán */
    @NotNull(message = "paymentMethod không được để trống")
    private PaymentMethod paymentMethod;
}