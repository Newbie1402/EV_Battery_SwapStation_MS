package com.boilerplate.billing.model.DTO;

import com.boilerplate.billing.enums.PaymentMethod;
import com.boilerplate.billing.enums.PaymentStatus;
import com.boilerplate.billing.model.entity.BasePayment;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentDTO {

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

    // thêm trường riêng cho từng loại
    private String paymentType; // "PACKAGE" hoặc "SINGLE"
    private Long packageId;
    private Long bookingId;
    private Long stationId;
    private Long swapLogId;
    private LocalDate startDate;
    private LocalDate endDate;

    // ================== FROM ENTITY ==================
    public static PaymentDTO fromEntity(BasePayment entity) {
        PaymentDTO.PaymentDTOBuilder builder = PaymentDTO.builder()
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
                .createdAt(entity.getCreatedAt());

        // nếu là PackagePayment
        if (entity instanceof com.boilerplate.billing.model.entity.PackagePayment p) {
            builder.paymentType("PACKAGE");
            builder.packageId(p.getPackageId());
            builder.startDate(p.getStartDate());
            builder.endDate(p.getEndDate());
        }

        // nếu là SingleSwapPayment
        if (entity instanceof com.boilerplate.billing.model.entity.SingleSwapPayment s) {
            builder.paymentType("SINGLE");
            builder.bookingId(s.getBookingId());
            builder.stationId(s.getStationId());
            builder.swapLogId(s.getSwapLogId());
        }

        return builder.build();
    }
}
