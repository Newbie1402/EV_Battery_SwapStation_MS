package com.boilerplate.billing.model.DTO;

import com.boilerplate.billing.enums.PaymentMethod;
import com.boilerplate.billing.enums.PaymentStatus;
import com.boilerplate.billing.model.entity.PackagePayment;
import com.boilerplate.billing.model.entity.SingleSwapPayment;
import com.boilerplate.billing.model.event.consumer.DTO.DriverDTO;
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
    private DriverDTO customerId;
    private Double totalAmount;
    private Double baseAmount;
    private Double discountAmount;
    private Double taxAmount;
    private PaymentMethod method;
    private PaymentStatus status;
    private Long bookingId;
    private String description;
    private LocalDateTime paymentTime;
    private LocalDateTime createdAt;

    private Long packageId;
    private LocalDate startDate;
    private LocalDate endDate;

    // Chuyển từ Entity sang DTO
    public static PackagePaymentDTO fromEntity(PackagePayment entity) {
        return PackagePaymentDTO.builder()
                .id(entity.getId())
                .customerId(DriverDTO.fromEntity(entity.getCustomerId()))
                .totalAmount(entity.getTotalAmount())
                .baseAmount(entity.getBaseAmount())
                .discountAmount(entity.getDiscountAmount())
                .taxAmount(entity.getTaxAmount())
                .method(entity.getMethod())
                .status(entity.getStatus())
                .bookingId(entity.getBookingId())
                .description(entity.getDescription())
                .paymentTime(entity.getPaymentTime())
                .createdAt(entity.getCreatedAt())
                .packageId(entity.getPackageId())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .build();
    }


}
