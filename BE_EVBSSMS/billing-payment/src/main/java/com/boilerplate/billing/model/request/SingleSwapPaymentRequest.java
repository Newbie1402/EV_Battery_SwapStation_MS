package com.boilerplate.billing.model.request;

import com.boilerplate.billing.enums.PaymentMethod;
import com.boilerplate.billing.enums.PaymentStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SingleSwapPaymentRequest {
    private Long customerId;
    private Double totalAmount;
    private Double baseAmount;
    private Double discountAmount;
    private Double taxAmount;
    private PaymentMethod method;
    private PaymentStatus status;
    private String transactionId;
    private String description;
    private LocalDateTime paymentTime;
    private Long bookingId;
    private Long stationId;
    private Long swapLogId;
}
