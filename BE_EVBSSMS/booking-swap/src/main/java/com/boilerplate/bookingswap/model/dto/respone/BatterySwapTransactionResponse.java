package com.boilerplate.bookingswap.model.dto.respone;

import com.boilerplate.bookingswap.enums.PaymentMethod;
import com.boilerplate.bookingswap.enums.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO trả dữ liệu giao dịch đổi pin về cho client
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatterySwapTransactionResponse {

    /** Id giao dịch */
    private Long id;

    /** Id booking liên quan */
    private String bookingId;

    /** Id trạm thực hiện đổi pin */
    private String stationId;

    /** Id tài xế thực hiện giao dịch */
    private String driverId;

    /** Id pin cũ trả về */
    private String oldBatteryId;

    /** Id pin mới nhận */
    private String newBatteryId;

    /** Số tiền giao dịch */
    private BigDecimal amount;

    /** Phương thức thanh toán */
    private PaymentMethod paymentMethod;

    /** Thời gian tạo giao dịch */
    private LocalDateTime createdAt;

    /** Trạng thái giao dịch */
    private TransactionStatus transactionStatus;
}

