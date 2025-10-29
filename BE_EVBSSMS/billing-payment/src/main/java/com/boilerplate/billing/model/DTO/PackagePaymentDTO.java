package com.boilerplate.billing.model.DTO;

import com.boilerplate.billing.enums.PaymentMethod;
import com.boilerplate.billing.enums.PaymentStatus;
import com.boilerplate.billing.model.entity.PackagePayment;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackagePaymentDTO {
    private Long id;
    private Long customerId;
    private Long packageId;
    private Double totalAmount;
    private PaymentMethod method;
    private PaymentStatus status;
    private String transactionId;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime paymentTime;
    private LocalDateTime createdAt;

    public static PackagePaymentDTO fromEntity(PackagePayment entity) {
        if (entity == null) {
            return null;
        }
        return PackagePaymentDTO.builder()
                .id(entity.getId())
                .customerId(entity.getCustomerId())
                .packageId(entity.getPackageId())
                .totalAmount(entity.getTotalAmount())
                .method(entity.getMethod())
                .status(entity.getStatus())
                .transactionId(entity.getTransactionId())
                .description(entity.getDescription())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .paymentTime(entity.getPaymentTime())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
