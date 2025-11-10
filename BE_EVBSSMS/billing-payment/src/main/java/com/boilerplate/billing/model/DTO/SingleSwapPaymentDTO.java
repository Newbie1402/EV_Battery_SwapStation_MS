package com.boilerplate.billing.model.dto;

import com.boilerplate.billing.enums.PaymentMethod;
import com.boilerplate.billing.enums.PaymentStatus;
import com.boilerplate.billing.model.entity.SingleSwapPayment;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SingleSwapPaymentDTO {
    private Long id;
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
    private LocalDateTime createdAt;

    private Long bookingId;
    private Long stationId;
    private Long swapLogId;

    public static SingleSwapPaymentDTO fromEntity(SingleSwapPayment entity) {
        return SingleSwapPaymentDTO.builder()
                .id(entity.getId())
                .customerId(entity.getCustomerId())
                .totalAmount(entity.getTotalAmount())
                .baseAmount(entity.getBaseAmount())
                .discountAmount(entity.getDiscountAmount())
                .taxAmount(entity.getTaxAmount())
                .method(entity.getMethod())
                .status(entity.getStatus())
                .transactionId(entity.getTransactionId())
                .description(entity.getDescription())
                .paymentTime(entity.getPaymentTime())
                .createdAt(entity.getCreatedAt())
                .bookingId(entity.getBookingId())
                .stationId(entity.getStationId())
                .swapLogId(entity.getSwapLogId())
                .build();
    }
}
