package com.boilerplate.billing.model.DTO;

import com.boilerplate.billing.model.entity.SingleSwapPayment;
import com.boilerplate.billing.enums.PaymentMethod;
import com.boilerplate.billing.enums.PaymentStatus;
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
    private String description;
    private Long bookingId;
    private LocalDateTime paymentTime;
    private LocalDateTime createdAt;
    private Long stationId;

    // ===============================
    //       MAPPER STATIC
    // ===============================
    public static SingleSwapPaymentDTO fromEntity(SingleSwapPayment payment) {
        if (payment == null) return null;

        return SingleSwapPaymentDTO.builder()
                .id(payment.getId())
                .customerId(payment.getCustomerId())
                .totalAmount(payment.getTotalAmount())
                .baseAmount(payment.getBaseAmount())
                .discountAmount(payment.getDiscountAmount())
                .taxAmount(payment.getTaxAmount())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .description(payment.getDescription())
                .bookingId(payment.getBookingId())
                .paymentTime(payment.getPaymentTime())
                .createdAt(payment.getCreatedAt())
                .stationId(payment.getStationId())
                .build();
    }
}
