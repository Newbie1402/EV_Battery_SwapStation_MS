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
    private Long bookingId;
    private Long stationId;
    private Double totalAmount;
    private PaymentMethod method;
    private PaymentStatus status;
    private String transactionId;
    private String description;
    private LocalDateTime paymentTime;
    private LocalDateTime createdAt;

    public static SingleSwapPaymentDTO fromEntity(SingleSwapPayment entity) {
        if (entity == null) return null;

        return SingleSwapPaymentDTO.builder()
                .id(entity.getId())
                .customerId(entity.getCustomerId())
                .bookingId(entity.getBookingId())
                .stationId(entity.getStationId())
                .totalAmount(entity.getTotalAmount())
                .method(entity.getMethod())
                .status(entity.getStatus())
                .transactionId(entity.getTransactionId())
                .description(entity.getDescription())
                .paymentTime(entity.getPaymentTime())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
